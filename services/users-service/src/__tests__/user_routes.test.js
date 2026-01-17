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

describe('Users Service Endpoints', () => {
  describe('POST /api/add', () => {
    it('should create a new user', async () => {
      const userData = {
        id: 999,
        first_name: 'Test',
        last_name: 'User',
        birthday: '1990-01-01',
      };

      const response = await request(app)
        .post('/api/add')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('first_name', 'Test');
      expect(response.body).toHaveProperty('last_name', 'User');
    });

    it('should return error for invalid user data', async () => {
      const response = await request(app)
        .post('/api/add')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/users', () => {
    it('should get all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return error for invalid user ID', async () => {
      const response = await request(app)
        .get('/api/users/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999999')
        .expect(404);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message');
    });
  });
});
