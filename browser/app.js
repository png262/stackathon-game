var socket = io(window.location.origin);
var canvas = document.querySelector("#paint");
var ctx = canvas.getContext('2d');
var button = document.querySelector("#save");

socket.on('connect', function(){
	// socket.on("load", function(state){
	// 	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// 	var image = new Image();
	// 	image.src = state;
	// 	image.onload = function(){
	// 		ctx.drawImage(image, 0,0);
	// 	}
	// })
	console.log("I have connected to the server")

	whiteboard.on("draw", function(start,end,color){
		socket.emit("draw", start, end, color);

	})



})


socket.on("draw", function(start, end, color){
	whiteboard.draw(start, end, color, false);
})