const db = require("../db");

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
      .query(`  SELECT  author,
                        title,
                        article_id,
                        topic,
                        created_at,
                        votes
                FROM    articles
                WHERE article_id = $1`,
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