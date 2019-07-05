const express = require('express');
const router = express.Router();

const RequestError = require('../global/requestError');

router.use('/accounts', require('./accounts'));
router.use('/api', require('./api'));

router.use((req, res, next, err) => {
	let message = 'An unexpected error occurred';
	let code = 500;
	if(err instanceof RequestError) {
		if(err.code !== 500) {
			message = err.message;
		}

		code = err.status;
	}

	return res.json({ error: { message, code }});
});

module.exports = router;
