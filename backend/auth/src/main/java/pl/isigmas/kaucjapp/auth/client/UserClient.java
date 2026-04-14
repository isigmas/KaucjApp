package pl.isigmas.kaucjapp.auth.client;

import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import pl.isigmas.kaucjapp.auth.dto.request.UsersServiceUser;

@FeignClient(name = "users-service", url = "${USER_SERVICE_URL}")
public interface UserClient {

    @PostMapping("/api/user/user")
    ResponseEntity<Void> create(
            @Valid @RequestBody UsersServiceUser user,
            @RequestHeader("X-Internal-Secret") String internalSecret);
}
