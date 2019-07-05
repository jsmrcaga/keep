const express = require('express');
const credentials = express.Router();

const RequestError = require('../global/requestError');

const Credentials = require('../models/credentials');

/**
 * Get all credentials
 */
credentials.get('/', (req, res, next) => {
	Credentials.get({
		user: req.user.id
	}).then(credentials => {
		return res.json(credentials);
	}).catch(e => {
		// request error
		console.error('[Credentials][All]', e);
		let error = new RequestError('An unexpected error occurred', 500, error);
		return next(e);
	});
});

/**
 * Get credentials for a single item
 */
credentials.get('/:name', (req, res, next) => {
	Credentials.get({
		user: req.user.id,
		$or: [{
			name: req.params.name,
		}, {
			url: decodeURIComponent(req.params.name)
		}]
	}).then(credentials => {
		if(!credentials) {
			return res.status(404).json({error: `No credentials with name/url ${req.params.name}`});
		}
		return res.json(credentials);
	}).catch(e => {
		console.error('[Credentials][Single]', e);
		let error = new RequestError('An unexpected error occurred', 500, error);
		return next(error);
	});
});

/**
 * Create new credential
 */
credentials.post('/new', (req, res, next) => {
	const { keys, password, name, url } = req.body;

	if(!name || !url || (!keys && !password)) {
		return res.status(400).json({error: 'name, url and keys or password are mandatory'});
	}

	let credential = new Credentials({
		user: req.user.id,
		type: req.body.type || 'password',
		keys: req.body.keys || null,
		password: req.body.password || null,
		name: req.body.name,
		tags: req.body.tags || [],
		url: req.body.url
	});

	credential.save().then(() => {
		return res.json({ success: true });
	}).catch(e => {
		console.error('[Credentials][New]', e);
		let error = new RequestError('An unexpected error occurred', 500, error);
		return next(e);
	});
});

/**
 * Generate new credential
 */
credentials.get('/generate', (req, res, next) => {
	const { length=32, special=true, numbers=true } = req.body;
	return res.json({
		result: Credentials.generate(length, { special, numbers })
	});
});

module.exports = credentials;
