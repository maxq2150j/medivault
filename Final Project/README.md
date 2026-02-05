# MediVault - Medical Vault Management System

A comprehensive healthcare management system with dual backend implementations (.NET and Spring Boot) and a modern React frontend. MediVault enables secure management of medical records, patient consultations, appointments, and payments.

## 📋 Project Overview

MediVault is a full-stack healthcare application that provides:
- **Patient Management**: Registration, profile management, and medical record storage
- **Doctor Management**: Doctor profiles, consultations, and access control
- **Hospital Management**: Hospital registration and management
- **Appointments**: Scheduling and tracking patient appointments
- **Consultations**: Digital consultations with file attachments
- **Payment Processing**: Integrated payment gateway support
- **Admin Dashboard**: Comprehensive administration and monitoring

## 🏗️ Architecture

This project contains **two complete implementations**:

### 1. **MediVault DotNet** (ASP.NET Core 9.0)
- **Backend**: ASP.NET Core Web API
- **Database**: MySQL
- **Frontend**: React with Vite
- **Key Features**: JWT authentication, Entity Framework Core ORM, Swagger API documentation

### 2. **Medivault Spring** (Spring Boot 3.5.10)
- **Backend**: Spring Boot REST API
- **Database**: MySQL
- **Frontend**: React with Vite
- **Key Features**: Spring Security, Spring Data JPA, comprehensive role-based access control

Both implementations share the same React frontend codebase but can be deployed independently.

## 🛠️ Technology Stack

### Backend - .NET Implementation
- **Framework**: ASP.NET Core 9.0
- **Database**: MySQL (via Pomelo Entity Framework Core)
- **Authentication**: JWT Bearer
- **API Documentation**: Swagger/OpenAPI
- **PDF Generation**: iTextSharp
- **Email**: SMTP integration
- **Payment**: Razorpay integration
- **Runtime**: .NET 9.0

### Backend - Spring Boot Implementation
- **Framework**: Spring Boot 3.5.10
- **Database**: MySQL (via Spring Data JPA)
- **Authentication**: Spring Security with JWT
- **Java Version**: 21+
- **Build Tool**: Maven
- **API Documentation**: Springdoc OpenAPI

### Frontend (Shared)
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **UI Library**: React Bootstrap 2.10.10
- **HTTP Client**: Axios
- **Routing**: React Router DOM 7.11.0
- **Charts**: Chart.js with react-chartjs-2
- **Styling**: CSS & Bootstrap 5.3.8
- **Payment**: Razorpay integration

## 📦 Project Structure

```
MediVault/
├── MediVault DotNet/
│   ├── MediVault.Backend/
│   │   ├── Controllers/          # API endpoints
│   │   ├── Models/               # Entity models
│   │   ├── Services/             # Business logic
│   │   ├── Data/                 # DbContext
│   │   ├── Migrations/           # Database migrations
│   │   ├── wwwroot/              # Static files
│   │   ├── appsettings.json      # Configuration
│   │   └── Program.cs            # Application startup
│   └── MediVault.Frontend/
│       ├── src/
│       │   ├── components/       # Reusable components
│       │   ├── pages/            # Page components
│       │   ├── services/         # API services
│       │   └── main.jsx          # Entry point
│       └── package.json
├── Medivault Spring/
│   ├── MediVault/                # Spring Boot application
│   │   ├── src/main/java/
│   │   ├── pom.xml
│   │   └── application.properties
│   └── MediVault.Frontend/       # Shared React frontend
└── README.md
```

## 🚀 Getting Started

### Prerequisites

**For .NET Implementation:**
- .NET 9.0 SDK or later
- MySQL Server 5.7+
- Node.js 18+ and npm

**For Spring Boot Implementation:**
- Java 21+
- MySQL Server 5.7+
- Maven 3.9+
- Node.js 18+ and npm

### Installation

#### Option 1: .NET Backend Setup

1. **Navigate to .NET backend directory**:
   ```bash
   cd "MediVault DotNet\MediVault.Backend"
   ```

2. **Configure database connection** in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=MediVault;User=root;Password=your_password;Port=3306;"
     }
   }
   ```

3. **Restore dependencies**:
   ```bash
   dotnet restore
   ```

4. **Apply database migrations**:
   ```bash
   dotnet ef database update
   ```

5. **Run the backend** (runs on http://localhost:5000):
   ```bash
   dotnet run
   ```

#### Option 2: Spring Boot Backend Setup

1. **Navigate to Spring Boot directory**:
   ```bash
   cd "Medivault Spring\MediVault-Spring\MediVault"
   ```

2. **Configure database connection** in `application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/MediVault
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

3. **Build and run**:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   The application will start on http://localhost:8080

#### Frontend Setup (Shared)

1. **For .NET Frontend**:
   ```bash
   cd "MediVault DotNet\MediVault.Frontend"
   npm install
   npm run dev
   ```

2. **For Spring Boot Frontend**:
   ```bash
   cd "Medivault Spring\MediVault.Frontend"
   npm install
   npm run dev
   ```

   Frontend runs on http://localhost:5173

## 📚 API Documentation

### .NET Implementation
- **Swagger Documentation**: http://localhost:5000/swagger
- **Health Check**: http://localhost:5000/health

### Spring Boot Implementation
- **API Documentation**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

## 🔐 Authentication

Both implementations use **JWT (JSON Web Token)** for authentication:

- Tokens are issued upon successful login
- Include token in `Authorization: Bearer <token>` header for protected endpoints
- Token expiration and refresh mechanisms implemented
- Role-based access control (RBAC) for different user types

## 📊 User Roles

1. **Admin**: Full system access, user management, system monitoring
2. **Doctor**: Patient consultations, file management, appointment scheduling
3. **Patient**: Medical records, consultations, appointment booking, payments
4. **Hospital**: Hospital profile management and operations

## 💾 Database Schema

### Key Tables
- **Users**: Base user information with role management
- **Patients**: Patient-specific data and profiles
- **Doctors**: Doctor profiles and qualifications
- **Hospitals**: Hospital information and management
- **Appointments**: Patient-doctor appointment scheduling
- **Consultations**: Digital consultations with file attachments
- **Payments**: Payment transaction records
- **DoctorAccessRequests**: Access control and permissions

## 🔧 Configuration

### Environment Variables

Create `.env` or modify `appsettings.json` (.NET) / `application.properties` (Spring):

```
DATABASE_URL=mysql://localhost:3306/MediVault
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh-token` - Refresh JWT token

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/{id}` - Get patient details
- `POST /api/patients` - Create patient
- `PUT /api/patients/{id}` - Update patient

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/{id}` - Get doctor details
- `POST /api/doctors/access-request` - Request doctor access

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Book appointment
- `PUT /api/appointments/{id}` - Update appointment

### Consultations
- `GET /api/consultations` - List consultations
- `POST /api/consultations` - Create consultation
- `GET /api/consultations/{id}/files` - Get consultation files

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment

## 🧪 Running Tests

### .NET Backend
```bash
cd "MediVault DotNet\MediVault.Backend"
dotnet test
```

### Spring Boot Backend
```bash
cd "Medivault Spring\MediVault-Spring\MediVault"
mvn test
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running on localhost:3306
- Check database credentials in configuration files
- Ensure database exists: `CREATE DATABASE MediVault;`

### Port Already in Use
- .NET: Change port in `launchSettings.json`
- Spring Boot: Update `application.properties` with different port
- Frontend: Vite will automatically use next available port

### CORS Errors
- Verify frontend URL is in backend CORS configuration
- Default frontend ports: 5173, 5174, 5175, 5176

### JWT Token Issues
- Ensure secret key is consistent between issues and verification
- Check token hasn't expired
- Include `Bearer ` prefix in Authorization header

## 🚀 Deployment

### Docker Support
Create a `docker-compose.yml` for full-stack deployment (configure as needed):

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: MediVault

  dotnet-api:
    build: ./MediVault DotNet/MediVault.Backend
    ports:
      - "5000:5000"
    depends_on:
      - mysql

  frontend:
    build: ./MediVault DotNet/MediVault.Frontend
    ports:
      - "5173:5173"
```

## 📄 Features

- ✅ User authentication and authorization
- ✅ Patient medical record management
- ✅ Doctor consultation system
- ✅ Appointment scheduling
- ✅ Secure file uploads and storage
- ✅ PDF report generation
- ✅ Email notifications
- ✅ Payment gateway integration (Razorpay)
- ✅ Role-based access control
- ✅ Admin dashboard with analytics
- ✅ Real-time status updates

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a Pull Request

## 📞 Support

For issues or questions:
1. Check existing issues on the repository
2. Create a detailed issue with reproduction steps
3. Include relevant logs and configuration details

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Authors

MediVault Development Team

---

**Last Updated**: February 2026

**Project Status**: Active Development

For more information, visit the individual project READMEs in each backend directory.
