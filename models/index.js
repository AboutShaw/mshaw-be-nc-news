const db = require("../db");
const { articleIds, usernames } = require("../db/helpers/utils");

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
        return result.rows;
    });
};

exports.sortArticles = (sorter=`created_at`, order=`DESC`, topic) => {
    const sortParams = ['author',
                        'title',
                        'article_id',
                        'topic',
                        'created_at',
                        'votes',
                        'comment_count'];
    const orderParams = ['ASC', 'DESC'];
    const topicParams = ['mitch', 'cats'];
    order = order.toLocaleUpperCase();
    if(!sortParams.includes(sorter) || !orderParams.includes(order)){
        return Promise.reject({
            status: 400,
            msg: `Query not allowed`
        });
    }
    if(topic === undefined) {
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
                        ORDER BY ${sorter} ${order};`)
        .then((result) => {
            console.log(result.rows)
            return result.rows;
        })
    }
    if(!topicParams.includes(topic)){
        return Promise.reject({
            status: 400,
            msg: `Topic: ${topic}, does not exist`
        });
    } else {
        console.log(`here`)
        console.log(typeof topic)
        const topicWhere = `WHERE A.topic='${topic}'`
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
                        ${topicWhere}
                        GROUP BY A.article_id
                        ORDER BY ${sorter} ${order};`)
        .then((result) => {
            console.log(result.rows)
            return result.rows;
        })
    }
}

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
    .query(`    SELECT  A.author,
                        A.title,
                        A.article_id,
                        A.body,
                        A.topic,
                        A.created_at,
                        A.votes,
                        COUNT(B.article_id) AS comment_count
                FROM    articles A
                LEFT JOIN comments B ON A.article_id=A.article_id
                WHERE   A.article_id = $1
                GROUP BY A.article_id;`,
                [article_id])
    .then(({rows}) => {
        const rest = rows[0];
        if(!rest) {
          return Promise.reject({
            status: 400,
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
            status: 400,
            msg: `No articles or comments for article with the ID: ${article_id}`
            })
        }
        return rest;
    });
};

exports.updateArticleById = (article_id, inc_votes) => {
    if(!articleIds.includes(parseInt(article_id))) {
        return Promise.reject({
        status: 400,
        msg: `No articles or comments for article with the ID: ${article_id}`
        })
    }
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
        const rest = rows;
        if(rest.length === 0) {
            return Promise.reject({
            status: 404,
            msg: `No articles with ID: ${article_id}`
        })
    }
    return rest[0];
    });
}

exports.deleteComment = (comment_id) => {
    return db
        .query(`DELETE FROM     comments 
                WHERE           comment_id = $1
                RETURNING       *;`,
                [comment_id])
        .then(({ rows }) => {
            const rest = rows;
            if(rest.length === 0) {
                return Promise.reject({
                status: 404,
                msg: `No comments with ID: ${comment_id}`
            })
        }
        return rows[0]
        });
};

exports.insertNewComment = (article_id, username, body) => {
    if(!usernames.includes(username)) {
        return Promise.reject({
            status: 400,
            msg: `User not registered`
        })
    }
    if(username === undefined || body === undefined) {
        return Promise.reject({
            status: 400,
            msg: `Missing part of post request`
        })
    } 
    if(!articleIds.includes(parseInt(article_id))) {
        return Promise.reject({
        status: 400,
        msg: `No articles or comments for article with the ID: ${article_id}`
        })
    }
    if(typeof username !== `string` || typeof body !== `string`) {
        return Promise.reject({
            status: 400,
            msg: `Usernames and comment bodies should be text`
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
