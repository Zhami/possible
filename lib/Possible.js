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
function Execution (p, opts) {
	this._p				= p;		// the instance of Possible
	this._emit			= p.emit.bind(p);

	this._invokedArgs	= void 0; 
	this._didBegin		= false;
	this._didComplete	= false;
	this._didEnd		= false;
	this._didError		= false;
	this._didThrow		= false;
	this._didTimeout	= false;
	this._threw			= void 0;

	this._timeoutMS		= 0;
	this._timeout		= void 0;

	if (opts) {
		if (opts.timeout) {
			this._timeoutMS = opts.timeout;
		}
	}
}

//===========================
// Public Methods
//===========================

Execution.prototype._handler = function (err) {
	// NOTE: ensure V8 will optimize this so:
	// do NOT leak arguments

	var args = new Array(arguments.length);
	var i;

	this._didEnd = true;

	if (err) {
		this._didError = true;
		this._emit('error', err, this);
	} else {
		for (i = 1; i < args.length; ++i) {
			args[i] = arguments[i];
		}
		args.shift();	// get rid of the err argument
		this._didComplete = true;
		this._emit('complete', args, this);
	}

	this._emit('end', this);

};

Execution.prototype.didBegin = function () {
	return this._didBegin;
};

Execution.prototype.didComplete = function () {
	return this._didComplete;
};

Execution.prototype.didEnd = function () {
	return this._didEnd;
};

Execution.prototype.didError = function () {
	return this._didError;
};

Execution.prototype.didThrow = function () {
	return this._didThrow;
};

Execution.prototype.didTimeout = function () {
	return this._didTimeout;
};

Execution.prototype.getInvokedArgs = function () {
	return this._invokedArgs;
};


Execution.prototype.go = function (args) {
	// NOTE: V8 will NOT optimize this function because:
	// 1) arguments has been leked
	// 2) try-ctch is used

	// Because this will not optimize, do NOT:
	// a) allocate heap objects, i.e., use: new Constructor()
	// b) do math (which does implcicit object creation)

	var f;

	f = this._p.getFunction();

	this._invokedArgs = args;

	if (!Array.isArray(args)) {
		args = [args];
	}

	args.push(this._handler.bind(this));

	this._didBegin = true;

	try {
		f.apply(this, args);
	}	
	catch (e) {
		this._didEnd = true;
		this._didThrow = true;
		this._threw = e;
		this._emit('threw', e, this);
	}
}


//======================================
// Public Interface
//======================================

function Possible (f) {
	this._function		= f;
}
inherits(Possible, EventEmitter);


//===========================
// Public Methods
//===========================


Possible.prototype.execute = function (args, opts) {

	var exec = new Execution(this, opts);

	exec.go(args);
}

Possible.prototype.getFunction = function () {
	return this._function;
};


//===========================
// exports
//===========================

exports = module.exports = Possible;
