class RequestError extends Error {
	constructor(message, status, error) {
		super(message);
		this.message = message;
		this.status = status;
		this.error = error;
	}
}

module.exports = RequestError;
