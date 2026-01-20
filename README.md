⚠️ **Important**: The microservices are deployed on Render Free Tier. Due to the "spin-down" policy for inactive instances, **you may experience a delay of 60-90 seconds** while the containers mount and start running. **If you receive a timeout or a long loading screen, please refresh after a minute.**

# Microservices Architecture

This project has been refactored into 4 independent microservices, each running on a separate port and deployable independently.

## Services

### 1. Users Service (Port 3001)
- **Location**: `services/users-service/`
- **Port**: 3001
- **Endpoints**:
  - `GET /api/users` - Get all users
  - `GET /api/users/:id` - Get user by ID (includes total costs)
  - `POST /api/add` - Create user

### 2. Costs Service (Port 3002)
- **Location**: `services/costs-service/`
- **Port**: 3002
- **Endpoints**:
  - `GET /api/costs` - Get all costs (supports query params: `userid`, `category`)
  - `POST /api/add` - Create cost (supports optional `createdAt` field, cannot be in the past)
  - `GET /api/costs/total/:userId` - Get total costs for a user
  - `GET /api/report` - Get monthly report (query params: `id`, `year`, `month`)
    - Returns costs grouped by category for a specific user, month, and year
    - Implements Computed Design Pattern - caches reports for past months
    - Categories: food, education, health, housing

### 3. Logs Service (Port 3003)
- **Location**: `services/logs-service/`
- **Port**: 3003
- **Endpoints**:
  - `GET /api/logs` - Get all logs (supports query params: `service`, `level`, `startDate`, `endDate`, `limit`)

### 4. Admins Service (Port 3004)
- **Location**: `services/admins-service/`
- **Port**: 3004
- **Endpoints**:
  - `GET /api/about` - Get developers list (returns fixed array: Shahaf Levi, Eylon Edri)

## Installation

### Prerequisites

**⚠️ IMPORTANT: Before starting the installation, you must obtain the `MONGODB_URI` from the project developers (Shahaf Levi or Eylon Edri).**

Contact the developers to receive the MongoDB connection string required for all services.

### Quick Setup

1. **Get MongoDB URI from developers** (required before proceeding)
2. Install all dependencies at once:
```bash
npm run install:all
```
3. **Configure environment variables** (see Environment Variables section below)

### Manual Setup

Each service is independent and has its own `package.json`. To set up manually:

1. **Get MongoDB URI from developers** (required before proceeding)
2. Install dependencies:
```bash
cd services/users-service && npm install
cd ../costs-service && npm install
cd ../logs-service && npm install
cd ../admins-service && npm install
```
3. **Configure environment variables** (see Environment Variables section below)

## Environment Variables

**⚠️ IMPORTANT: You must obtain the `MONGODB_URI` from the project developers before creating the `.env` files.**

Contact the project developers (Shahaf Levi or Eylon Edri) to receive the MongoDB connection string.

Create `.env` files for each service with the MongoDB URI provided by the developers:

### users-service/.env
```env
PORT=3001
MONGODB_URI=<OBTAIN FROM DEVELOPERS - Contact Shahaf Levi or Eylon Edri>
SERVICE_NAME=users-service
NODE_ENV=development
LOG_LEVEL=info
COSTS_SERVICE_URL=http://localhost:3002
```

### costs-service/.env
```env
PORT=3002
MONGODB_URI=<OBTAIN FROM DEVELOPERS - Contact Shahaf Levi or Eylon Edri>
SERVICE_NAME=costs-service
NODE_ENV=development
LOG_LEVEL=info
USERS_SERVICE_URL=http://localhost:3001
```

### logs-service/.env
```env
PORT=3003
MONGODB_URI=<OBTAIN FROM DEVELOPERS - Contact Shahaf Levi or Eylon Edri>
SERVICE_NAME=logs-service
NODE_ENV=development
LOG_LEVEL=info
```

### admins-service/.env
```env
PORT=3004
MONGODB_URI=<OBTAIN FROM DEVELOPERS - Contact Shahaf Levi or Eylon Edri>
SERVICE_NAME=admins-service
NODE_ENV=development
LOG_LEVEL=info
USERS_SERVICE_URL=http://localhost:3001
COSTS_SERVICE_URL=http://localhost:3002
LOGS_SERVICE_URL=http://localhost:3003
```

**Note:** Replace `<OBTAIN FROM DEVELOPERS - Contact Shahaf Levi or Eylon Edri>` with the actual MongoDB URI provided by the project developers.

## Running the Services

### Development Mode

Use the root package.json scripts to run services:

```bash
# Terminal 1
npm run dev:users

# Terminal 2
npm run dev:costs

# Terminal 3
npm run dev:logs

# Terminal 4
npm run dev:admins
```

Or run each service manually:

```bash
# Terminal 1
cd services/users-service && npm run dev

# Terminal 2
cd services/costs-service && npm run dev

# Terminal 3
cd services/logs-service && npm run dev

# Terminal 4
cd services/admins-service && npm run dev
```

### Production Mode

```bash
cd services/users-service && npm start
cd services/costs-service && npm start
cd services/logs-service && npm start
cd services/admins-service && npm start
```

## Inter-Service Communication

- **Users Service** calls **Costs Service** to get total costs for a user
- **Costs Service** calls **Users Service** to verify users exist before creating costs
- All services log to MongoDB using Pino

## Logging

All services use Pino for logging with the following features:
- Logs are saved to MongoDB `logs` collection
- Log fields: `level`, `time`, `pid`, `service`, `message`, `metadata`
- HTTP request logging via `pino-http`
- Endpoint access logging via custom middleware
- Pretty console output in development mode

## Service URLs

- Users Service: `http://localhost:3001`
- Costs Service: `http://localhost:3002`
- Logs Service: `http://localhost:3003`
- Admins Service: `http://localhost:3004`

## Database Collections

- **users** - User information (id, first_name, last_name, birthday)
- **costs** - Cost items (description, category, userid, sum, createdAt)
- **logs** - Application logs (level, time, pid, service, message, metadata)
- **reports** - Cached monthly reports (userid, year, month, costs)

## Features

- ✅ Microservices architecture with independent deployment
- ✅ MongoDB integration with Mongoose
- ✅ Centralized logging with Pino
- ✅ Error handling middleware
- ✅ Monthly report generation with caching (Computed Design Pattern)

## Technologies

- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **Pino** (v10.2.0) - Fast JSON logger
- **Pino-http** (v11.0.0) - HTTP request logging
- **Pino-mongodb** (v5.0.0) - MongoDB transport for Pino
- **Axios** - HTTP client for inter-service communication
- **dotenv** - Environment variable management
- **Nodemon** - Development auto-reload
