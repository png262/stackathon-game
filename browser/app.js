var socket = io(window.location.origin);
var myPlayerID;
var players = {};
var player;
var cursors;

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });


function createPlayer(player_id, x, y) {
	console.log("creating player", player_id +"at x:"+x+"    y:"+y)
	game.load.image(player_id,'test.ico');
	
	players[player_id] = game.add.sprite(x, y, 'playericon');
	game.physics.p2.enable(players[player_id]);
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





socket.on("new_player", function(player_id){
	console.log("A new player has joined", player_id)
	createPlayer(player_id, game.world.centerX, game.world.centerY)
})

socket.on('move', function(moveObj, direction) {
	console.log("player"+moveObj.id+" moved "+direction);
	//players[moveObj.id].body.setZeroVelocity();
	if(direction =="up")
		players[moveObj.id].body.moveUp(300)
	else if(direction =="down")
		players[moveObj.id].body.moveDown(300)
	else if(direction =="left")
		players[moveObj.id].body.moveLeft(300)
	else if(direction =="right")
		players[moveObj.id].body.moveRight(300)
	//players[moveObj.id].body.setZeroVelocity();
})

// PHASER


function preload() {

    game.load.image('background','debug-grid-1920x1920.png');
    game.load.image('playericon','favicon.ico');
    

}



function create() {

    game.add.tileSprite(0, 0, 800, 600, 'background');

    game.world.setBounds(0, 0, 800, 600);

    game.physics.startSystem(Phaser.Physics.P2JS);

    player = game.add.sprite(game.world.centerX, game.world.centerY, 'playericon');

    //player2 = game.add.sprite(game.world.centerX+100, game.world.centerY+100, 'player2');

    game.physics.p2.enable(player);
    //game.physics.p2.enable(player2);

    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(player);



}

function update() {

    player.body.setZeroVelocity();
    //player2.body.setZeroVelocity();

    if (cursors.up.isDown)
    {
        player.body.moveUp(300)
        socket.emit("move",  {id: myPlayerID, x: player.position.x, y: player.position.y}, "up");
        //player2.body.moveDown(300)
    }
    else if (cursors.down.isDown)
    {
        player.body.moveDown(300);
        socket.emit("move", {id: myPlayerID, x: player.position.x, y: player.position.y}, "down");
    }

    if (cursors.left.isDown)
    {
        player.body.moveLeft(300);
        socket.emit("move", {id: myPlayerID, x: player.position.x, y: player.position.y}, "left");
        //player.body.velocity.x = -300;
    }
    else if (cursors.right.isDown)
    {
        player.body.moveRight(300);
        socket.emit("move", {id: myPlayerID, x: player.position.x, y: player.position.y}, "right");
    }
    
    //console.log('hello ', player.body);

    

}

function render() {

    game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.spriteCoords(player, 32, 500);

}



function actionOnClick () {

    button.destroy();

}