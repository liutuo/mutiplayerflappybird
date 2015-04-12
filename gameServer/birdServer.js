// enforce strict/clean programming
"use strict";
var LIB_PATH = "./";
require(LIB_PATH + "Config.js");

function BirdServer() {
	var web_sockets = {}; // Associative array for web sockets, indexed via player ID
	var birds = {};
	var controllers; // controllers 1 and 2.
	var player_count = 0;
	var nextPID;
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
			unicast(web_sockets[id], {
				type: "connect",
				id: index,
				isMyself: true,
			});
		}

		var bird = new Bird();
		birds[nextPID] = bird;

		web_sockets[nextPID] = conn;
		controllers[nextPID] = "empty";

		nextPID = ((nextPID + 1) % 2 === 0) ? 2 : 1;
	}

	this.start = function() {
		var express = require('express');
		var http = require('http');
		var sockjs = require('sockjs');
		var sock = sockjs.createServer();
		var net = require("net");

		//establish connection between server and web client
		sock.on('connection', function(conn) {
			console.log("connected");
			console.log(conn.id);
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

				// delete player
				player_count--;



			});

			// When the client send something to the server.
			conn.on('data', function(data) {
				console.log("data");
				var message = JSON.parse(data);

				switch (message.type) {
					default: console.log("Unhandled " + message.type);
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
				swtich(message.type) {
					case "connect":
						if (controllers[message.id] === undefined || controllers[message.id] !== "empty") {
							socket.write("NOT OK\n");
						} else {
							controllers[message.id] = "taken";
							socket.write("OK\n");
						}
						break;
					case "ready":
						controllers[message.id] = "ready";
						if (isAllReady()) {
							isGameStarted = true;
							gameInterval = setInterval(function() {gameLoop();}, Config.SERVER_INTERVAL);
							broadcast({
								type:"start",
								timestamp: getCurrentTime();
							});
						}
						break;
					case "shake":
						if (isGameStarted) {
							birds[message.id].birdFlap();
						}
						break;
					case "disconnect":
						delete controllers[message.id];
						isGameStarted = false;
						resetGame();
						break;
					case "restart":

						break;
					default:
						break;
				}

			});

			// Add a 'close' event handler to this instance of socket
			socket.on('close', function(data) {
				console.log('CLOSED: ' + socket.remoteAddress + ' ' + socket.remotePort);
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

	var getCurrentTime() {
		var date = new Date();
		var currentTime = date.getTime();
		return currentTime;
	}
	
	var resetGame = function() {
		gameInterval = undefined;
	}

	var gameLoop = function() {
		

		var birdArr = [];
		var id;
		for (id in birds) {
			var bird = birds[id];
			bird.updatePositiion(Config.SERVER_INTERVAL);
			var position = bird.getBirdPosition();
			position["id"] = id;
			birdArr.push(position);
		}

		unicast(web_sockets[id], {
			type: update,
			timestamp: getCurrentTime(),
			birds: birdArr
		});
	}
}

var gameServer = new BirdServer();
gameServer.start();