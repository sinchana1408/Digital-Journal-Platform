import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { Application } from 'express';

describe('LumaJournal API Comprehensive Test Suite', () => {
  let app: Application;
  let authToken: string;
  let createdEntryId: string;
  const testEmail = `test_${Date.now()}@lumajournal.com`;
  const testPassword = 'Password123';

  beforeAll(() => {
    app = createApp();
  });

  describe('Health Endpoint', () => {
    it('GET /api/health returns status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('lumajournal-api');
    });
  });

  describe('Authentication & Authorization', () => {
    it('POST /api/auth/register should create a new user account with valid payload', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testEmail.toLowerCase());
      expect(res.body.token).toBeDefined();
    });

    it('POST /api/auth/register should fail on password mismatch', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'mismatch@lumajournal.com',
          password: 'Password123',
          confirmPassword: 'DifferentPassword123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login should authenticate user and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      authToken = res.body.token;
    });

    it('POST /api/auth/login should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me should return current user profile when authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testEmail.toLowerCase());
    });

    it('GET /api/auth/me should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('Journal Entry Management & Filtering', () => {
    it('POST /api/entries should create a new journal entry with computed stats', async () => {
      const res = await request(app)
        .post('/api/entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'My First Test Reflection',
          content: '<p>Today was an insightful and peaceful day of deep focus and reading.</p>',
          mood: 'calm',
          tags: ['reflection', 'mindfulness'],
          isFavorite: true,
          isPinned: false,
          isDraft: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.entry).toBeDefined();
      expect(res.body.entry.title).toBe('My First Test Reflection');
      expect(res.body.entry.mood).toBe('calm');
      expect(res.body.entry.wordCount).toBeGreaterThan(0);
      expect(res.body.entry.readingTime).toBeGreaterThanOrEqual(1);

      createdEntryId = res.body.entry.id;
    });

    it('GET /api/entries/:id should retrieve the entry details', async () => {
      const res = await request(app)
        .get(`/api/entries/${createdEntryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.entry.id).toBe(createdEntryId);
      expect(res.body.entry.title).toBe('My First Test Reflection');
    });

    it('PUT /api/entries/:id should update entry (autosave behavior)', async () => {
      const res = await request(app)
        .put(`/api/entries/${createdEntryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'My Updated Test Reflection',
          content: '<p>Updated content with extra insights and discoveries.</p>',
          mood: 'excellent',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.entry.title).toBe('My Updated Test Reflection');
      expect(res.body.entry.mood).toBe('excellent');
      expect(res.body.entry.moodScore).toBe(5);
    });

    it('POST /api/entries/:id/favorite should toggle favorite status', async () => {
      const res = await request(app)
        .post(`/api/entries/${createdEntryId}/favorite`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.isFavorite).toBe('boolean');
    });

    it('GET /api/entries should search and filter entries', async () => {
      const searchRes = await request(app)
        .get('/api/entries?search=Updated')
        .set('Authorization', `Bearer ${authToken}`);

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.success).toBe(true);
      expect(searchRes.body.data.length).toBeGreaterThan(0);
      expect(searchRes.body.data[0].title).toContain('Updated');

      const moodRes = await request(app)
        .get('/api/entries?mood=excellent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(moodRes.status).toBe(200);
      expect(moodRes.body.data.length).toBeGreaterThan(0);
      expect(moodRes.body.data[0].mood).toBe('excellent');
    });

    it('Strict Authorization: User B cannot access User A entry', async () => {
      // Register second user
      const userBRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bob Smith',
          email: `bob_${Date.now()}@lumajournal.com`,
          password: 'Password123',
          confirmPassword: 'Password123',
        });

      const tokenB = userBRes.body.token;

      // User B attempts to access User A's entry
      const accessRes = await request(app)
        .get(`/api/entries/${createdEntryId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(accessRes.status).toBe(404);
    });

    it('DELETE /api/entries/:id should delete the entry', async () => {
      const res = await request(app)
        .delete(`/api/entries/${createdEntryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkRes = await request(app)
        .get(`/api/entries/${createdEntryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(checkRes.status).toBe(404);
    });
  });

  describe('Tags, Moods, Calendar & Insights', () => {
    it('POST & GET /api/tags should create and retrieve user tags', async () => {
      const postTag = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'books' });

      expect(postTag.status).toBe(201);
      expect(postTag.body.tag.name).toBe('books');

      const getTags = await request(app)
        .get('/api/tags')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getTags.status).toBe(200);
      expect(getTags.body.tags.some((t: any) => t.name === 'books')).toBe(true);
    });

    it('POST & GET /api/moods should log daily mood and return logs', async () => {
      const dateStr = new Date().toISOString().split('T')[0];
      const logMood = await request(app)
        .post('/api/moods')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: dateStr,
          mood: 'good',
          score: 4,
          note: 'Productive and calm day',
        });

      expect(logMood.status).toBe(201);
      expect(logMood.body.mood.mood).toBe('good');

      const getMoods = await request(app)
        .get('/api/moods')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getMoods.status).toBe(200);
      expect(getMoods.body.moods.length).toBeGreaterThan(0);
    });

    it('GET /api/insights should return full dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/insights')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.insights).toBeDefined();
      expect(res.body.moodDistribution).toBeDefined();
      expect(res.body.monthlyStats).toBeDefined();
    });

    it('GET /api/entries/calendar should return month days array', async () => {
      const res = await request(app)
        .get('/api/entries/calendar?year=2026&month=9')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(30); // September has 30 days
    });

    it('GET /api/export should download JSON archive', async () => {
      const res = await request(app)
        .get('/api/export')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.version).toBe('1.0');
      expect(res.body.user).toBeDefined();
    });
  });
});
