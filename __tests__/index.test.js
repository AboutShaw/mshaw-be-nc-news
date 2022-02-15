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

describe(`GET /api/articles tests`, () => {
    describe(`GET tests`, () => {
        test(`/api/articles, returns an array of objects sorted in desc order by created date`, () => {
            return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles)
                .toBeSortedBy('created_at', {descending: true})
                articles.forEach(article => 
                    expect(article).toEqual(
                        expect.objectContaining({
                            author: expect.any(String),
                            title: expect.any(String),
                            article_id: expect.any(Number),
                            topic: expect.any(String),
                            created_at: expect.any(String),
                            votes: expect.any(Number)
                        })
                    )
                )
            })
        })
    })
    describe(`Error handling tests`, () => {
        test(`404 - Path not found for /api/topi`, () => {
            return request(app)
                .get('/api/artivles')
                .expect(404)
                .then(({ body }) => {
                    expect(body.msg).toBe('Route not found');
                });
        })
    })
})

describe(`GET /api/users tests`, () => {
    describe(`GET tests`, () => {
        test(`/api/users, returns an array of objects`, () => {
            return request(app)
            .get("/api/users")
            .expect(200)
            .then(({ body }) => {
                const { users } = body;
                users.forEach(user => 
                    expect(user).toEqual(
                        expect.objectContaining({
                            username: expect.any(String)
                        })
                    )
                )
            })
        })
    })
    describe(`Error handling tests`, () => {
        test(`404 - Path not found for /api/topi`, () => {
            return request(app)
                .get('/api/uset')
                .expect(404)
                .then(({ body }) => {
                    expect(body.msg).toBe('Route not found');
      });
        })
    })
})

describe(`GET /api/articles/:article_id tests`, () => {
    describe(`GET tests`, () => {
        test(`/api/articles/:article_id, returns an array with single object`, () => {
            return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then(({ body }) => {
                const { article } = body;
                console.log(article)
                expect(article).toEqual(
                    expect.objectContaining({
                        article_id: 1,
                        title: "Living in the shadow of a great man",
                        topic: "mitch",
                        author: "butter_bridge",
                        body: "I find this existence challenging",
                        created_at: "2020-07-09T20:11:00.000Z",
                        votes: 100
                    })
                )
            })
        })
    })
    describe(`Error handling tests`, () => {
        test(`404 - Path not found for /api/topi`, () => {
            return request(app)
            .get('/api/artivle/1')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('Route not found');
            });
        })
        test(`400 - No article with ID 666`, () => {
            return request(app)
            .get(`/api/articles/666`)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe(`No articles with ID: 666`);
            })
        })
    })
})

describe(`GET /api/articles/:article_id/comments tests`, () => {
    describe(`GET tests`, () => {
        test(`/api/articles/:article_id/comments, returns an array with single object`, () => {
            return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
                const { comments } = body;
                comments.forEach(comment =>
                    expect(comment).toEqual(
                        expect.objectContaining({
                            comment_id: expect.any(Number),
                            votes: expect.any(Number),
                            created_at: expect.any(String),
                            author: expect.any(String),
                            body: expect.any(String)
                        })
                    )
                )
                expect(comments.length).toBe(11)
            })
        })
    })
    describe(`Error handling tests`, () => {
        test(`404 - Path not found for /api/artivle/1/comments`, () => {
            return request(app)
            .get('/api/artivle/1/comments')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('Route not found');
            });
        })
        test(`404 - No article with ID 666`, () => {
            return request(app)
            .get(`/api/articles/666/comments`)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe(`No articles or comments for article with the ID: 666`);
            })
        })
        test(`404 - ID must be a number`, () => {
            return request(app)
            .get(`/api/articles/banana/comments`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe(`Invalid input`);
            })
        })
    })
})

describe(`PATCH /api/articles/:article_id tests`, () => {
    describe(`PATCH tests`, () => {
        test(`PATCH /api/articles/:article_id, updates the number of votes on an article and returns the article with latest info`, () => {
            const articleUpdate = {
                inc_votes: 10
            }
            return request(app)
            .patch("/api/articles/1")
            .send(articleUpdate)
            .expect(200)
            .then(({ body }) => {
                const { article } = body;
                expect(article).toEqual(
                    expect.objectContaining({
                        author: expect.any(String),
                        title: expect.any(String),
                        article_id: 1,
                        topic: expect.any(String),
                        created_at: expect.any(String),
                        votes: 110
                    })
                )
            })
        })
    })
    describe(`Error handling tests`, () => {
        test(`404 - Path not found for /api/topi`, () => {
            return request(app)
            .get('/api/artivle/1')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('Route not found');
            });
        })
        test(`400 - No article with ID 666`, () => {
            return request(app)
            .get(`/api/articles/666`)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe(`No articles with ID: 666`);
            })
        })
    })
})