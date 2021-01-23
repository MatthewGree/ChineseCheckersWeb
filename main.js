

var canSend = false;
var moveFrom = "";
var moveTo = ""
var currentMoveFrom = "";

var socket = new Websock("ws://localhost:4888");

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
	console.log("response gotten from server: " + response);
	var messageBox = document.getElementById("messageField");
	switch (response) {
		case "your_turn\n":
			messageBox.innerHTML = "It's your turn";
			canSend = true;
			break;
		case "move_success\n":
			messageBox.innerHTML = "Move ok";
			move(currentMoveFrom, moveTo);
			break;
		case "move_wrong\n":
			messageBox.innerHTML = "Wrong move";
			canSend = true;
			break;
		case "you_finished\n":
			messageBox.innerHTML = "You finished";
			break;
		case "skip_success\n":
			messageBox.innerHTML = "You skipped a turn";
		default:
			initCheckers(response);
			var arr = response.split(" ");
			if (arr[0] == "move") {
				move(arr[1], arr[2].trim());
			}
			break;
	}
}

function initCheckers(type) {
	if (type == "TwoPlayerChineseCheckers\n") {
		fillWithCheckers(2);
		socket.send_string("OK\n")
	} else if (type == "ThreePlayerChineseCheckers\n") {
		fillWithCheckers(3);
		socket.send_string("OK\n")
	}  else if (type == "FourPlayerChineseCheckers\n") {
		fillWithCheckers(4);
		socket.send_string("OK\n")
	}  else if (type == "SixPlayerChineseCheckers\n") {
		fillWithCheckers(6);
		socket.send_string("OK\n")
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
	var lineFound = false;
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
	}
	return socket.rQshiftStr(length);
}
