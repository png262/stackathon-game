var path = require('path');

var http = require('http');
var server = http.createServer();

var express = require('express');
var app = express();

var socketio = require('socket.io');

server.on('request', app);
var io = socketio(server);



server.listen(1337, function () {
    console.log('The server is listening on port 1337!');
});


io.on('connection', function(socket){

	console.log("A new client has connected", socket.id)

	socket.on('disconnect', function(socket){
		console.log(":((((((")
	})
	socket.on('move', function(start, end, color){
		socket.broadcast.emit("move", start, end, color);
	})

	socket.broadcast.emit('new_player', socket.id);

});



app.use(express.static(path.join(__dirname, 'browser')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});



