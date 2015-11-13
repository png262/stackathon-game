var socket = io(window.location.origin);
var myPlayerID;
var players = {};
var player;
var player2;
var cursors;

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });


function createPlayer(player_id, x, y) {
	console.log("creating player", player_id +"at x:"+x+"    y:"+y)
	game.load.image(player_id,'test.ico');
	
	//players[player_id] = game.add.sprite(x, y, 'playericon');
	player2 = game.add.sprite(x, y, 'playericon');

	// game.physics.p2.enable(players[player_id]);
	game.physics.arcade.enable(player2);
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
	console.log( "player"+moveObj.id+" moved to x:"+moveObj.x +" and y:" +moveObj.y);
	//players[moveObj.id].body.setZeroVelocity();
	// if(direction =="up")
	// 	players[moveObj.id].body.moveUp(300)
	// else if(direction =="down")
	// 	players[moveObj.id].body.moveDown(300)
	// else if(direction =="left")
	// 	players[moveObj.id].body.moveLeft(300)
	// else if(direction =="right")
	// 	players[moveObj.id].body.moveRight(300)
	//players[moveObj.id].body.setZeroVelocity();
	//console.log(players[moveObj.id].body.position.x);
	// players[moveObj.id].body.position.x= moveObj.x
	// players[moveObj.id].body.position.y= moveObj.y
	player2.x=moveObj.x;
	player2.y=moveObj.y;

})

socket.on('player_left', function(socket_id) {
	
})

socket.on("new_player", function(player_id){
	console.log("A new player has joined", player_id)
	createPlayer(player_id, game.world.centerX, game.world.centerY)
})

// PHASER


function preload() {

    game.load.image('background','debug-grid-1920x1920.png');
    game.load.image('playericon','favicon.ico');



}



function create() {

    game.add.tileSprite(0, 0, 800, 600, 'background');

    game.world.setBounds(0, 0, 800, 600);


    game.physics.startSystem(Phaser.Physics.ARCADE)
    // game.physics.startSystem(Phaser.Physics.P2JS);

    player = game.add.sprite(game.world.centerX, game.world.centerY, 'playericon');

    ball = game.add.sprite(game.world.centerX+100, game.world.centerY+100, 'playericon');
    game.physics.arcade.enable(ball);


    game.physics.arcade.enable(player);
    // game.physics.p2.enable(player);

    player.body.collideWorldBounds = true;
    ball.body.collideWorldBounds = true;

    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(player);



    console.log("finish creating game")
    
}

var lastPosition = {x: null, y: null}
function update() {
    if(player.body.position.x != lastPosition.x || player.body.position.y != lastPosition.y) {
    	socket.emit("move", {id: myPlayerID, x: player.position.x, y: player.position.y}, "right");
    }

    // player.body.setZeroVelocity();
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    //game.physics.arcade.moveToPointer(player, 60, game.input.activePointer, 500);

    if (cursors.up.isDown)
    {
        // player.body.position.x = 100;
        // player.body.moveUp(300)
        player.body.velocity.y = -100;
        

        //socket.emit("move",  {id: myPlayerID, x: player.position.x, y: player.position.y}, "up");
        //player2.body.moveDown(300)
    }
    else if (cursors.down.isDown)
    {
        // player.body.position.x = 200;
        // player.body.moveDown(300);
        player.body.velocity.y = 100;


        //socket.emit("move", {id: myPlayerID, x: player.position.x, y: player.position.y}, "down");
    }

    if (cursors.left.isDown)
    {
        // player.body.position.x = 300;
        // player.body.moveLeft(300);
        //socket.emit("move", {id: myPlayerID, x: player.position.x, y: player.position.y}, "left");
        player.body.velocity.x = -100;

    }
    else if (cursors.right.isDown)
    {
        // player.body.position.x = 400;
        // player.body.moveRight(300);
        player.body.velocity.x = 100;

    }
    lastPosition.x = player.body.position.x; 
    lastPosition.y = player.body.position.y; 
    game.physics.arcade.collide(player, ball);
    

}

function render() {

    game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.spriteCoords(player, 32, 500);

}



