package pl.isigmas.kaucjapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.isigmas.kaucjapp.DTO.UserDTO;
import pl.isigmas.kaucjapp.model.User;
import pl.isigmas.kaucjapp.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::mapToDTO)
                .orElse(null);
    }

    public UserDTO createUser(UserDTO userDTO) {
        User user = mapToEntity(userDTO);
        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    public UserDTO updateUser(Long id, UserDTO userDTO) {
        return userRepository.findById(id).map(existingUser -> {

            existingUser.setName(userDTO.getName());
            existingUser.setSurname(userDTO.getSurname());
            existingUser.setUsername(userDTO.getUsername());
            existingUser.setPhoneNumber(userDTO.getPhoneNumber());
            existingUser.setEmail(userDTO.getEmail());
            existingUser.setDefaultAddress(userDTO.getDefaultAddress());
            existingUser.setDefaultLatitude(userDTO.getDefaultLatitude());
            existingUser.setDefaultLongitude(userDTO.getDefaultLongitude());

            User updatedUser = userRepository.save(existingUser);
            return mapToDTO(updatedUser);

        }).orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika o ID: " + id));
    }

    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .surname(user.getSurname())
                .username(user.getUsername())
                .phoneNumber(user.getPhoneNumber())
                .email(user.getEmail())
                .defaultAddress(user.getDefaultAddress())
                .defaultLatitude(user.getDefaultLatitude())
                .defaultLongitude(user.getDefaultLongitude())
                .build();
    }

    private User mapToEntity(UserDTO dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setSurname(dto.getSurname());
        user.setUsername(dto.getUsername());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setEmail(dto.getEmail());
        user.setDefaultAddress(dto.getDefaultAddress());
        user.setDefaultLatitude(dto.getDefaultLatitude());
        user.setDefaultLongitude(dto.getDefaultLongitude());
        return user;
    }
}