const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const { World, Chunk } = require("./src/world")
const { WorldGeneration } = require("./src/worldgen")
const { Player } = require("./src/player")
const { UtilitiesClass } = require("./src/utils")

app.use(express.static("client"));

const worldBounds = [20, 20];
const chunkSize = 120;

const worldGen = new WorldGeneration(worldBounds, chunkSize);
const world = new World(worldGen);

const utils = new UtilitiesClass();

hello = () => {
    console.log("hello")
}

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    world.players[socket.id] = new Player(0, 0, socket.id);
    world.players[socket.id].color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`

    socket.emit("initialize", { world, playerId: socket.id });
    socket.broadcast.emit("playerJoined", world.players[socket.id]);

    /*socket.on("playerMove", (playerData) => {
        let player = world.players[socket.id];
        if(!player) return;

        world.players[socket.id].x = playerData.x;
        world.players[socket.id].y = playerData.y;
        world.players[socket.id].angle = playerData.angle;

        socket.broadcast.emit("playerMoved", { playerId: socket.id, x: playerData.x, y: playerData.y, angle: playerData.angle });
    });*/

    socket.on("playerMove", (playerData) => {
        const player = world.players[socket.id];
        if (!player) return;
      
        const newX = playerData.x;
        const newY = playerData.y;
        player.x = newX;
        player.y = newY;
        player.angle = playerData.angle;

        // console.log(playerData)
      
        socket.broadcast.emit("playerMoved", { playerId: socket.id, x: player.x, y: player.y, angle: player.angle });
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        delete world.players[socket.id];
        socket.broadcast.emit("playerDisconnected", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
