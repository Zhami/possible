//==============================
// (c) 2014 Envisix Labs
//
// License: MIT
// Author: Stuart Malin
// stuart [at] envisixlabs [dot] com
//==============================

"use strict";

var	http = require('http');

var Possible = require('..').Possible;


function test (action, x, cb) {
	function async (x, cb) {
		cb && cb(null, x);
	}
	function error (cb) {
		cb && cb(new Error('test error!'));
	}

	if (!cb) {
		cb = x;
	}

	switch (action) {
	case 'wait':
		setTimeout(async.bind(this, x, cb), x);
		break;	
	case 'throw':
		throw 'Boom!';
		break;
	default:
		setImmediate(error.bind(this, cb));	
	}

}


var p = new Possible(test);


p.on('complete', function (args, exec) {
	var context = exec.getContext();
	var res = context.res;

	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World:' + args +' \n');
});

p.on('error', function (err, exec) {
	var context = exec.getContext();
	var res = context.res;

	res.writeHead(400, {'Content-Type': 'text/plain'});
	res.end('Error: ' + err + '\n');	
});

p.on('threw', function (e, exec) {
	var context = exec.getContext();
	var res = context.res;

	res.writeHead(500, {'Content-Type': 'text/plain'});
	res.end('Server code threw: ' + e + '\n');	
});

p.on('timeout', function (elapsed, exec) {
	var context = exec.getContext();
	var res = context.res;

	res.writeHead(400, {'Content-Type': 'text/plain'});
	res.end('Server code timeout after: ' + elapsed + 'ms\n');	
});

function handleConnection (req, res) {
	var argsToApply;
	var context = {
		req		: req
		, res	: res
	};
	var opts = {
		timeoutMS : 3500
	};

	var x = Math.random();
	if (x < .5) {
		argsToApply = ['wait', x * 10000];
	} else if (x > .75) {
		argsToApply = 'error';
	} else {
		argsToApply = 'throw';
	}

	p.execute(argsToApply, context, opts);
}

http.createServer(handleConnection).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');
