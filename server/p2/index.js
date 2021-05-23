const routerP2 = require('express').Router();
const path = require('path');
const { spawn } = require('child_process');
const getCommandsView = require('./view');
// JS5 -  Problem 2
routerP2.get('/commands', (req, res) => {
  res.send(getCommandsView());
});

routerP2.post('/commands', async (req, res) => {
  // parse input
  const { stdin } = req.body;

  // TODO: add support for quoted param values
  const [cmd, ...params] = stdin.split(' ');

  const output = await runCommand(cmd, params);

  res.json({ ...output, stdin });
});

function runCommand(cmd, params) {
  const output = {
    stdout: null,
    stderr: null,
    exitCode: null,
  };

  // Check command is one of these three commands
  const VALID_COMMANDS = ['ls', 'pwd', 'cat'];
  if (!VALID_COMMANDS.includes(cmd)) {
    // Fake output on not allowed commands
    output.stdout = `bash: ${cmd}: command not found`;
    output.exitCode = 1;

    return output;
  }

  const cmdProcess = spawn(cmd, params);

  cmdProcess.stdout.on('data', (data) => {
    output.stdout = data.toString();
  });

  cmdProcess.stderr.on('data', (data) => {
    output.stderr = data.toString();
  });

  // wait for exit code to return results
  return new Promise((resolve, reject) => {
    cmdProcess.on('close', (code) => {
      output.exitCode = code;
      resolve(output);
    });
    // TODO: this timeout should be a reject! with error handling on the other side
    setTimeout(() => {
      cmdProcess.kill();
      output.stderr =
        'Command timed out!!\n Make sure not to send an open ended command like "cat" with no params\n';
      resolve(output);
    }, 2000);
  });
}

module.exports = routerP2;
