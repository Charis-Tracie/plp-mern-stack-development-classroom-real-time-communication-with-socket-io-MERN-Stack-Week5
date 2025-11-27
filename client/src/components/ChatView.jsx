// client/src/components/ChatView.jsx
import React, { useEffect, useRef, useState } from 'react';
import MessageItem from './MessageItem';
import FileUploader from './FileUploader';
import { socket, useSocket } from '../socket/socket';

export default function ChatView({ username }) {
  const { connect, disconnect, sendMessage, messages, users, typingUsers, isConnected, setTyping, socket: sock } = useSocket();
  const [text, setText] = useState('');
  const [room, setRoom] = useState('global');
  const [privateTarget, setPrivateTarget] = useState(null);
  const [loadedMessages, setLoadedMessages] = useState([]);
  const [offset, setOffset] = useState(0);
  const listRef = useRef();

  useEffect(() => {
    connect(username);
    return () => disconnect();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // sync hook messages into local view
    setLoadedMessages(messages);
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const payload = {
      text,
      room: privateTarget ? `private:${username}:${privateTarget.id}` : room,
      isPrivate: !!privateTarget,
      to: privateTarget ? privateTarget.id : null,
    };

    // use socket emit with acknowledgement
    sock.emit('send_message', payload, (ack) => {
      // ack: { id, status }
      // optional: update local message if needed
    });

    setText('');
    setTyping(false);
  };

  const handleTyping = (val) => {
    setText(val);
    setTyping(val.length > 0);
  };

  const handleUpload = ({ name, type, base64 }) => {
    // send as attachment: for demo we send base64 and render on clients
    const payload = {
      text: `${username} sent a file: ${name}`,
      attachments: [{ name, type, base64 }],
      room: privateTarget ? `private:${username}:${privateTarget.id}` : room,
      isPrivate: !!privateTarget,
      to: privateTarget ? privateTarget.id : null,
    };

    // emit
    sock.emit('send_message', payload);
  };

  const onReact = (messageId, emoji) => {
    sock.emit('add_reaction', { messageId, emoji });
  };

  // show typing users
  const typingLabel = typingUsers.length ? `${typingUsers.join(', ')} typing...` : '';

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      <div className="col-span-1">
        <div className="bg-gray-800 p-4 rounded h-[80vh]">
          <h3 className="text-lg">Users</h3>
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between p-2">
              <div>{u.username}</div>
              <button onClick={() => setPrivateTarget(u)} className="bg-blue-600 px-2 rounded text-sm">PM</button>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-3 bg-gray-800 p-4 rounded h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div>Room: {privateTarget ? `Private with ${privateTarget.username}` : room}</div>
          <div className="text-sm text-gray-300">{isConnected ? 'Connected' : 'Disconnected'}</div>
        </div>

        <div ref={listRef} className="flex-1 overflow-auto space-y-2 mb-2">
          {loadedMessages.map(m => (
            <MessageItem onReact={onReact} key={m.id} msg={m} currentUser={username} />
          ))}
        </div>

        <div className="text-sm text-gray-300 mb-2">{typingLabel}</div>

        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => handleTyping(e.target.value)}
            className="flex-1 p-2 rounded text-black"
            placeholder="Type a message..."
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          />
          <FileUploader onUpload={handleUpload} />
          <button onClick={handleSend} className="px-4 py-2 bg-green-600 rounded">Send</button>
        </div>
      </div>
    </div>
  );
}
