#!/usr/bin/env bash
# One-time (and idempotent) hardening + setup of a fresh Ubuntu 24.04 / Debian 12 VPS. Run as root:
#
#   DEPLOY_SSH_PUBLIC_KEY="ssh-ed25519 AAAA... deploy@github" sudo -E bash bootstrap.sh
#
# Or let the provider run it through deploy/cloud-init.yaml.
#
# Result: user "deploy" (SSH key only, in the docker group), root login and passwords disabled over SSH,
# firewall (22/80/443), fail2ban, automatic security updates with reboot at 04:00, Docker + compose plugin,
# 2 GB swap, log limits, /opt/kaucjapp, and the systemd timers for backups and the monthly restore drill.
set -euo pipefail

: "${DEPLOY_SSH_PUBLIC_KEY:?Set DEPLOY_SSH_PUBLIC_KEY to the public key GitHub Actions will use to deploy}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
APP_DIR="${APP_DIR:-/opt/kaucjapp}"
SWAP_SIZE="${SWAP_SIZE:-2G}"
SSH_PORT=22  # keep 22: Ubuntu 24.04 uses ssh.socket, so changing the port needs extra socket config

[[ $EUID -eq 0 ]] || { echo "Run as root" >&2; exit 1; }
export DEBIAN_FRONTEND=noninteractive
log() { echo "[bootstrap] $*"; }

# shellcheck disable=SC1091
. /etc/os-release
case "$ID" in ubuntu|debian) ;; *) echo "Unsupported OS: $ID" >&2; exit 1 ;; esac

log "Updating packages"
apt-get update -y
apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg ufw fail2ban unattended-upgrades rclone rsync jq python3

log "Creating user $DEPLOY_USER"
if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
if ! grep -qxF "$DEPLOY_SSH_PUBLIC_KEY" "/home/$DEPLOY_USER/.ssh/authorized_keys" 2>/dev/null; then
  echo "$DEPLOY_SSH_PUBLIC_KEY" >> "/home/$DEPLOY_USER/.ssh/authorized_keys"
fi
chown "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh/authorized_keys"
chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys"

log "Installing Docker"
if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL "https://download.docker.com/linux/$ID/gpg" -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/$ID $VERSION_CODENAME stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
usermod -aG docker "$DEPLOY_USER"
cat > /etc/docker/daemon.json <<'JSON'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "live-restore": true
}
JSON
systemctl enable --now docker
systemctl reload docker || systemctl restart docker

log "Configuring swap ($SWAP_SIZE)"
if ! swapon --show | grep -q .; then
  fallocate -l "$SWAP_SIZE" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
cat > /etc/sysctl.d/99-kaucjapp.conf <<'EOF'
vm.swappiness = 10
vm.overcommit_memory = 1
EOF
sysctl --system >/dev/null

log "Hardening SSH"
# sshd uses the FIRST value it reads, so this drop-in must sort before the provider's 50-cloud-init.conf.
cat > /etc/ssh/sshd_config.d/00-kaucjapp-hardening.conf <<EOF
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowUsers $DEPLOY_USER
MaxAuthTries 3
EOF
sshd -t
systemctl reload ssh || systemctl reload sshd

log "Configuring firewall"
ufw default deny incoming
ufw default allow outgoing
ufw allow "$SSH_PORT"/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable
# Note: Docker publishes only Caddy's ports (80/443); no other container has a "ports:" section.

log "Configuring fail2ban"
cat > /etc/fail2ban/jail.d/kaucjapp.local <<EOF
[sshd]
enabled = true
port = $SSH_PORT
maxretry = 4
findtime = 10m
bantime = 1h
EOF
systemctl enable --now fail2ban
systemctl restart fail2ban

log "Configuring automatic security updates"
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
cat > /etc/apt/apt.conf.d/52kaucjapp-unattended <<'EOF'
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-WithUsers "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:00";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
EOF
systemctl enable --now unattended-upgrades

log "Preparing $APP_DIR"
install -d -m 755 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$APP_DIR"

log "Installing systemd timers (backup 02:30 UTC, restore drill monthly)"
cat > /etc/systemd/system/kaucjapp-backup.service <<EOF
[Unit]
Description=KaucjApp database backup to R2
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
User=$DEPLOY_USER
Environment=APP_DIR=$APP_DIR
ExecStart=$APP_DIR/scripts/backup.sh
EOF
cat > /etc/systemd/system/kaucjapp-backup.timer <<'EOF'
[Unit]
Description=Nightly KaucjApp backup

[Timer]
OnCalendar=*-*-* 02:30:00 UTC
RandomizedDelaySec=300
Persistent=true

[Install]
WantedBy=timers.target
EOF
cat > /etc/systemd/system/kaucjapp-restore-drill.service <<EOF
[Unit]
Description=KaucjApp restore drill (restores the latest backup into temporary databases)
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
User=$DEPLOY_USER
Environment=APP_DIR=$APP_DIR
ExecStart=$APP_DIR/scripts/restore.sh drill
EOF
cat > /etc/systemd/system/kaucjapp-restore-drill.timer <<'EOF'
[Unit]
Description=Monthly KaucjApp restore drill

[Timer]
OnCalendar=*-*-01 05:00:00 UTC
Persistent=true

[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now kaucjapp-backup.timer kaucjapp-restore-drill.timer

log "Done."
echo
echo "Next steps:"
echo "  1. Add these GitHub Environment (production) values:"
echo "       DEPLOY_HOST        = $(curl -fsS -m 5 https://api.ipify.org 2>/dev/null || echo '<server IP>')"
echo "       DEPLOY_KNOWN_HOSTS = <server IP> $(cut -d' ' -f1,2 /etc/ssh/ssh_host_ed25519_key.pub)"
echo "  2. Point the DNS A record of your API domain at this server."
echo "  3. Run the 'Deploy' workflow."
