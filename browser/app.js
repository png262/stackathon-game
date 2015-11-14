var socket = io(window.location.origin);
var myPlayerID;
var players = {};
var playersarr =[];
var player;
var cursors;
var leftnet;
var ball;
var scoreString = 'Score : ';
var leftscore = 0;
var rightscore = 0;
var LeftScoreBoard;
var RightScoreBoard;
var host = false;


var game = new Phaser.Game(1200, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function createPlayer(player_id, x, y, ct) {
	console.log("creating player", player_id +"at x: "+x+"    y: "+y+" --- "+ct);
    players[player_id] = game.add.sprite(x, y, 'playericon');
	playersarr.push(players[player_id]);
    if (ct % 2 === 0)  players[player_id].loadTexture('playericon2');
	game.physics.arcade.enable(players[player_id]);
	players[player_id].body.collideWorldBounds = true;
    players[player_id].body.maxVelocity.set(200);
    players[player_id].body.drag.set(10);
    players[player_id].anchor.set(0.5);
}


socket.on('connect', function(){
	console.log("I have connected to the server")
})

socket.on('initializeUsers', function(allUsers, mysocket_id, host_id, userCt) {
	console.log("allUsers", allUsers);
    console.log("userCt ", userCt);
	for(var key in allUsers) {
		if (key !== 'ball') {
			createPlayer(key, allUsers[key].x, allUsers[key].y, allUsers[key].ct);
        }
	}
    //check team
    if (userCt % 2 === 0) {
        player.loadTexture('playericon2');
    }
	console.log("my socket ID is", mysocket_id)
	myPlayerID = mysocket_id;
    if(myPlayerID == host_id) host = true;
})

socket.on("new_player", function(player_id, ct){
    if (player_id !== 'ball') {
        console.log("A new player has joined", player_id)
        createPlayer(player_id, game.world.centerX, game.world.centerY, ct);
    }
})

socket.on('move', function(moveObj, direction) {
	//console.log( "player"+moveObj.id+" moved to x:"+moveObj.x +" and y:" +moveObj.y);
    if(!host) {
    	if (moveObj.id === 'ball' && ball) {
    		ball.x = moveObj.x;
    		ball.y = moveObj.y;
    	} else {
            if(moveObj.id == myPlayerID) {
                player.x=moveObj.x;
                player.y=moveObj.y;
                player.rotation = moveObj.r;
            }
            else if(players[moveObj.id]) {
                players[moveObj.id].x= moveObj.x
                players[moveObj.id].y= moveObj.y
                players[moveObj.id].rotation = moveObj.r;
            }

        }	
    }
})

socket.on('stroke', function(player_id, key) {
    if (host && players[player_id]) {
        if(key == 'up')
            game.physics.arcade.accelerationFromRotation(players[player_id].rotation, 200, players[player_id].body.acceleration);
        else if(key == 'left')
            players[player_id].body.angularVelocity = -300;
        else
            players[player_id].body.angularVelocity = 300;
    }
})
    

socket.on('player_left', function(socket_id) {
		players[socket_id].kill();
	})



function preload() {
    game.load.image('background','starfield.png'); //'debug-grid-1920x1920.png');
    game.load.image('playericon','bsquadron2.png');
    game.load.image('playericon2','bsquadron3.png');

}

function create() {
	//Create board
    game.add.tileSprite(0, 0, 1200, 600, 'background');
    game.world.setBounds(0, 0, 1200, 600);

	game.physics.startSystem(Phaser.Physics.ARCADE)

	//Generate your player
    player = game.add.sprite(game.world.centerX, game.world.centerY, 'playericon');
    playersarr.push(player);

    //create cicular ball
    var bmd = game.add.bitmapData(30, 30);
  	bmd.ctx.beginPath();
  	bmd.circle(15,15,15);
  	bmd.ctx.fillStyle = '#FFFFFF';
  	bmd.ctx.fill();

  	//create rectangle for goal
  	var bmd2 = game.add.bitmapData(10, 300);
  	bmd2.ctx.beginPath();
	bmd2.ctx.rect(0, 0, 10, 300);
	bmd2.ctx.fillStyle = '#FFA500';
	bmd2.ctx.fill();


    ball = game.add.sprite(game.world.centerX+100, game.world.centerY+100, bmd);
    leftgoal = game.add.sprite(0,game.world.centerY/2,bmd2)
    rightgoal = game.add.sprite(game.world.width-10, game.world.centerY/2,bmd2)

    LeftScoreBoard = game.add.text(10, 10, scoreString + leftscore, { font: '20px Arial', fill: '#fff' });
    RightScoreBoard = game.add.text(game.world.width-150, 10, scoreString + rightscore, { font: '20px Arial', fill: '#fff' });


    game.physics.arcade.enable(ball);
    game.physics.arcade.enable(player);
    game.physics.arcade.enable(leftgoal);
    game.physics.arcade.enable(rightgoal);


    player.body.collideWorldBounds = true;
    player.body.maxVelocity.set(200);
    player.body.drag.set(10);
    player.anchor.set(0.5);

    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1,1);
    ball.body.drag.set(5);

    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(player);

    console.log("finished creating game")
}

var lastPosition = {x: null, y: null};
var lastBallPosition = {x: null, y: null};

function update() {
    // if(player.body.position.x != lastPosition.x || player.body.position.y != lastPosition.y) {
    socket.emit("move", {id: myPlayerID, x: player.position.x, y: player.position.y, r: player.rotation}, "right");
    socket.emit('move', {id: 'ball', x: ball.position.x, y: ball.position.y, r: ball.rotation}, "right")
    // }


    if(host) {
        if (cursors.up.isDown)
        {
            game.physics.arcade.accelerationFromRotation(player.rotation, 200, player.body.acceleration);
        }
        else
        {
            player.body.acceleration.set(0);
        }

        if (cursors.left.isDown)
        {
            player.body.angularVelocity = -300;
        }
        else if (cursors.right.isDown)
        {
            player.body.angularVelocity = 300;
        }
        else
        {
            player.body.angularVelocity = 0;
        }
    }
    else {
        if(cursors.up.isDown)
            socket.emit('stroke',myPlayerID,"up")
        if(cursors.left.isDown)
            socket.emit('stroke',myPlayerID,"left")
        else if (cursors.right.isDown)
            socket.emit('stroke',myPlayerID,"right")
    }

    for(var key in players) {
        players[key].body.acceleration.set(0);
        players[key].body.angularVelocity = 0;
        socket.emit('move', {id: key, x: players[key].x, y: players[key].y, r: players[key].rotation})
    }

    lastPosition.x = player.body.position.x; 
    lastPosition.y = player.body.position.y; 

    game.physics.arcade.collide(ball, playersarr);
    game.physics.arcade.collide(player, playersarr);

    if(game.physics.arcade.overlap(ball,leftgoal)) {
    	console.log("GOAL!")
        rightscore++
        RightScoreBoard.text = scoreString+rightscore;
    	ball.kill();
    	ball.reset(game.world.centerX, game.world.centerY)
    }
    if(game.physics.arcade.overlap(ball,rightgoal)) {
    	console.log("GOAL!")
        leftscore++ 
        LeftScoreBoard.text = scoreString+leftscore;

    	ball.kill();
    	ball.reset(game.world.centerX, game.world.centerY)
    }
}


function render() {

    //game.debug.cameraInfo(game.camera, 32, 32);
    //game.debug.spriteCoords(player, 32, 500);

}




