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
function Execution (p, ctxt, opts) {
	this._p				= p;		// the instance of Possible
	this._emit			= p.emit.bind(p);
	this._context		= ctxt;
	this._state			= '';

	this._invokedArgs	= void 0; 
	this._resultArgs	= void 0;
	this._threw			= void 0;

	this._execWithThis	= void 0;
	this._timeoutMS		= 0;
	this._timeout		= void 0;
	this._timeStart		= 0;
	this._timeEnd		= 0;

	if (opts) {
		if (opts.timeoutMS) {
			this._timeoutMS = opts.timeoutMS;
		}
		if (opts.execWithThis) {
			this._execWithThis = opts.execWithThis;
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

	if (this._state === 'timeout') {
		// already timed out
		return;
	}

	// if there is a timeout timer, clear it
	if (this._timeout) {
		clearTimeout(this._timeout);
		this._timeout = void 0;
	}

	this._timeEnd = + new Date();
	this._elapsed = this._timeEnd - this._timeStart;

	if (err) {
		this._state = 'error';
		this._emit('error', err, this);
	} else {
		for (i = 1; i < args.length; ++i) {
			args[i] = arguments[i];
		}
		args.shift();	// get rid of the err argument
		this._state = 'complete';
		this._resultArgs = args;
		this._emit('complete', args, this);
	}

	this._emit('end', this);
};

Execution.prototype._timeoutHandler = function () {
	this._timeEnd = + new Date();
	this._elapsed = this._timeEnd - this._timeStart;
	this._state = 'timeout';
	this._timeout = void 0;
	this._emit('timeout', this._elapsed, this);
};


Execution.prototype.didBegin = function () {
	return this._state = 'begin';
};

Execution.prototype.didComplete = function () {
	return this._state = 'complete';
};

Execution.prototype.didEnd = function () {
	return ((this._state = 'complete') || (this._state = 'error') || (this._state = 'throw') || (this._state = 'timeout'));
};

Execution.prototype.didError = function () {
	return this._state = 'error';
};

Execution.prototype.didThrow = function () {
	return this._state = 'throw';
};

Execution.prototype.didTimeout = function () {
	return this._state = 'timeout';
};

Execution.prototype.getContext = function () {
	return this._context;
};

Execution.prototype.getInvokedArgs = function () {
	return this._invokedArgs;
};

Execution.prototype.getResultArgs = function () {
	return this._resultArgs;
};

Execution.prototype.getState = function () {
	return this._state;
};

Execution.prototype.getTimeElapsed = function () {
	return this._elapsed;
};


Execution.prototype.go = function (args) {
	// NOTE: V8 will NOT optimize this function because:
	// 1) arguments has been leked
	// 2) try-ctch is used

	// Because this will not optimize, do NOT:
	// a) allocate heap objects, i.e., use: new Constructor()
	// b) do math (which does implcicit object creation)

	var execWithThis;
	var f;
	var timeoutMS;
	var timeout;

	execWithThis = this._execWithThis || this;
	f = this._p.getFunction();
	timeoutMS = this._timeoutMS;

	this._invokedArgs = args;

	if (!Array.isArray(args)) {
		args = [args];
	}

	args.push(this._handler.bind(this));

	this._state = 'begin';
	this._timeStart = + new Date();

	if (timeoutMS) {
		this._timeout = setTimeout(this._timeoutHandler.bind(this), timeoutMS);
	}

	try {
		f.apply(execWithThis, args);
	}	
	catch (e) {
		this._timeEnd = + new Date();
		this._elapsed = this._timeEnd - this._timeStart;
		this._state = 'throw';
		this._threw = e;
		this._emit('threw', e, this);
		this._emit('end', this);
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


Possible.prototype.execute = function (args, ctxt, opts) {

	var exec = new Execution(this, ctxt, opts);

	exec.go(args);
}

Possible.prototype.getFunction = function () {
	return this._function;
};


//===========================
// exports
//===========================

exports = module.exports = Possible;
