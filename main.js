var socket = new Websock();

function myFunc() {
	console.log("Creating socket");
	socket.open("ws://localhost:4888");
	console.log("Created socket");
	socket.send_string("hello server\n");
	console.log("message sent");
}
