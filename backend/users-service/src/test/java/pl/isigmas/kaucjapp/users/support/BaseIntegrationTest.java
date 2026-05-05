package pl.isigmas.kaucjapp.users.support;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import pl.isigmas.kaucjapp.users.DTO.CreateUserDTO;
import pl.isigmas.kaucjapp.users.listener.UsersKafkaListener;
import pl.isigmas.kaucjapp.users.repository.UserRepository;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public abstract class BaseIntegrationTest {

    protected MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    private UsersKafkaListener usersKafkaListener;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUpBase() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    public void postCreateUser(String jsonBody) throws Exception {
        JsonNode node = objectMapper.readTree(jsonBody);
        CreateUserDTO user = CreateUserDTO.builder()
                .id(node.get("user_id").asLong())
                .username(node.get("username").asText())
                .firstName(node.has("firstName") ? node.get("firstName").asText() : null)
                .lastName(node.has("lastName") ? node.get("lastName").asText() : null)
                .phone(node.has("phone") ? node.get("phone").asText() : null)
                .email(node.get("email").asText())
                .build();
        usersKafkaListener.handleUserSync(objectMapper.writeValueAsString(user));
    }

    public void deleteUser(Long userId) {
        usersKafkaListener.handleUserDelete(String.valueOf(userId));
    }
}
