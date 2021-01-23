
var messageBox ;
var canSend = false;
var moveFrom = "";
var moveTo = ""
var currentMoveFrom = "";

var socket = new Websock("ws://localhost:4888");

function skipTurn() {
	if (canSend) {
		canSend = false;
		socket.send_string("skip_turn\n");
	}
}

function handleClick(id) {
	if (canSend && moveFrom != "") {
		console.log("Sending: move " + moveFrom + " " + id);
		moveTo = id;
		socket.send_string("move " + moveFrom + " " + moveTo + "\n");
		currentMoveFrom = moveFrom;
		moveFrom = "";
		canSend = false;
	} else {
		console.log("changing moveFrom to " + id);
		moveFrom = id;
	}
}

function fillWithCheckers(players) {
	var playerCoordinates = [];
	if (players == 2) {
		playerCoordinates = playerCoordinates.concat(getTrianglePoints(0, 12, 4, 1))
		playerCoordinates = playerCoordinates.concat(getTrianglePoints(16, 12, 4, -1))
	} else if (players == 3) {
		playerCoordinates = playerCoordinates.concat(getTrianglePoints(16, 12, 4, -1))
		playerCoordinates = playerCoordinates.concat(getTrianglePoints(7, 3, 4, -1))
		playerCoordinates = playerCoordinates.concat(getTrianglePoints(7, 21, 4, -1))
	} else if (players == 4) {
		playerCoordinates = playerCoordinates.concat(getTrianglePoints(7, 3, 4, -1))
		playerCoordinates = playerCoordinates.concat(getTrianglePoints(9, 3, 4, 1))
		playerCoordinates = playerCoordinates.concat(getTrianglePoints(7, 21, 4, -1))
		playerCoordinates = playerCoordinates.concat(getTrianglePoints(9, 21, 4, 1))
	} else if (players == 6) {
		playerCoordinates = playerCoordinates.concat(getTrianglePoints(0, 12, 4, 1))
		playerCoordinates = playerCoordinates.concat(getTrianglePoints(16, 12, 4, -1))
		playerCoordinates = playerCoordinates.concat(getTrianglePoints(7, 3, 4, -1))
		playerCoordinates = playerCoordinates.concat(getTrianglePoints(9, 3, 4, 1))
		playerCoordinates = playerCoordinates.concat(getTrianglePoints(7, 21, 4, -1))
		playerCoordinates = playerCoordinates.concat(getTrianglePoints(9, 21, 4, 1))
	}

	var checkerNumber = 0;
	for (let i = 0; i < playerCoordinates.length; i++) {
		if (i % 10 == 0) {
			checkerNumber++;
		}
		var checker = document.createElement("div");
		checker.classList.add("checker");
		checker.classList.add("checker" + checkerNumber.toString());
		var cellHTML = document.getElementById(playerCoordinates[i]);
		cellHTML.appendChild(checker);
	}
}

function initServerConnection() {
	messageBox.innerHTML = "Connecting...";
	var connectButton = document.getElementById("connectButton");
	connectButton.style.display="none";
	messageBox.style.display="block";
	var skipButton = document.getElementById("skipButton");
	skipButton.style.display="block";
	socket.open("ws://localhost:4888");
	console.log("setting startGame function");
	socket.on('open', startGame)

}

function startGame() {
	console.log("getting type from server");
	socket.on('message', handleServer)
}

function handleServer() {
	console.log("getting response from server");
	var response = getResponse();
	var arr = response.split("\n");
	console.log("response gotten from server: " + response);
	for (let i = 0; i < arr.length; i++) {
	switch (arr[i]) {
		case "your_turn":
			messageBox.innerHTML = "It's your turn";
			canSend = true;
			break;
		case "move_success":
			messageBox.innerHTML = "Move ok, wait for your turn";
			move(currentMoveFrom, moveTo);
			break;
		case "move_wrong":
			messageBox.innerHTML = "Wrong move";
			canSend = true;
			break;
		case "you_finished":
			messageBox.innerHTML = "You finished";
			break;
		case "skip_success":
			messageBox.innerHTML = "You skipped a turn";
		default:
			initCheckers(arr[i]);
			var arrr = arr[i].split(" ");
			if (arrr[0] == "move") {
				move(arrr[1], arrr[2].trim());
			}
			break;
	}
	}
}

function initCheckers(type) {
	var inited = false;
	if (type == "TwoPlayerChineseCheckers") {
		fillWithCheckers(2);
		inited = true;
	} else if (type == "ThreePlayerChineseCheckers") {
		fillWithCheckers(3);
		inited = true;
	}  else if (type == "FourPlayerChineseCheckers") {
		fillWithCheckers(4);
		inited = true;
	}  else if (type == "SixPlayerChineseCheckers") {
		fillWithCheckers(6);
		inited = true;
	}

	if (inited) {
		socket.send_string("OK\n");
		messageBox.innerHTML = "Wait for your turn";
	}
	
}

function move(from, to) {
	var A = document.getElementById(from);
	var B = document.getElementById(to);
	if (A.lastChild && !B.lastChild) {
		var child = A.lastChild;
		B.appendChild(child);
	}
}

function createTable() {
	var gameBoard = document.getElementById("gameBoard");
	for (let row = 0; row < 17; row++) {
		var rowHTML = document.createElement("tr");
		for (let column = 0; column < 25; column++) {
			var cell = document.createElement("td");
			cell.classList.add("cell");
			cell.id = row.toString() + "," + column.toString();
			rowHTML.appendChild(cell);
		}
		gameBoard.appendChild(rowHTML);
	}
}

function createBoard() {
	messageBox =  document.getElementById("messageField");
	createTable();
	highlightPlayableFields();
}

function highlightPlayableFields() {
	var triangle = getTrianglePoints(0, 12, 13, 1);
	triangle = triangle.concat(getTrianglePoints(16, 12, 13, -1))
	for (let i = 0; i < triangle.length; i++) {
		var cellHTML = document.getElementById(triangle[i]);
		cellHTML.classList.add("playableCell");
		cellHTML.onclick = function () {
			handleClick(this.id);
		}
	}
}

function getTrianglePoints(xBeg, yBeg, height, verticalDirection) {
	var result = [];
	var xPoint = xBeg;
	var yPoint = yBeg;
	var amountOfPoints = 1;
	for (let row = 0; row < height; row++) {
		for (let point = 0; point < amountOfPoints; point += 2) {
			result.push(xPoint.toString() + "," + (yPoint + point).toString());
		}
		xPoint += verticalDirection;
		yPoint -= 1;
		amountOfPoints += 2;
	}
	return result;
}

function getResponse() {
	/*var lineFound = false;
	var length = 0;
	while(!lineFound) {
		var arrLen = socket.rQlen();
		var arr = socket.get_rQ();
		var startingIndex = socket.get_rQi();
		for (let i = startingIndex; i < startingIndex + arrLen; i++) {
			if (arr[i] == 10) {
				length = i+1 - startingIndex;
				lineFound = true;
				break;
			}
		}
		lineFound = true;
	}*/
	return socket.rQshiftStr(socket.rQlen());
}
