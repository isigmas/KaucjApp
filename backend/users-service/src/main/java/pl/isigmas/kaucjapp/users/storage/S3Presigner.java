package pl.isigmas.kaucjapp.users.storage;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;

/**
 * Minimal AWS Signature V4 query-string presigner for S3-compatible storage (Cloudflare R2, MinIO, AWS S3).
 *
 * <p>Implemented by hand instead of pulling in the AWS SDK: the SDK adds tens of MB to the GraalVM native image
 * (the original reason blob storage had to be removed from this service) and needs reflection metadata.
 * This class has no dependencies beyond the JDK.
 */
public final class S3Presigner {

    private static final String ALGORITHM = "AWS4-HMAC-SHA256";
    private static final String SERVICE = "s3";
    private static final DateTimeFormatter AMZ_DATE =
            DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'").withZone(ZoneOffset.UTC);
    private static final DateTimeFormatter DATE_STAMP =
            DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC);

    private final String accessKey;
    private final String secretKey;
    private final String region;

    public S3Presigner(String accessKey, String secretKey, String region) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.region = region;
    }

    /**
     * Presigns a path-style request: {@code <endpoint>/<bucket>/<key>}.
     *
     * @param extraSignedHeaders headers the client must send with exactly these values (e.g. content-type),
     *                           keys are case-insensitive. The {@code host} header is always signed.
     */
    public String presign(
            String method,
            URI endpoint,
            String bucket,
            String key,
            Duration expires,
            Instant now,
            Map<String, String> extraSignedHeaders
    ) {
        String basePath = endpoint.getRawPath() == null ? "" : endpoint.getRawPath();
        if (basePath.endsWith("/")) {
            basePath = basePath.substring(0, basePath.length() - 1);
        }
        String path = basePath + "/" + encodePath(bucket) + "/" + encodePath(key);
        return presignPath(method, endpoint.getScheme(), hostHeader(endpoint), path, expires, now, extraSignedHeaders);
    }

    /**
     * Low-level presign for an already encoded absolute path. Package-private for testing against
     * the official AWS examples.
     */
    String presignPath(
            String method,
            String scheme,
            String host,
            String encodedPath,
            Duration expires,
            Instant now,
            Map<String, String> extraSignedHeaders
    ) {
        String amzDate = AMZ_DATE.format(now);
        String dateStamp = DATE_STAMP.format(now);
        String scope = dateStamp + "/" + region + "/" + SERVICE + "/aws4_request";

        TreeMap<String, String> headers = new TreeMap<>();
        headers.put("host", host);
        if (extraSignedHeaders != null) {
            extraSignedHeaders.forEach((name, value) -> headers.put(name.toLowerCase(), value.trim()));
        }
        String signedHeaders = String.join(";", headers.keySet());

        TreeMap<String, String> query = new TreeMap<>();
        query.put("X-Amz-Algorithm", ALGORITHM);
        query.put("X-Amz-Credential", accessKey + "/" + scope);
        query.put("X-Amz-Date", amzDate);
        query.put("X-Amz-Expires", String.valueOf(expires.toSeconds()));
        query.put("X-Amz-SignedHeaders", signedHeaders);

        StringBuilder canonicalQuery = new StringBuilder();
        query.forEach((name, value) -> {
            if (!canonicalQuery.isEmpty()) {
                canonicalQuery.append('&');
            }
            canonicalQuery.append(encode(name)).append('=').append(encode(value));
        });

        StringBuilder canonicalHeaders = new StringBuilder();
        headers.forEach((name, value) -> canonicalHeaders.append(name).append(':').append(value).append('\n'));

        String canonicalRequest = method + "\n"
                + encodedPath + "\n"
                + canonicalQuery + "\n"
                + canonicalHeaders + "\n"
                + signedHeaders + "\n"
                + "UNSIGNED-PAYLOAD";

        String stringToSign = ALGORITHM + "\n" + amzDate + "\n" + scope + "\n" + hex(sha256(canonicalRequest));
        String signature = hex(hmac(signingKey(dateStamp), stringToSign));

        return scheme + "://" + host + encodedPath + "?" + canonicalQuery + "&X-Amz-Signature=" + signature;
    }

    private byte[] signingKey(String dateStamp) {
        byte[] dateKey = hmac(("AWS4" + secretKey).getBytes(StandardCharsets.UTF_8), dateStamp);
        byte[] regionKey = hmac(dateKey, region);
        byte[] serviceKey = hmac(regionKey, SERVICE);
        return hmac(serviceKey, "aws4_request");
    }

    private static String hostHeader(URI endpoint) {
        int port = endpoint.getPort();
        boolean defaultPort = port == -1
                || ("http".equals(endpoint.getScheme()) && port == 80)
                || ("https".equals(endpoint.getScheme()) && port == 443);
        return defaultPort ? endpoint.getHost() : endpoint.getHost() + ":" + port;
    }

    private static String encodePath(String value) {
        String[] segments = value.split("/", -1);
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < segments.length; i++) {
            if (i > 0) {
                out.append('/');
            }
            out.append(encode(segments[i]));
        }
        return out.toString();
    }

    /** RFC 3986 percent-encoding as required by SigV4 (unreserved characters are left as is). */
    static String encode(String value) {
        StringBuilder out = new StringBuilder();
        for (byte b : value.getBytes(StandardCharsets.UTF_8)) {
            char c = (char) (b & 0xff);
            if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')
                    || c == '-' || c == '_' || c == '.' || c == '~') {
                out.append(c);
            } else {
                out.append('%').append(Character.toUpperCase(Character.forDigit((c >> 4) & 0xf, 16)))
                        .append(Character.toUpperCase(Character.forDigit(c & 0xf, 16)));
            }
        }
        return out.toString();
    }

    private static byte[] hmac(byte[] key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("HmacSHA256 unavailable", e);
        }
    }

    private static byte[] sha256(String data) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(data.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    private static String hex(byte[] bytes) {
        StringBuilder out = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            out.append(Character.forDigit((b >> 4) & 0xf, 16)).append(Character.forDigit(b & 0xf, 16));
        }
        return out.toString();
    }
}
