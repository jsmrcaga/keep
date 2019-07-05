const Crypto = require('crypto');
const Database = require('../db/db');

const UserModel = Database.model('User');

class User extends UserModel {
	constructor({ username, password, tokens=[] }) {
		super();
		this.username = username;
		this.password = password;
		this.tokens = tokens;
	}

	token(token=null) {
		if(token) {
			// verify token
			let exists = this.tokens.findIndex((tok) => tok.token === token);
			if(!exists) {
				return false;
			}

			let expires = this.tokens[exists].expires;
			if(expires <= Date.now()) {
				this.tokens.splice(exists, 1);
				this.save();
				return false;
			}

			return true;
		}

		// Create token
		let new_token = Math.random();
		this.tokens.push({
			token: new_token,
			expires: Date.now() + (1000 * 60 * 60 * 24)
		});
		
		return this.save().then(() => {
			return token;
		});
	}

	static login({ username, password }) {
		return User.get({
			username
		}).then(([user]) => {
			if(!user) {
				return new Error('User not found');
			}

			let hashed = this.hash(username, password);
			if(hashed !== user.password) {
				throw new Error('Credentials do not match')
			}

			return user.token();
		});
	}

	static hash(salt, password) {
		let hash = Crypto.createHash('sha256');
		hash.update(`${salt}:password`);
		return hash.digest('base64');
	}
}

module.exports = User;
