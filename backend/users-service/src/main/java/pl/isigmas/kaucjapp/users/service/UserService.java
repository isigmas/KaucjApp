package pl.isigmas.kaucjapp.users.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pl.isigmas.kaucjapp.users.DTO.CreateUserDTO;
import pl.isigmas.kaucjapp.users.DTO.UpdateUserDTO;
import pl.isigmas.kaucjapp.users.DTO.UserAddressDTO;
import pl.isigmas.kaucjapp.users.DTO.UserDTO;
import pl.isigmas.kaucjapp.users.exception.UserNotFoundException;
import pl.isigmas.kaucjapp.users.model.Rating;
import pl.isigmas.kaucjapp.users.model.User;
import pl.isigmas.kaucjapp.users.model.UserAddress;
import pl.isigmas.kaucjapp.users.repository.UserRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    @Transactional
    public void createUser(long id, CreateUserDTO userDTO) {
        User user = new User();
        user.setId(id);
        user.setUsername(userDTO.getUsername());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());


        Rating initialRating = new Rating();
        initialRating.setAvgScore(BigDecimal.ZERO);
        initialRating.setFeedbackCount(0);
        user.setRating(initialRating);

        userRepository.save(user);
    }

    @Transactional
    public void updateUser(Long id, UpdateUserDTO dto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        if (dto.getFirstName() != null) existingUser.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) existingUser.setLastName(dto.getLastName());
        if (dto.getAddresses() != null) {
            new ArrayList<>(existingUser.getAddresses()).forEach(existingUser::removeAddress);
            userRepository.flush();
            dto.getAddresses().forEach(addrDto -> {
                UserAddress address = new UserAddress();
                address.setAddressLabel(addrDto.getAddressLabel());
                address.setAddress(addrDto.getAddress());
                address.setLatitude(addrDto.getLatitude());
                address.setLongitude(addrDto.getLongitude());
                address.setDefault(addrDto.isDefault());
                existingUser.addAddress(address);
            });
        }
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        userRepository.delete(user);
    }

    private UserDTO mapToDTO(User user) {
        List<UserAddressDTO> addressDTOs = user.getAddresses().stream()
                .map(this::mapAddressToDTO)
                .collect(Collectors.toList());

        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .addresses(addressDTOs)
                .build();
    }

    private UserAddressDTO mapAddressToDTO(UserAddress addr) {
        UserAddressDTO dto = new UserAddressDTO();
        dto.setAddressLabel(addr.getAddressLabel());
        dto.setAddress(addr.getAddress());
        dto.setLatitude(addr.getLatitude());
        dto.setLongitude(addr.getLongitude());
        dto.setDefault(addr.isDefault());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<UserAddressDTO> getUserAddresses(Long myUserId) {
        User user = userRepository.findById(myUserId)
                .orElseThrow(() -> new UserNotFoundException(myUserId));
        return user.getAddresses().stream()
                .map(this::mapAddressToDTO)
                .collect(Collectors.toList());
    }
}
