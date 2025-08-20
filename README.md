# Leave Management System

A comprehensive leave management web application built with Next.js, TypeScript, Prisma, Tailwind CSS, and ClerkJS.

## Features

### Employee Dashboard

- View leave request statistics (pending, approved this month, rejected, total)
- Submit new leave requests with start date, end date, and reason
- View and manage all personal leave requests
- Edit/delete pending requests

### Supervisor Dashboard

- View and approve/reject leave requests from team members
- Search requests by employee name or status
- Manage team leave requests
- View team statistics

### Admin Dashboard

- Manage all users and their roles
- View all leave requests across the organization
- Search and filter requests by employee name or status
- Assign supervisors to employees
- View comprehensive analytics

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Authentication**: ClerkJS
- **Database**: PostgreSQL with Prisma ORM
- **Package Manager**: pnpm

## Project Structure

```
├── app/
│   ├── dashboard/
│   │   ├── all-requests/     # Admin: All requests page
│   │   ├── requests/         # User: Personal requests page
│   │   ├── team/            # Supervisor: Team requests page
│   │   ├── users/           # Admin: User management page
│   │   ├── layout.tsx       # Dashboard layout with navigation
│   │   └── page.tsx         # Main dashboard page
│   ├── sign-in/             # Authentication pages
│   ├── sign-up/
│   ├── globals.css          # Global styles with custom components
│   ├── layout.tsx           # Root layout with ClerkProvider
│   └── page.tsx             # Home page
├── components/              # Reusable React components
├── lib/
│   ├── actions.ts           # Server actions for CRUD operations
│   ├── auth.ts              # Authentication utilities
│   └── prisma.ts            # Prisma client setup
├── prisma/
│   └── schema.prisma        # Database schema
└── middleware.ts            # Clerk authentication middleware
```

## Database Schema

### User Model

- `id`: Unique identifier
- `name`: Full name
- `employeeId`: Unique employee identifier
- `email`: Email address
- `phone`: Phone number (optional)
- `clerkId`: Clerk authentication ID
- `role`: EMPLOYEE | SUPERVISOR | ADMIN
- `supervisorId`: Reference to supervisor (for employees)

### LeaveRequest Model

- `id`: Unique identifier
- `userId`: Reference to user
- `startDate`: Leave start date
- `endDate`: Leave end date
- `reason`: Reason for leave
- `status`: PENDING | APPROVED | REJECTED
- `timestamps`: Created and updated dates

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account for authentication

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd leave_management
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/leave_management"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# (Optional) Open Prisma Studio
pnpm db:studio
```

### 4. Clerk Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Configure sign-in/sign-up pages
3. Copy your publishable key and secret key to `.env.local`
4. Set up custom sign-in/sign-up pages in Clerk dashboard

### 5. Run the Application

```bash
# Development mode
pnpm dev

# Production build
pnpm build
pnpm start
```

## User Roles and Permissions

### Employee

- ✅ View personal dashboard with statistics
- ✅ Submit leave requests
- ✅ View/edit/delete personal leave requests
- ❌ Cannot view other employees' requests
- ❌ Cannot approve/reject requests

### Supervisor

- ✅ All employee permissions
- ✅ View team members' leave requests
- ✅ Approve/reject team requests
- ✅ Search and filter team requests
- ❌ Cannot manage users outside their team

### Admin

- ✅ All supervisor permissions
- ✅ View all users and requests
- ✅ Manage user roles and assignments
- ✅ View organization-wide analytics
- ✅ Assign supervisors to employees

## UI Design

The application features a clean, modern design with:

- **Primary Color**: Black (#000000)
- **Background**: White (#ffffff)
- **Custom Box Shadows**: Soft, medium, and strong variants
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Custom components with consistent styling

## Authentication Flow

1. Users sign up/sign in through ClerkJS
2. Upon first login, a user record is created in the database
3. Default role is assigned as EMPLOYEE
4. Admins can modify roles and assign supervisors
5. Role-based access control restricts page access

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Prisma Studio

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.
