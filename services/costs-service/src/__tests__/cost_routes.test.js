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

describe('Costs Service Endpoints', () => {
  describe('POST /api/add', () => {
    it('should return error for invalid cost data', async () => {
      const response = await request(app)
        .post('/api/add')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for invalid userid', async () => {
      const costData = {
        description: 'Test cost',
        category: 'food',
        userid: 'invalid',
        sum: 100,
      };

      const response = await request(app)
        .post('/api/add')
        .send(costData)
        .expect(400);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/costs', () => {
    it('should get all costs', async () => {
      const response = await request(app)
        .get('/api/costs')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter costs by userid', async () => {
      const response = await request(app)
        .get('/api/costs?userid=1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return error for invalid userid in query', async () => {
      const response = await request(app)
        .get('/api/costs?userid=invalid')
        .expect(400);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/costs/total/:userId', () => {
    it('should return total costs for a user', async () => {
      const response = await request(app)
        .get('/api/costs/total/1')
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(typeof response.body.total).toBe('number');
    });

    it('should return error for invalid user ID', async () => {
      const response = await request(app)
        .get('/api/costs/total/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/report', () => {
    it('should return error for missing query parameters', async () => {
      const response = await request(app)
        .get('/api/report')
        .expect(400);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for invalid id parameter', async () => {
      const response = await request(app)
        .get('/api/report?id=invalid&year=2025&month=1')
        .expect(400);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for invalid year parameter', async () => {
      const response = await request(app)
        .get('/api/report?id=1&year=1800&month=1')
        .expect(400);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for invalid month parameter', async () => {
      const response = await request(app)
        .get('/api/report?id=1&year=2025&month=13')
        .expect(400);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message');
    });
  });
});
