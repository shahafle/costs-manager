require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const connectDB = require('../config/database');

// Connect to database before all tests
beforeAll(async () => {
  await connectDB();
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongoose.disconnect();
});

describe('Logs Service Endpoints', () => {
  describe('GET /api/logs', () => {
    it('should get all logs', async () => {
      const response = await request(app)
        .get('/api/logs')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter logs by service', async () => {
      const response = await request(app)
        .get('/api/logs?service=logs-service')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter logs by level', async () => {
      const response = await request(app)
        .get('/api/logs?level=info')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should limit results', async () => {
      const response = await request(app)
        .get('/api/logs?limit=10')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
