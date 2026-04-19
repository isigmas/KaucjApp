package pl.isigmas.kaucjapp.users;

import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class UserAdminTest extends BaseIntegrationTest {
    @Test
    void gettingAllUsersWorks() throws Exception {

        var usersCount = userRepository.count();
        String createUserJson1 = """
                {
                    "user_id": 1005,
                    "username": "anowak",
                    "firstName": "Anna",
                    "lastName": "Nowak",
                    "phone": "123456789",
                    "email": "anna@example.com"
                }
                """;
        String createUserJson2 = """
                {
                    "user_id": 1006,
                    "username": "stasiekk",
                    "firstName": "Stas",
                    "lastName": "Nowak",
                    "phone": "123456799",
                    "email": "stac@example.com"
                }
                """;

        postCreateUser(createUserJson1);
        postCreateUser(createUserJson2);

        mockMvc.perform(get("/api/user/admin/users"))
                .andExpect(jsonPath("$.length()").value(usersCount+2))
                .andExpect(status().isOk());
    }
}
