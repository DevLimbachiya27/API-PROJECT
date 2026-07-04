# Smart Society Management System

A comprehensive web-based platform for managing residential society operations including resident management, visitor tracking, complaint handling, maintenance billing, facility bookings, and more.

## Tech Stack

### Frontend
- React.js 18 with Vite
- Redux Toolkit for state management
- React Router v6
- Axios for HTTP requests
- Chart.js for dashboard analytics
- React Toastify for notifications
- React Icons

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- Bcrypt.js for password hashing
- Multer for file uploads
- Nodemailer for email services

## Features

### User Roles
1. **Administrator** - Full system access, manages residents, complaints, billing, notices, polls
2. **Resident** - Personal dashboard, raise complaints, pay bills, book facilities, vote in polls
3. **Security Staff** - Visitor registration, entry/exit tracking
4. **Maintenance Staff** - View and update assigned complaints

### Modules
- **Authentication** - Register, Login, Forgot Password, JWT-based sessions
- **Resident Management** - Profiles, family members, vehicle registration
- **Visitor Management** - Registration, approval workflow, entry/exit logs
- **Complaint Management** - Raise, assign, track with status flow
- **Maintenance Billing** - Generate bills, track payments, penalty calculation
- **Facility Booking** - Book amenities, availability check, admin approval
- **Notice Board** - Post announcements with priority and categories
- **Polls & Voting** - Create polls, cast votes, view results
- **Notifications** - Real-time updates for all activities
- **Dashboard & Analytics** - Stats cards, charts, quick actions

## Project Structure

```
├── server/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth & upload middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── utils/           # Helper functions
│   ├── uploads/         # Uploaded files
│   └── server.js        # Entry point
│
├── client/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── redux/       # Redux store & slices
│   │   ├── services/    # API configuration
│   │   ├── App.jsx      # Main app with routing
│   │   └── index.css    # Global styles
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd smart-society-management
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_society_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Create Admin Account
Register a new user through the registration page and select "Administrator" as the role.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/updateprofile | Update profile |
| POST | /api/auth/forgotpassword | Send reset email |
| PUT | /api/auth/resetpassword/:token | Reset password |

### Residents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/residents | Get all residents |
| POST | /api/residents | Create resident profile |
| GET | /api/residents/myprofile | Get own profile |
| POST | /api/residents/:id/family | Add family member |
| POST | /api/residents/:id/vehicles | Register vehicle |

### Visitors
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/visitors | Register visitor |
| GET | /api/visitors | Get visitor log |
| PUT | /api/visitors/:id/approve | Approve/Reject visitor |
| PUT | /api/visitors/:id/exit | Record exit |

### Complaints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/complaints | Raise complaint |
| GET | /api/complaints | Get complaints |
| PUT | /api/complaints/:id/assign | Assign to staff |
| PUT | /api/complaints/:id/status | Update status |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/billing/generate | Generate monthly bills |
| GET | /api/billing | Get bills |
| PUT | /api/billing/:id/pay | Record payment |
| GET | /api/billing/summary | Get revenue summary |

### Facilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/facilities | List facilities |
| GET | /api/facilities/availability | Check availability |
| POST | /api/facilities/book | Book facility |
| PUT | /api/facilities/bookings/:id/approve | Approve booking |

### Notices
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/notices | Create notice |
| GET | /api/notices | Get all notices |
| DELETE | /api/notices/:id | Delete notice |

### Polls
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/polls | Create poll |
| GET | /api/polls | Get all polls |
| POST | /api/polls/:id/vote | Cast vote |

## Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy the dist/ folder to Vercel
```

### Backend (Render)
- Set environment variables on Render
- Deploy the server/ directory
- Use MongoDB Atlas for production database

## License
ISC
