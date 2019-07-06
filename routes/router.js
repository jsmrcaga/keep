const express = require('express');
const router = express.Router();

const RequestError = require('../global/requestError');

router.use('/accounts', require('./accounts'));
router.use('/api', require('./api'));

router.use((err, req, res, next) => {
	let message = 'An unexpected error occurred';
	let code = 500;
	if(err instanceof RequestError) {
		if(err.status !== 500) {
			message = err.message;
		}

		code = err.status;
	} else {
		console.log(err);
	}

	return res.status(code).json({ error: { message, code, meta: { message: err.message }}});
});

module.exports = router;
