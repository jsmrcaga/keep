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
		return res.json(credentials.map(c => c.toAPI()));
	}).catch(e => {
		// request error
		console.error('[Credentials][All]', e);
		let error = new RequestError(e.message, 500, error);
		return next(e);
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

	Credentials.get({
		name,
		url
	}).then(([existing_credentials]) => {
		if(existing_credentials) {
			let error = new RequestError('Credentials with the same name and url exist', 400);
			next(error);
			return false;
		}

		let credential = new Credentials({
			user: req.user.id,
			type: req.body.type || 'password',
			keys: req.body.keys || null,
			password: req.body.password || null,
			name: req.body.name,
			tags: req.body.tags || [],
			url: req.body.url,
			encrypted: req.body.encrypted
		});

		// Encrypted not sent, and one key present
		if(!req.body.encrypted && (req.body.encrypt || req.user.key)) {
			credential.encrypt(req.body.encrypt || req.user.key);
		}

		return credential.save();
	}).then((bool) => {
		if(bool === false) {
			return;
		}

		return res.json({ success: true });
	}).catch(e => {
		console.error('[Credentials][New]', e);
		let error = new RequestError(e.message, 500, e);
		return next(error);
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

/**
 * Retrieve all user generated tags
 */
credentials.get('/tags', (req, res, next) => {
	Credentials.distinct('tags').then(tags => {
		return res.json(tags);
	}).catch(e => {
		console.error('[Credentials][Tags]', e);
		let error = new RequestError(e.message, 500, error);
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
	}).then(([credentials]) => {
		if(!credentials) {
			return res.status(404).json({error: `No credentials with name/url ${req.params.name}`});
		}

		if(req.body.decrypt || req.user.key) {
			credentials.decrypt(req.body.decrypt || req.user.key);
		}

		return res.json(credentials.toAPI());
	}).catch(e => {
		console.error('[Credentials][Single]', e);
		let error = new RequestError(e.message, 500, error);
		return next(error);
	});
});

module.exports = credentials;
