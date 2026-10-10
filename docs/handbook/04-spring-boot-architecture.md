# Chapter 04: Spring Boot Layered Architecture & Dependency Injection

Spring Boot is the industry-standard framework for building Java enterprise web applications. In this chapter, we dissect how VulnTrack's backend is constructed, exploring Dependency Injection, inversion of control, and each layer of our architecture.

---

## 1. What is Spring Boot and Why Use It?

Traditional Java EE development required massive XML configurations, external application servers (Tomcat/JBoss), and tedious boilerplate code.

**Spring Boot** solves this by offering:
- **Opinionated "Starters"**: Pre-packaged dependencies (e.g., `spring-boot-starter-web`, `spring-boot-starter-data-jpa`) that automatically configure compatible libraries.
- **Embedded Servlet Container**: Runs an embedded Tomcat server inside the executable JAR. You simply run `java -jar app.jar` without deploying war files to external servers.
- **Auto-Configuration**: Inspects classes on the classpath (like H2 or PostgreSQL) and wires up data sources and entity managers automatically.

---

## 2. Inversion of Control (IoC) & Dependency Injection (DI)

### The Problem without DI:
If class `AssetController` creates its own dependencies using `new`:
```java
public class AssetController {
    private AssetService assetService = new AssetService(); // Hard-coded tightly coupled dependency!
}
```
You cannot easily unit test `AssetController` with a mock service, and you cannot swap implementations without modifying code.

### The Solution: Constructor-Based Dependency Injection:
In VulnTrack, Spring's **ApplicationContext** manages objects called **Beans**. Spring automatically creates and injects dependencies via constructors:

```java
@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;

    // Spring automatically supplies the singleton AssetService bean here!
    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }
}
```

> [!NOTE]
> Constructor injection is preferred over `@Autowired` on private fields because:
> 1. Fields can be declared `final`, ensuring immutability.
> 2. It makes dependencies explicit when writing unit tests with Mockito (`new AssetController(mockService)`).
> 3. It prevents circular dependency bugs during bean initialization.

---

## 3. Dissecting the Four Layers in VulnTrack

### Layer 1: Entities (`entity/`)
- Represent database tables.
- Annotated with `@Entity` and `@Table`.
- Example: [Asset.java](file:///c:/Users/LENOVO/Documents/Desktop/desk/3rd%20year/Devops/Devops%20Project/backend/src/main/java/com/vulntrack/entity/Asset.java) has fields mapping directly to columns in the `assets` table.

### Layer 2: Repositories (`repository/`)
- Interfaces extending `JpaRepository<T, ID>`.
- Spring Data JPA dynamically generates bytecode at runtime to implement standard CRUD queries (`save`, `findById`, `findAll`, `delete`) as well as derived finder methods (`existsByNameIgnoreCase`).
- Example: [AssetRepository.java](file:///c:/Users/LENOVO/Documents/Desktop/desk/3rd%20year/Devops/Devops%20Project/backend/src/main/java/com/vulntrack/repository/AssetRepository.java).

### Layer 3: Services (`service/`)
- Annotated with `@Service` and `@Transactional`.
- Contains all business rules, validation logic, entity persistence, and DTO conversion.
- Example: [AssetService.java](file:///c:/Users/LENOVO/Documents/Desktop/desk/3rd%20year/Devops/Devops%20Project/backend/src/main/java/com/vulntrack/service/AssetService.java) verifies that asset names are unique before calling `assetRepository.save()`.

### Layer 4: Controllers (`controller/`)
- Annotated with `@RestController` and `@RequestMapping`.
- Handles incoming HTTP requests, extracts headers and path parameters, triggers bean validation via `@Valid`, and returns appropriate HTTP responses (`ResponseEntity`).
- Example: [AssetController.java](file:///c:/Users/LENOVO/Documents/Desktop/desk/3rd%20year/Devops/Devops%20Project/backend/src/main/java/com/vulntrack/controller/AssetController.java).

---

## 4. Modern Java Records for DTOs

In Java 17, records provide an immutable, concise data carrier:

```java
public record AssetRequestDto(
    @NotBlank(message = "Asset name is required")
    @Size(max = 100, message = "Asset name must not exceed 100 characters")
    String name,

    @NotNull(message = "Asset type is required")
    AssetType type,

    @NotNull(message = "Environment is required")
    Environment environment,

    @Size(max = 500, message = "Description must not exceed 500 characters")
    String description
) {}
```

Records automatically generate private final fields, a canonical constructor, `equals()`, `hashCode()`, and `toString()`, eliminating hundreds of lines of boilerplate getters and setters.
