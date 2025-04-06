# Technical Implementation Guide

## Project Overview

This document outlines the technical implementation of a startup networking platform with the following core features:

- Authentication System
- Profile Management
- Updates Feed
- Status Management
- User Directory

## Technology Stack

- Frontend: React.js with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT (JSON Web Tokens)
- Styling: Tailwind CSS

## Core Features

### 1. Authentication System
- Secure user registration with email and password
- JWT-based authentication
- Protected routes for authenticated users
- Session management using localStorage
- Automatic redirect to login for unauthenticated users

### 2. Profile Management
- View and edit personal profile
- Update startup URL
- View other users' profiles
- Display startup information
- Email contact functionality

### 3. Updates Feed
- Post text updates about startup progress
- View chronological feed of all updates
- Pagination with "Load More" functionality
- User attribution for each update
- Real-time feed updates

### 4. Status Management
- Toggle between "In Office" and "Out of Office" status
- Personal status management page
- Central office status dashboard
- Real-time status updates
- Status history tracking

### 5. User Directory
- View all registered users
- Quick access to user profiles
- Startup information display
- Direct email contact
- Latest updates from each user

## Database Schema

### User Model
```prisma
model User {
  id          Int      @id @default(autoincrement())
  name        String
  email       String   @unique
  password    String
  startupName String
  startupUrl  String?
  createdAt   DateTime @default(now())
  updates     Update[]
  status      Status?
}