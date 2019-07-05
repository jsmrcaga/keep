const Database = require('./db/db');
const { server } = require('./server');

Database.connect().then(() => {
	return server.listen(process.env.KEEP_PORT || 7654);
}).then(() => {
	console.log('Server listening on port', process.env.KEEP_PORT || 7654);
}).catch(e => {
	console.error(e);
	process.exit(1);
});
