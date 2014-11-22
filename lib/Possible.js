//==============================
// (c) 2014 Envisix Labs
//
// License: MIT
// Author: Stuart Malin
// stuart [at] envisixlabs [dot] com
//==============================

"use strict";

var EventEmitter	= require('events').EventEmitter;
var inherits		= require('util').inherits;

//======================================
// Execution Object
//======================================
function Exec () {
}


//======================================
// Public Interface
//======================================

function Possible (f, opts) {

	this._didBegin		= false;
	this._didComplete	= false;
	this._didEnd		= false;
	this._didError		= false;
	this._didThrow		= false;
	this._didTimeout	= false;
	this._threw			= void 0;

	this._function		= f;
	this._timeout		= 0;

	if (opts) {
		if (opts.timeout) {
			this._timeout = opts.timeout;
		}
	}

}
inherits(Possible, EventEmitter);


//===========================
// Public Methods
//===========================

Possible.prototype._handler = function (err) {
	var args = new Array(arguments.length);
	var i;

	this._didEnd = true;

	if (err) {
		this._didError = true;
		this.emit('error', err);
	} else {
		for (i = 1; i < args.length; ++i) {
			args[i] = arguments[i];
		}
		args.shift();	// get rid of the err argument
		this._didComplete = true;
		this.emit('complete', args);
	}
};

Possible.prototype.didBegin = function () {
	return this._didBegin;
};

Possible.prototype.didComplete = function () {
	return this._didComplete;
};

Possible.prototype.didEnd = function () {
	return this._didEnd;
};

Possible.prototype.didError = function () {
	return this._didError;
};

Possible.prototype.didThrow = function () {
	return this._didThrow;
};

Possible.prototype.didTimeout = function () {
	return this._didTimeout;
};

Possible.prototype.go = function () {
	// NOTE: V8 will NOT optimize this function because:
	// 1) arguments has been leked
	// 2) try-ctch is used

	// Because this will not optimize, do NOT:
	// a) allocate heap objects, i.e., use: new Constructor()
	// b) do math (which does implcicit object creation)

	var args = [].slice.call(arguments);
	args.push(this._handler.bind(this));

	this._didBegin = true;

	try {
		this._function.apply(this, args);
	}	
	catch (e) {
		this._didEnd = true;
		this._didThrow = true;
		this._threw = e;
		this.emit('threw', e);
	}
}


//===========================
// exports
//===========================

exports = module.exports = Possible;
