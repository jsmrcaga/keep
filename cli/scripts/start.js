module.exports = (args, options={}) => {
	if(!options.config && !options.c) {
		console.warn(`[KEEP] No config file specified, using ./config.json`);
	}

	// Init config
	require('../../global/config')(options.config || options.c);
	const keep = require('../../keep');
	keep.start(options);
};
