const chatForm = document.getElementById("chat-form");
const chatMessage = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const roomUsers = document.getElementById("users");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();
//Join chatroom
socket.emit("joinRoom", { username, room });

//Message frm server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);
  chatMessage.scrollTop = chatMessage.scrollHeight;
});

socket.on("roomUser", ({ room, users }) => {
  outputRoomName(room);
  outputRoomUser(users);
});

//Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //Get message text
  const msg = e.target.elements.msg.value;

  //Emit message to server
  socket.emit("chatMessage", msg);
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//Output Message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = ` <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
     ${message.text}
    </p>`;

  document.querySelector(".chat-messages").appendChild(div);
}

//Add room to user
function outputRoomName(room) {
  roomName.innerText = room;
}

function outputRoomUser(users) {
  roomUsers.innerHTML = `${users
    .map((user) => `<li>${user.username}</li>`)
    .join("")}`;
}
