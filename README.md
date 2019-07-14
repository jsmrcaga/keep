<p align="center"><img width="150px" src="https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/vault_9cmw.svg"/></p>

# Keep

A simple credential management solution.

## Roadmap
* [X] Simple user and credential management
* [X] Credential encrypting server-side (with 2nd encrypting password/certif)
* [X] Front end
* [X] Front end only encryption
* [ ] OTP Management
* [ ] Web authentication (fingerprint)

## Installation
`keep` works as a CLI to make it easy to launch. In order to install it just run

`npm i -g @jsmrcaga/keep`

You should now have access to the CLI.

## CLI
* Start:
`keep start [--config ./config.json] [--port 1234]`

> Note that if no config is specified, `./config.json` will be used as a default

## API
You can also use it via its API:

```js
const keep = require('@jsmrcaga/keep');

keep.start({ port: 1234 }, configFile).then(() => {
	// do something
}).catch(e => {
	// handle the error
});
```

> Please note that when using as an API `keep` will not register global
> error handling. When launched via the CLI it will via `process.on('unhandledRejection')` and `process.on('uncaughtError')`.

## Requirements
* Database:
Keep uses MongoDB along with `@jsmrcaga/mongo`. You should be able to launch it just by specifiying your config via the API or the cli.

## Configuration
Example:

> Note that under `db` all properties will be forwarded to `@jsmrcaga/mongo`

```
{
	"db": {
		"username": "",
		"password": "",
		"port": 23456
	}
}
```


