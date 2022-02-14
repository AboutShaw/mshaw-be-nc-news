const { update } = require("lodash");
const {
  selectTopics,
  selectArticles,
  selectUsers
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