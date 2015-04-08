// enforce strict/clean programming
"use strict";
var LIB_PATH = "./";
require(LIB_PATH + "Config.js");

function BirdServer() {
	var web_sockets;
	var players = [];
	var controllers;
	var player_count = 0;

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
		for (id in sockets) {
			sockets[id].write(JSON.stringify(msg));
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
	var unicast = function(socket, msg) {
		socket.write(JSON.stringify(msg));
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
			type: "message",
			content: "Your are new player"
		});

		var new_player = new Player();
		players[conn.id] = new_player;
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
			console.log(conn);
			// Sends to client
			broadcast({
				type: "message",
				content: "There is a new player with " + conn.id
			});

			if (player_count == 2) {
				// Send back message that game is full
				unicast(conn, {
					type: "message",
					content: "The game is full.  Come back later"
				});
				// TODO: force a disconnect
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
				delete players[conn.id];

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

				var thisPlayer = players[conn.id];
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
			prefix: '/'
		});
		httpServer.listen(Config.WEBPORT, '0.0.0.0');
		app.use(express.static(__dirname));
	}
}

var gameServer = new BirdServer();
gameServer.start();