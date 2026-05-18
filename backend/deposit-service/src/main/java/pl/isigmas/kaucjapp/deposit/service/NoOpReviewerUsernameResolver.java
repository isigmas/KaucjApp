package pl.isigmas.kaucjapp.deposit.service;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

/**
 * Default: no cross-service lookup — {@code reviewer_username} stays null in API responses.
 */
@Component
public class NoOpReviewerUsernameResolver implements ReviewerUsernameResolver {

    @Override
    public Map<Long, String> resolveUsernames(Set<Long> userIds) {
        return Map.of();
    }
}
