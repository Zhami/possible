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

p.on('threw', function (e) {
	console.log('main: on: threw:', e);
});

p.go(3);

