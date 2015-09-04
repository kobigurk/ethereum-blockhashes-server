var http = require('http');

function getBlockRlp(number, callback) {
	var options = {
		hostname: 'localhost',
		port: 8545,
		path: '/',
		method: 'POST'
	};

	console.log('getting rlp for: ' + number);

	var postdata = JSON.stringify({
		jsonrpc: '2.0',
		method: 'debug_getBlockRlp',
		params: [number],
		id: 10
	});

	var body = '';

	var request = http.request(options, function (response) {
		response.on('data', function (chunk) {
			body += chunk;
		});

		response.on('end', function () {
			callback(null, JSON.parse(body).result);
		});
	});

	request.on('error', function (e) {
		callback(e);
	});

	request.write(postdata);
	request.end();
}

module.exports = getBlockRlp;

