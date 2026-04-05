package pl.isigmas.kaucjapp.offers.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.wololo.jts2geojson.GeoJSONReader;

import java.io.InputStream;

@Slf4j
@Service
public class GeoValidationService {

    private Geometry polandGeometry;
    private final GeometryFactory geometryFactory = new GeometryFactory();

    @PostConstruct
    public void init() {
        try {
            log.info("Loading Poland boundaries from GeoJSON...");

            InputStream inputStream = new ClassPathResource("poland.geo.json").getInputStream();
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(inputStream);

            JsonNode geometryNode = rootNode.path("features").get(0).path("geometry");

            GeoJSONReader reader = new GeoJSONReader();
            this.polandGeometry = reader.read(geometryNode.toString());

            log.info("Successfully loaded Poland boundaries.");
        } catch (Exception e) {
            log.error("Failed to load geojson boundaries. App might not validate locations correctly!", e);
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