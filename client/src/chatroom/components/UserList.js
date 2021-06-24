import React from 'react';

export default function UserList({ users }) {
  return (
    <div>
      Online Users
      <ul>
        {users.map((name, index) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  );
}
