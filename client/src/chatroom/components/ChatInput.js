import React, { useRef } from 'react';

export default function ChatInput({ user, onSend }) {
  const inputRef = useRef(null);

  const sendClearAndFocusInput = () => {
    const msg = inputRef.current.value;
    if (msg) {
      onSend(msg);
      inputRef.current.value = '';
    }
    inputRef.current.focus();
  };

  const handleKeyDown = (e) => e.key === 'Enter' && sendClearAndFocusInput();

  return (
    <div style={{ display: 'flex' }}>
      <label style={{ flex: 1, paddingRight: '5px' }}>
        {user ? user + ':' : null}
      </label>
      <input
        type="text"
        style={{ boxSizing: 'border-box', width: '100%' }}
        onKeyDown={handleKeyDown}
        ref={inputRef}
      ></input>

      <button onClick={sendClearAndFocusInput}>Send</button>
    </div>
  );
}
