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
    .query(`    SELECT  A.author,
                        A.title,
                        A.article_id,
                        A.topic,
                        A.created_at,
                        A.votes,
                        COUNT(B.article_id) AS comment_count
                    FROM    articles A
                    LEFT JOIN comments B ON A.article_id=A.article_id
                    GROUP BY A.article_id
                    ORDER BY created_at DESC;`)
    .then((result) => {
        console.log(result.rows)
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