// enforce strict/clean programming
"use strict";
var LIB_PATH = "./";
require(LIB_PATH + "bird.js");
require(LIB_PATH + "map.js");
require(LIB_PATH + "Config.js");
// require()

function BirdServer() {
	var web_sockets = {}; // Associative array for web sockets, indexed via player ID
	var birds = {};
	var controllers = {}; // controllers 1 and 2.
	var map;
	var player_count = 0;
	var nextPID = 1;
	var timeToGenerateTube = 0;
	var startX = 500;
	var nearestTubeLastPoint = 750;
	var screenX = 0;
	var isGameStarted = false;
	var gameInterval;
	/*
	 * private method: broadcast(msg)
	 *
	 * broadcast takes in a JSON structure and send it to
	 * all players.
	 *
	 * e.g., broadcast({type: "abc", x: 30});
	 */
	var broadcast = function(msg) {
		var id;
		for (id in web_sockets) {
			web_sockets[id].write(JSON.stringify(msg));
		}
	}

	/*
	 * private method: unicast(socket, msg)
	 *
	 * unicast takes in a socket and a JSON structure
	 * and send the message through the given socket.
	 *
	 * e.g., unicast(socket, {type: "abc", x: 30});
	 */
	var unicast = function(sk, msg) {
		sk.write(JSON.stringify(msg));
	}

	/*
	 * private method: newPlayer()
	 *
	 * Called when a new connection is detected.
	 * Create and init the new player.
	 */
	var newPlayer = function(conn) {
		player_count++;

		// Send message to new player (the current client)
		unicast(conn, {
			type: "connect",
			id: nextPID,
			isMyself: true,
		});

		var index;
		for (index in web_sockets) {
			unicast(web_sockets[index], {
				type: "connect",
				id: nextPID,
				isMyself: false,
			});
			unicast(conn, {
				type: "connect",
				id: index,
				isMyself: false,
			});

		}

		var bird = new Bird();
		bird.init();

		birds[nextPID] = bird;
		console.log("new player with id " + nextPID + " created");
		web_sockets[nextPID] = conn;
		controllers[nextPID] = "empty";

		unicast(conn, {
			type: "new_tube",
			tubes: map.getTubeQueue(),
			screen_x : screenX
		});

		nextPID = ((nextPID + 1) % 2 === 0) ? 2 : 1;
	}

	this.start = function() {
		var express = require('express');
		var http = require('http');
		var sockjs = require('sockjs');
		var sock = sockjs.createServer();
		var net = require("net");

		map = new Map();

		//generate 3 initial tubes
		for (var i = 0; i < 3; i++) {
			map.generateNewTubePair(startX);
			startX += Config.TUBE_BLOCK;
		}

		//establish connection between server and web client
		sock.on('connection', function(conn) {
			// Sends to client

			if (player_count == 2) {
				// Send back message that game is full
				unicast(conn, {
					type: "message",
					content: "The game is full.  Come back later"
				});
			} else {
				// create a new player
				newPlayer(conn);
			}

			// When the client closes the connection to the server/closes the window
			conn.on('close', function() {
				console.log("close");

				// stop the game
				resetGame();

				// delete player
				player_count--;

			});

			// When the client send something to the server.
			conn.on('data', function(data) {
				console.log("data");
				var message = JSON.parse(data);

				switch (message.type) {
					case "start":
						if (!isGameStarted) {
							startGame();
						}

						break;
					default:
						console.log("Unhandled " + message.type);
				}
			});
		});

		// Standard code to starts the Sockick server and listen
		// for connection
		var app = express();
		var httpServer = http.createServer(app);
		sock.installHandlers(httpServer, {
			prefix: '/bird'
		});
		httpServer.listen(Config.WEBPORT, '0.0.0.0');
		app.use(express.static(__dirname));


		net.createServer(function(socket) {

			// We have a connection - a socket object is assigned to the connection automatically
			console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);

			// Add a 'data' event handler to this instance of socket
			socket.on('data', function(data) {
				var message = JSON.parse(data);
				console.log(message);
				switch (message.type) {
					case "connect":
						console.log(message.prefered_id);
						if (controllers[message.prefered_id] === undefined || controllers[message.prefered_id] !== "empty") {

							socket.write("CONNECT NOT OK\n");
						} else {
							controllers[message.prefered_id] = "taken";
							socket.write("CONNECT OK\n");
						}
						break;
					case "ready":
						controllers[message.id] = "ready";

						if (isAllReady()) {
							// tell client to start
							broadcast({
								type: "start",
								timestamp: getCurrentTime()
							});
							socket.write("READY OK\n");
						} else {
							socket.write("READY NOT OK\n");
						}

						break;
					case "shake":
						if (isGameStarted) {
							birds[message.id].birdFlap();
						}
						socket.write("SHAKE OK\n")
						break;
					case "disconnect":
						delete controllers[message.id];
						resetGame();
						socket.write("DISCONNECT OK");
						break;
					case "restart":
						socket.write("RESTART OK");
						break;
					default:
						break;
				}

			});

			// Add a 'close' event handler to this instance of socket
			socket.on('close', function(data) {
				// console.log('CLOSED: ' + socket.remoteAddress + ' ' + socket.remotePort);
			});

		}).listen(4222, Config.SERVER_NAME);
	}

	var isAllReady = function() {
		if (player_count < 2) {
			return false;
		}
		var id;
		for (id in controllers) {
			if (controllers[id] !== "ready")
				return false;
		}

		return true;
	}

	var getCurrentTime = function() {
		var date = new Date();
		var currentTime = date.getTime();
		return currentTime;
	}

	var startGame = function() {
		isGameStarted = true;
		gameInterval = setInterval(function() {
			gameLoop();
		}, Config.SERVER_INTERVAL);
	}

	var resetGame = function() {

		isGameStarted = false;
		if (gameInterval !== undefined) {
			clearInterval(gameInterval);
			// gameInterval = undefined;
		}
	}


	var detectCollision = function(bird, tube) {
		if (bird.x + Config.BIRD_FRAME_WIDTH < tube.x || tube.x + tube.w < bird.x ||
			bird.y + Config.BIRD_FRAME_HEIGHT < tube.y || tube.y + tube.h < bird.y) {

			return false;
		} else {
			return true;
		}
	}



	var gameLoop = function() {
		screenX += Config.SERVER_INTERVAL / 1000 * Config.FORWARD_VELOCITY;

		// check if add new tube and delete the passed tubes
		if (startX - screenX < 1250) {
			
			var tubePair = map.generateNewTubePair(startX);
			broadcast({
				type: "new_tube",
				tubes: tubePair,
				screen_x : screenX
			});
			startX += 250;
			console.log("new tube", tubePair);
		}
		if (nearestTubeLastPoint - screenX < 248) {
			map.deleteTube()
			nearestTubeLastPoint += 250;
		}
		// update bird position
		var birdArr = [];
		var id;
		for (id in birds) {
			var bird = birds[id];
			bird.updatePositiion(Config.SERVER_INTERVAL / 1000);
			var position = {
				id: id,
				x: bird.x,
				y: bird.y
			};
			birdArr.push(position);
		}

		// detect collision
		var tubePair = map.getNearestTubePair();
		var i, j;
		for (i in birds) {
			for (j in tubePair) {
				if (detectCollision(birds[i], tubePair[j])) {
					// bird i die
					console.log(birds[i], tubePair[j], screenX);
					broadcast({
						type: "end",
						timestamp: getCurrentTime(),
						loser: i,
						distance: 0
					});
					resetGame();
					return;
				}

			}
			unicast(web_sockets[i], {
				type: "update",
				timestamp: getCurrentTime(),
				birds: birdArr,
				screen_x: screenX
			});
		}
	}
}

var gameServer = new BirdServer();
gameServer.start();