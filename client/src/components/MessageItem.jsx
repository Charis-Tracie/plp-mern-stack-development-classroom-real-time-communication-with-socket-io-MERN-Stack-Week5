// client/src/components/MessageItem.jsx
import React from 'react';

export default function MessageItem({ msg, currentUser, onReact }) {
  const isMe = msg.sender === currentUser;
  const time = new Date(msg.timestamp).toLocaleTimeString();

  return (
    <div className={`mb-2 max-w-[70%] p-2 rounded ${isMe ? 'ml-auto bg-blue-600' : 'bg-gray-700'}`}>
      {msg.system ? (
        <div className="text-sm italic text-gray-300">{msg.message}</div>
      ) : (
        <>
          <div className="text-sm font-bold">{msg.sender} <span className="text-xs text-gray-300 ml-2">{time}</span></div>
          <div className="mt-1">{msg.text}</div>

          {msg.attachments && msg.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {msg.attachments.map((a, i) => (
                <div key={i}>
                  {a.type?.startsWith('image') ? (
                    <img src={a.url} alt={a.name} className="max-w-xs rounded" />
                  ) : (
                    <a href={a.url} target="_blank" rel="noreferrer">{a.name}</a>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center gap-2">
            <button onClick={() => onReact(msg.id, '👍')} className="text-sm">👍</button>
            <button onClick={() => onReact(msg.id, '❤️')} className="text-sm">❤️</button>
            <span className="text-xs text-gray-300 ml-2">Reactions: {Object.entries(msg.reactions || {}).map(([e, list]) => `${e} ${list.length}`).join(' • ')}</span>
          </div>
        </>
      )}
    </div>
  );
}
