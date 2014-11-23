//==============================
// (c) 2014 Envisix Labs
//
// License: MIT
// Author: Stuart Malin
// stuart [at] envisixlabs [dot] com
//==============================

"use strict";

var timeoutMS = 1000;

var Possible = require('..').Possible;

function delay (x, cb) {
	function async (x, cb) {
		cb && cb(null, 'test invoked with x = ', x);
	}

	setTimeout(async.bind(this, x, cb), x);
}

var p = new Possible(delay);

p.on('complete', function (args, execution) {
	console.log('main: on: complete:', args);
	console.log('Invoked Args:', execution.getInvokedArgs());
});

p.on('timeout', function (elapsed, execution) {
	console.log('main: on: timeout: elapsed:', elapsed);
	console.log('Invoked Args:', execution.getInvokedArgs());
});

var opts = {
	timeoutMS	: timeoutMS
}

p.execute(timeoutMS + 100, null, opts);

