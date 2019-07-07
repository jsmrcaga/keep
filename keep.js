const Database = require('./db/db');
const { server } = require('./server');

const start = ({ port }) => {
	port = port || process.env.KEEP_PORT || 7654;
	return Database.connect().then(() => {
		return server.listen(port);
	}).then(() => {
		console.log('Server listening on port', port);
	}).catch(e => {
		console.error(e);
		process.exit(1);
	});
};

module.exports = { start };
