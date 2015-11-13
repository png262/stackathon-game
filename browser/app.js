var socket = io(window.location.origin);
var myPlayerID;
var players = {};
var playersarr =[];
var player;
var player2;
var cursors;


var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });


function createPlayer(player_id, x, y) {
	console.log("creating player", player_id +"at x:"+x+"    y:"+y)
	players[player_id] = game.add.sprite(x, y, 'playericon');
	playersarr.push(players[player_id]);
	game.physics.arcade.enable(players[player_id]);
}

    socket.on('connect', function(){
		console.log("I have connected to the server")
	})

	socket.on('initializeUsers', function(allUsers, mysocket_id) {
		console.log("allUsers", allUsers)
		for(var key in allUsers) {
			createPlayer(key, allUsers[key].x, allUsers[key].y);
		}	
		console.log("my socket ID is", mysocket_id)
		myPlayerID = mysocket_id;
	})



	socket.on('move', function(moveObj, direction) {
		// console.log( "player"+moveObj.id+" moved to x:"+moveObj.x +" and y:" +moveObj.y);
		players[moveObj.id].x= moveObj.x
		players[moveObj.id].y= moveObj.y
	})

	socket.on('player_left', function(socket_id) {
		players[socket_id].destroy(true);
	})

	socket.on("new_player", function(player_id){
		console.log("A new player has joined", player_id)
		createPlayer(player_id, game.world.centerX, game.world.centerY)
	})



function preload() {
    game.load.image('background','debug-grid-1920x1920.png');
    game.load.image('playericon','favicon.ico');
}



function create() {
	//Create board
    game.add.tileSprite(0, 0, 800, 600, 'background');
    game.world.setBounds(0, 0, 800, 600);
	game.physics.startSystem(Phaser.Physics.ARCADE)

	//Generate your player
    player = game.add.sprite(game.world.centerX, game.world.centerY, 'playericon');
    playersarr.push(player);

    ball = game.add.sprite(game.world.centerX+100, game.world.centerY+100, 'playericon');

    game.physics.arcade.enable(player);
    game.physics.arcade.enable(ball);


    player.body.collideWorldBounds = true;

    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(player);

    console.log("finished creating game")
    
}

var lastPosition = {x: null, y: null}
function update() {
    if(player.body.position.x != lastPosition.x || player.body.position.y != lastPosition.y) {
    	socket.emit("move", {id: myPlayerID, x: player.position.x, y: player.position.y}, "right");
    }

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    //game.physics.arcade.moveToPointer(player, 60, game.input.activePointer, 500);

    if (cursors.up.isDown)
    {
        player.body.velocity.y = -100;
    }
    else if (cursors.down.isDown)
    {
        player.body.velocity.y = 100;
    }

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -100;
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = 100;
    }

    lastPosition.x = player.body.position.x; 
    lastPosition.y = player.body.position.y; 

    // if(game.physics.arcade.intersects(ball,goal)) {
    // 	ball.destroy();
    // }
    game.physics.arcade.collide(ball, playersarr);


}

function render() {

    game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.spriteCoords(player, 32, 500);

}



