// enforce strict/clean programming
"use strict";
var LIB_PATH = "./";
require(LIB_PATH + "Config.js");
//require(LIB_PATH + "player.js")

function BirdServer() {
	var web_sockets = {}; // Associative array for web sockets, indexed via player ID
	var birds = {};
	var controllers; // controllers 1 and 2.
	var player_count = 0;
	var nextPID;
	var occupied = [0, 0];
	var gameover = [0, 0];

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

		// players[conn.id] = new Player(conn.id, nextPID);
		web_sockets[nextPID] = conn;

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
				// Set nextPID to quitting player's PID
				nextPID = players[conn.id].pid;
				occupied[nextPID] = 0;
				gameover[nextPID] = 0;
				// Remove player who wants to quit/closed the window
				delete birds[conn.id];

				// Sends to everyone connected to server except the client
				broadcast({
					type: "message",
					content: " There is now " + player_count + " players."
				});

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
				console.log('data length is ' + data.length);
				if (data.toString().substr(0, data.length - 1) === "1") {
					if (occupied[1] == 0) { // available
						socket.write('Player 1\n');
						occupied[1] == 1;
					} else {
						socket.write('Player 2\n');
						occupied[2] == 1;
					}

				} else if (data.toString().substr(0, data.length - 1) === "2") {
					if (occupied[2] == 0) { //available
						socket.write('Player 2');
						occupied[2] == 1
					} else {
						socket.write('Player 1');
						occupied[1] == 1;
					}
				} else if (data.toString().substr(0, data.length - 1) === "SHAKE") {
					// get player id from data, check gameover array, if not gameover, send back OK, otherwise send "GAME OVER"
					// move up the bird for player id
					var id;
					// get player id

					if (gameover[id]) {
						socket.write('GAME OVER');
					} else {
						socket.write('OK');
						// update bird
					}
				} else if (data.toString().substr(0, data.length - 1) === "RESTART") {
					// get player id from data, check gameover array, if all gameover, send back "RESTART OK" , otherwise send "RESTART NOT OK"
				} else {
					console.log(data);
				}
				console.log('occupied is ' + occupied[1] + ' ' + occupied[2]);
				console.log('gameover is ' + gameover[1] + ' ' + gameover[2]);
				//sock.write(JSON.stringify({type:"playerid", content: "" + nextPID}));

			});

			// Add a 'close' event handler to this instance of socket
			socket.on('close', function(data) {
				console.log('CLOSED: ' + socket.remoteAddress + ' ' + socket.remotePort);
			});

		}).listen(4222, Config.SERVER_NAME);
	}
}

var gameServer = new BirdServer();
gameServer.start();