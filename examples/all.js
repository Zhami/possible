//==============================
// (c) 2014 Envisix Labs
//
// License: MIT
// Author: Stuart Malin
// stuart [at] envisixlabs [dot] com
//==============================

"use strict";

var Possible = require('..').Possible;

function test (action, x, cb) {
	function async (x, cb) {
		cb && cb(null, 'test invoked with x = ', x);
	}
	function error (cb) {
		cb && cb(new Error('test error!'));
	}

	if (!cb) {
		cb = x;
	}

	switch (action) {
	case 'complete':
		setImmediate(async.bind(this, x, cb));
		break;	
	case 'throw':
		throw 'Boom!';
		break;
	default:
		setImmediate(error.bind(this, cb));	
	}

}

var p = new Possible(test);

p.on('complete', function (args) {
	console.log('main: on: complete:', args);
});

p.on('error', function (err) {
	console.log('main: on: error:', err);
});

p.on('threw', function (e) {
	console.log('main: on: threw:', e);
});

p.execute(['complete', Math.random()]);
p.execute('error');
p.execute('throw');

