package pl.isigmas.kaucjapp.notification.util;

import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Component;
import pl.isigmas.kaucjapp.common.dto.WarningDTO;
import pl.isigmas.kaucjapp.notification.entity.Warning;

@Component
public class Mapper {

    public Warning toWarningEntity(@NonNull WarningDTO dto) {
        return Warning.builder()
                .id(dto.id())
                .time(dto.time())
                .message(dto.message())
                .build();
    }
}
