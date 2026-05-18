package pl.isigmas.kaucjapp.deposit.service;

import java.util.Map;
import java.util.Set;

/**
 * Resolves reviewer user ids to display names. Deposit-service does not own user data;
 * provide a {@link UsersServiceReviewerUsernameResolver} (HTTP) or another implementation.
 */
public interface ReviewerUsernameResolver {

    Map<Long, String> resolveUsernames(Set<Long> userIds);
}
