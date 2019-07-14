const express = require('express');
const credentials = express.Router();

const RequestError = require('../global/requestError');

const Credentials = require('../models/credentials');

const decrypt_credentials = (req, credentials) => {
	if(!credentials.encrypted) {
		return;
	}

	if(req.query.decrypt) {
		try {
			let decrypted = JSON.parse(credentials.decrypt(req.body.decrypt || req.query.decrypt));
			if(credentials.type === 'password') {
				credentials.password = decrypted;
			} else {
				credentials.keys = decrypted;
			}

			// Do not send both at the same time
			credentials.encrypted = null;
		} catch(e) {
			console.error(e);
		}
	}
}

/**
 * Get all credentials
 */
credentials.get('/', (req, res, next) => {
	Credentials.get({
		user: req.user.id
	}).then(credentials => {
		credentials.forEach(credential => {
			decrypt_credentials(req, credential);
		});
		return res.json(credentials.map(c => c.toAPI()));
	}).catch(e => {
		// request error
		console.error('[Credentials][All]', e);
		let error = new RequestError(e.message, 500, e);
		return next(e);
	});
});

/**
 * Create new credential
 */
credentials.post('/new', (req, res, next) => {
	const { keys, password, name, url } = req.body;

	if(!name || !url || (!keys && !password && !encrypted)) {
		return res.status(400).json({error: 'name, url and keys or password or encyrpted value are mandatory'});
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
			type: req.body.type || (req.body.password ? 'password' : 'keys'),
			keys: req.body.encrypted ? null: (req.body.keys || null),
			password: req.body.encrypted ? null: (req.body.password || null),
			name: req.body.name,
			tags: req.body.tags || [],
			url: req.body.url,
			encrypted: req.body.encrypted
		});

		// Encrypted not sent, and one key present
		if(!req.body.encrypted && req.body.encrypt) {
			credential.encrypt(req.body.encrypt);
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


credentials.use('/:slug', (req, res, next) => {
	Credentials.get({
		user: req.user.id,
		$or: [{
			slug: req.params.slug
		}, {
			url: decodeURIComponent(req.params.slug)
		}, {
			name: req.params.slug,
		}]
	}).then(([credentials]) => {
		if(!credentials) {
			return res.status(404).json({error: `No credentials with name/url ${req.params.slug}`});
		}

		req.credentials = credentials;
		return next();
	}).catch(e => {
		console.error('[Credentials][Single]', e);
		let error = new RequestError(e.message, 500, error);
		return next(error);
	});
});


/**
 * Get credentials for a single item
 */
credentials.get('/:slug', (req, res, next) => {
	decrypt_credentials(req, req.credentials);
	return res.json(credentials.toAPI());
});

/**
 * Delete a credential
 */
credentials.delete('/:slug', (req, res, next) => {
	// Hard Delete
	req.credentials.delete().then(() => {
		return res.status(204).end();
	}).catch(e => {
		console.error('[Credentials][DELETE]', e);
		let error = new RequestError(e.message, 500, error);
		return next(error);
	});
});

/**
 * Modify a credential
 */
credentials.put('/:slug', (req, res, next) => {
	for(let k in req.body) {
		if(k in req.credentials && req.body[k]) {
			req.credentials[k] = req.body[k];
		}
	}

	if(req.body.encrypted) {
		req.credentials.clear();
	}

	req.credentials.save().then(() => {
		return res.json(req.credentials.toAPI());
	}).catch(e => {
		console.error('[Credentials][PUT]', e);
		let error = new RequestError(e.message, 500, error);
		return next(error);
	});
});

module.exports = credentials;
