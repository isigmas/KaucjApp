package pl.isigmas.kaucjapp.users;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import pl.isigmas.kaucjapp.users.model.User;
import pl.isigmas.kaucjapp.users.repository.UserRepository;

import java.util.stream.Stream;

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
        String createRatedUserJson = """
                {
                    "username": "anowak",
                    "firstName": "Anna",
                    "lastName": "Nowak",
                    "phone": "111222333",
                    "email": "anna@example.com",
                    %s
                }
                """.formatted(VALID_ADDRESS_BLOCK);

        mockMvc.perform(post("/api/user/user")
                        .header("X-User-Id",1005L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRatedUserJson))
                .andExpect(status().isCreated());

        User ratedUser = userRepository.findAll().stream()
                .filter(it -> "anowak".equals(it.getUsername()))
                .findFirst()
                .orElseThrow();
        Long ratedUserId = ratedUser.getId();

        String createRaterJson = """
                {
                    "username": "bkowal",
                    "firstName": "Bartek",
                    "lastName": "Kowal",
                    "phone": "222333444",
                    "email": "bartek@example.com",
                    %s
                }
                """.formatted(VALID_ADDRESS_BLOCK);

        mockMvc.perform(post("/api/user/user")
                        .header("X-User-Id",1006L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRaterJson))
                .andExpect(status().isCreated());

        Long raterId = userRepository.findAll().stream()
                .filter(it -> "bkowal".equals(it.getUsername()))
                .findFirst()
                .orElseThrow()
                .getId();

        mockMvc.perform(get("/api/user/" + ratedUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_id").value(ratedUserId))
                .andExpect(jsonPath("$.username").value("anowak"));

        String updateUserJson = """
                {
                    "username": "anna.k",
                    "firstName": "Anna",
                    "lastName": "Kowalska",
                    "phone": "999888777",
                    "email": "anna.k@example.com",
                    %s
                }
                """.formatted(VALID_ADDRESS_BLOCK);

        mockMvc.perform(put("/api/user/" + ratedUserId)
                        .header("X-User-Id", ratedUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateUserJson))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/user/" + ratedUserId + "/rating")
                        .header("X-User-Id", raterId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":5}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/user/" + ratedUserId + "/rating"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_id").value(ratedUserId))
                .andExpect(jsonPath("$.feedback_count").value(1))
                .andExpect(jsonPath("$.avg_score").value(5.00));

        mockMvc.perform(post("/api/user/" + ratedUserId + "/rating")
                        .header("X-User-Id", raterId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":3}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/user/" + ratedUserId + "/rating"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_id").value(ratedUserId))
                .andExpect(jsonPath("$.feedback_count").value(2))
                .andExpect(jsonPath("$.avg_score").value(4.00));

        mockMvc.perform(delete("/api/user/" + ratedUserId)
                        .header("X-User-Id", ratedUserId))
                .andExpect(status().isOk());

        assertThat(userRepository.findById(ratedUserId)).isEmpty();
    }

    @Test
    void userNotFoundCasesReturn404() throws Exception {
        mockMvc.perform(get("/api/user/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("not_found"));

        mockMvc.perform(delete("/api/user/999999")
                        .header("X-User-Id", 999999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("not_found"));
    }

    @Test
    void cannotRateYourselfReturns403() throws Exception {
        String json = """
                {
                    "username": "solo",
                    "firstName": "Solo",
                    "lastName": "User",
                    "phone": "333444555",
                    "email": "solo@example.com",
                    %s
                }
                """.formatted(VALID_ADDRESS_BLOCK);

        mockMvc.perform(post("/api/user/user")
                        .header("X-User-Id",1005L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated());

        Long userId = userRepository.findAll().stream()
                .filter(u -> "solo".equals(u.getUsername()))
                .findFirst()
                .orElseThrow()
                .getId();

        mockMvc.perform(post("/api/user/" + userId + "/rating")
                        .header("X-User-Id", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":5}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("forbidden"));
    }

    @Test
    void ratingWithInvalidScoreReturns400() throws Exception {
        String json = """
                {
                    "username": "rated",
                    "firstName": "R",
                    "lastName": "ated",
                    "phone": "444555666",
                    "email": "rated@example.com",
                    %s
                }
                """.formatted(VALID_ADDRESS_BLOCK);

        mockMvc.perform(post("/api/user/user")
                        .header("X-User-Id",1005L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated());

        String raterJson = """
                {
                    "username": "rater",
                    "firstName": "Ra",
                    "lastName": "ter",
                    "phone": "555666777",
                    "email": "rater@example.com",
                    %s
                }
                """.formatted(VALID_ADDRESS_BLOCK);

        mockMvc.perform(post("/api/user/user")
                        .header("X-User-Id",1006L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(raterJson))
                .andExpect(status().isCreated());

        Long ratedId = userRepository.findAll().stream()
                .filter(u -> "rated".equals(u.getUsername()))
                .findFirst()
                .orElseThrow()
                .getId();
        Long raterId = userRepository.findAll().stream()
                .filter(u -> "rater".equals(u.getUsername()))
                .findFirst()
                .orElseThrow()
                .getId();

        mockMvc.perform(post("/api/user/" + ratedId + "/rating")
                        .header("X-User-Id", raterId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":0}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/user/" + ratedId + "/rating")
                        .header("X-User-Id", raterId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":6}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void creatingUserWithWrongEmailFormatReturns400() throws Exception {
        String createUserJson = """
                {
                    "username": "anowak",
                    "firstName": "Anna",
                    "lastName": "Nowak",
                    "phone": "111222333",
                    "email": "to nie jest poprawny email",
                    %s
                }
                """.formatted(VALID_ADDRESS_BLOCK);

        mockMvc.perform(post("/api/user/user")
                .header("X-User-Id",1005L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(createUserJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void creatingUserWithWrongPhoneNumberFormatReturns400() throws Exception {
        String createUserJson = """
                {
                    "username": "anowak",
                    "firstName": "Anna",
                    "lastName": "Nowak",
                    "phone": "letters",
                    "email": "anna@example.com",
                    %s
                }
                """.formatted(VALID_ADDRESS_BLOCK);

        mockMvc.perform(post("/api/user/user")
                .header("X-User-Id",1005L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(createUserJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void gettingMyAddressesReturns200() throws Exception {
        String createUserJson = """
                {
                    "username": "anowak",
                    "firstName": "Anna",
                    "lastName": "Nowak",
                    "phone": "123456789",
                    "email": "anna@example.com",
                    "addresses": [
                        {
                    "addressLabel": "home",
                    "address": "ul. Testowa 2",
                    "latitude": 52.23,
                    "longitude": 21.01,
                    "default": true
                        },
                    {
                    "addressLabel": "work",
                    "address": "ul. Testowa 3",
                    "latitude": 52.24,
                    "longitude": 21.03,
                    "default": false
                        }
                    ]
                }
               """;

        mockMvc.perform(post("/api/user/user")
                        .header("X-User-Id",1005L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createUserJson))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/user/me/addresses")
                .header("X-User-Id",1005L)).andExpect(status().isOk());
    }

    @ParameterizedTest(name = "Should return 400 when: {1}")
    @MethodSource("provideInvalidUserPayloads")
    void creatingUserWithInvalidDataReturns400(String invalidJson, @SuppressWarnings("unused") String failureReason) throws Exception {

        mockMvc.perform(post("/api/user/user")
                .header("X-User-Id",1005L)
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
                    "email": "anna@example.com",
                    "addresses": []
                }
                """, "Missing username"),

            Arguments.of("""
                {
                    "username": "anowak",
                    "lastName": "Nowak",
                    "phone": "111222333",
                    "email": "anna@example.com",
                    "addresses": []
                }
                """, "Missing first name"),

            Arguments.of("""
                {
                    "username": "anowak",
                    "firstName": "Anna",
                    "phone": "111222333",
                    "email": "anna@example.com",
                    "addresses": []
                }
                """, "Missing last name"),

            Arguments.of("""
                {
                    "username": "anowak",
                    "firstName": "Anna",
                    "lastName": "Nowak",
                    "email": "anna@example.com",
                    "addresses": [{
                        "address": "ul. Test",
                        "latitude": 52.23,
                        "longitude": 21.01,
                        "default": true
                    }]
                }
                """, "Missing phone")
        );
    }
}
