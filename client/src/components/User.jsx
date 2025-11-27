// client/src/components/Users.jsx
import React from 'react';

export default function Users({ users, onStartPrivate }) {
  return (
    <div className="bg-gray-800 p-4 rounded h-full">
      <h3 className="text-lg mb-3">Online</h3>
      <ul className="space-y-2">
        {users.map(u => (
          <li key={u.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div>{u.username}</div>
            <button onClick={() => onStartPrivate(u)} className="px-2 py-1 bg-blue-600 rounded text-sm">PM</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
