package pl.isigmas.kaucjapp.users.integration.address;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import pl.isigmas.kaucjapp.users.support.BaseIntegrationTest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class UserAddressEndpointTest extends BaseIntegrationTest {
    @Test
    void gettingMyAddressesReturns200() throws Exception {
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

        postCreateUser(createUserJson).andExpect(status().isCreated());

        String updateUserJson = """
                {
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

        mockMvc.perform(patch("/api/user/me")
                        .header("X-User-Id", 1005L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateUserJson))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/user/me/addresses")
                        .header("X-User-Id", 1005L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].addressLabel").value("home"))
                .andExpect(jsonPath("$[1].addressLabel").value("work"));
    }

    @Test
    void gettingMyAddressesWithoutUserIdHeaderReturns400() throws Exception {
        mockMvc.perform(get("/api/user/me/addresses"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.path").value("/api/user/me/addresses"));
    }

    @Test
    void patchWithOnlyFirstNameDoesNotChangeAddresses() throws Exception {
        String createUserJson = """
                {
                    "user_id": 2001,
                    "username": "u2001",
                    "firstName": "Old",
                    "lastName": "Name",
                    "phone": "123456789",
                    "email": "u2001@example.com"
                }
                """;
        postCreateUser(createUserJson).andExpect(status().isCreated());

        String setAddressesJson = """
                {
                    "addresses": [
                        {
                            "addressLabel": "home",
                            "address": "ul. A 1",
                            "latitude": 52.23,
                            "longitude": 21.01,
                            "default": true
                        }
                    ]
                }
                """;
        mockMvc.perform(patch("/api/user/me")
                        .header("X-User-Id", 2001L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(setAddressesJson))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/user/me/addresses").header("X-User-Id", 2001L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].addressLabel").value("home"));

        String patchFirstNameOnly = """
                {
                    "firstName": "New"
                }
                """;
        mockMvc.perform(patch("/api/user/me")
                        .header("X-User-Id", 2001L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patchFirstNameOnly))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/user/2001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("New"))
                .andExpect(jsonPath("$.lastName").value("Name"));

        mockMvc.perform(get("/api/user/me/addresses").header("X-User-Id", 2001L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].addressLabel").value("home"));
    }

    @Test
    void patchWithLatitudeOutOfRangeReturnsValidationError() throws Exception {
        String createUserJson = """
                {
                    "user_id": 2003,
                    "username": "u2003",
                    "firstName": "A",
                    "lastName": "B",
                    "phone": "123456789",
                    "email": "u2003@example.com"
                }
                """;
        postCreateUser(createUserJson).andExpect(status().isCreated());

        String badLatJson = """
                {
                    "addresses": [
                        {
                            "addressLabel": "home",
                            "address": "Somewhere",
                            "latitude": 999,
                            "longitude": 21.01,
                            "default": false
                        }
                    ]
                }
                """;

        mockMvc.perform(patch("/api/user/me")
                        .header("X-User-Id", 2003L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badLatJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERR"))
                .andExpect(jsonPath("$.validationErrors['addresses[0].latitude']").exists());
    }

    @Test
    void patchWithEmptyAddressesClearsAddresses() throws Exception {
        String createUserJson = """
                {
                    "user_id": 2002,
                    "username": "u2002",
                    "firstName": "A",
                    "lastName": "B",
                    "phone": "123456789",
                    "email": "u2002@example.com"
                }
                """;
        postCreateUser(createUserJson).andExpect(status().isCreated());

        String setAddressesJson = """
                {
                    "addresses": [
                        {
                            "addressLabel": "home",
                            "address": "ul. A 1",
                            "latitude": 52.23,
                            "longitude": 21.01,
                            "default": true
                        }
                    ]
                }
                """;
        mockMvc.perform(patch("/api/user/me")
                        .header("X-User-Id", 2002L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(setAddressesJson))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/user/me/addresses").header("X-User-Id", 2002L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].addressLabel").value("home"));

        mockMvc.perform(patch("/api/user/me")
                        .header("X-User-Id", 2002L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"addresses\": []}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/user/me/addresses").header("X-User-Id", 2002L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

}
