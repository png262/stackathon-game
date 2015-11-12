var socket = io(window.location.origin);
var canvas = document.querySelector("#paint");
var ctx = canvas.getContext('2d');
var button = document.querySelector("#save");

socket.on('connect', function(){
	socket.on("load", function(state){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		var image = new Image();
		image.src = state;
		image.onload = function(){
			ctx.drawImage(image, 0,0);
		}
	})

	whiteboard.on("draw", function(start,end,color){
		socket.emit("draw", start, end, color);

	})

	$("#save").on("click", function(){
		var canvasState = canvas.toDataURL();
		console.log(canvasState);
		socket.emit('save', canvasState);
	})

	$("#kitchen").on("click", function(){
		socket.emit("the-kitchen");
	})

	$("#grace-hopper").on("click", function(){
		socket.emit("grace-hopper");
	})

	$("#turing").on("click", function(){
		socket.emit("turing-hall");
	})

})


socket.on("draw", function(start, end, color){
	whiteboard.draw(start, end, color, false);
})