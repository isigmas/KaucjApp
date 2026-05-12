package pl.isigmas.kaucjapp.notification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.isigmas.kaucjapp.common.dto.WarningDTO;
import pl.isigmas.kaucjapp.notification.entity.Warning;
import pl.isigmas.kaucjapp.notification.repository.WarningRepository;
import pl.isigmas.kaucjapp.notification.util.Mapper;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WarningService {

    private final WarningRepository warningRepository;
    private final Mapper mapper;

    @Transactional
    public void saveWarning(WarningDTO warning) {
        warningRepository.save(mapper.toWarningEntity(warning));
    }

    @Transactional
    public List<Warning> getWarnings() {
        return warningRepository.findAll();
    }
}
