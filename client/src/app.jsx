import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function App() {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    socket.on("chatMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("typing", (user) => {
      setTypingUser(user);
      setTimeout(() => setTypingUser(""), 2000);
    });

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => socket.disconnect();
  }, []);

  const login = () => {
    if (username.trim()) {
      socket.emit("join", username);
      setIsLoggedIn(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("chatMessage", { username, message });
      setMessage("");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      {!isLoggedIn ? (
        <div className="flex flex-col gap-3">
          <input
            className="p-2 border"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className="bg-blue-600 text-white p-2" onClick={login}>
            Join Chat
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-3">Global Chat</h2>

          <div className="text-sm mb-2 text-gray-600">
            Online: {onlineUsers.join(", ")}
          </div>

          <div className="border h-80 p-3 overflow-y-auto bg-gray-100 mb-3">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2">
                <strong>{msg.username}: </strong> {msg.message}
              </div>
            ))}

            {typingUser && (
              <div className="italic text-gray-500">{typingUser} is typing...</div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              className="flex-1 p-2 border"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                socket.emit("typing", username);
              }}
              placeholder="Type message..."
            />
            <button className="bg-green-600 text-white p-2" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
