const $stdin = document.querySelector('#stdin');
const $validationError = document.querySelector('#validationError');
const $stdout = document.querySelector('#stdout');

const VALID_COMMANDS = ['ls', 'pwd', 'cat', 'clear'];

$stdin.addEventListener('keyup', (e) => {
  if (e.key !== 'Enter') return;

  const cmdString = $stdin.value;
  $stdin.value = '';

  if (cmdString === 'clear') {
    $stdout.replaceChildren();
    return;
  }
  console.log({ cmdString });
  fetch('/commands', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stdin: cmdString }),
  })
    .then((res) => res.json())
    .then(renderTerminalOutput);
});

function renderTerminalOutput({ stdout, stderr, exitCode }) {
  console.log({ stdout, stderr, exitCode });

  $stdout.innerHTML += stderr
    ? stderr.replace(/(\r\n|\n|\r)/gm, '<br/>')
    : stdout.replace(/(\r\n|\n|\r)/gm, '<br/>');

  $stdout.scrollTop = $stdout.scrollHeight; // - div.clientHeight;
}
