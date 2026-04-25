package pl.isigmas.kaucjapp.users.integration.admin;

import org.junit.jupiter.api.Test;
import pl.isigmas.kaucjapp.users.support.BaseIntegrationTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(usersCount + 2));
    }

    @Test
    void deletingUserWorks() throws Exception{
        String createUserJson = """
                {
                    "user_id": 1005,
                    "username": "anowak",
                    "firstName": "Anna",
                    "lastName": "Nowak",
                    "phone": "123456789",
                    "email": "anna@example.com"
                }
                """;
        postCreateUser(createUserJson);

        mockMvc.perform(delete("/api/user/admin/delete/"+1005)
                .header("X-Internal-Secret", TEST_INTERNAL_SECRET))
                .andExpect(status().isOk());

        var deletedUser = userRepository.findById(1005L).orElseThrow();

        assertThat(deletedUser.getUsername()).isEqualTo("deleted-user-"+1005L);
        assertThat(deletedUser.getFirstName()).isEqualTo("Deleted");
        assertThat(deletedUser.getLastName()).isEqualTo("User");
        assertThat(deletedUser.getPhone()).isNull();
        assertThat(deletedUser.getEmail()).isEqualTo("deleted-user-"+1005L+"@deleted.com");


    }
}
