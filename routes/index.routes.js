const router = require("express").Router();
const http = require("http")
router.get("/", (req, res, next) => {
  res.json("All good in here");
});


router.get("/video", (req, res, next) => {
  try{
    const server = http.createServer(app)
const io = require("socket.io")(server, {
	cors: {
		origin: `http://localhost:${PORT}`,
		methods: [ "GET", "POST" ]
	}
})

io.on("connection", (socket) => {
	socket.emit("me", socket.id)

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	})

	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	})

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	})
})

res.json("Video route reached");
} catch (err) {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
}
});
module.exports = router;

