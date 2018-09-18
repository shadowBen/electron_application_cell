const { ipcMain } = require('electron')
var pty = require('node-pty');

var terminals = {},
    logs = {};

ipcMain.on('terminal', (event, arg) => {
    var cols = parseInt(80),
        rows = parseInt(24),
        term = pty.spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', [], {
          name: 'xterm-color',
          cols: cols || 80,
          rows: rows || 24,
          cwd: process.env.PWD,
          env: process.env
        });

    console.log('Created terminal with PID: ' + term.pid);
    terminals[term.pid] = term;
    logs[term.pid] = '';
    term.on('data', function(data) {
      logs[term.pid] += data;
    });
    res.send(term.pid.toString());
    event.sender.send('asynchronous-reply', term.pid.toString());
})
ipcMain.on('terminal-cmd', (event, arg) => {
    let cmd = arg.cmdStr;
    let child_process = terminalPool[arg.terminalID];
    Logger.log(cmd+"----"+arg.terminalID);
    var term = terminals[arg.terminalID];
    console.log('Connected to terminal ' + term.pid);
    //ws.send(logs[term.pid]);

    term.on('data', function(data) {
      try {
        event.sender.send('asynchronous-reply', data);
        // ws.send(data);
      } catch (ex) {
        // The WebSocket is not open, ignore
      }
    });
    term.write(cmd);
})
ipcMain.on('terminal-cmd-close', (event, arg) => {
    let cmd = arg.cmdStr;
    let child_process = terminalPool[arg.terminalID];
    Logger.log("Kill:----"+arg.terminalID);
    var term = terminals[arg.terminalID];
    console.log('Ready to close terminal ' + term.pid);
    term.kill();
    console.log('Closed terminal ' + term.pid);
    // Clean things up
    delete terminals[term.pid];
    delete logs[term.pid];
})

// app.post('/terminals/:pid/size', function (req, res) {
//   var pid = parseInt(req.params.pid),
//       cols = parseInt(req.query.cols),
//       rows = parseInt(req.query.rows),
//       term = terminals[pid];

//   term.resize(cols, rows);
//   console.log('Resized terminal ' + pid + ' to ' + cols + ' cols and ' + rows + ' rows.');
//   res.end();
// });