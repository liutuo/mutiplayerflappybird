"use strict"

function Player(sid, pid) {
	    // Public variables
    this.sid;   // Socket id. Used to uniquely identify players via 
                // the socket they are connected from
    this.pid;   // Player id. In this case, 1 or 2 
    this.bird;
    this.lastUpdated; // timestamp of last paddle update

    this.sid = sid;
    this.pid = pid;
    
    this.lastUpdated = new Date().getTime();
}

global.Player = Player;