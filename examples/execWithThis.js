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
		cb && cb(null, 'test invoked with x = ', x, 'this is:', this);
	}

	setImmediate(async.bind(this, x, cb));
}

var p = new Possible(test);

p.on('complete', function (args, execution) {
	console.log('main: on: complete:', args);
	console.log('Invoked Args:', execution.getInvokedArgs());
});

var opts = {
	execWithThis	: { name: 'thisContext'}
}

p.execute(3, null, opts);

