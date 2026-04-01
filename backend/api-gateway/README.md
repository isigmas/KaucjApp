# API Gateway Service

This service serves as the entry point for all client requests. It routes requests to the appropriate microservices, handles authentication and authorization, and performs any necessary request transformations.

## Local configuration - Quick Start

To run the API Gateway service locally, follow these steps:

1. Create **application-local.yml** file based on the provided **application.yml** template. This file will contain your local configuration settings.

    ```shell
    cd src/main/resources
    cp application-local.example.yml application-local.yml
    ```
2. Create JWT token for authentication. You can use online tools like [jwt.io](https://www.jwt.io). Example:
    ```json
    { // Header
      "alg": "HS256",
      "typ": "JWT"
    }
    ```
   ```json
    { // Payload
      "sub": "tester",
      "user_id": 1
    }
    ```
   ```json
   // Secret
   {{Secret from your application-local.yml file}}
   ```
   Alternatively, you can generate a JWT token using auth microservice, but for development purposes, using an online tool is quicker.

## Usage guide

Use every other endpoint as you would normally, but make sure to change the base URL address to :8080, and include the JWT token generated in the previous step in the Authorization header of your request.

#### Example:

```http request
GET http://localhost:8080/api/status
Authorization: Bearer {{Your JWT token}}
```

---

### Contact

maintainer: Konrad Mateja\
github: [w3rr0](https://github.com/w3rr0)\
email: [konradmateja65@gmail.com](mailto:konradmateja65@gmail.com)
