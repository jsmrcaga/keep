const Crypto = require('crypto');
const Utils = require('../global/utils');
const Database = require('../db/db');

const CredentialsModel = Database.model('Credentials');

const generate_characters = (from, to) => {
	if(from instanceof Array) {
		return from.map(([f, t]) => generate_characters(f, t)).flat(Infinity);
	}

	let characters = [];
	for(let i = from; i <= to; i++) {
		characters.push(String.fromCharCode(i));
	}

	return characters;
};

const characters = {
	chars: generate_characters([[33, 33], [35, 38], [40, 47], [123, 126], [91, 91],[93, 96]]),
	letters: generate_characters([[65, 90], [97, 122]]),
	numbers: generate_characters(48, 57)
};

class Credentials extends CredentialsModel {
	constructor({ user, type='password', keys=null, password=null, name='', tags=[], url, logo=null, encrypted=null, slug='' }) {
		super();

		if(!Credentials.types.includes(type)) {
			throw new Error(`[Credentials] Unsupported type: ${type}`);
		}

		if(!encrypted) {
			if(type === 'password' && !password) {
				throw new Error(`[Credentials] Password credentials need a password`);
			}

			if(type !== 'password' && (!keys || (!keys.private && !keys.public))) {
				throw new Error(`[Credentials] Keys credentials need one of both keys`);
			}
		}

		this.user = user;
		this.type = type || 'password';
		this.keys = keys;
		this.password = password;
		this.name = name;
		this.slug = slug || Utils.slugify(name);
		this.tags = tags;
		this.url = url;
		this.logo = logo;
		this.encrypted = encrypted;
	}

	encrypt(key) {
		// AES needs 16
		let iv = Crypto.randomBytes(16);
		let cipher = Crypto.createCipheriv('AES-256-CBC', Buffer.from(key), iv);
		let encrypted = cipher.update(JSON.stringify(this.password || this.keys), 'utf8');
		encrypted = Buffer.concat([encrypted, cipher.final()]);

		let new_value = `${iv.toString('base64')}:${encrypted.toString('base64')}`;
		this.password = null;
		this.keys = null;
		this.encrypted = new_value;
	}

	decrypt(key) {
		if(!this.encrypted) {
			throw new Error(`Credentials (${this.id}): nothing to decrypt`);
		}

		let [ iv, encrypted ] = this.encrypted.split(':');
		iv = Buffer.from(iv, 'base64');
		encrypted = Buffer.from(encrypted, 'base64');
		let decipher = Crypto.createDecipheriv('AES-256-CBC', Buffer.from(key), iv);
		
		let decrypted = decipher.update(encrypted);

		decrypted = Buffer.concat([decrypted, decipher.final()]);

		return decrypted.toString('utf8');
	}

	toAPI() {
		const { type, keys, password, name, tags, url, encrypted, slug } = this;
		return {
			type,
			keys,
			password,
			name,
			slug,
			tags,
			url,
			encrypted
		};
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

Credentials.types = ['password', 'ssh', 'keypair'];

module.exports = Credentials;
