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
	throw "Throwing!"
}

var p = new Possible(test);

p.on('threw', function (e, execution) {
	console.log('main: on: threw:', e);
	console.log('Invoked Args:', execution.getInvokedArgs());
});

p.execute(3);

