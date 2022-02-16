const db = require("../db");
const { articleIds } = require("../db/helpers/utils");

exports.selectTopics = () => {
    return db
    .query(`    SELECT  *
                FROM    topics;`)
    .then((result) => {
        return result.rows;
    });
};

exports.selectArticles = () => {
    return db
    .query(`    SELECT  author,
                        title,
                        article_id,
                        topic,
                        created_at,
                        votes
                FROM    articles
                ORDER BY created_at DESC;`)
    .then((result) => {
        return result.rows;
    });
};

exports.selectUsers = () => {
    return db
    .query(`    SELECT  username
                FROM    users;`)
    .then((result) => {
        return result.rows;     
    })
}

exports.selectArticleById = (article_id) => {
    return db
    .query(`    SELECT  author,
                        title,
                        article_id,
                        body,
                        topic,
                        created_at,
                        votes
                FROM    articles
                WHERE   article_id = $1`,
                [article_id])
    .then(({rows}) => {
        const rest = rows[0];
        if(!rest) {
          return Promise.reject({
            status: 404,
            msg: `No articles with ID: ${article_id}`
          });
        }
        return rest;
      });
  };

exports.articleComments = (article_id) => {
    return db
    .query(`    SELECT  comment_id,
                        votes,
                        created_at,
                        author,
                        body
                FROM    comments
                WHERE   article_id=$1`,
                [article_id])
    .then(({rows}) => {
        const rest = rows;
        if(rest.length === 0) {
            return Promise.reject({
            status: 404,
            msg: `No articles or comments for article with the ID: ${article_id}`
            })
        }
        return rest;
    });
};

exports.updateArticleById = (article_id, inc_votes) => {
    return db
    .query(`    UPDATE      articles
                SET         votes = votes + $1
                WHERE       article_id = $2
                RETURNING   author,
                            title,
                            article_id,
                            topic,
                            created_at,
                            votes;`,
                [inc_votes, article_id])
    .then(({ rows }) => {
        return rows[0];
    });
}

exports.insertNewComment = (article_id, username, body) => {
    console.log(articleIds)
    if(!articleIds.includes(article_id)) {
        return Promise.reject({
        status: 404,
        msg: `No articles or comments for article with the ID: ${article_id}`
        })
    }
    return db
    .query(`    INSERT INTO comments
                            (body, article_id, author)
                VALUES      ($1, $2, $3)
                RETURNING   *;`,
                [body, article_id, username])
    .then(({ rows }) => {
        
        return rows[0];
    })
}