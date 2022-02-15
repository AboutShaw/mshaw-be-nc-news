const {
  selectTopics,
  selectArticles,
  selectUsers,
  selectArticleById,
  articleComments,
  updateArticleById
} = require("../models/index");

exports.getTopics = (req, res, next) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics })})
    .catch(next);
}

exports.getArticles = (req, res, next) => {
  selectArticles().then((articles) => {
    res.status(200).send({ articles })})
    .catch(next);
}

exports.getUsers = (req, res, next) => {
  selectUsers().then((users) => {
    res.status(200).send({ users })})
    .catch(next);
}

exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id).then((article) => {
    res.status(200).send({ article })})
    .catch(next)
}

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  articleComments(article_id).then((comments) => {
    res.status(200).send({ comments })})
    .catch(next)
}

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  updateArticleById(article_id, inc_votes).then((article) => {
    res.status(200).send({ article })})
    .catch(next)
} 