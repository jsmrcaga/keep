const { expect } = require('chai');

const Credentials = require('../../models/credentials');

describe('Credentials', () => {
	// 256bit key
	const key = '6DsZlNQeX0Ia91J2aw8LcmSVpTrBheOU';

	it('Encrypts data correctly', () => {
		let credentials = new Credentials({
			password: 'plep'
		});

		credentials.encrypt(key);

		expect(credentials.password).to.be.null;
		expect(credentials.keys).to.be.null;
		expect(credentials.encrypted).to.not.be.null;
		expect(credentials.encrypted).to.not.be.undefined;
		expect(credentials.encrypted).to.not.be.eql('plep');

	});

	it('Decrypts data correctly', () => {
		let credentials = new Credentials({
			password: 'plep'
		});

		credentials.encrypt(key);
		const decrypted = credentials.decrypt(key);
		expect(decrypted).to.be.eql(JSON.stringify('plep'));
	});
});
