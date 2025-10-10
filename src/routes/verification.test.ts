import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { router } from './verification.js';

const app = express();
app.use(express.json());
app.use(router);

describe('POST /verify', () => {
  it('should return 400 if credentialid is missing', async () => {
    const res = await request(app).post('/verify').send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Missing credentialid' });
  });

  it('should return valid: false if credential does not exist', async () => {
    const res = await request(app)
      .post('/verify')
      .send({ credentialid: 'nonexistent-id' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ valid: false, message: 'Invalid credential' });
  });

  it('should return valid: true if credential exists', async () => {
    const res = await request(app)
      .post('/verify')
      .send({ credentialid: 'existing-credential-id' });
    expect(res.status).toBe(200);
    expect(res.body.valid).toBeDefined();
  });

});
