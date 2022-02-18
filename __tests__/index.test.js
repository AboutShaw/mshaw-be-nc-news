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
        test(`/api/articles, returns an array of objects sorted in desc order by created date, inc refactor to include comment_count`, () => {
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
                            votes: expect.any(Number),
                            comment_count: expect.any(String)
                        })
                    )
                )
                expect(articles.length).toBe(12)
            })
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
})

describe(`GET /api/articles/:article_id tests`, () => {
    describe(`GET tests`, () => {
        test(`/api/articles/:article_id, returns an array with single object, has been refactored to include comment count`, () => {
            return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then(({ body }) => {
                const { article } = body;
                expect(article).toEqual(
                    expect.objectContaining({
                        article_id: 1,
                        title: "Living in the shadow of a great man",
                        topic: "mitch",
                        author: "butter_bridge",
                        body: "I find this existence challenging",
                        created_at: "2020-07-09T20:11:00.000Z",
                        votes: 100,
                        comment_count: "18"
                    })
                )
            })
        })
    })
    describe(`Error handling tests`, () => {
        test(`400 - No article with ID 666`, () => {
            return request(app)
            .get(`/api/articles/666`)
            .expect(400)
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
        test(`400 - No article with ID 666`, () => {
            return request(app)
            .get(`/api/articles/666/comments`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe(`No articles or comments for article with the ID: 666`);
            })
        })
        test(`400 - ID must be a number`, () => {
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
        test(`PATCH /api/articles/:article_id, updates the number of votes +10 on an article and returns the article with latest info`, () => {
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
        test(`PATCH /api/articles/:article_id, updates the number of votes -20 on an article and returns the article with latest info`, () => {
            const articleUpdate = {
                inc_votes: -20
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
                        votes: 80
                    })
                )
            })
        })
    })
    describe(`Error handling tests`, () => {
        test(`400 - No article with ID 666`, () => {
            return request(app)
            .get(`/api/articles/666`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe(`No articles with ID: 666`);
            })
        })
    })
})

describe(`POST /api/articles/:article_id/comments tests`, () => {
    describe(`POST tests`, () => {
        test(`POST /api/articles/:article_id/comments creates a new comment and returns the posted comment`, () => {
            const postThis = {
                username: "icellusedkars",
                body: "Russia's defence ministry says some troops positioned on the border with Ukraine are returning to their bases after completing drills"
            };
            return request(app)
            .post(`/api/articles/1/comments`)
            .send(postThis)
            .expect(201)
            .then(({ body }) => {
                const { comment } = body;
                expect(comment).toEqual(
                    expect.objectContaining({
                        comment_id: expect.any(Number),
                        body: "Russia's defence ministry says some troops positioned on the border with Ukraine are returning to their bases after completing drills",
                        article_id: 1,
                        author: "icellusedkars",
                        votes: 0,
                        created_at: expect.any(String)
                    })
                )
            })
        })
    })
    describe(`Error handling tests`, () => {
        test(`400 - No article with ID 666`, () => {
            const postThis = {
                username: "icellusedkars",
                body: "Russia's defence ministry says some troops positioned on the border with Ukraine are returning to their bases after completing drills"
            };
            return request(app)
            .post(`/api/articles/666/comments`)
            .send(postThis)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg)
                .toBe(`No articles or comments for article with the ID: 666`);
            })
        })
        test(`400 - missing part of post request`, () => {
            const postThis = {
                username: "icellusedkars"
            };
            return request(app)
            .post(`/api/articles/1/comments`)
            .send(postThis)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg)
                .toBe(`Missing part of post request`)
            })
        })
        test(`400 - username not registered`, () => {
            const postThis = {
                username: "tallyWacker",
                body: "Russia's defence ministry says some troops positioned on the border with Ukraine are returning to their bases after completing drills"
            };
            return request(app)
            .post(`/api/articles/1/comments`)
            .send(postThis)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg)
                .toBe(`User not registered`);
            })
        })
        test(`400 - Input of wrong data type`, () => {
            const postThis = {
                username: "icellusedkars",
                body: 1234567980
            };
            return request(app)
            .post(`/api/articles/1/comments`)
            .send(postThis)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg)
                .toBe(`Usernames and comment bodies should be text`);
            })
        })
    })
})

describe(`DELETE /api/comments/:comment_id tests`, () => {
    describe(`DELETE tests`, () => {
        test('DELETE /api/comments/:comment_id, status:204, responds with an empty response body', () => {
            return request(app)
            .delete('/api/comments/2')
            .expect(204)
        })
    })
    describe(`Error handling tests`, () => {
        test(`404 - Path not found for /api/topi`, () => {
            return request(app)
            .delete('/api/commcnts/1')
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe('Route not found');
            });
        })
        test(`404 - No article with ID 666`, () => {
            return request(app)
            .delete(`/api/comments/666`)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe(`No comments with ID: 666`);
            })
        })
    })
})

describe(`GET /api/articles tests V2 including queries  `, () => {
    describe(`GET tests for sortby`, () => {
        test(`/api/articles?sort_by=topic&order_by=asc returns correctly`, () => {
            return request(app)
            .get("/api/articles?sort_by=topic&order_by=asc")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles)
                .toBeSortedBy('topic', {descending: false})
                articles.forEach(article => 
                    expect(article).toEqual(
                        expect.objectContaining({
                            author: expect.any(String),
                            title: expect.any(String),
                            article_id: expect.any(Number),
                            topic: expect.any(String),
                            created_at: expect.any(String),
                            votes: expect.any(Number),
                            comment_count: expect.any(String)
                        })
                    )
                )
                expect(articles.length).toBe(12)
            })
        })
        test(`/api/articles?topic=mitch returns correctly`, () => {
            return request(app)
            .get("/api/articles?topic=mitch")
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
                            topic: `mitch`,
                            created_at: expect.any(String),
                            votes: expect.any(Number),
                            comment_count: expect.any(String)
                        })
                    )
                )
                expect(articles.length).toBe(11)
            })
        })
    })
    describe(`Error handling tests`, () => {
        test(`404 - Invalid topic returned as error`, () => {
            return request(app)
            .get(`/api/articles?topic=banana`)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe(`Topic: banana, cannot be found`);
            })
        })
        test(`400 - Query not allowed, invalid query parameter`, () => {
            return request(app)
            .get(`/api/articles?sort_by=banana`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe(`Query not allowed`);
            })
        })
        test(`400 - Order By not allowed, invalid order parameter`, () => {
            return request(app)
            .get(`/api/articles?order_by=INVALID`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe(`Query not allowed`);
            })
        })
    })
})

describe(`GET /api returns a JSON with all possible endpoints`, () => {
    test(`/api returns correctly`, () => {
        return request(app)
        .get(`/api`)
        .expect(200)
        .then(({ body }) => {
            expect(typeof body).toBe("object")
        })
    })
})