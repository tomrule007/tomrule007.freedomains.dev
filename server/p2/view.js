module.exports = () => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>commands</title>
    <style>
      body {
        display: flex;
        flex-direction: column;
        height: 100vh;
        margin: 0;
      }
      #stdout {
        flex-grow: 1;
        overflow: auto;
      }
      div,
      header {
        padding: 5px;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Commands</h1>
      <p>
        Remotely execute (ls, pwd, cat,clear) commands on the server and see
        what they return
      </p>
    </header>
    <div>
      <label
        >Terminal Input <input title="terminal input" type="text" id="stdin" />
      </label>

      <hr />
    </div>
    <div id="stdout"></div>
    <script src="commands.js"></script>
  </body>
</html>
`;
