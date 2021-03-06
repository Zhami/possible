//==============================
// (c) 2014 Envisix Labs
//
// License: MIT
// Author: Stuart Malin
// stuart [at] envisixlabs [dot] com
//==============================

"use strict";

var Possible = require('..').Possible;

function test (x, cb) {
	function async (x, cb) {
		cb && cb('test error: ' + x);
	}

	setImmediate(async.bind(this, x, cb));
}

var p = new Possible(test);

p.on('error', function (err, execution) {
	console.log('main: on: error:', err);
	console.log('Invoked Args:', execution.getInvokedArgs());
});

p.execute(3);

