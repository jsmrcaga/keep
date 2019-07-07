const fs = require('fs');

let config = null;

module.exports = (file='./config.json') => {
	if(!config) {
		console.log('[KEEP] Reading config from', file);
		config = JSON.parse(fs.readFileSync(file));
	}
	return config;
};
