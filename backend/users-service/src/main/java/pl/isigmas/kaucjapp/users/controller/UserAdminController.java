package pl.isigmas.kaucjapp.users.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.isigmas.kaucjapp.common.logger.Logger;
import pl.isigmas.kaucjapp.users.DTO.AdminStatsDTO;
import pl.isigmas.kaucjapp.users.DTO.UserAdminDTO;
import pl.isigmas.kaucjapp.users.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/user/admin")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserService userService;
    private final Logger logger;


    @GetMapping("/users")
    @Operation(
            summary = "List all users",
            description = "Returns all users located in db"
    )
    public ResponseEntity<List<UserAdminDTO>> getAllUsers(){
        logger.info("Getting all users");
        return ResponseEntity.ok(userService.getAll());
    }

    @GetMapping("/stats")
    @Operation(
            summary = "Get all time stats"
    )
    public ResponseEntity<AdminStatsDTO> getAllStats(){
        logger.info("Getting all time stats for admin");
        return ResponseEntity.ok(userService.getAllStats());

    }

}
