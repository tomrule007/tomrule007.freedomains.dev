const { getVisitorView } = require('./visitorView');
const fs = require('fs');
const fetch = require('node-fetch');
const { spawn } = require('child_process');
const path = require('path');
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.json());

// constants
const VISITOR_LOG_FILE = './visitorLog';

// Utility functions
const compose =
  (...fns) =>
  (x) =>
    fns.reduceRight((x, y) => y(x), x);

const last = (a) => a[a.length - 1];
const split = (separator) => (string) => string.split(separator);

// Load log file
let visitors = JSON.parse(fs.readFileSync(VISITOR_LOG_FILE));

// IP Geo Logger middleware
app.get('/*', async (req, res, next) => {
  const ip = compose(
    last,
    split(':')
  )(req.headers['x-forwarded-for'] || req.socket.remoteAddress);

  if (!visitors[ip]) {
    // New Visitor! looking up location
    try {
      const response = await fetch(
        `https://js5.c0d3.com/location/api/ip/${ip}`
      );
      const { ll, cityStr } = await response.json();

      visitors[ip] = { latLng: { lat: ll[0], lng: ll[1] }, cityStr };
    } catch (error) {
      console.log('fetch geo error', error);
    }

    // save to log
    fs.writeFile(VISITOR_LOG_FILE, JSON.stringify(visitors), (err) => {
      if (err) return console.log('Write Error', err);
    });
  }

  // set user info
  req.user = visitors[ip];

  next();
});

app.get('/visitor', (req, res) => {
  console.log('the user', req.user);

  res.send(getVisitorView(req.user.cityStr, req.user.latLng));
});

app.get('/api/visitor', (req, res) => {
  res.json(visitors);
});

// JS5 -  Problem 2

app.get('/commands', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/commands.html'));
});

app.post('/commands', async (req, res) => {
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

module.exports = { app };
