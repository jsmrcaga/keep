const Utils = {};

Utils.UUID = () => {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

Utils.slugify = (string) => {
	return string.replace(/\s/g, '_').toLowerCase();
};

module.exports = Utils;
