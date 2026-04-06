package pl.isigmas.kaucjapp.auth.client;

import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import pl.isigmas.kaucjapp.auth.dto.request.UsersServiceUser;

@Component
@FeignClient(name = "users-service", url = "${USER_SERVICE_URL}")
public interface UserClient {

    @PostMapping("/api/user/user")
    ResponseEntity<Void> create(@Valid @RequestBody UsersServiceUser user);
}
