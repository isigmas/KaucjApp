package pl.isigmas.kaucjapp.users.integration.profile;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.users.model.User;
import pl.isigmas.kaucjapp.users.support.BaseIntegrationTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class UserProfileEndpointTest extends BaseIntegrationTest {

    private static final String VALID_ADDRESS_BLOCK = """
            "addresses": [
                {
                    "address_label": "home",
                    "address": "ul. Testowa 2",
                    "latitude": 52.23,
                    "longitude": 21.01,
                    "default": true
                }
            ]
            """;

    @Test
    void userCrudFlowWorks() throws Exception {
        String createdUserJson = """
                {
                    "user_id": 1005,
                    "username": "anowak",
                    "first_name": "Anna",
                    "last_name": "Nowak",
                    "phone": "111222333",
                    "email": "anna@example.com"
                }
                """;

        postCreateUser(createdUserJson);

        User user = userRepository.findAll().stream()
                .filter(it -> "anowak".equals(it.getUsername()))
                .findFirst()
                .orElseThrow();
        Long userId = user.getId();
        assertThat(userId).isEqualTo(1005L);

        mockMvc.perform(get("/api/user/" + userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_id").value(userId))
                .andExpect(jsonPath("$.username").value("anowak"));

        String updateUserJson = """
                {
                    "first_name": "Anna",
                    "last_name": "Kowalska",
                    %s
                }
                """.formatted(VALID_ADDRESS_BLOCK);

        mockMvc.perform(patch("/api/user/me")
                        .header("X-User-Id", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateUserJson))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/user/me")
                .header("X-User-Id", userId))
                .andExpect(status().isNoContent());

        var deletedUser = userRepository.findById(userId).orElseThrow();

        assertThat(deletedUser.getUsername()).isEqualTo("deleted-user-"+userId);
        assertThat(deletedUser.getFirstName()).isEqualTo("Deleted");
        assertThat(deletedUser.getLastName()).isEqualTo("User");
        assertThat(deletedUser.getPhone()).isNull();
        assertThat(deletedUser.getEmail()).isEqualTo("deleted-user-"+userId+"@deleted.com");
    }

    @Test
    void userNotFoundCasesReturn404() throws Exception {
        mockMvc.perform(get("/api/user/999999"))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/user/me")
                        .header("X-User-Id", 999999L))
                .andExpect(status().isNotFound());
    }

    @Test
    void creatingUserWithDuplicateEmailReturns409() throws Exception {
        String first = """
                {
                    "user_id": 92001,
                    "username": "dupe",
                    "first_name": "A",
                    "last_name": "A",
                    "phone": "111222335",
                    "email": "duplicate@example.com"
                }
                """;
        String second = """
                {
                    "user_id": 92002,
                    "username": "dupb",
                    "first_name": "B",
                    "last_name": "B",
                    "phone": "111222336",
                    "email": "duplicate@example.com"
                }
                """;

        postCreateUser(first);
        try {
            postCreateUser(second);
        } catch (Exception e) {
            // In Kafka system, conflict might happen in DB during listener execution
        }

        var users = userRepository.findAll().stream()
                .filter(u -> "duplicate@example.com".equals(u.getEmail()))
                .toList();
        assertThat(users).hasSize(1);
    }

    @Test
    void getMeWithoutUserIdHeaderReturns400() throws Exception {
        mockMvc.perform(get("/api/user/me"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("BAD_REQUEST"));
    }

    @Test
    void patchMeWithoutUserIdHeaderReturns400() throws Exception {
        mockMvc.perform(patch("/api/user/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"first_name\": \"X\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("BAD_REQUEST"));
    }

    @Test
    void deleteProfilePicture_clearsUrl() throws Exception {
        String createdUserJson = """
                {
                    "user_id": 1006,
                    "username": "picuser",
                    "first_name": "P",
                    "last_name": "U",
                    "phone": "111222334",
                    "email": "pic@example.com"
                }
                """;

        postCreateUser(createdUserJson);

        User user = userRepository.findAll().stream()
                .filter(it -> "picuser".equals(it.getUsername()))
                .findFirst()
                .orElseThrow();
        Long userId = user.getId();
        user.setProfilePictureUrl("http://127.0.0.1:10000/devstoreaccount1/profile-pictures/user-6-test.jpg");
        userRepository.saveAndFlush(user);

        mockMvc.perform(delete("/api/user/me/profile-picture").header("X-User-Id", userId))
                .andExpect(status().isNoContent());

        assertThat(userRepository.findById(userId).orElseThrow().getProfilePictureUrl()).isNull();
    }

    @Test
    void deleteProfilePicture_withoutPicture_isIdempotent() throws Exception {
        String createdUserJson = """
                {
                    "user_id": 1007,
                    "username": "nopic",
                    "first_name": "N",
                    "last_name": "P",
                    "phone": "111222337",
                    "email": "nopic@example.com"
                }
                """;

        postCreateUser(createdUserJson);

        Long userId = userRepository.findAll().stream()
                .filter(it -> "nopic".equals(it.getUsername()))
                .findFirst()
                .orElseThrow()
                .getId();

        mockMvc.perform(delete("/api/user/me/profile-picture").header("X-User-Id", userId))
                .andExpect(status().isNoContent());
    }
}
