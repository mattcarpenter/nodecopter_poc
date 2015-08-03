var express = require('express');
var WebSocketServer = require('ws').Server;
var wss;
var app;
var server;
var clientWs;

module.exports = {
	init: init,
	send: send
};

function init() {
	app = express();

	app.use(express.static('./lib/server/public'));
	
	server = app.listen(3080, function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('Server listening at http://%s:%s', host, port);
	});
	
	wss = new WebSocketServer({ server: server, path: '/live'});
	
	wss.on('connection', function (ws) {
		console.log('client connected');
		clientWs = ws;			

		ws.on('message', function (msg) {
			console.log(msg);
		});
	});
}

function send(data) {
	if (clientWs) {
		try {
			clientWs.send(data.toString());
		} catch (e) {}
	}
}
