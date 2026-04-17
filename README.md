# internships platform

A comprehensive internships management platform built with Express.js, TypeScript, and PostgreSQL. This system enables students to discover and apply for internships while companies can post opportunities and manage applications using an intelligent selection algorithm.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Student Endpoints](#student-endpoints)
  - [Company Endpoints](#company-endpoints)
  - [Internship Endpoints](#internship-endpoints)
- [Database Schema](#database-schema)
- [Selection Algorithm](#selection-algorithm)
- [Error Handling](#error-handling)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Features

### For Students

- User authentication and profile management
- Search and browse available internships
- Apply to internships with wish order preference (1st, 2nd, 3rd choice)
- Track application status and history
- View profile statistics (view count)
- Update profile information (GPA, bio, major, etc.)

### For Companies

- User authentication and company profile management
- Post internship opportunities with details (title, location, required major, GPA requirements)
- Search and filter student profiles
- View applications with comprehensive filtering (major, city, GPA, bio keywords)
- Run intelligent selection algorithm to accept/reject applications
- Manage internship status (active/inactive)
- Track student profile interactions

### Core Functionality

- **Intelligent Selection Algorithm**: Scores applications based on:
  - Wish order (1st wish: 100pts, 2nd: 50pts, 3rd: 25pts)
  - Major match (exact: 50pts, related cluster: 25pts)
  - Contextual GPA (percentile among applicants: 0-50pts)
- **Role-Based Access Control**: Separate authentication and authorization for students and companies
- **Pagination & Filtering**: Efficient data retrieval with advanced filtering capabilities
- **Database Transactions**: Ensures data consistency during critical operations

## 🛠 Tech Stack

| Category           | Technology                              |
| ------------------ | --------------------------------------- |
| **Runtime**        | Node.js with Express.js                 |
| **Language**       | TypeScript                              |
| **Database**       | PostgreSQL with Drizzle ORM             |
| **Authentication** | Better Auth                             |
| **Validation**     | Custom TypeScript validation            |
| **API Style**      | RESTful                                 |
| **Middleware**     | Express middleware (CORS, JSON parsing) |

## 📁 Project Structure

```
src/
├── modules/
│   ├── auth/
│   │   ├── students/          # Student authentication
│   │   ├── companies/         # Company authentication
│   │   └── shared/            # Shared auth utilities & error handling
│   ├── student/               # Student profile management
│   ├── company/               # Company profile & search management
│   └── internships/
│       ├── student/           # Student internship interactions
│       └── company/           # Company internship management
├── db/
│   ├── schema/                # Database schemas
│   ├── relations.ts           # Drizzle relations
│   └── index.ts               # Database instance
├── lib/
│   ├── auth.ts                # Better Auth configuration
│   └── middleware.ts          # Custom middleware
├── routes/
│   └── internships.ts         # Public internship routes
└── index.ts                   # Main application file

drizzle/                        # Database migrations
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **PostgreSQL** >= 12
- Environment variables (see [Environment Setup](#environment-setup))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/platform-backend.git
   cd platform-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables** (see next section)

4. **Run database migrations**

   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:8000`

### Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/platform_db

# Authentication
BETTER_AUTH_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-secret-key-here


# Server
NODE_ENV=development
PORT=8000
```

**Environment Variables Explanation:**

| Variable             | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string                               |
| `BETTER_AUTH_URL`    | Base URL for Better Auth                                   |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth (generate secure random string) |
| `FRONTEND_URL`       | Frontend URL for CORS configuration                        |
| `NODE_ENV`           | Environment (development/production)                       |
| `PORT`               | Server port number                                         |

## 📚 API Documentation

### Base URL

```
http://localhost:8000/api
```

### Authentication

All protected endpoints require an authentication session token in the request headers or cookies.

#### Student Registration

```http
POST /auth/student/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "SecurePassword123",
  "nationalId": "12345678",
  "fullName": "John Doe",
  "city": "Cairo",
  "gpa": 3.5,
  "major": "CS",
  "bioText": "Passionate about software development"
}
```

#### Company Registration

```http
POST /auth/company/register
Content-Type: application/json

{
  "email": "company@example.com",
  "password": "SecurePassword123",
  "companyName": "Tech Corp"
}
```

#### Sign Out

```http
POST /auth/student/signout
Authorization: Bearer <session_token>
```

### Student Endpoints

#### Get My Profile

```http
GET /student/profile
Authorization: Bearer <session_token>
```

#### Update My Profile

```http
PUT /student/profile
Authorization: Bearer <session_token>
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "gpa": 3.7,
  "bioText": "Updated bio text",
  "city": "Alexandria"
}
```

#### Get Eligible Internships

```http
GET /student/internships
Authorization: Bearer <session_token>
```

Filters eligible internships based on:

- Student's major matches internship requirements
- Student's GPA meets minimum requirements

#### Apply to Internship

```http
POST /student/internships/:internshipId/apply
Authorization: Bearer <session_token>
Content-Type: application/json

{
  "wishOrder": 1
}
```

**Parameters:**

- `internshipId` (path): ID of the internship
- `wishOrder` (body): 1 (first choice), 2 (second choice), or 3 (third choice)

**Constraints:**

- Maximum 3 applications per student
- Cannot apply twice to the same internship

#### Get My Applications

```http
GET /student/applications
Authorization: Bearer <session_token>
```

### Company Endpoints

#### Search Students

```http
GET /company/students/search?search=CS&gpa=3.5&page=1&limit=10
Authorization: Bearer <session_token>
```

**Query Parameters:**

- `search` (optional): Search by major, city, or bio text
- `gpa` (optional): Minimum GPA filter
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)

#### View Student Profile

```http
GET /company/students/:studentId
Authorization: Bearer <session_token>
```

Increments student's profile view count.

#### Post Internship

```http
POST /company/internships
Authorization: Bearer <session_token>
Content-Type: application/json

{
  "title": "Summer Intern - Backend",
  "description": "Join our backend team",
  "requiredMajor": "CS",
  "city": "Cairo",
  "minGpa": "3.0",
  "capacity": 5
}
```

#### Get My Internships

```http
GET /company/internships
Authorization: Bearer <session_token>
```

#### Update Internship

```http
PATCH /company/internships/:internshipId
Authorization: Bearer <session_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "capacity": 10,
  "status": "inactive"
}
```

#### Delete Internship

```http
DELETE /company/internships/:internshipId
Authorization: Bearer <session_token>
```

#### Get Applications

```http
GET /company/applications?major=CS&city=Cairo&minGpa=3.0&page=1&limit=10
Authorization: Bearer <session_token>
```

**Query Parameters:**

- `major` (optional): Filter by student major
- `city` (optional): Filter by student city
- `minGpa` (optional): Filter by minimum GPA
- `bioKeyword` (optional): Search in student bio
- `page` (optional): Page number
- `limit` (optional): Records per page

#### Run Selection Algorithm

```http
POST /company/internships/:internshipId/run-selection
Authorization: Bearer <session_token>
```

Executes the intelligent selection algorithm:

1. Calculates scores for all pending applications
2. Accepts top N applications (N = internship capacity)
3. Rejects remaining applications
4. Marks internship as inactive

**Response:**

```json
{
  "internshipId": 1,
  "internshipTitle": "Summer Intern",
  "capacity": 5,
  "totalApplications": 12,
  "accepted": 5,
  "rejected": 7,
  "acceptedApplications": [
    {
      "applicationId": 1,
      "studentId": 100,
      "wishOrder": 1,
      "scores": {
        "wishOrder": 100,
        "majorMatch": 50,
        "gpa": 45,
        "total": 195
      }
    }
  ]
}
```

### Internship Endpoints (Public)

#### Get All Internships

```http
GET /internships?search=Python&major=CS&page=1&limit=10
```

**Query Parameters:**

- `search` (optional): Search in title, major, city
- `major` (optional): Filter by major
- `page` (optional): Page number
- `limit` (optional): Records per page

## 📊 Database Schema

### Users (Better Auth)

```typescript
user {
  id: string (PK)
  name: string
  email: string (unique)
  role: "student" | "company"
  ...timestamps
}
```

### Students

```typescript
students {
  id: integer (PK)
  userId: string (FK -> user.id)
  nationalId: string (unique)
  fullName: string
  city: enum(EgyptianCity)
  gpa: numeric(3,2)
  major: enum("CS" | "IT" | "IS" | "AI" | "DS")
  bioText: text
  profileViews: integer
  ...timestamps
}
```

### Companies

```typescript
companies {
  id: integer (PK)
  userId: string (FK -> user.id, unique)
  companyName: string
  ...timestamps
}
```

### Internships

```typescript
internships {
  id: integer (PK)
  companyId: integer (FK -> companies.id)
  title: string
  description: text
  requiredMajor: enum("CS" | "IT" | "IS" | "AI" | "DS")
  city: enum(EgyptianCity)
  minGpa: numeric(3,2)
  capacity: integer
  status: enum("active" | "inactive")
  ...timestamps
}
```

### Applications

```typescript
applications {
  id: integer (PK)
  studentId: integer (FK -> students.id)
  internshipId: integer (FK -> internships.id)
  wishOrder: 1 | 2 | 3
  status: enum("pending" | "accepted" | "rejected" | "withdrawn")
  ...timestamps

  UNIQUE(studentId, internshipId)
  UNIQUE(studentId, wishOrder)
}
```

### Enums

#### Major

```
"CS" | "IT" | "IS" | "AI" | "DS"
```

#### Egyptian Cities (`EgyptianCity`)

Both `students.city` and `internships.city` are restricted to one of the 27 Egyptian governorate capitals:

```
Cairo, Alexandria, Giza, Shubra El Kheima, Port Said, Suez, Luxor,
Mansoura, El Mahalla El Kubra, Tanta, Asyut, Ismailia, Fayyum,
Zagazig, Aswan, Damietta, Damanhur, Minya, Beni Suef, Qena,
Sohag, Hurghada, 6th of October City, Shibin El Kom, Banha,
Arish, Mallawi
```

## 🧮 Selection Algorithm

The intelligent selection algorithm ranks applications using three scoring components:

### Scoring Formula

#### 1. Wish Order Score (Priority)

```
- 1st wish: 100 points
- 2nd wish: 50 points
- 3rd wish: 25 points
```

#### 2. Major Match Score

```
- Exact major match: 50 points
- Related cluster match: 25 points (e.g., CS ↔ IT)
- No match: 0 points

Major Clusters:
- [CS, IT, IS] - Software/Computing
- [AI, DS] - Data Science
```

#### 3. Contextual GPA Score (0-50 points)

```
Formula: ((student_gpa - min_gpa) / (max_gpa - min_gpa)) * 50

Contextual: Calculated relative to all applicants for that internship
- If all students have same GPA: 25 points each
```

### Total Score Calculation

```
Total = WishOrderScore + MajorMatchScore + GPAScore (0-200 points)
```

### Selection Process

1. Calculate total score for each pending application
2. Sort by total score (descending)
3. Break ties by application date (earliest first)
4. Accept top N applications (N = internship capacity)
5. Reject remaining applications
6. Mark internship as inactive

### Example

```
Internship: "Backend Intern" - CS, Capacity: 2
Applications:
1. Student A: Wish 1, CS, GPA 3.8 → Score: 100 + 50 + 50 = 200 ✅ ACCEPTED
2. Student B: Wish 1, IT, GPA 3.5 → Score: 100 + 25 + 30 = 155 ✅ ACCEPTED
3. Student C: Wish 2, CS, GPA 3.9 → Score: 50 + 50 + 50 = 150 ❌ REJECTED
```

## 🚨 Error Handling

The API uses standard HTTP status codes and custom error responses:

### Status Codes

| Code | Meaning                                |
| ---- | -------------------------------------- |
| 200  | OK - Request successful                |
| 201  | Created - Resource created             |
| 400  | Bad Request - Validation failed        |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions   |
| 404  | Not Found - Resource not found         |
| 409  | Conflict - Duplicate resource          |
| 500  | Internal Server Error                  |

### Error Response Format

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}
```

### Custom Error Classes

- `DuplicateEmailError` - Email already registered
- `DuplicateNationalIdError` - National ID already exists
- `RegistrationError` - Registration failed
- `InternshipError` - Internship-related errors
- `UnauthorizedError` - Unauthorized access
- `CompanyNotFoundError` - Company profile not found
- `StudentNotFoundError` - Student profile not found

## 💻 Development

### Available Scripts

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Database operations
npm run db:push      # Push schema changes to DB
npm run db:generate  # Generate migration files
npm run db:studio    # Open Drizzle Studio UI

# Testing
npm test             # Run test suite
npm run test:watch   # Watch mode
```

### Code Organization Best Practices

1. **Separation of Concerns**
   - Controllers: Handle HTTP requests/responses
   - Services: Business logic
   - Repositories: Database operations
   - Validations: Input validation

2. **Error Handling**
   - Use custom error classes
   - Consistent error responses
   - Proper HTTP status codes

3. **Naming Conventions**
   - Controllers: `*Controller`
   - Services: `*Service`
   - Repositories: direct function names
   - Files: kebab-case, directories: kebab-case

4. **Type Safety**
   - Leverage TypeScript types
   - Use Drizzle ORM type inference
   - Define DTOs for API requests

### Database Migrations

When modifying the schema in [`src/db/schema/`](#project-structure):

```bash
# Generate migration files
npm run db:generate

# Push changes to database
npm run db:push

# View database in Drizzle Studio
npm run db:studio
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Quality Standards

- Follow TypeScript best practices
- Write descriptive commit messages
- Add comments for complex logic
- Test new features
- Update documentation

## 🤝 Support

For issues, questions, or suggestions:

- Open an issue in the repository
- Contact: ziad.elsyad16@gmail.com
