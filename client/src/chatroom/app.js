import React, { useCallback, useEffect, useState } from 'react';

import ChatInput from './components/ChatInput';
import ChatMessages from './components/ChatMessages';
import ReactDOM from 'react-dom';
import UserList from './components/UserList';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

// Persist user id on local storage
const USER_ID = (() => {
  let userId = localStorage.getItem('chatUserId');
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem('chatUserId', userId);
  }
  return userId;
})();

console.log({ USER_ID });
function Chatroom() {
  const [messages, setMessages] = useState([]);
  const [userList, setUserList] = useState([]);
  const [userInfo, setUserInfo] = useState({ name: 'null' });
  const [socketRef, setSocketRef] = useState(null);

  // User Action Event Handlers
  const handleSendMsg = useCallback(
    (msg) => socketRef && socketRef.emit('newMsg', msg),
    [socketRef]
  );

  useEffect(() => {
    const socket = io();

    // Socket.io Event handlers
    const handleReceivedMsg = (msgNameTime) =>
      setMessages((oldMsgs) => [...oldMsgs, msgNameTime]);

    const handleReceivedUserInfo = (data) => {
      setUserInfo(data);
      setSocketRef(socket);
    };

    const handleReceivedUserListUpdate = ({ type, payload }) => {
      switch (type) {
        case 'INITIAL_LOAD':
          setUserList(payload);

          break;
        case 'USER_SIGN_OUT':
          setUserList((userList) =>
            userList.filter((name) => name !== payload)
          );

          break;
        case 'USER_SIGN_IN':
          setUserList((userList) => [...new Set(userList).add(payload)]);
          break;

        case 'USER_NAME_CHANGE':
          setUserList((userList) => [
            ...userList.filter((name) => name !== payload.oldName),
            payload.newName,
          ]);
          break;
        default:
          throw new Error(`Unknown UserListUpdate event type: ${type}`);
          break;
      }
    };

    const handleReceivedMessageHistory = (data) => setMessages(data);

    // Socket.io Event Listeners
    socket.on('messageHistory', handleReceivedMessageHistory);
    socket.on('userInfo', handleReceivedUserInfo);
    socket.on('newMsg', handleReceivedMsg);
    socket.on('userListUpdate', handleReceivedUserListUpdate);

    // Request UserInfo, MessageHistory, UserList
    socket.emit('getUserInfo', USER_ID);
    socket.emit('getMessageHistory');
  }, []);
  return (
    <div style={{ display: 'flex' }}>
      <UserList users={userList} />
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        <ChatMessages messages={messages} />
        <ChatInput user={userInfo.name} onSend={handleSendMsg} />
      </div>
    </div>
  );
}

ReactDOM.render(<Chatroom />, document.getElementById('root'));
