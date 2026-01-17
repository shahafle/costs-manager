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

describe('Admins Service Endpoints', () => {
  describe('GET /api/about', () => {
    it('should return developers list', async () => {
      const response = await request(app)
        .get('/api/about')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      
      expect(response.body[0]).toHaveProperty('first_name', 'Shahaf');
      expect(response.body[0]).toHaveProperty('last_name', 'Levi');
      expect(response.body[1]).toHaveProperty('first_name', 'Eylon');
      expect(response.body[1]).toHaveProperty('last_name', 'Edri');
    });
  });
});
