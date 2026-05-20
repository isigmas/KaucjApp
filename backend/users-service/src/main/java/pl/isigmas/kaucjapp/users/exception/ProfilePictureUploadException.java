package pl.isigmas.kaucjapp.users.exception;

import org.springframework.http.HttpStatus;

public class ProfilePictureUploadException extends KaucjappException {
    public ProfilePictureUploadException(String message) {
        super(message, "USER_008", HttpStatus.BAD_REQUEST);
    }

    private ProfilePictureUploadException(String message, String errorCode, HttpStatus status) {
        super(message, errorCode, status);
    }

    public static ProfilePictureUploadException storageFailed() {
        return new ProfilePictureUploadException(
                "Failed to upload profile picture",
                "USER_009",
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
