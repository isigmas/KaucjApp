# Lista kroków: uruchomienie backendu na VPS (po polsku)

Plik dla właściciela projektu; pozostała dokumentacja jest po angielsku. Szczegóły techniczne: [README.md](README.md), [CUTOVER.md](CUTOVER.md).
Zaznaczaj kroki w miarę postępów. Zamiast `IP` wpisuj adres IP serwera.

Domeny nie trzeba kupować: `kaucjapp.pl` przejmiesz od kolegi. Do tego czasu używasz darmowego adresu z DuckDNS.

---

## Część A: teraz (około 1,5 godziny)

- [x] **0. Repozytorium:** token GitHub unieważniony, remote bez tokena, gałąź `kaucjap-three-dot-zero-prod-by-maxxx` wypchnięta.

- [ ] **1. Kup VPS**
  1. [ovhcloud.com/pl/vps](https://www.ovhcloud.com/pl/vps/): **VPS-1** (4 GB RAM, około 20 zł/mies.) albo **VPS-2** (8 GB, około 38 zł) dla zapasu.
  2. System **Ubuntu 24.04**, lokalizacja **Warszawa**, okres miesięczny.
  3. W mailu po zakupie znajdziesz **adres IP** i dane użytkownika `ubuntu`.

- [ ] **2. Klucz SSH dla deployu** (na Macu)
  ```bash
  ssh-keygen -t ed25519 -f ~/.ssh/kaucjapp_deploy -C github-deploy -N ""
  ```

- [ ] **3. Przygotuj serwer**
  ```bash
  scp deploy/scripts/bootstrap.sh ~/.ssh/kaucjapp_deploy.pub ubuntu@IP:~
  ssh ubuntu@IP
  sudo DEPLOY_SSH_PUBLIC_KEY="$(cat kaucjapp_deploy.pub)" bash bootstrap.sh
  ```
  1. Skopiuj do notatek linię `DEPLOY_KNOWN_HOSTS = ...` z końca wyniku (zawsze odtworzysz ją przez `ssh-keyscan -t ed25519 IP`).
  2. **Nie zamykaj tej sesji.** W nowym terminalu sprawdź: `ssh -i ~/.ssh/kaucjapp_deploy deploy@IP 'docker ps'`. Dopiero potem zamknij pierwszą sesję.
     Od teraz logujesz się tylko jako `deploy` tym kluczem.

- [ ] **4. Darmowy adres w DuckDNS**
  1. [duckdns.org](https://www.duckdns.org): zaloguj się kontem GitHub.
  2. Utwórz subdomenę, np. `kaucjapp` (czyli `kaucjapp.duckdns.org`), wpisz w „current ip” adres `IP`, kliknij „update ip”.
  3. `ping kaucjapp.duckdns.org` powinien pokazać Twoje IP.

- [ ] **5. Cloudflare R2 (zdjęcia i backupy)**
  1. Konto na [dash.cloudflare.com](https://dash.cloudflare.com), potem **R2 Object Storage** (wymaga karty, do 10 GB za darmo).
  2. Bucket `kaucjapp-profile-pictures`: Settings → **Public Development URL** → Enable. Zapisz `https://pub-....r2.dev`.
  3. Bucket `kaucjapp-backups`: bez żadnych zmian (prywatny).
  4. **Manage R2 API Tokens** → Create API token: uprawnienia **Object Read & Write**, zakres oba buckety.
     Zapisz **Access Key ID**, **Secret Access Key** (pokazuje się raz) i endpoint `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.

- [ ] **6. healthchecks.io:** konto, check `kaucjapp-backup` (Period 1 day, Grace 2 hours). Skopiuj **ping URL**.

- [ ] **7. Sekrety w GitHubie** (z katalogu repo, podmień `<...>`)
  ```bash
  gh api -X PUT repos/isigmas/KaucjApp/environments/production
  E="--env production"

  gh variable set DEPLOY_HOST $E --body "<IP>"
  gh variable set API_DOMAIN $E --body "kaucjapp.duckdns.org"
  gh variable set ACME_EMAIL $E --body "<twoj mail>"
  gh variable set DB_USER $E --body "kaucjapp"
  gh variable set ADMIN_USERNAME $E --body "admin"
  gh variable set ADMIN_EMAIL $E --body "<twoj mail>"
  gh variable set STORAGE_S3_ENDPOINT $E --body "https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
  gh variable set STORAGE_S3_BUCKET $E --body "kaucjapp-profile-pictures"
  gh variable set STORAGE_S3_PUBLIC_BASE_URL $E --body "https://pub-<...>.r2.dev"
  gh variable set BACKUP_S3_ENDPOINT $E --body "https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
  gh variable set BACKUP_S3_BUCKET $E --body "kaucjapp-backups"

  openssl rand -hex 32 | gh secret set DB_PASSWORD $E
  openssl rand -hex 32 | gh secret set REDIS_PASSWORD $E
  openssl rand -hex 32 | gh secret set JWT_SECRET $E
  openssl rand -hex 8  | gh secret set PASSWORD_SALT $E
  openssl rand -hex 32 | gh secret set IT_SECRET $E
  gh secret set DEPLOY_SSH_KEY $E < ~/.ssh/kaucjapp_deploy
  gh secret set DEPLOY_KNOWN_HOSTS $E --body "<linia z kroku 3, bez 'DEPLOY_KNOWN_HOSTS = '>"
  ```
  Sekrety wpisywane ręcznie (`gh` zapyta o wartość):
  ```bash
  gh secret set ADMIN_PASSWORD $E          # tylko litery i cyfry; zapisz w menedżerze haseł
  gh secret set MAIL_PASSWORD $E           # klucz Resend, ten sam co MAIL_PASSWORD w backend/.env
  gh secret set STORAGE_S3_ACCESS_KEY $E   # Access Key ID z R2
  gh secret set STORAGE_S3_SECRET_KEY $E   # Secret Access Key z R2
  gh secret set BACKUP_S3_ACCESS_KEY $E    # ten sam Access Key ID
  gh secret set BACKUP_S3_SECRET_KEY $E    # ten sam Secret Access Key
  gh secret set BACKUP_HEALTHCHECK_URL $E  # ping URL z healthchecks.io
  ```
  Kontrola: `gh variable list $E` (11 zmiennych) i `gh secret list $E` (14 sekretów).
  Wartości nie mogą zawierać spacji, `$`, `#`, cudzysłowów ani backslasha (workflow to sprawdza).

- [ ] **8. Pierwszy deploy**
  ```bash
  gh pr create --base main --fill
  ```
  Daj znać koledze, bo pracuje na `main`. Merge usuwa folder `infra/` (Azure), ale na Azure nic się nie zmieni.
  Po zielonych testach zrób merge. Uruchomią się **Build backend images** (10–20 min) i **Deploy** (około 5 min); postęp: Actions albo `gh run watch`.
  Zielony Deploy oznacza, że smoke test na serwerze przeszedł.

- [ ] **9. Sprawdź ręcznie**
  ```bash
  curl https://kaucjapp.duckdns.org/api/gateway/status
  SMOKE_UPLOAD=1 ADMIN_USERNAME=admin ADMIN_PASSWORD='<haslo>' deploy/scripts/smoke-test.sh https://kaucjapp.duckdns.org
  ssh -i ~/.ssh/kaucjapp_deploy deploy@IP
    /opt/kaucjapp/scripts/backup.sh          # w R2 powinien być folder daily/<data>
    /opt/kaucjapp/scripts/restore.sh drill   # test odtworzenia backupu
    docker stats --no-stream                 # zużycie RAM
  ```

- [ ] **10. UptimeRobot:** monitor HTTP(s) na `https://kaucjapp.duckdns.org/api/gateway/status`, co 5 min, alert na maila.

- [ ] **11. Test aplikacji na produkcyjnym backendzie:** w `mobile/KaucjApp/.env` ustaw `EXPO_PUBLIC_API_URL=https://kaucjapp.duckdns.org/api`, uruchom `npx expo start --clear`.
  Sprawdź logowanie, rejestrację (mail aktywacyjny), oferty, automaty i zdjęcie profilowe.

---

## Część B: gdy kolega przepisze domenę i Resend (za tydzień)

- [ ] **12. DNS do Cloudflare**
  1. Cloudflare → Add a domain → `kaucjapp.pl` → plan Free.
  2. Sprawdź, czy zaimportowały się rekordy Resend (`resend._domainkey`, `send`, SPF) i `_dmarc`.
  3. W panelu Hostido zmień serwery DNS na dwa z Cloudflare.
  4. Gdy domena jest „Active”: rekord `A` `api` → `IP` jako **DNS only** (szara chmurka).
  5. Bucket zdjęć → Custom Domains → Connect `cdn.kaucjapp.pl`.

- [ ] **13. Przełącz backend na domenę**
  ```bash
  gh variable set API_DOMAIN --env production --body "api.kaucjapp.pl"
  gh variable set STORAGE_S3_PUBLIC_BASE_URL --env production --body "https://cdn.kaucjapp.pl"
  gh workflow run deploy.yml
  ```
  Potem na serwerze uruchom SQL z sekcji „Temporary setup without access to the domain's DNS” w `README.md` (przepisuje adresy zdjęć). Zmień adres w UptimeRobot.

- [ ] **14. Resend:** w Resend → Domains domena `kaucjapp.pl` ma być **Verified**. Własny klucz: `gh secret set MAIL_PASSWORD --env production`, potem `gh workflow run deploy.yml`.

- [ ] **15. Build aplikacji do sklepu:** `EXPO_PUBLIC_API_URL=https://api.kaucjapp.pl/api` w `mobile/KaucjApp/.env`. Nie wydawaj publicznie wersji z adresem DuckDNS.

- [ ] **16. Usuń Azure:** gdy wszystko działa, usuń resource group w Azure Portal. Następnego dnia sprawdź Cost Management.

---

## Koszt miesięczny
VPS 20–38 zł. R2, healthchecks.io, UptimeRobot, Cloudflare DNS, DuckDNS i GitHub Actions: 0 zł.
