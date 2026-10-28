# Bike Rental CRUD Service

Base package: `com.klef.soa.docker`

## Packages
- `configuration` — Swagger/OpenAPI configuration
- `entity` — JPA `BikeRental` entity with generated ID
- `repository` — Spring Data JPA repository
- `service` — business service interface
- `service.impl` — service implementation
- `dto` — validated request and response DTOs
- `controller` — REST endpoints
- `exception` — structured API error responses and global exception handling

## Before running
1. Install/use Java 21 and Maven (or run `mvnw.cmd spring-boot:run` on Windows).
2. Ensure PostgreSQL is running and the database named in `application.properties` exists.
3. Set your own local `spring.datasource.password` in `application.properties`.
4. Run the application.

Swagger UI: `http://localhost:8081/swagger-ui.html`
OpenAPI JSON: `http://localhost:8081/v3/api-docs`

## Endpoints
- `GET /bikerental/`
- `POST /bikerental/Add`
- `GET /bikerental/DisplayAll`
- `GET /bikerental/DisplayById/{id}`
- `PUT /bikerental/Update/{id}`
- `DELETE /bikerental/Delete/{id}`

Example POST/PUT body:
```json
{
  "bikeModel": "Honda Activa",
  "rentalDate": "2026-10-26",
  "hourlyRate": 120.0,
  "available": true
}
```
Backend validation checks the model, date format, and positive hourly rate. Invalid requests return a JSON error response.
No JWT authentication or authorization is configured.
