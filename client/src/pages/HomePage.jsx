// client/src/pages/HomePage.jsx
import React, { useState } from 'react';
import Login from '../components/Login';
import ChatView from '../components/ChatView';

export default function HomePage() {
  const [username, setUsername] = useState(null);

  if (!username) {
    return <Login onLogin={setUsername} />;
  }

  return <ChatView username={username} />;
}
