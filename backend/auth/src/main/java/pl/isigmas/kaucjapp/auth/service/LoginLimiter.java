package pl.isigmas.kaucjapp.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class LoginLimiter {

    private final StringRedisTemplate redisTemplate;

    private static final int MAX_ATTEMPTS = 10;
    private static final int BLOCK_DURATION_MINUTES = 15;
    private static final String KEY_PREFIX = "login_attempts:";

    public void incrementAttempts(String credentials) {
        var key = KEY_PREFIX + credentials;
        var currentAttempts = redisTemplate.opsForValue().increment(key);

        if (currentAttempts != null && currentAttempts == 1L) {
            redisTemplate.expire(key, BLOCK_DURATION_MINUTES, TimeUnit.MINUTES);
        }
    }

    public boolean isBlocked(String credentials) {
        var key = KEY_PREFIX + credentials;
        var currentAttempts = redisTemplate.opsForValue().get(key);
        if (currentAttempts == null) {
            return false;
        }

        return Integer.parseInt(currentAttempts) >= MAX_ATTEMPTS;
    }

    public long getRemainingAlertTime(String credentials) {
        String key = KEY_PREFIX + credentials;
        Long expireTime = redisTemplate.getExpire(key, TimeUnit.MINUTES);
        return (expireTime == null || expireTime < 0) ? 0L : expireTime;
    }

    public void clearAttempts(String credentials) {
        var key = KEY_PREFIX + credentials;
        redisTemplate.delete(key);
    }

}
