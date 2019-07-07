#!/usr/bin/env node
const argumentate = require('argumentate');

let { options, variables } = argumentate(process.argv.slice(2));

if(options.h || options.help || variables[0] === 'help') {
	return console.log(`
Usage
  keep <script> [options]

Example:
  keep start -p 8080
	`);
}

const handles = require('./cli/handles');

const [script, ...args] = variables;

if(!script) {
	let err = new Error(`[KEEP] Script is mandatory`);
	return console.error(err);
}

if(!handles[script]) {
	let err = new Error(`[KEEP] Unknown script ${script}`);
	return console.error(err);
}

return handles[script](args, options);

process.on('unhandledRejection', (err) => {
	console.error('[KEEP][Unhandled Rejection]', err);
});

process.on('uncaughtException', (err) => {
	console.error('[KEEP][Uncaught Exception]', err);
});
