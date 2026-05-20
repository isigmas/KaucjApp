package pl.isigmas.kaucjapp.users.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.users.DTO.AdminStatsDTO;
import pl.isigmas.kaucjapp.users.DTO.UserAdminDTO;
import pl.isigmas.kaucjapp.users.service.UserService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user/admin")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserService userService;


    @GetMapping("/users")
    @Operation(
            summary = "List all users",
            description = "Returns all users located in db"
    )
    public ResponseEntity<List<UserAdminDTO>> getAllUsers(){
        log.info("Getting all users");
        return ResponseEntity.ok(userService.getAll());
    }

    @GetMapping("/stats")
    @Operation(
            summary = "Get all time stats"
    )
    public ResponseEntity<AdminStatsDTO> getAllStats(){
        log.info("Getting all time stats for admin");
        return ResponseEntity.ok(userService.getAllStats());

    }

}
