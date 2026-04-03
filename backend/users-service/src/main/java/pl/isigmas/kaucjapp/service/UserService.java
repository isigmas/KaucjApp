package pl.isigmas.kaucjapp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityNotFoundException;

import pl.isigmas.kaucjapp.DTO.UserAddressDTO;
import pl.isigmas.kaucjapp.DTO.UserDTO;
import pl.isigmas.kaucjapp.model.Rating;
import pl.isigmas.kaucjapp.model.User;
import pl.isigmas.kaucjapp.model.UserAddress;
import pl.isigmas.kaucjapp.repository.UserRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + id));
    }

    @Transactional
    public UserDTO createUser(UserDTO userDTO) {
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());

        if (userDTO.getAddresses() != null) {
            userDTO.getAddresses().forEach(addrDto -> {
                UserAddress address = new UserAddress();
                address.setAddressLabel(addrDto.getAddressLabel());
                address.setAddress(addrDto.getAddress());
                address.setLatitude(addrDto.getLatitude());
                address.setLongitude(addrDto.getLongitude());
                address.setDefault(addrDto.isDefault());

                user.addAddress(address);
            });
        }

        Rating initialRating = new Rating();
        initialRating.setAvgScore(BigDecimal.ZERO);
        initialRating.setFeedbackCount(0);
        user.setRating(initialRating);

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + id));

        existingUser.setFirstName(userDTO.getFirstName());
        existingUser.setLastName(userDTO.getLastName());
        existingUser.setUsername(userDTO.getUsername());
        existingUser.setPhone(userDTO.getPhone());
        existingUser.setEmail(userDTO.getEmail());

        List<UserAddress> currentAddresses = new ArrayList<>(existingUser.getAddresses());
        currentAddresses.forEach(existingUser::removeAddress);
        userRepository.flush();

        if (userDTO.getAddresses() != null) {
            userDTO.getAddresses().forEach(addrDto -> {
                UserAddress address = new UserAddress();
                address.setAddressLabel(addrDto.getAddressLabel());
                address.setAddress(addrDto.getAddress());
                address.setLatitude(addrDto.getLatitude());
                address.setLongitude(addrDto.getLongitude());
                address.setDefault(addrDto.isDefault());

                existingUser.addAddress(address);
            });
        }

        User updatedUser = userRepository.save(existingUser);
        return mapToDTO(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
    }


    private UserDTO mapToDTO(User user) {
        List<UserAddressDTO> addressDTOs = user.getAddresses().stream().map(addr -> {
            UserAddressDTO dto = new UserAddressDTO();
            dto.setAddressLabel(addr.getAddressLabel());
            dto.setAddress(addr.getAddress());
            dto.setLatitude(addr.getLatitude());
            dto.setLongitude(addr.getLongitude());
            dto.setDefault(addr.isDefault());
            return dto;
        }).collect(Collectors.toList());

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
}