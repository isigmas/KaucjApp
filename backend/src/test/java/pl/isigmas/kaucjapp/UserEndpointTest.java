package pl.isigmas.kaucjapp;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
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
                    "phoneNumber": "111222333",
                    "email": "anna@example.com",
                    "defaultAddress": "ul. Testowa 2",
                    "defaultLatitude": 52.23,
                    "defaultLongitude": 21.01
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
                    "phoneNumber": "999888777",
                    "email": "anna.k@example.com",
                    "defaultAddress": "ul. Zmieniona 3",
                    "defaultLatitude": 51.10,
                    "defaultLongitude": 19.20
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
}
