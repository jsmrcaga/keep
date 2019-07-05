const express = require('express');
const api = express.Router();

api.use('/', require('./middleware/security'));
api.use('/credentials', require('./credentials'));

module.exports = api;
