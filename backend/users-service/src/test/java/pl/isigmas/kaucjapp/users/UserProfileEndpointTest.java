package pl.isigmas.kaucjapp.users;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.users.model.User;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class UserProfileEndpointTest extends BaseIntegrationTest {

    private static final String VALID_ADDRESS_BLOCK = """
            "addresses": [
                {
                    "addressLabel": "home",
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
                    "firstName": "Anna",
                    "lastName": "Nowak",
                    "phone": "111222333",
                    "email": "anna@example.com"
                }
                """;

        postCreateUser(createdUserJson).andExpect(status().isCreated());

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
                    "firstName": "Anna",
                    "lastName": "Kowalska",
                    %s
                }
                """.formatted(VALID_ADDRESS_BLOCK);

        mockMvc.perform(patch("/api/user/me")
                        .header("X-User-Id", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateUserJson))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/user/me")
                .header("X-User-Id", userId))
                .andExpect(status().isOk());

        assertThat(userRepository.findById(userId)).isEmpty();
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
    void creatingUserWithWrongEmailFormatReturns400() throws Exception {
        String createUserJson = """
                {
                    "user_id": 1005,
                    "username": "anowak",
                    "firstName": "Anna",
                    "lastName": "Nowak",
                    "phone": "111222333",
                    "email": "to nie jest poprawny email"
                }
                """;

        postCreateUser(createUserJson).andExpect(status().isBadRequest());
    }

    @Test
    void creatingUserWithWrongPhoneNumberFormatReturns400() throws Exception {
        String createUserJson = """
                {
                    "user_id": 1005,
                    "username": "anowak",
                    "firstName": "Anna",
                    "lastName": "Nowak",
                    "phone": "letters",
                    "email": "anna@example.com"
                }
                """;

        postCreateUser(createUserJson).andExpect(status().isBadRequest());
    }

    @ParameterizedTest(name = "Should return 400 when: {1}")
    @MethodSource("provideInvalidUserPayloads")
    void creatingUserWithInvalidDataReturns400(String invalidJson, @SuppressWarnings("unused") String failureReason) throws Exception {

        mockMvc.perform(post("/api/user/user")
                        .header("X-Internal-Secret", TEST_INTERNAL_SECRET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    private static Stream<Arguments> provideInvalidUserPayloads() {
        return Stream.of(
                Arguments.of("""
                        {
                            "firstName": "Anna",
                            "lastName": "Nowak",
                            "phone": "111222333",
                            "email": "anna@example.com"
                        }
                        """, "Missing user_id"),

                Arguments.of("""
                        {
                            "user_id": 1005,
                            "lastName": "Nowak",
                            "phone": "111222333",
                            "email": "anna@example.com"
                        }
                        """, "Missing username"),

                Arguments.of("""
                        {
                            "user_id": 1005,
                            "username": "anowak",
                            "lastName": "Nowak",
                            "phone": "111222333",
                            "email": "anna@example.com"
                        }
                        """, "Missing first name"),

                Arguments.of("""
                        {
                            "user_id": 1005,
                            "username": "anowak",
                            "firstName": "Anna",
                            "phone": "111222333",
                            "email": "anna@example.com"
                        }
                        """, "Missing last name"),

                Arguments.of("""
                        {
                            "user_id": 1005,
                            "username": "anowak",
                            "firstName": "Anna",
                            "lastName": "Nowak",
                            "email": "anna@example.com"
                        }
                        """, "Missing phone")
        );
    }
}
