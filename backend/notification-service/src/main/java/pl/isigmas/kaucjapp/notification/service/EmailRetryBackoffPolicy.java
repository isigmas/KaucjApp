package pl.isigmas.kaucjapp.notification.service;

import java.time.Duration;

public final class EmailRetryBackoffPolicy {

    public static final int MAX_ATTEMPTS = 6;

    public static final Duration[] RETRY_INTERVALS = {
            Duration.ofSeconds(5),
            Duration.ofSeconds(15),
            Duration.ofMinutes(1),
            Duration.ofMinutes(5),
            Duration.ofMinutes(15),
            Duration.ofHours(1),
    };

    private EmailRetryBackoffPolicy() {
    }

    public static Duration intervalAfterAttempt(int attemptCount) {
        if (attemptCount < 1 || attemptCount > MAX_ATTEMPTS) {
            throw new IllegalArgumentException("attemptCount must be between 1 and " + MAX_ATTEMPTS);
        }
        return RETRY_INTERVALS[attemptCount - 1];
    }
}
