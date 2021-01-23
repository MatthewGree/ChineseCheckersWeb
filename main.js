

var canSend = false;
var moveFrom = "";

var socket = new Websock();

function handleClick(id) {
	if (canSend && moveFrom != "") {
		//console.log("move " + moveFrom + " " + id);
		socket.send_string("move " + moveFrom + " " + id);
		moveFrom = "";
		canSend = false;
	} else {
		console.log("changing to " + id);
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
	console.log("waiting for response");
	var response = getResponse();
	console.log("response gotten: " + getResponse());
	console.log("waiting for response");
	var response = getResponse();
	console.log("response gotten: " + getResponse());
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
	fillWithCheckers(6);
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
		var arr = socket.get_rQ();
		for (let i = 0; i < socket.rQlen(); i++) {
			if (arr[i] = 10) {
				length = i+1;
				lineFound = true;
			}
		}
	}
	return socket.rQshiftStr(length);
}
