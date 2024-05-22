require('dotenv').config();

const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
// Peer

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  console.log('req', req)

  const caseId = req.query.caseId;
  const userId = req.query.userId;

  // check in db
  /**
   * db schema will be like caseId , roomId, users (only allowed users)
   * caseId and users should be update while booking appointment (user id is required to restrict the user)
   * if when user comes here if caseId is not present return appropriate response
   * if user Id is not present return appropriate response in session details
   * if rooId is present return room id
   * if room id is not present create new room Id store in db and return room id
   */

  if (!caseId) {
    res.status(200).send("Case Id Not Found");
    return;
  }
  if (!userId) {
    res.status(200).send("User Id Not Found");
    return;
  }
  
  const roomId = caseId; // here roomId should be updated as per db response

  res.redirect(`/${roomId}`);
  
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    // socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
  });
});

server.listen(process.env.PORT || 3030, () => {
  console.log(`server running on PORT ${process.env.PORT || 3030}`)
});
