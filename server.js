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
var userCt = 0;
var host;
var team1 = [];
var team2 = [];
var hostsocket;

function countPlayers(teamnum) {
	var count = 0;
	for(var key in allUsers) {
		if(allUsers[key].team == teamnum) count++
	}
	return count;
}

function determineSpawn(width, height) {
	var countTeam1 = countPlayers(1);
	var countTeam2 = countPlayers(2);

	var t1_x_pos = width/4;
	var t2_x_pos = width * 3 / 4;

	var t1_y_incr = height / (countTeam1+1);
	var t1_y_pos = t1_y_incr;

	var t2_y_incr = height / (countTeam2+1);
	var t2_y_pos = t2_y_incr;


	for(var key in allUsers) {
		if(allUsers[key].team === 1) {
			allUsers[key].spawn_x = t1_x_pos;
			allUsers[key].spawn_y = t1_y_pos;
			allUsers[key].spawn_r = 0;
			t1_y_pos += t1_y_incr;
		}
		else {
			allUsers[key].spawn_x = t2_x_pos;
			allUsers[key].spawn_y = t2_y_pos;
			allUsers[key].spawn_r = 3.14159;
			t2_y_pos += t2_y_incr;
		}
	}

}



function determineTeams() {
	var team = 1;
	for(var key in allUsers) {
		allUsers[key].team = team;
		team == 1 ? team++ : team--;
	}
}

io.on('connection', function(socket){
	console.log("A new client has connected", socket.id)

	socket.on('login', function(name) {
		console.log(" before Login, allUsers", allUsers, Object.keys(allUsers).length)

		if(Object.keys(allUsers).length == 0) {
			allUsers[socket.id] = {name: name}
			socket.emit('setHost', socket.id);
			socket.emit('setPlayer', socket.id);
			io.emit('currentUsers', allUsers);
			hostsocket = socket;
		}
		else if(Object.keys(allUsers).length >= 7) {
			console.log("Sorry, max players exceeded")
			socket.emit('forceDisconnect');
			socket.disconnect();
		}
		else {
			allUsers[socket.id] = {name: name}
			socket.emit('setPlayer', socket.id);
			io.emit('currentUsers', allUsers);
		}
		console.log(" after Login, allUsers", allUsers, Object.keys(allUsers).length)

	})

	socket.on('startgame', function() {
		determineTeams();
		determineSpawn(1200, 600);
		io.emit('initializeUsers', allUsers);
	})
	socket.on('disconnectme', function() {
		socket.disconnect();
	})

	// if(Object.keys(allUsers).length >= 7){
	// 	console.log("Sorry, Max players exceeded")
	// 	socket.disconnect();
	// 	return;
	// }

	// if(Object.keys(allUsers).length == 0) {
	// 	host = socket.id;
	// }

	// setTimeout(function() {
 //    	//Sending back existing users to the new client
 //    	userCt++;
	//     console.log("timeout has finished, now emitting allUsers", allUsers)
	// 	socket.emit('initializeUsers', allUsers, socket.id, host, userCt);

	// 	//adding new user to the allUsers object
	// 	console.log("about to add current user to allUsers",allUsers, userCt)
	// 	allUsers[socket.id] = {x:100, y:100, ct:userCt}
	// 	console.log("after adding current user to allUsers", allUsers)

	// 	//notifying rest of the clients about the new player
	// 	console.log("emitting new player to everyone else - ", userCt)
	// 	socket.broadcast.emit('new_player', socket.id, userCt);

	// }, 1500);
	

	//if received a move event from player X, update playerX position (x&y coordinates)
	//then broadcast emit to the rest of the players
	socket.on('move', function(moveObj) {
		socket.broadcast.emit('move', moveObj)

		//if(moveObj.id) {
			// if (allUsers[moveObj.id] && allUsers[moveObj.id].ct) 
			// 	allUsers[moveObj.id] = {x: moveObj.x, y: moveObj.y, r:moveObj.rotation, ct: allUsers[moveObj.id].ct};
			// else allUsers[moveObj.id] = {x: moveObj.x, y: moveObj.y, r:moveObj.rotation};
			//socket.broadcast.emit('move', moveObj);
		//}
	})


	socket.on('stroke', function(player_id, key) {
		hostsocket.emit('stroke', player_id, key);
	})

	socket.on('disconnect', function(){
		console.log("A client has disconnected", socket.id)
		delete allUsers[socket.id]
		userCt--;
		socket.broadcast.emit('player_left', socket.id);
		console.log("updated allUsers is", allUsers, userCt);
	})
	socket.on('scoreboardUpdate', function(leftscore, rightscore) {
		socket.broadcast.emit('scoreboardUpdate', leftscore,rightscore)
	})

});


app.use(express.static(path.join(__dirname, 'browser')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});
