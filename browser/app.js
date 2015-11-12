var socket = io(window.location.origin);

socket.on('connect', function(){
	console.log("I have connected to the server")

	// whiteboard.on("draw", function(start,end,color){
	// 	socket.emit("draw", start, end, color);

	// })

})


var players = {};


socket.on("new_player", function(player_id){
	console.log('in new player', player_id)
	game.load.image(player_id,'test.ico');
	players[player_id] = game.add.sprite(game.world.centerX-100, game.world.centerY-100, player_id);
	game.physics.p2.enable(players[player_id]);

})


// PHASER

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('background','debug-grid-1920x1920.png');
    game.load.image('player','favicon.ico');
    

}

var player;
var player2;
var cursors;

function create() {

    game.add.tileSprite(0, 0, 1920, 1920, 'background');

    game.world.setBounds(0, 0, 1920, 1920);

    game.physics.startSystem(Phaser.Physics.P2JS);

    player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');

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
        //player2.body.moveDown(300)
    }
    else if (cursors.down.isDown)
    {
        player.body.moveDown(300);
    }

    if (cursors.left.isDown)
    {
        player.body.moveLeft(300);
        //player.body.velocity.x = -300;
    }
    else if (cursors.right.isDown)
    {
        player.body.moveRight(300);
    }

    //console.log('hello ', player.body);

    

}

function render() {

    game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.spriteCoords(player, 32, 500);

}