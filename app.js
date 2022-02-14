const express = require("express");
const {
  getTopics,
  getArticles,
  getUsers,
  getArticle
} = require("./controllers/index");

const {
    handleCustomErrors,
    handlePsqlErrors,
    handleServerErrors,
  } = require('./errors/index.js');

const app = express();
app.use(express.json());
// Requires and util functions above this line -----
// API requests below this line -----
app.get(`/api/topics`, getTopics);
app.get(`/api/articles`, getArticles);
app.get(`/api/users`, getUsers);
app.get(`/api/articles/:article_id`, getArticle);



// Error handling below this line -----
app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

app.all('/*', (req, res) => {
  res.status(404).send({ msg: 'Route not found' });
});

module.exports = app;