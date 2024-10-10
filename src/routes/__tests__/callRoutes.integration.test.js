// call-analytics/src/tests/routes.test.js

import request from 'supertest';
import app from '../../../app.js'; // Assuming you have an Express app exported from app.js
jest.useFakeTimers()

describe('Call Analytics Routes', () => {
    let token; // Variable to hold the authentication token

    beforeEach(async () => {
        // Logic to obtain a valid token for testing
        const response = await request(app)
            .post('/login')
            .send({ id: 'user_2mTuXtHhPMncnh6FBcuCvlynvGX'});
        token = response.body.bearer_token; // Assuming the token is returned in the response
    });

    test('GET /poll - should fetch and update call data', async () => {
        const response = await request(app)
            .get('/poll')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        // Add more assertions based on the expected response
    });

    test('GET /analytics - should retrieve call analytics data', async () => {
        const response = await request(app)
            .get('/analytics')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        // Add more assertions based on the expected response
    });

    test('POST /super-admin/create-agency - should create a new agency', async () => {
        const response = await request(app)
            .post('/super-admin/create-agency')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'New Agency' });
        expect(response.status).toBe(201);
        // Add more assertions based on the expected response
    });

    // Add more tests for other routes as needed
});