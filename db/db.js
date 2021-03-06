const Config = require('../global/config')();
const { Database } = require('@jsmrcaga/mongo');

const database = new Database('main', {
	username: Config.db.username, // test
	password: Config.db.password, // test123
	endpoint: Config.db.endpoint || 'localhost',
	port: Config.db.port || 46037,
	database: 'keep',
	reconnectTries: 1000,
	reconnectInterval: 1000
});

module.exports = database;
