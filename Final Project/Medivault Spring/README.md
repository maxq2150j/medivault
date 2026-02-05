# MediVault - Spring Boot Backend

A comprehensive healthcare management API built with Spring Boot 3.5.10, Spring Data JPA, and MySQL.

## 🚀 Quick Start

### Prerequisites
- Java 21+
- MySQL Server 5.7+
- Maven 3.9+
- IntelliJ IDEA or VS Code

### Setup Instructions

1. **Navigate to project directory**:
   ```bash
   cd MediVault-Spring/MediVault
   ```

2. **Configure Database Connection**

   Update `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/MediVault
   spring.datasource.username=root
   spring.datasource.password=your_password
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=false
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
   
   app.jwt.secret=your-super-secret-key-minimum-32-characters-long
   app.jwt.expiration=86400000
   
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your-email@gmail.com
   spring.mail.password=app-password
   ```

3. **Build with Maven**:
   ```bash
   mvn clean install
   ```

4. **Run the Application**:
   ```bash
   mvn spring-boot:run
   ```

   API will be available at: `http://localhost:8080`
   Swagger UI: `http://localhost:8080/swagger-ui.html`
   API Docs: `http://localhost:8080/v3/api-docs`

## 📦 Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| spring-boot-starter-data-jpa | 3.5.10 | ORM and data access |
| spring-boot-starter-security | 3.5.10 | Authentication & authorization |
| spring-boot-starter-web | 3.5.10 | Web framework |
| mysql-connector-java | 8.x | MySQL database driver |
| jjwt | Latest | JWT token generation and validation |
| springdoc-openapi | Latest | OpenAPI/Swagger documentation |
| lombok | Latest | Code generation |
| spring-boot-starter-validation | 3.5.10 | Input validation |
| spring-boot-starter-mail | 3.5.10 | Email support |

## 🏗️ Project Structure

```
MediVault/
├── src/main/java/com/medivault/
│   ├── controller/
│   │   ├── AdminController.java         # Admin operations
│   │   ├── AuthController.java          # Authentication
│   │   ├── DoctorController.java        # Doctor operations
│   │   ├── HospitalController.java      # Hospital management
│   │   ├── PatientController.java       # Patient operations
│   │   └── AppointmentController.java   # Appointment handling
│   ├── model/
│   │   ├── User.java                    # Base user entity
│   │   ├── Patient.java                 # Patient profile
│   │   ├── Doctor.java                  # Doctor profile
│   │   ├── Hospital.java                # Hospital profile
│   │   ├── Appointment.java             # Appointments
│   │   ├── Consultation.java            # Consultations
│   │   ├── Payment.java                 # Payments
│   │   └── OtpRecord.java               # OTP management
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── PatientRepository.java
│   │   ├── DoctorRepository.java
│   │   └── ...
│   ├── service/
│   │   ├── UserService.java
│   │   ├── AuthService.java
│   │   ├── PatientService.java
│   │   ├── DoctorService.java
│   │   ├── EmailService.java
│   │   ├── PaymentService.java
│   │   └── ...
│   ├── security/
│   │   ├── JwtTokenProvider.java        # JWT utilities
│   │   ├── SecurityConfig.java          # Security configuration
│   │   └── JwtAuthenticationFilter.java # JWT filter
│   ├── exception/
│   │   └── GlobalExceptionHandler.java  # Error handling
│   └── MediVaultApplication.java        # Main class
├── src/main/resources/
│   ├── application.properties           # Configuration
│   └── application-dev.properties       # Dev specific config
├── pom.xml                              # Maven dependencies
└── HELP.md                              # Help documentation
```

## 🔐 Authentication & Security

### JWT Configuration
- Token generation on successful login
- Token validation on each protected request
- Configurable token expiration (default: 24 hours)
- Role-based access control (RBAC)

### Security Endpoints
- **Public**: /api/auth/register, /api/auth/login
- **Protected**: All other endpoints require valid JWT token

### Getting a Token

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "role": "PATIENT"
  }
}
```

### Using the Token

Include in request headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/request-otp` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP

### Patients
- `GET /api/patients/{id}` - Get patient profile
- `PUT /api/patients/{id}` - Update patient profile
- `GET /api/patients/{id}/files` - Get medical files
- `POST /api/patients/{id}/files` - Upload file
- `GET /api/patients/{id}/appointments` - List appointments
- `GET /api/patients/{id}/consultations` - List consultations

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/{id}` - Get doctor profile
- `PUT /api/doctors/{id}` - Update doctor profile
- `GET /api/doctors/{id}/consultations` - List consultations
- `POST /api/doctors/access-request` - Request patient access
- `GET /api/doctors/access-requests` - List pending requests

### Appointments
- `GET /api/appointments` - List all appointments
- `GET /api/appointments/{id}` - Get appointment details
- `POST /api/appointments` - Book new appointment
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Cancel appointment

### Consultations
- `GET /api/consultations` - List consultations
- `POST /api/consultations` - Create consultation
- `GET /api/consultations/{id}` - Get consultation details
- `PUT /api/consultations/{id}` - Update consultation
- `POST /api/consultations/{id}/files` - Upload consultation file

### Hospitals
- `POST /api/hospitals` - Register hospital
- `GET /api/hospitals/{id}` - Get hospital details
- `PUT /api/hospitals/{id}` - Update hospital
- `GET /api/hospitals/{id}/doctors` - List hospital doctors

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/{id}` - Get payment details

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/stats` - System statistics
- `PUT /api/admin/users/{id}/role` - Update user role
- `DELETE /api/admin/users/{id}` - Delete user

## 💾 Database Models

### User Entity
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String email;
    private String passwordHash;
    private String firstName;
    private String lastName;
    
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### Patient Entity
```java
@Entity
@Table(name = "patients")
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private Integer age;
    private String gender;
    private String bloodType;
    private String medicalHistory;
    private String insuranceProvider;
}
```

### Doctor Entity
```java
@Entity
@Table(name = "doctors")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "hospital_id")
    private Hospital hospital;
    
    private String specialization;
    private String licenseNumber;
    private Integer experience;
    private String qualifications;
}
```

## 🔧 Configuration

### application.properties Example
```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/api

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/MediVault
spring.datasource.username=root
spring.datasource.password=password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# JWT Configuration
app.jwt.secret=YourSuperSecretKeyThatIsAtLeast32CharactersLong
app.jwt.expiration=86400000

# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# Logging
logging.level.root=INFO
logging.level.com.medivault=DEBUG

# Swagger/OpenAPI
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.enabled=true
```

## 📝 API Examples

### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "SecurePassword123!",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "DOCTOR"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "SecurePassword123!"
  }'
```

### Get Patient Profile
```bash
curl -X GET http://localhost:8080/api/patients/1 \
  -H "Authorization: Bearer <token>"
```

### Create Consultation
```bash
curl -X POST http://localhost:8080/api/consultations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "patientId": 1,
    "doctorId": 2,
    "diagnosis": "Migraine",
    "prescription": "Take aspirin twice daily",
    "notes": "Follow up in one week"
  }'
```

## 🏗️ Building and Deployment

### Build Project
```bash
mvn clean package
```

### Run Tests
```bash
mvn test
```

### Create Executable JAR
```bash
mvn clean package -DskipTests
java -jar target/MediVault-0.0.1-SNAPSHOT.jar
```

### Production Deployment
```bash
mvn clean package -DskipTests -P production
java -Dspring.profiles.active=production -jar target/MediVault-0.0.1-SNAPSHOT.jar
```

## 🧪 Testing

### Run All Tests
```bash
mvn test
```

### Run Specific Test Class
```bash
mvn test -Dtest=PatientServiceTest
```

### Run with Code Coverage
```bash
mvn clean test jacoco:report
```

## 📊 Logging

Configure logging in `application.properties`:
```properties
logging.level.root=INFO
logging.level.com.medivault=DEBUG
logging.level.org.springframework.security=DEBUG
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n
```

## 🔒 Security Best Practices

- ✅ Never commit sensitive credentials
- ✅ Use environment variables for secrets
- ✅ Enable HTTPS in production
- ✅ Validate and sanitize all inputs
- ✅ Use prepared statements for database queries
- ✅ Implement rate limiting for APIs
- ✅ Keep dependencies updated
- ✅ Regular security audits

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Database connection failed** | Verify MySQL is running and credentials are correct |
| **Port 8080 already in use** | Change port in application.properties to 8081 |
| **JWT token validation failed** | Ensure secret key is consistent across app |
| **CORS errors** | Configure CORS in SecurityConfig class |
| **Build fails with Maven** | Run `mvn clean` and retry `mvn install` |
| **No suitable driver found** | Ensure mysql-connector-java dependency is added |

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [Spring Data JPA Documentation](https://spring.io/projects/spring-data-jpa)
- [Springdoc OpenAPI](https://springdoc.org/)

## 📄 License

MIT License - See main README for details

---

For the complete project overview, see [../../README.md](../../README.md)
