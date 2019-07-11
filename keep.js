const start = ({ port }, config) => {
	// Initialize config
	const init_config = require('./global/config');
	init_config(config);

	const { server } = require('./server');
	const Database = require('./db/db');

	port = port || process.env.KEEP_PORT || 7654;
	return Database.connect().then(() => {
		return server.listen(port);
	}).then(() => {
		console.log('[KEEP] Server listening on port', port);
	}).catch(e => {
		console.error(e);
		process.exit(1);
	});
};

module.exports = { start };
