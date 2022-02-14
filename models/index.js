const { result } = require("lodash");
const db = require("../db");

exports.selectTopics = () => {
    return db
            .query(`    SELECT  *
                        FROM    topics;`)
            .then((result) => {
                return result.rows;
            });
  };