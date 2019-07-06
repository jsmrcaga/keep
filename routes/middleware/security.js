const User = require('../../models/user');
const ignore = ['/credentials/generate'];

module.exports = (req, res, next) => {
	if(ignore.includes(req.path)) {
		return next();
	}

	if(!req.get('Authorization')) {
		return res.status(403).json({error: 'credentials are required'});
	}

	let token = req.get('Authorization');

	if(!token.startsWith('Bearer ')) {
		return res.status(400).json({error: 'Unknown authorization type'});
	}

	token = token.replace('Bearer ', '');

	User.get({
		'tokens.token': token
	}).then(([user]) => {
		if(!user) {
			return res.status(403).json({error: 'Invalid credentials'});
		}

		let token_valid = user.token(token);

		if(!token_valid) {
			return res.status(403).json({error: 'Outdated credentials'});
		}

		req.user = user;
		return next();
	}).catch(e => {
		console.error('[Security]', e);
		return res.status(500).json({error: 'An unexpected error occurred'});
	});
};
