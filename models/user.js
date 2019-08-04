const Crypto = require('crypto');
const { UUID } = require('../global/utils');
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
		// clear tokens
		this.tokens = this.tokens.filter(({ token, expires }) => expires > Date.now());
		this.save();

		if(token) {
			// verify token
			let exists = this.tokens.findIndex((tok) => tok.token === token);
			return exists > -1;
		}

		// Create token
		let new_token = UUID();
		this.tokens.push({
			token: new_token,
			expires: Date.now() + (1000 * 60 * 60 * 24)
		});
		
		return this.save().then(() => {
			return new_token;
		});
	}

	toAPI() {
		const { id, username, __created, __deleted, __updated } = this;
		return {
			id,
			username,
			created: __created,
			deleted: __deleted,
			updated: __updated
		};
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
