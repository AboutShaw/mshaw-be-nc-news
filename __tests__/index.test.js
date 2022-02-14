const { forEach } = require("lodash");
const request = require("supertest");
const app = require("../app");
const db = require("../db");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data")

beforeEach(() => seed(data));
afterAll(() => db.end());

describe(`/api/topics tests`, () => {
    describe(`GET tests`, () => {
        test(`/api/topics, returns an array of objects`, () => {
            return request(app)
            .get("/api/topics")
            .expect(200)
            .then(({ body }) => {
                const { topics } = body;
                topics.forEach(topic => 
                    expect(topic).toEqual(
                        expect.objectContaining({
                            slug: expect.any(String),
                            description: expect.any(String)
                        })
                    )
                )
            })
        })
    })
    describe(`Error handling tests`, () => {
        test(`404 - Path not found for /api/topi`, () => {
            return request(app)
                .get('/api/topi')
                .expect(404)
                .then(({ body }) => {
                    expect(body.msg).toBe('Route not found');
      });
        })
    })
})