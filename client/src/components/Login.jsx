// client/src/components/Login.jsx
import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    onLogin(username.trim());
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={submit} className="bg-gray-800 p-6 rounded shadow w-full max-w-sm">
        <h2 className="text-2xl mb-4">Join Chat</h2>
        <input
          className="w-full p-2 mb-3 rounded text-black"
          placeholder="Enter username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <button className="w-full bg-blue-600 p-2 rounded">Join</button>
      </form>
    </div>
  );
}
