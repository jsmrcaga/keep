module.exports = (args, options={}) => {
	if(!options.config && !options.c) {
		console.warn(`[KEEP] No config file specified, using ./config.json`);
	}

	const keep = require('../../keep');
	keep.start(options, options.config || options.c);
};
