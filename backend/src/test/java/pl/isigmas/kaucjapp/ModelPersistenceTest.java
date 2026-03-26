package pl.isigmas.kaucjapp;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.model.BottlePrice;
import pl.isigmas.kaucjapp.model.Offer;
import pl.isigmas.kaucjapp.model.OfferCount;
import pl.isigmas.kaucjapp.model.OfferInfo;
import pl.isigmas.kaucjapp.model.OfferStatus;
import pl.isigmas.kaucjapp.model.Rating;
import pl.isigmas.kaucjapp.model.User;
import pl.isigmas.kaucjapp.repository.OfferRepository;
import pl.isigmas.kaucjapp.repository.RatingRepository;
import pl.isigmas.kaucjapp.repository.UserRepository;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class ModelPersistenceTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Test
    void savesUserOfferAndRatingRelations() {
        User creator = new User();
        creator.setName("Jan");
        creator.setSurname("Kowalski");
        creator.setUsername("jkowalski_model");
        creator.setEmail("jkowalski_model@example.com");
        creator.setPhoneNumber("123123123");
        creator.setDefaultAddress("ul. Model 1");
        creator.setDefaultLatitude(new BigDecimal("52.229700"));
        creator.setDefaultLongitude(new BigDecimal("21.012200"));
        creator = userRepository.save(creator);

        Rating rating = Rating.builder()
                .user(creator)
                .currentAvg(new BigDecimal("4.50"))
                .numberOfFeedbacks(2L)
                .build();
        ratingRepository.save(rating);

        Offer offer = new Offer();
        offer.setCreator(creator);

        OfferInfo info = new OfferInfo();
        info.setOffer(offer);
        info.setLatitude(new BigDecimal("52.229700"));
        info.setLongitude(new BigDecimal("21.012200"));
        info.setPickupAddress("ul. Odbiorcza 1");
        info.setPickupInstructions("Zadzwonic");
        info.setStatus(OfferStatus.OPEN);
        offer.setInfo(info);

        BottlePrice bottlePrice = BottlePrice.builder()
                .price(new BigDecimal("10.00"))
                .fee(new BigDecimal("2.00"))
                .build();

        OfferCount count = new OfferCount();
        count.setOffer(offer);
        count.setBottlePrice(bottlePrice);
        count.setQuantity(5);
        offer.setCounts(List.of(count));

        Offer savedOffer = offerRepository.save(offer);

        Offer loadedOffer = offerRepository.findById(savedOffer.getId()).orElseThrow();
        assertThat(loadedOffer.getCreator().getId()).isEqualTo(creator.getId());
        assertThat(loadedOffer.getInfo().getStatus()).isEqualTo(OfferStatus.OPEN);
        assertThat(loadedOffer.getCounts()).hasSize(1);
        assertThat(loadedOffer.getCounts().get(0).getQuantity()).isEqualTo(5);
        assertThat(loadedOffer.getCounts().get(0).getBottlePrice().getPrice()).isEqualByComparingTo("10.00");

        Rating loadedRating = ratingRepository.findById(creator.getId()).orElseThrow();
        assertThat(loadedRating.getCurrentAvg()).isEqualByComparingTo("4.50");
        assertThat(loadedRating.getNumberOfFeedbacks()).isEqualTo(2L);
    }
}
