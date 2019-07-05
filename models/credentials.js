const Database = require('../db/db');

const CredentialsModel = Database.model('Credentials');

const generate_characters = (from, to) => {
	if(from instanceof Array) {
		return from.map(([f, t]) => generate_characters(f, t)).flat(Infinity);
	}

	let characters = [];
	for(let i = from; i <=to; i++) {
		characters.push(String.fromCharCode(i));
	}

	return characters;
};

const characters = {
	chars: generate_characters([[33, 38], [40, 47], [123, 126], [91, 96]]),
	letters: generate_characters([[65, 90], [97, 122]]),
	numbers: generate_characters(48, 57)
};

class Credentials extends CredentialsModel {
	constructor({ user, type, keys=null, password=null, name, tags=[], url }) {
		super();

		if(!Credentials.types.includes(type)) {
			throw new Error(`[Credentials] Unsupported type: ${type}`);
		}

		if(type === 'password' && !password) {
			throw new Error(`[Credentials] Password credentials need a password`);
		}

		if(type === 'password' && (!keys || !keys.private || !keys.public)) {
			throw new Error(`[Credentials] Keys credentials need both keys`);
		}

		this.user = user;
		this.type = type || 'password';
		this.keys = keys;
		this.password = password;
		this.name = name;
		this.tags = tags;
		this.url = url;
	}

	static generate(length=32, params={ special:true, numbers:true }) {
		const { special, numbers } = params;

		let mixture = [...characters.letters];
		if(special) {
			mixture = mixture.concat(characters.chars);
		}

		if(numbers) {
			mixture = mixture.concat(characters.numbers);
		}

		let response = '';
		for(let i = 0; i < length; i++) {
			response += mixture[Math.floor(Math.random() * mixture.length)];
		}

		return response;
	}
}

module.exports = Credentials;
