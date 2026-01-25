# 💰 ZapWallet Server - Digital Payment System Backend

A robust and secure backend API for ZapWallet, a digital payment system similar to bKash. Built with Node.js, Express, TypeScript, and MongoDB.

## 🌐 Live URL

- **Backend API:** [https://zapwallet-server.vercel.app](https://zapwallet-server.vercel.app)
- **API Documentation:** `/api/v1`

---

## 🎯 Overview

ZapWallet Server is a production-ready RESTful API that powers a complete digital wallet ecosystem with support for multiple user roles (Users, Agents, Super Admins), secure transactions, commission tracking, and comprehensive wallet management.

### Key Highlights

- ✅ **Role-Based Access Control** - User, Agent, and Super Admin roles
- ✅ **Secure Authentication** - JWT-based auth with refresh tokens
- ✅ **Transaction Management** - Send money, cash in/out, withdrawals
- ✅ **Commission System** - Agent and admin commission tracking
- ✅ **OTP Verification** - SMS-based account verification
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **Input Validation** - Zod schema validation on all endpoints
- ✅ **Redis Caching** - Fast session and data caching

---

## 🚀 Features

### 🔐 Authentication & Authorization

- **JWT Authentication** - Access and refresh token system
- **Role-Based Access** - Three user roles with different permissions
  - **User** - Send money, cash out, view transactions
  - **Agent** - Cash in, withdraw, earn commissions
  - **Super Admin** - Fund agents, manage users, view revenue
- **PIN-Based Security** - 6-digit PIN for transactions
- **OTP Verification** - Phone number verification via SMS
- **Session Management** - Redis-based session storage

### 💸 Transaction System

- **Send Money** - User-to-user transfers (৳100 - ৳1,000,000)
- **Cash In** - Agent deposits money to user accounts
- **Cash Out** - Users withdraw cash through agents
- **Withdraw Money** - Agents withdraw to bank accounts
- **Transaction History** - Paginated transaction logs with filters
- **Real-time Balance Updates** - Atomic wallet operations

### 💼 Commission Management

- **Agent Commission** - 1.5% on cash-in transactions
- **Admin Commission** - System-wide commission tracking
- **Commission History** - Detailed commission reports
- **Automatic Calculation** - Commission computed on each transaction

### 👥 User Management

- **User Registration** - Email, phone, NID verification
- **Agent Registration** - Additional TIN ID requirement
- **Profile Management** - Update user information
- **Account Status** - Active, inactive, deleted states
- **Agent Approval** - Admin approval workflow for agents

### 💰 Wallet System

- **Balance Tracking** - Real-time wallet balance
- **Transaction Limits** - Min/max amount enforcement
- **Currency Support** - BDT (Bangladeshi Taka)
- **Wallet Status** - Active/inactive wallet management
- **Initial Balance** - ৳50 for users, ৳100M for super admin

### 🔒 Security Features

- **Rate Limiting** - 5 login attempts per 15 minutes
- **Request Validation** - Zod schema validation
- **PIN Hashing** - Bcrypt with 12 salt rounds
- **CORS Protection** - Environment-based origin control
- **Request Size Limits** - 10kb max payload
- **Error Handling** - Centralized error management

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | JavaScript runtime | Latest LTS |
| **Express.js** | Web framework | v5.x |
| **TypeScript** | Type safety | v5.9.x |
| **MongoDB** | NoSQL database | v8.x |
| **Mongoose** | ODM for MongoDB | v8.19.x |
| **JWT** | Authentication tokens | v9.0.x |
| **Bcrypt** | Password hashing | v3.0.x |
| **Zod** | Schema validation | v4.1.x |
| **Redis** | Caching & sessions | v5.8.x |
| **Nodemailer** | Email service | v7.0.x |
| **Twilio** | SMS service | v5.10.x |
| **Express Rate Limit** | Rate limiting | Latest |
| **Compression** | Response compression | Latest |

---

## 📁 Project Structure

```
ZapWallet-Server/
├── src/
│   ├── app/
│   │   ├── config/           # Configuration files
│   │   │   ├── env.ts        # Environment variables
│   │   │   └── redis.config.ts
│   │   ├── middlewares/      # Express middlewares
│   │   │   ├── checkAuth.ts  # JWT authentication
│   │   │   ├── rateLimiter.ts # Rate limiting
│   │   │   ├── validateRequest.ts # Zod validation
│   │   │   ├── globalErrorHandler.ts
│   │   │   └── notFound.ts
│   │   ├── modules/          # Feature modules
│   │   │   ├── auth/         # Authentication
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.route.ts
│   │   │   │   └── auth.validation.ts
│   │   │   ├── user/         # User management
│   │   │   ├── wallet/       # Wallet operations
│   │   │   ├── transaction/  # Transactions
│   │   │   ├── commission/   # Commission tracking
│   │   │   └── otp/          # OTP verification
│   │   ├── routes/           # Route aggregation
│   │   └── utils/            # Utility functions
│   ├── app.ts                # Express app setup
│   └── server.ts             # Server entry point
├── .env                      # Environment variables
├── package.json
└── tsconfig.json
```

---

## 🚦 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/login` | User login | ❌ |
| POST | `/api/v1/auth/refresh-token` | Get new access token | ❌ |
| POST | `/api/v1/auth/logout` | User logout | ✅ |
| POST | `/api/v1/auth/reset-pin` | Change PIN | ✅ |

### User Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/user/create-user` | Register user | ❌ |
| GET | `/api/v1/user/my-info` | Get current user | ✅ |
| PATCH | `/api/v1/user/update-profile` | Update profile | ✅ |
| GET | `/api/v1/user/all-users` | Get all users (Admin) | ✅ |

### Wallet Operations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/wallet/send-money` | Send money to user | ✅ |
| POST | `/api/v1/wallet/cash-in` | Cash in (Agent) | ✅ |
| POST | `/api/v1/wallet/cash-out` | Cash out | ✅ |
| POST | `/api/v1/wallet/withdraw` | Withdraw (Agent) | ✅ |
| GET | `/api/v1/wallet/balance` | Get wallet balance | ✅ |

### Transactions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/transaction/my-transactions` | Get user transactions | ✅ |
| GET | `/api/v1/transaction/all-transactions` | Get all (Admin) | ✅ |

### OTP

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/otp/send-otp` | Send OTP | ❌ |
| POST | `/api/v1/otp/verify-otp` | Verify OTP | ❌ |

### Commission

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/commission/my-commission` | Get agent commission | ✅ |
| GET | `/api/v1/commission/all-commission` | Get all (Admin) | ✅ |

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DB_URL=mongodb://localhost:27017/zapwallet

# JWT Secrets
JWT_ACCESS_SECRET=your-access-secret-here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRES=7d

# Security
BCRYPT_SALT_ROUND=12
EXPRESS_SESSION_SECRET=your-session-secret

# Super Admin
SUPER_ADMIN_EMAIL=admin@zapwallet.com
SUPER_ADMIN_PASSWORD=Admin@123
SUPER_ADMIN_PHONE=+8801812345678

# Frontend
FRONTEND_URL=http://localhost:5173

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=ZapWallet <noreply@zapwallet.com>

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=your-redis-password
```

> **Note:** See `.env.example` for complete list of environment variables including SSL payment gateway, Cloudinary, and Twilio configuration.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Redis (v7 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ZapWallet.git
   cd ZapWallet/ZapWallet-Server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB and Redis**
   ```bash
   # MongoDB
   mongod

   # Redis
   redis-server
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

The server will start on `http://localhost:5000`

---

## 📊 Database Schema

### User Model
```typescript
{
  name: string;
  email: string;
  phone: string; // +88XXXXXXXXXXX
  pin: string; // Hashed, 6 digits
  nid: string; // 10, 13, or 17 digits
  role: 'user' | 'agent' | 'super_admin';
  isVerified: boolean;
  isActive: 'active' | 'inactive';
  isDeleted: boolean;
  wallet: ObjectId; // Reference to Wallet
  agentInfo?: {
    tinId: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    commissionRate: number;
    totalCommission: number;
  };
}
```

### Wallet Model
```typescript
{
  user: ObjectId; // Reference to User
  balance: number;
  currency: string; // Default: 'BDT'
  walletStatus: 'active' | 'inactive';
  transactions: ObjectId[]; // References to Transaction
}
```

### Transaction Model
```typescript
{
  from: ObjectId; // Sender User
  to: ObjectId; // Receiver User
  fromWallet: ObjectId;
  toWallet: ObjectId;
  amount: number;
  type: 'send_money' | 'cash_in' | 'cash_out' | 'withdraw';
  initiatedBy: 'user' | 'agent';
  status: 'completed' | 'pending' | 'failed';
  commission: {
    agentCommission: number;
    superAdminCommission: number;
    systemFee: number;
  };
}
```

---

## 🔒 Security Best Practices

1. **Environment Variables** - Never commit `.env` files
2. **JWT Secrets** - Use strong, random secrets (64+ characters)
3. **PIN Security** - 6-digit PINs hashed with bcrypt (12 rounds)
4. **Rate Limiting** - Prevents brute force attacks
5. **Input Validation** - All inputs validated with Zod
6. **CORS** - Restricted to frontend URL only
7. **Request Size** - Limited to 10kb to prevent DoS

---

## 🧪 Testing

```bash
# Run tests (if configured)
npm test

# Run linter
npm run lint
```

---

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@Farhad25906](https://github.com/Farhad25906)
- Email:farhadhossen2590@gmail.com

---

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- MongoDB team for the powerful database
- All contributors who helped improve this project

---

## 📞 Support

For support, email support@zapwallet.com or join our Slack channel.
