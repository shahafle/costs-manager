# Environment Variables for Deployment

This document lists all required environment variables for each microservice.

## Users Service

**Required Environment Variables:**

```env
# Server Configuration
PORT=3001                    # Port the service will run on (default: 3001)

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/your_database_name
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority

# External Service URLs (for inter-service communication)
COSTS_SERVICE_URL=http://localhost:3002
# In production, use the actual deployed URL:
# COSTS_SERVICE_URL=https://costs-service.yourdomain.com

# Logging
LOG_LEVEL=info               # Options: error, warn, info, debug (default: info)
NODE_ENV=production          # Options: development, production (default: development)
```

**Notes:**
- `COSTS_SERVICE_URL` is used when getting user details with total costs
- Each service can use the same MongoDB database or separate databases

---

## Costs Service

**Required Environment Variables:**

```env
# Server Configuration
PORT=3002                    # Port the service will run on (default: 3002)

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/your_database_name
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority

# External Service URLs (for inter-service communication)
USERS_SERVICE_URL=http://localhost:3001
# In production, use the actual deployed URL:
# USERS_SERVICE_URL=https://users-service.yourdomain.com

# Logging
LOG_LEVEL=info               # Options: error, warn, info, debug (default: info)
NODE_ENV=production          # Options: development, production (default: development)
```

**Notes:**
- `USERS_SERVICE_URL` is used to verify users exist and get user information when returning costs
- Costs service calls users-service to populate user data in responses

---

## Logs Service

**Required Environment Variables:**

```env
# Server Configuration
PORT=3003                    # Port the service will run on (default: 3003)

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/your_database_name
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority

# Logging
LOG_LEVEL=info               # Options: error, warn, info, debug (default: info)
NODE_ENV=production          # Options: development, production (default: development)
```

**Notes:**
- Logs service is independent and doesn't communicate with other services
- It stores log entries in MongoDB

---

## Admins Service

**Required Environment Variables:**

```env
# Server Configuration
PORT=3004                    # Port the service will run on (default: 3004)

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/your_database_name
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority

# External Service URLs (for inter-service communication)
USERS_SERVICE_URL=http://localhost:3001
# In production, use the actual deployed URLs:
# USERS_SERVICE_URL=https://users-service.yourdomain.com

# Logging
LOG_LEVEL=info               # Options: error, warn, info, debug (default: info)
NODE_ENV=production          # Options: development, production (default: development)
```

**Notes:**
- `USERS_SERVICE_URL` is used to fetch developers for the `/api/about` endpoint
- Admins service calls users-service to get developer information

---

## Summary Table

| Service | Port | Required ENV Vars | External Dependencies |
|---------|------|-------------------|----------------------|
| **Users Service** | 3001 | `PORT`, `MONGODB_URI`, `COSTS_SERVICE_URL`, `LOG_LEVEL`, `NODE_ENV` | Costs Service |
| **Costs Service** | 3002 | `PORT`, `MONGODB_URI`, `USERS_SERVICE_URL`, `LOG_LEVEL`, `NODE_ENV` | Users Service |
| **Logs Service** | 3003 | `PORT`, `MONGODB_URI`, `LOG_LEVEL`, `NODE_ENV` | None |
| **Admins Service** | 3004 | `PORT`, `MONGODB_URI`, `USERS_SERVICE_URL`, `LOG_LEVEL`, `NODE_ENV` | Users Service |

---

## Deployment Checklist

For each service deployment:

1. ✅ Set `PORT` (or use default)
2. ✅ Set `MONGODB_URI` (can be shared or separate databases)
3. ✅ Set external service URLs (if the service depends on others)
4. ✅ Set `NODE_ENV=production`
5. ✅ Set `LOG_LEVEL` (recommended: `info` for production)
6. ✅ Ensure MongoDB is accessible from deployment environment
7. ✅ Ensure inter-service URLs are accessible (if using HTTPS, update URLs accordingly)

---

## Example Production .env Files

### users-service/.env
```env
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/production_db?retryWrites=true&w=majority
COSTS_SERVICE_URL=https://api.yourdomain.com/costs-service
NODE_ENV=production
LOG_LEVEL=info
```

### costs-service/.env
```env
PORT=3002
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/production_db?retryWrites=true&w=majority
USERS_SERVICE_URL=https://api.yourdomain.com/users-service
NODE_ENV=production
LOG_LEVEL=info
```

### logs-service/.env
```env
PORT=3003
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/production_db?retryWrites=true&w=majority
NODE_ENV=production
LOG_LEVEL=info
```

### admins-service/.env
```env
PORT=3004
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/production_db?retryWrites=true&w=majority
USERS_SERVICE_URL=https://api.yourdomain.com/users-service
NODE_ENV=production
LOG_LEVEL=info
```

---

## Important Notes

1. **Database Strategy**: You can use:
   - **Shared Database**: All services connect to the same MongoDB database (different collections)
   - **Separate Databases**: Each service has its own database (better isolation)

2. **Service URLs**: When deploying:
   - Use HTTPS in production
   - Update URLs to match your actual deployment domains
   - Consider using environment-specific URLs (dev, staging, prod)

3. **Security**: 
   - Never commit `.env` files to version control
   - Use secure methods to inject environment variables in your deployment platform
   - Use MongoDB Atlas IP whitelisting and authentication

4. **Ports**: In production, you'll likely use:
   - Reverse proxy (nginx, API Gateway) to route to services
   - Or container orchestration (Kubernetes, Docker Swarm) with internal networking
   - Ports may be different from defaults depending on your infrastructure

