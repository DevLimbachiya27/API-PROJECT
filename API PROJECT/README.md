# 🏢 Smart Society Management System

<div align="center">

A Full Stack **MERN** application that digitizes residential society management by providing a centralized platform for Residents, Society Administrators, Security Staff, and Maintenance Staff.

Built using **React, Node.js, Express, MongoDB & JWT Authentication.**

---

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Node](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-success?logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Authentication-red)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-purple?logo=bootstrap)
![License](https://img.shields.io/badge/License-MIT-blue)

</div>

---

# 📖 About Project

Managing residential societies manually often leads to communication gaps, poor record management, visitor tracking issues, delayed complaint resolution, and maintenance billing challenges.

The **Smart Society Management System** solves these problems by providing an all-in-one digital platform where administrators, residents, security personnel, and maintenance staff can efficiently manage society operations.

---

# ✨ Features

## 🔐 Authentication

- User Registration
- Login
- Logout
- Forgot Password
- Reset Password
- JWT Authentication
- Role Based Access Control

---

## 👨‍👩‍👧 Resident Management

- Resident Registration
- Family Members
- Flat Allocation
- Tenant Details
- Vehicle Registration
- Profile Management

---

## 🚪 Visitor Management

- Visitor Entry
- Exit Tracking
- Resident Approval
- Delivery Tracking
- Visitor History

---

## 🛠 Complaint Management

- Raise Complaint
- Upload Images
- Assign Complaint
- Update Status
- Complaint History

Status Flow

```
Open
   ↓
Assigned
   ↓
In Progress
   ↓
Resolved
   ↓
Closed
```

---

## 💰 Maintenance Billing

- Monthly Bills
- Invoice Generation
- Payment Tracking
- Due Amount
- Penalty Calculation

---

## 🏊 Facility Booking

- Club House
- Gym
- Swimming Pool
- Garden
- Community Hall
- Sports Court

---

## 📢 Notice Board

- Society Notices
- Emergency Alerts
- Events
- Meeting Notifications

---

## 🗳 Poll & Voting

- Create Poll
- Online Voting
- Result Tracking
- Resident Participation

---

## 📊 Dashboard

### Admin Dashboard

- Total Residents
- Flats
- Visitor Reports
- Complaints
- Revenue
- Facility Usage

### Resident Dashboard

- Bills
- Complaints
- Notices
- Visitor Requests
- Bookings

---

## 🔔 Notification System

- Visitor Approval
- Complaint Updates
- Payment Reminder
- Booking Confirmation
- Society Announcements

---

# 👥 User Roles

## 🛡 Society Administrator

- Manage Residents
- Manage Flats
- Maintenance Bills
- Complaints
- Facilities
- Notices
- Reports
- Visitors

---

## 🏠 Resident

- Profile
- Family Members
- Vehicles
- Complaints
- Bills
- Payments
- Book Facilities
- Visitor Approval
- Notices

---

## 🚓 Security Staff

- Register Visitors
- Verify Resident Approval
- Entry & Exit
- Delivery Management
- Visitor Logs

---

## 🔧 Maintenance Staff

- Assigned Complaints
- Progress Update
- Resolve Issues
- Upload Completion Details

---

# 🛠 Tech Stack

## Frontend

- React.js
- TypeScript
- Bootstrap 5
- React Router
- Redux Toolkit
- Axios

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt
- Multer
- Nodemailer

---

# 📂 Project Structure

```text
API PROJECT
│
├── client
│   ├── dist
│   ├── public
│   ├── src
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── server
│   ├── config
│   │   └── db.js
│   │
│   ├── controllers
│   │   ├── authController.js
│   │   ├── billingController.js
│   │   ├── complaintController.js
│   │   ├── facilityController.js
│   │   ├── noticeController.js
│   │   ├── notificationController.js
│   │   ├── pollController.js
│   │   ├── residentController.js
│   │   └── visitorController.js
│   │
│   ├── middleware
│   │   └── auth.js
│   │
│   ├── models
│   │   ├── Complaint.js
│   │   ├── FacilityBooking.js
│   │   ├── MaintenanceBill.js
│   │   ├── Notice.js
│   │   ├── Notification.js
│   │   ├── Poll.js
│   │   ├── Resident.js
│   │   ├── User.js
│   │   └── Visitor.js
│   │
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── billingRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── facilityRoutes.js
│   │   ├── noticeRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── pollRoutes.js
│   │   ├── residentRoutes.js
│   │   └── visitorRoutes.js
│   │
│   ├── uploads
│   ├── utils
│   │   ├── helpers.js
│   │   └── sendEmail.js
│   │
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── ASSETS
│   └── screenshots
│
├── .gitignore
└── README.md
```

---

# ⚙ Installation

Clone Repository

```bash
git clone https://github.com/yourusername/Smart-Society-Management-System.git
```

Move into project

```bash
cd Smart-Society-Management-System
```

Install Backend

```bash
cd server
npm install
```

Install Frontend

```bash
cd ../client
npm install
```

Run Backend

```bash
npm start
```

Run Frontend

```bash
npm run dev
```

---

# 🌍 Environment Variables

Create a `.env`

```env
PORT=5000

MONGO_URI=

JWT_SECRET=

EMAIL=

PASSWORD=

CLIENT_URL=http://localhost:5173
```

---

# 📸 Project Screenshots

Create a folder

```
ASSETS/screenshots
```

Then add screenshots like this:

```
ASSETS/
└── screenshots
    ├── login.png
    ├── dashboard.png
    ├── residents.png
    ├── complaints.png
    ├── visitors.png
    ├── billing.png
    ├── booking.png
    └── notices.png
```

Display them in README:

## Login

![](ASSETS/screenshots/login.png)

---

## Dashboard

![](ASSETS/screenshots/dashboard.png)

---

## Residents

![](ASSETS/screenshots/residents.png)

---

## Complaints

![](ASSETS/screenshots/complaints.png)

---

## Visitor Management

![](ASSETS/screenshots/visitors.png)

---

## Maintenance Billing

![](ASSETS/screenshots/billing.png)

---

## Facility Booking

![](ASSETS/screenshots/booking.png)

---

## Notice Board

![](ASSETS/screenshots/notices.png)

---

# 🚀 Future Improvements

- Socket.io Notifications
- QR Visitor Pass
- Mobile Application
- Online Payment Gateway
- WhatsApp Notifications
- AI Complaint Categorization
- Multi Society Support

---

# 🎓 Learning Outcomes

- MERN Stack
- REST API
- JWT Authentication
- MongoDB
- Redux Toolkit
- File Upload
- Email Integration
- Dashboard Development
- Deployment
- Project Architecture

---

# 👨‍💻 Developer

**Dev Limbachiya**

Frontend & MERN Stack Developer

GitHub: https://github.com/yourusername

LinkedIn: https://linkedin.com/in/yourprofile

---

# ⭐ Support

If you like this project,

⭐ Star this repository.

---

# 📜 License

This project is developed for educational purposes.

MIT License