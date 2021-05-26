const AUTH_KEY = 'AUTH_KEY'; // used to store jwt token in local storage.

const getMessages = (room) =>
  fetch(`/api/${room}/messages`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('AUTH_KEY')}`,
    },
  }).then((r) => {
    if (r.ok) return r.json();

    return Promise.reject(r);
  });

const sendMessage = (room, message) => {
  console.log('sending', {
    room,
    message,
    jwt: localStorage.getItem('AUTH_KEY'),
  });
  return fetch(`/api/${room}/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('AUTH_KEY')}`,
    },
    body: JSON.stringify({ message }),
  });
};
const renderLobby = (initialState = {}) => {
  const { error = '' } = initialState;
  $appContainer.innerHTML = `
    <h1>Enter Room Name</h1>
    <div>
      <input type="text" id="chatRoomInput" />
      <div class="error-msg">${error}</div>
      <button class="submit">Submit</button>
    </div>
    </div>
  `;
  const $input = $appContainer.querySelector('#chatRoomInput');
  const $submit = $appContainer.querySelector('.submit');
  const $errorDisplay = $appContainer.querySelector('.error-msg');
  $input.focus();

  const clearLoadError = () => {
    $errorDisplay.innerText = '';
  };

  const renderLoadError = (error) => {
    console.log(error);
    $errorDisplay.innerText = `${error.msg}`;
    $input.focus();
  };

  const handleLoadRoom = (room) => {
    if (!room)
      return renderLoadError({ msg: 'Must provide non empty room name' });
    renderChatRoom(room);
  };
  $input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleLoadRoom($input.value);
  });
  $submit.addEventListener('click', () => handleLoadRoom($input.value));
};

function renderChatRoom(room) {
  $appContainer.innerHTML = `
    <h1>Chatroom: ${room}</h1>
    <div class="chatroom" tabindex="0"></div>
      <hr width="100%" />
    <div class="chatroom-input-container">
    
      <input
        title="message input"
        type="text"
        class="chatroom-input-text"
        placeholder="message"
      />
      <button class="chatroom-input-send">send</button>
    </div>
  `;

  // DOM Refs
  const $chatroom = document.querySelector('.chatroom');
  const $input = document.querySelector('.chatroom-input-text');
  const $send = document.querySelector('.chatroom-input-send');

  let messageCount = 0;
  const addNewMessages = (messages = []) => {
    messages.slice(messageCount).forEach(([username, message]) => {
      messageCount += 1;

      const container = document.createElement('div');
      container.innerHTML = `<b>${username}:</b><span>${message}</span>`;

      container.classList.add('chat-msg');
      $chatroom.append(container);
    });
  };

  let msgPollRef;
  const getAndRenderMessages = () =>
    getMessages(room)
      .then((messages) => {
        // Bonus feature: If scrolled to bottom keep it scrolled to bottom
        const scrolledToBottom =
          $chatroom.scrollTop ===
          $chatroom.scrollHeight - $chatroom.clientHeight;

        addNewMessages(messages);

        if (scrolledToBottom) {
          $chatroom.scrollTop = $chatroom.scrollHeight;
        }
      })
      .catch((error) => {
        // Assume all errors at this point are invalid room name
        if (msgPollRef) clearInterval(msgPollRef);
        renderLobby({ error: 'Invalid Room Name' });
      });

  // Poll for new messages
  msgPollRef = setInterval(() => {
    getAndRenderMessages();
  }, 2000);

  // Initial Render
  getAndRenderMessages();

  // EVENT HANDLERS
  const handleSendMsg = () => {
    sendMessage(room, $input.value).then(() => {
      $input.value = '';
      getAndRenderMessages();
    });
  };

  // EVENT LISTENERS

  $send.addEventListener('click', handleSendMsg);
  $input.addEventListener('keyup', (e) => e.key === 'Enter' && handleSendMsg());
}

const renderLogin = () => {
  $appContainer.innerHTML = `
    <h1>You must be logged in</h1>
    <p> No Account? You can
      <a href="#" class="instead">Sign up instead</a>
    </p>
    <input class="username" type="text" placeholder="username">
    <input class="password" type="password" placeholder="password">
    <button class="submit">Submit</button>
  `;
  const $username = document.querySelector('.username');
  const $password = document.querySelector('.password');
  const $instead = document.querySelector('.instead');
  const $submit = document.querySelector('.submit');
  $instead.addEventListener('click', () => {
    renderSignUp();
  });
  $submit.addEventListener('click', () => {
    fetch('https://js5.c0d3.com/auth/api/sessions', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        username: $username.value,
        password: btoa($password.value),
      }),
    })
      .then((r) => r.json())
      .then((body) => {
        if (body.jwt) {
          localStorage.setItem(AUTH_KEY, body.jwt);
          renderLobby();
        }
      });
  });
};

const renderSignUp = () => {
  $appContainer.innerHTML = `
    <h1>New Account!</h1>
    <p> Already have an account? You can
      <a href="#" class="instead">Login instead</a>
    </p>
    <input class="name" type="text" placeholder="full name">
    <input class="username" type="text" placeholder="username">
    <input class="email" type="email" placeholder="email">
    <input class="password" type="password" placeholder="password" required minlength="5">
    <button class="submit">Submit</button>
  `;
  const $username = document.querySelector('.username');
  const $email = document.querySelector('.email');
  const $name = document.querySelector('.name');
  const $password = document.querySelector('.password');
  const $instead = document.querySelector('.instead');
  const $submit = document.querySelector('.submit');
  $instead.addEventListener('click', () => {
    renderLogin();
  });
  $submit.addEventListener('click', () => {
    fetch('https://js5.c0d3.com/auth/api/users', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },

      body: JSON.stringify({
        username: $username.value,
        name: $name.value,
        email: $email.value,
        password: btoa($password.value),
      }),
    })
      .then((r) => r.json())
      .then((body) => {
        if (body.jwt) {
          localStorage.setItem(AUTH_KEY, body.jwt);
          renderLobby();
        }
      });
  });
};

const $appContainer = document.querySelector('.app-container');

const startApp = () => {
  fetch('/api/session', {
    method: 'GET',
    headers: {
      authorization: `Bearer ${localStorage.getItem(AUTH_KEY)}`,
    },
  })
    .then((response) => response.json())
    .then((body) => {
      if (body.error) return renderLogin();
      renderLobby();
    });
};
startApp();
