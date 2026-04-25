package pl.isigmas.kaucjapp.auth.exception;

import org.springframework.http.HttpStatus;
import pl.isigmas.kaucjapp.auth.entity.enums.AccountStatus;

public class AccountAlreadyDeleted extends AuthBaseException {
  private AccountAlreadyDeleted(String msg, String code, HttpStatus status) {
    super(msg, code, status);
  }

  public static AccountAlreadyDeleted of(AccountStatus status) {
    return switch (status) {
      case PENDING_DELETION -> new AccountAlreadyDeleted("Account already queued for deletion", "AU_009", HttpStatus.CONFLICT);
      case DELETED -> new AccountAlreadyDeleted("Account already deleted", "AU_009", HttpStatus.GONE);
      default -> throw new IllegalArgumentException("Invalid status for this exception: " + status);
    };
  }
}
