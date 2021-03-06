const express = require('express');
const accounts = express.Router();
const RequestError = require('../global/requestError');

const User = require('../models/user');

accounts.use('/', (req, res, next) => {
	const { username, password } = req.body;
	if(!username || !password) {
		return res.status(400).json({error: 'username and password are mandatory'});
	}

	return next();
});

/**
 * Create a new user
 */
accounts.post('/new', (req, res, next) => {
	const { username, password } = req.body;
	let user = new User({
		username,
		password: User.hash(username, password)
	});

	user.save().then(() => {
		return res.json(user.toAPI());
	}).catch(e => {
		console.error('[USER][New]', e);
		let error = new RequestError(null, 500, e);
		return next(error);
	});
});

/**
 * Login with previously created user
 */
accounts.post('/login', (req, res, next) => {
	const { username, password } = req.body;
	User.login({ username, password }).then(token => {
		return res.json({ token });
	}).catch(e => {
		console.error('[USER][Login]', e);
		let error = new RequestError(null, 500, e);
		return next(error);
	});
});

module.exports = accounts;
