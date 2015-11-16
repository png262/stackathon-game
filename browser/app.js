$(function() {

var socket = io(window.location.origin);
var game;
var myPlayerID = null;
var players = {};
var playersarr =[];
var player;
var initUsers;
var cursors;
var leftnet;
var ball;
var scoreString = 'Score : ';
var leftscore = 0;
var rightscore = 0;
var LeftScoreBoard;
var RightScoreBoard;
var host = false;
var gameRunning = false;

function createPlayer(player_id, x, y, r, name, team) {
    var icon;
    console.log("creating player", player_id +"at x: "+x+"    y: "+y+" --- ");
    if(team == 1)
        icon = 'playericon'
    else
        icon = 'playericon2'

    players[player_id] = game.add.sprite(x, y, icon);
    var style = { font: "12px Arial", fill: "#ffffff" }
    var label_score = game.add.text(-10,20,name, style);
    players[player_id].addChild(label_score);

    playersarr.push(players[player_id]);
    game.physics.arcade.enable(players[player_id]);
    players[player_id].body.collideWorldBounds = true;
    players[player_id].body.maxVelocity.set(150);
    players[player_id].body.drag.set(30);
    players[player_id].anchor.set(0.5);
    players[player_id].rotation = r;
}

function respawnPlayers() {
    for (var key in players) {
        players[key].kill();
        players[key].reset(initUsers[key].spawn_x, initUsers[key].spawn_y);
        players[key].rotation = initUsers[key].spawn_r;
    }
}


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

    //create ball
    ball = game.add.sprite(game.world.centerX, game.world.centerY, bmd);
    game.physics.arcade.enable(ball);
    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1.1,1.1);
    ball.body.drag.set(5);

    //create left and right goals
    leftgoal = game.add.sprite(0,game.world.centerY/2,bmd2)
    rightgoal = game.add.sprite(game.world.width-10, game.world.centerY/2,bmd2)

    LeftScoreBoard = game.add.text(10, 10, scoreString + leftscore, { font: '20px Arial', fill: '#fff' });
    RightScoreBoard = game.add.text(game.world.width-150, 10, scoreString + rightscore, { font: '20px Arial', fill: '#fff' });


    game.physics.arcade.enable(leftgoal);
    game.physics.arcade.enable(rightgoal);

    console.log(initUsers)
    for(var key in initUsers) {
        createPlayer(key, initUsers[key].spawn_x, initUsers[key].spawn_y, initUsers[key].spawn_r, initUsers[key].name, initUsers[key].team);
    }

    cursors = game.input.keyboard.createCursorKeys();

    console.log("finished creating game")
    gameRunning = true;
}

function update() {
    // if(player.body.position.x != lastPosition.x || player.body.position.y != lastPosition.y) {
    //socket.emit("move", {id: myPlayerID, x: player.position.x, y: player.position.y, r: player.rotation}, "right");

    if(host) {
        if (cursors.up.isDown)
        {
            game.physics.arcade.accelerationFromRotation(players[myPlayerID].rotation, 200, players[myPlayerID].body.acceleration);
        }
        else
        {
            players[myPlayerID].body.acceleration.set(0);
        }

        if (cursors.left.isDown)
        {
            players[myPlayerID].body.angularVelocity = -100;
        }
        else if (cursors.right.isDown)
        {
            players[myPlayerID].body.angularVelocity = 100;
        }
        else
        {
            players[myPlayerID].body.angularVelocity = 0;
        }
        
        //emit ball position
        socket.emit('move', {id: 'ball', x: ball.position.x, y: ball.position.y, r: ball.rotation})
        
        //emit player position
        for(var key in players) {
            if(key != myPlayerID) {
                players[key].body.acceleration.set(0);
                players[key].body.angularVelocity = 0;
            }
            socket.emit('move', {id: key, x: players[key].x, y: players[key].y, r: players[key].rotation})
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

    game.physics.arcade.collide(ball, playersarr);
    game.physics.arcade.collide(playersarr, playersarr)

    if(game.physics.arcade.overlap(ball,leftgoal)) {
        console.log("GOAL!")
        rightscore++
        RightScoreBoard.text = scoreString+rightscore;
        ball.kill();
        ball.reset(game.world.centerX, game.world.centerY)
        respawnPlayers();
        socket.emit('scoreboardUpdate', leftscore, rightscore)
    }

    if(game.physics.arcade.overlap(ball,rightgoal)) {
        console.log("GOAL!")
        leftscore++ 
        LeftScoreBoard.text = scoreString+leftscore;
        ball.kill();
        ball.reset(game.world.centerX, game.world.centerY);
        respawnPlayers();
        socket.emit('scoreboardUpdate', leftscore, rightscore)
    }
}


function render() {

    //game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.spriteCoords(players[myPlayerID], 32, 500);

}

socket.on('connect', function(){
    console.log("I have connected to the server")
})

socket.on('currentUsers', function(allUsers) {
    var str = "Users in Lobby: "+Object.keys(allUsers).length+ " ::: "
    for (var key in allUsers) {
        str += allUsers[key].name+","
    }
    $('#lobbystatus').text(str);
})

socket.on('setPlayer', function(socketid){
    myPlayerID=socketid;
})

socket.on('stroke', function(player_id, key) {
    if (host && players[player_id]) {
        if(key == 'up')
            game.physics.arcade.accelerationFromRotation(players[player_id].rotation, 200, players[player_id].body.acceleration);
        else if(key == 'left')
            players[player_id].body.angularVelocity = -100;
        else
            players[player_id].body.angularVelocity = 100;
    }
})

socket.on('move', function(moveObj) {
    //console.log( "player"+moveObj.id+" moved to x:"+moveObj.x +" and y:" +moveObj.y);
    if(!host) {
        if (moveObj.id === 'ball' && ball) {
            ball.x = moveObj.x;
            ball.y = moveObj.y;
        }
        else if(players[moveObj.id]) {
            players[moveObj.id].x= moveObj.x
            players[moveObj.id].y= moveObj.y
            players[moveObj.id].rotation = moveObj.r;
        }   
    }
})

$('#joinbutton').click(function() {
    var name = $('#namefield').val();
    socket.emit('login', name);
    $(this).prop("disabled",true);
})

$('#startbutton').click(function() {
    console.log("emitted start game")
    socket.emit('startgame');
    $(this).prop("disabled",true);
})


socket.on('forceDisconnect', function() {
    var str = "Sorry, max players exceeded"
    $('#lobbystatus').text(str);
})

socket.on('initializeUsers', function(allUsers) {
    console.log("allUsers", allUsers)
    if(myPlayerID) {
        initUsers = allUsers;
        game = new Phaser.Game(1200, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });
    }
    else {
        socket.emit('disconnectme');
    }
})

socket.on('scoreboardUpdate', function(left, right) {
    LeftScoreBoard.text = scoreString+left;
    RightScoreBoard.text = scoreString+right;

})


/*
    var game = new Phaser.Game(1200, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });





    socket.on("new_player", function(player_id, ct){
        if (player_id !== 'ball') {
            console.log("A new player has joined", player_id)
            createPlayer(player_id, game.world.centerX, game.world.centerY, ct);
        }
    })




        

    socket.on('player_left', function(socket_id) {
            players[socket_id].kill();
        })

*/

socket.on('setHost', function() {
    console.log("setting host")
    host = true;
    $('#startbutton').removeAttr('disabled')
})


});

