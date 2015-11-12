var path = require('path');

var http = require('http');
var server = http.createServer();

var express = require('express');
var app = express();

var socketio = require('socket.io');

server.on('request', app);
var io = socketio(server);

var state;

var states = {
	"the-kitchen" : '',
	"grace-hopper" : '',
	"turing-hall" : ''
}

server.listen(1337, function () {
    console.log('The server is listening on port 1337!');
});

function leaveAllChannels (socket) {
	socket.leave('the-kitchen');
	socket.leave('grace-hopper');
	socket.leave('turing-hall');
}


io.on('connection', function(socket){
	// if (state) socket.emit('load', state); // <=== just emit to this socket
	var currentRoom;

	socket.on('the-kitchen', function(){
		currentRoom	= 'the-kitchen';
		socket.emit('load', states[currentRoom]);
		leaveAllChannels(socket);
		socket.join('the-kitchen');
	})
	socket.on('grace-hopper', function(){
		currentRoom	= 'grace-hopper';
		socket.emit('load', states[currentRoom]);
		leaveAllChannels(socket);
		socket.join('grace-hopper');
	})
	socket.on('turing-hall', function(){
		currentRoom	= 'turing-hall';
		socket.emit('load', states[currentRoom]);
		leaveAllChannels(socket);
		socket.join('turing-hall');
	})

	socket.on('disconnect', function(socket){
		console.log(":((((((")
	})
	socket.on('draw', function(start, end, color){
		socket.broadcast.to(currentRoom).emit("draw", start, end, color);
	})

	socket.on('save', function(canvasState){
		states[currentRoom] = canvasState;
	})
});



app.use(express.static(path.join(__dirname, 'browser')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});



