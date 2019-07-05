const Config = require('../global/config');
const { Database } = require('@jsmrcaga/mongo');

const database = new Database('main', {
	username: Config.db.username, // test
	password: Config.db.password, // test123
	endpoint: Config.db.endpoint || 'localhost',
	port: Config.db.port || 46037,
	database: 'keep',
	reconnectTries: 10,
	reconnectInterval: 100
});

module.exports = database;
