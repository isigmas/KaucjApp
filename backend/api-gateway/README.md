# API Gateway Service

This service serves as the entry point for all client requests. It routes requests to the appropriate microservices, handles authentication and authorization, and performs any necessary request transformations.

## Local configuration - Quick Start

To run the API Gateway service locally, follow these steps:

1. Running on localhost 

   Create **application-local.yml** file based on the provided **application.yml** template. This file will contain your local configuration settings.

    ```shell
    cd src/main/resources
    cp application-local.example.yml application-local.yml
    ```
   
2. Running via Docker

   Create **.env** file based on the provided **.env.example** template. This file will contain your local configuration settings (For whole backend, not only this service).

   ```shell
   cd ..
   cp .env.example .env
   ```

## Usage guide

Create JWT token for authentication. You can use online tools like [jwt.io](https://www.jwt.io).

#### Example of JWT token data:

```json
 { // Header
   "alg": "HS256",
   "typ": "JWT"
 }
 ```
```json
 { // Payload
   "role": "tester",
   "user_id": 1
 }
 ```
```json
// Secret
{{JWT Secret}}
```

Alternatively, you can generate a JWT token using auth microservice, but for development purposes, using an online tool is quicker.

Use every other endpoint as you would normally, but make sure to change the base URL address to :8080, and include the JWT token generated in the previous step in the Authorization header of your request.

#### Example of http request to the API Gateway:

```http request
GET http://localhost:8080/api/status
Authorization: Bearer {{Your JWT token}}
```

Every request passing through the API Gateway will be authorized and enriched with user information such as user ID.
Target microservices should fully rely on the header provided by the gateway, and not perform any additional authorization checks.

#### Example of reading ID in a microservice:

```java
@GetMapping("/my-resource")
public ResponseEntity<?> getMyData(
    @RequestHeader("X-User-Id") Long userId
) {
    // ...
}
```

---

### Contact

maintainer: Konrad Mateja\
github: [w3rr0](https://github.com/w3rr0)\
email: [konradmateja65@gmail.com](mailto:konradmateja65@gmail.com)
