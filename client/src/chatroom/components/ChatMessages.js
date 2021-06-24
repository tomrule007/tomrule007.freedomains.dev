import React, { useEffect, useRef } from 'react';

export default function ChatMessages({ messages }) {
  const messageEndDiv = useRef(null);
  useEffect(() => {
    if (messageEndDiv.current)
      messageEndDiv.current.scrollIntoView({ behavior: 'smooth' });
  });

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        margin: '10px',
      }}
    >
      {messages.map(({ time, sender, msg }, index) => (
        <div style={{ borderTop: '1px solid black' }} key={index}>
          <b>{sender}</b> <small>{new Date(time).toLocaleString()}</small>
          <div style={{ marginTop: '3px' }}>{msg}</div>
        </div>
      ))}
      <div ref={messageEndDiv}></div>
    </div>
  );
}
