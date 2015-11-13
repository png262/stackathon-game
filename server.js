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

var allUsers = {};
var host;

io.on('connection', function(socket){
	console.log("A new client has connected", socket.id)

	if(Object.keys(allUsers).length == 0) {
		host = socket.id;
	}

	setTimeout(function() {
    //Sending back existing users to the new client
	    console.log("timeout has finished, now emitting allUsers", allUsers)
		socket.emit('initializeUsers', allUsers, socket.id, host);

		//adding new user to the allUsers object
		console.log("about to add current user to allUsers",allUsers)
		allUsers[socket.id] = {x:100, y:100}
		console.log("after adding current user to allUsers", allUsers)

		//notifying rest of the clients about the new player
		console.log("emitting new player to everyone else")
		socket.broadcast.emit('new_player', socket.id);

	}, 1500);
	

	//if received a move event from player X, update playerX position (x&y coordinates)
	//then broadcast emit to the rest of the players
	socket.on('move', function(moveObj, direction) {
		if(moveObj.id) {
			allUsers[moveObj.id] = {x: moveObj.x, y: moveObj.y}
			// console.log(moveObj.id +" moved "+direction+"and his current position is x:"+moveObj.x+"  and y:"+moveObj.y)
			socket.broadcast.emit('move', moveObj, direction);
		}
	})


	socket.on('stroke', function(player_id, key) {
		socket.broadcast.emit('stroke', player_id, key);
	})

	socket.on('disconnect', function(){
		console.log("A client has disconnected", socket.id)
		delete allUsers[socket.id]
		socket.broadcast.emit('player_left', socket.id);
		console.log("updated allUsers is", allUsers)
	})

});


app.use(express.static(path.join(__dirname, 'browser')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});
