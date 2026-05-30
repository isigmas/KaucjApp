package pl.isigmas.kaucjapp.offers.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.wololo.jts2geojson.GeoJSONReader;
import pl.isigmas.kaucjapp.common.logger.Logger;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class GeoValidationService {

    private Geometry polandGeometry;
    private final GeometryFactory geometryFactory = new GeometryFactory();
    private final Logger logger;

    @PostConstruct
    public void init() {
        try {
            logger.info("Loading Poland boundaries from GeoJSON...");

            InputStream inputStream = new ClassPathResource("poland.geo.json").getInputStream();
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(inputStream);

            JsonNode geometryNode = rootNode.path("features").get(0).path("geometry");

            GeoJSONReader reader = new GeoJSONReader();
            this.polandGeometry = reader.read(geometryNode.toString());

            logger.info("Successfully loaded Poland boundaries.");
        } catch (Exception e) {
            logger.error("Failed to load geojson boundaries. App might not validate locations correctly!");
            throw new RuntimeException("Could not initialize GeoValidationService", e);
        }
    }

    public boolean isInPoland(double lat, double lon) {
        if (polandGeometry == null) {
            throw new IllegalStateException("Geo boundaries not loaded");
        }

        Point offerPoint = geometryFactory.createPoint(new Coordinate(lon, lat));

        return polandGeometry.contains(offerPoint);
    }
}
