package pl.isigmas.kaucjapp.deposit;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import pl.isigmas.kaucjapp.deposit.TestcontainersConfiguration;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@ActiveProfiles("test")
class KaucjappApplicationTests {

	@Test
	void contextLoads() {
	}

}
