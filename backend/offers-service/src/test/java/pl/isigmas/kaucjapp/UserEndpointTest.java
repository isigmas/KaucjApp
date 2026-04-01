package pl.isigmas.kaucjapp;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import pl.isigmas.kaucjapp.model.User;
import pl.isigmas.kaucjapp.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class UserEndpointTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void userCrudAndRatingFlowWorks() throws Exception {
        String createUserJson = """
                {
                    "name": "Anna",
                    "surname": "Nowak",
                    "username": "anowak",
                    "phone_number": "111222333",
                    "email": "anna@example.com",
                    "default_address": "ul. Testowa 2",
                    "default_latitude": 52.23,
                    "default_longitude": 21.01
                }
                """;

        mockMvc.perform(post("/api/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createUserJson))
                .andExpect(status().isCreated());

        User user = userRepository.findAll().stream()
                .filter(it -> "anowak".equals(it.getUsername()))
                .findFirst()
                .orElseThrow();

        Long userId = user.getId();

        mockMvc.perform(get("/api/user/" + userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_id").value(userId))
                .andExpect(jsonPath("$.username").value("anowak"));

        String updateUserJson = """
                {
                    "name": "Anna",
                    "surname": "Kowalska",
                    "username": "anna.k",
                    "phone_number": "999888777",
                    "email": "anna.k@example.com",
                    "default_address": "ul. Zmieniona 3",
                    "default_latitude": 51.10,
                    "default_longitude": 19.20
                }
                """;

        mockMvc.perform(put("/api/user/" + userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateUserJson))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/user/" + userId + "/rating")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score":5}
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/user/" + userId + "/rating"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_id").value(userId))
                .andExpect(jsonPath("$.number_of_feedbacks").value(1))
                .andExpect(jsonPath("$.current_avg").value(5.00));

        mockMvc.perform(post("/api/user/" + userId + "/rating")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"score":3}
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/user/" + userId + "/rating"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_id").value(userId))
                .andExpect(jsonPath("$.number_of_feedbacks").value(2))
                .andExpect(jsonPath("$.current_avg").value(4.00));

        mockMvc.perform(delete("/api/user/" + userId))
                .andExpect(status().isOk());

        assertThat(userRepository.findById(userId)).isEmpty();
    }

    @Test
    void userNotFoundCasesReturn404() throws Exception {
        mockMvc.perform(get("/api/user/999999"))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/user/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void creatingUserWithWrongEmailFormatReturns400() throws Exception {
        String createUserJson = """
                {
                    "name": "Anna",
                    "surname": "Nowak",
                    "username": "anowak",
                    "phone_number": "111222333",
                    "email": "to nie jest poprawny email",
                    "default_address": "ul. Testowa 2",
                    "default_latitude": 52.23,
                    "default_longitude": 21.01
                }
                """;

        mockMvc.perform(post("/api/user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createUserJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void creatingUserWithWrongPhoneNumberFormatReturns400() throws Exception {
        String createUserJson = """
                {
                    "name": "Anna",
                    "surname": "Nowak",
                    "username": "anowak",
                    "phone_number": "to nie jest poprawny numer telefonu",
                    "email": "anna@example.com",
                    "default_address": "ul. Testowa 2",
                    "default_latitude": 52.23,
                    "default_longitude": 21.01
                }
                """;

        mockMvc.perform(post("/api/user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createUserJson))
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest(name = "Should return 400 when: {1}")
    @MethodSource("provideInvalidUserPayloads")
    void creatingUserWithInvalidDataReturns400(String invalidJson, String failureReason) throws Exception {
        
        mockMvc.perform(post("/api/user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    private static Stream<Arguments> provideInvalidUserPayloads() {
        return Stream.of(
            Arguments.of("""
                {
                    "name": "Anna",
                    "surname": "Nowak",
                    "phone_number": "111222333",
                    "email": "anna@example.com",
                    "default_address": "ul. Testowa 2",
                    "default_latitude": 52.23,
                    "default_longitude": 21.01
                }
                """, "Missing username"),

            Arguments.of("""
                {
                    "name": "Anna",
                    "surname": "Nowak",
                    "username": "anowak",
                    "phone_number": "111222333",
                    "email": "anna@example.com",
                    "default_latitude": 52.23,
                    "default_longitude": 21.01
                }
                """, "Missing defaultAddress"),

        Arguments.of("""
                {
                    "name": "Anna",
                    "surname": "Nowak",
                    "username": "anowak",
                    "phone_number": "111222333",
                    "email": "anna@example.com",
                    "default_address": "ul. Testowa 2",
                    "default_longitude": 21.01
                }
                """, "Missing defaultLatitude"),

        Arguments.of("""
                {
                    "name": "Anna",
                    "surname": "Nowak",
                    "username": "anowak",
                    "phone_number": "111222333",
                    "email": "anna@example.com",
                    "default_address": "ul. Testowa 2",
                    "default_latitude": 52.23                }
                """, "Invalid defaultLongitude format"),
        Arguments.of("""
                {
                    "surname": "Nowak",
                    "username": "anowak",
                    "phone_number": "111222333",
                    "email": "anna@example.com",
                    "default_address": "ul. Testowa 2",
                    "default_latitude": 52.23,
                    "default_longitude": 21.01
                }
                """, "Missing name"),

            Arguments.of("""
                {
                    "name": "Anna",
                    "username": "anowak",
                    "phone_number": "111222333",
                    "email": "anna@example.com",
                    "default_address": "ul. Testowa 2",
                    "default_latitude": 52.23,
                    "default_longitude": 21.01
                }
                """, "Missing surname")

        );
    }
}
