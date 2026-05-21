package pl.isigmas.kaucjapp.users.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pl.isigmas.kaucjapp.users.DTO.*;
import pl.isigmas.kaucjapp.users.exception.InvalidRankingType;
import pl.isigmas.kaucjapp.users.exception.UserAlreadyExistsException;
import pl.isigmas.kaucjapp.users.exception.UserNotFoundException;
import pl.isigmas.kaucjapp.users.model.Rating;
import pl.isigmas.kaucjapp.users.model.User;
import pl.isigmas.kaucjapp.users.model.UserAddress;
import pl.isigmas.kaucjapp.users.model.UserStats;
import pl.isigmas.kaucjapp.users.repository.UserDailyStatsRepository;
import pl.isigmas.kaucjapp.users.repository.UserRepository;
import pl.isigmas.kaucjapp.users.repository.UserStatsRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserStatsRepository userStatsRepository;
    private final UserDailyStatsRepository userDailyStatsRepository;

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    @Transactional
    public void createUser(long id, CreateUserDTO userDTO) {

        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw UserAlreadyExistsException.forEmail(userDTO.getEmail());
        }
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw UserAlreadyExistsException.forUsername(userDTO.getUsername());
        }

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

        UserStats stats = new UserStats();
        stats.setUserId(user.getId());
        userStatsRepository.save(stats);
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
    public UserDTO updateProfilePictureUrl(Long userId, String imageUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        user.setProfilePictureUrl(imageUrl);
        return mapToDTO(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        user.setUsername("deleted-user-" + id);
        user.setEmail(user.getUsername() + "@deleted.com");
        user.setFirstName("Deleted");
        user.setLastName("User");
        user.setPhone(null);
    }

    private UserDTO mapToDTO(User user) {
        List<UserAddressDTO> addressDTOs = user.getAddresses().stream()
                .map(this::mapAddressToDTO)
                .collect(Collectors.toList());

        UserStats userStats = userStatsRepository.getReferenceById(user.getId());

        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .profilePictureUrl(user.getProfilePictureUrl())
                .addresses(addressDTOs)
                .createdAt(user.getTimeCreated())
                .collectedCanCount(userStats.getCollectedCanCount())
                .collectedPlasticCount(userStats.getCollectedPlasticCount())
                .returnedCanCount(userStats.getReturnedCanCount())
                .returnedPlasticCount(userStats.getReturnedPlasticCount())
                .returnedTotalCount(userStats.getReturnedCanCount() + userStats.getReturnedPlasticCount())
                .collectedTotalCount(userStats.getCollectedCanCount() + userStats.getCollectedPlasticCount())
                .build();
    }

    private UserAdminDTO mapToAdminDTO(User user) {
        List<UserAddressDTO> addressDTOs = user.getAddresses().stream()
                .map(this::mapAddressToDTO)
                .collect(Collectors.toList());

        UserStats userStats = userStatsRepository.getReferenceById(user.getId());

        return UserAdminDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .addresses(addressDTOs)
                .createdAt(user.getTimeCreated())
                .collectedCanCount(userStats.getCollectedCanCount())
                .collectedPlasticCount(userStats.getCollectedPlasticCount())
                .returnedCanCount(userStats.getReturnedCanCount())
                .returnedPlasticCount(userStats.getReturnedPlasticCount())
                .returnedTotalCount(userStats.getReturnedCanCount() + userStats.getReturnedPlasticCount())
                .collectedTotalCount(userStats.getCollectedCanCount() + userStats.getCollectedPlasticCount())
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

    @Transactional(readOnly = true)
    public List<UserAdminDTO> getAll() {
        return userRepository.findAll().stream()
                .map(this::mapToAdminDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminStatsDTO getAllStats() {
        var Can = userStatsRepository.getTotalReturnedCanCount();
        var Plastic = userStatsRepository.getTotalReturnedPlasticCount();
        var total = userStatsRepository.getTotalReturnedItemsCount();

        return AdminStatsDTO.builder()
                .returnedCanCount(Can)
                .returnedPlasticCount(Plastic)
                .returnedTotalCount(total)
                .build();
    }

    public List<UserDTO> getStatsRanking(String type, int days, int page, int size) {
        List<Long> sortedUserIds;

        if (days <= 0) {
            String sortByField = switch (type.toLowerCase()) {
                case "returned_plastic" -> "returnedPlasticCount";
                case "returned_can" -> "returnedCanCount";
                case "collected_plastic" -> "collectedPlasticCount";
                case "collected_can" -> "collectedCanCount";
                case "returned_total" -> "returnedTotalCount";
                case "collected_total" -> "collectedTotalCount";
                default -> throw new InvalidRankingType("Invalid ranking type: " + type);
            };
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortByField));
            sortedUserIds = userStatsRepository.findUserIds(pageable);
        } else {
            LocalDate endDate = LocalDate.now(ZoneOffset.UTC);
            LocalDate startDate = endDate.minusDays(days - 1L);

            Pageable pageable = PageRequest.of(page, size, Sort.unsorted());
            sortedUserIds = userDailyStatsRepository.findTopUsersForPeriod(
                    startDate, endDate, type.toLowerCase(), pageable
            );
        }

        if (sortedUserIds.isEmpty()) {
            return List.of();
        }

        Map<Long, UserDTO> usersMap = userRepository.findAllById(sortedUserIds).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toMap(UserDTO::getId, user -> user));

        return sortedUserIds.stream()
                .map(usersMap::get)
                .filter(java.util.Objects::nonNull)
                .toList();
    }


}
