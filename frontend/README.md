# MERN Stack Authentication - Frontend

A modern React frontend for a full-stack authentication and notes management application built with Vite, React Router, and Tailwind CSS.

## Features

### User Interface
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Smooth Navigation**: React Router for seamless page transitions
- **Loading States**: User feedback during API operations
- **Error Handling**: Comprehensive error messages and alerts

### Authentication Pages
- **Signup Form**: User registration with validation
- **Login Form**: Secure user authentication
- **Email Verification**: Account activation flow
- **Password Reset**: OTP-based password recovery
- **Protected Routes**: Automatic redirects for unauthenticated users

### Dashboard
- **Notes Management**: Create, read, update, and delete notes
- **Real-time Updates**: Instant UI updates after operations
- **User Profile**: Display user information
- **Logout Functionality**: Secure session termination

##  Tech Stack

- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Fetch API** - HTTP requests to backend API
- **ESLint** - Code linting and formatting

##  Prerequisites

- Node.js (v16 or higher)
- Backend server running (see backend README)

##  Getting Started

### 1. Install Dependencies
```bash
npm install
```

##  Components Overview

### Authentication Components
- **Signup**: User registration with email verification
- **Login**: JWT-based authentication
- **ForgetPassword**: Email-based password reset request
- **OtpVerification**: OTP input and verification
- **ChangePassword**: New password setup

### Dashboard Components
- **Dashboard**: Main notes display and management
- **AddNote**: Modal form for creating new notes
- **EditNoteModal**: Modal form for editing existing notes
