// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
const fs = require('fs')
const { shell } = require('electron')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
const dateFormat = function(dates, format) { // dates 支持时间戳或者时间格式  format为格式化格式 e.g "yyyy-MM-DD hh-mm-ss.S"
    if (typeof dates == "number") dates = new Date(dates);
    var date = {
        "M+": dates.getMonth() + 1,
        "d+": dates.getDate(),
        "h+": dates.getHours(),
        "m+": dates.getMinutes(),
        "s+": dates.getSeconds(),
        "q+": Math.floor((dates.getMonth() + 3) / 3),
        "S+": dates.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (dates.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
}
let Logger = {
    logMode: 'file', //file  //决定是cmd打印信息还是在server.log
    logFile: './server.log',
    log: function(msg) {
        var _this = this;
        if (_this.logMode == 'cmd') {
            console.log.apply(_this, arguments);
        } else {
            let path = _this.logFile;
            fs.exists(path, function(exists) {
                if (!exists) {
                    // console.log('日志文件不存在!');
                    console.log.apply(_this, arguments);
                }
                fs.appendFile(path, "\r\n" + dateFormat(new Date(), 'yyyy-MM-dd hh-mm-ss：') + msg, function(err) {
                    //console.log.apply(err);
                });
            });
        }
    }
}
// 指定 flash 路径，假定它与 main.js 放在同一目录中。
function usingFlash(){
    let pluginName
    switch (process.platform) {
        case 'win32':
            pluginName = './plugin/flash/pepflashplayer64_29_0_0_140.dll'
            break
        case 'darwin':
            pluginName = 'PepperFlashPlayer.plugin'
            break
        case 'linux':
            pluginName = './plugin/flash/libpepflashplayer.so'
            break
    }
    app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName))
    // app.commandLine.appendSwitch('ppapi-flash-path', app.getPath('pepperFlashSystemPlugin'))
    // 可选：指定 flash 的版本，例如 v17.0.0.169
    // app.commandLine.appendSwitch('ppapi-flash-version', '29.0.0.140')
    return path.join(__dirname, pluginName)
}
var configPath = usingFlash();
Logger.log(configPath);
// Logger.log(app.getPath('pepperFlashSystemPlugin'))

function createWindow() {
    // Create the browser window.
    // mainWindow = new BrowserWindow({width: 800, height: 600})
    //autoHideMenuBar: true  带头 不带menu
    //无标题操作栏
    mainWindow = new BrowserWindow({ 
        width: 936, 
        height: 612, 
        resizable: false, 
        maximizable: false, 
        useContentSize: true, 
        webPreferences: {
            plugins: true   
        }
    })

    mainWindow.setMenu(null);//no menu

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')
    // mainWindow.loadURL('http://192.168.30.241:8080/RtmpServer/index.html')

    // Open the DevTools. 开启F12调试 ctrl+shift+i  
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

var handleStartupEvent = function() {
    if (process.platform !== 'win32') {
        return false;
    }

    var squirrelCommand = process.argv[1];

    switch (squirrelCommand) {
        case '--squirrel-install':
        case '--squirrel-updated':
            install();
            return true;
        case '--squirrel-uninstall':
            uninstall();
            app.quit();
            return true;
        case '--squirrel-obsolete':
            app.quit();
            return true;
    }
    // 安装
    function install() {
        var cp = require('child_process');
        var updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
        var target = path.basename(process.execPath);
        var child = cp.spawn(updateDotExe, ["--createShortcut", target], { detached: true });
        child.on('close', function(code) {
            app.quit();
        });
    }
    // 卸载
    function uninstall() {
        var cp = require('child_process');
        var updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
        var target = path.basename(process.execPath);
        var child = cp.spawn(updateDotExe, ["--removeShortcut", target], { detached: true });
        child.on('close', function(code) {
            app.quit();
        });
    }

};

if (handleStartupEvent()) {
    return;
}

ipcMain.on('operate-window', (event, arg) => { //操作窗口命令
    Logger.log(arg);
    if ('min' == arg) {
        mainWindow.minimize() //窗口最小化
    } else if ('max' == arg) {
        mainWindow.maximize() //窗口最大化
    } else if ('close' == arg) {
        mainWindow.close()
        app.quit()
    } else {
        mainWindow.restore() //窗口恢复
    }
})

ipcMain.on('open-app', (event, arg) => {
    let child_process = require("child_process");

    let cmd = "";
    switch (process.platform) {
        case 'win32':
            cmd = 'start ';
            break;

        case 'linux':
            cmd = 'xdg-open ';
            break;

        case 'darwin':
            cmd = 'open ';
            break;
    }
    if ('firefox' == arg) {
        var ff = path.resolve(path.dirname(process.execPath), "resources/app/Firefox51", "firefox.exe");
        Logger.log(ff);
        shell.beep()
        shell.openItem(ff)
    } else {
        child_process.exec(cmd + arg)
    }
})

//通信模块，mian process与renderer process（web page）页面和主进程通信
//监听web page里发出的message
ipcMain.on('asynchronous-message', (event, arg) => {
    Logger.log("mian1" + arg) // prints "ping"
    event.sender.send('asynchronous-reply', 'pong') //在main process里向web page发出message
})
ipcMain.on('synchronous-message', (event, arg) => {
    Logger.log("mian2" + arg) // prints "ping"
    event.returnValue = 'pong'
})


//命令行模块
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
        try {
            // console.log("回复消息"+data);
            event.sender.send('asynchronous-reply', data);
            // ws.send(data);
        } catch (ex) {
            // The WebSocket is not open, ignore
        }
    });
    event.sender.send('asynchronous-reply', "PID_IS:"+term.pid.toString());
})
ipcMain.on('terminal-cmd', (event, arg) => {
    let cmd = arg.cmdStr;
    Logger.log(cmd+"----"+arg.terminalID);
    var term = terminals[arg.terminalID];
    Logger.log('Send Message'+ cmd +' to terminal ' + term.pid);
    //ws.send(logs[term.pid]);
    term.write(cmd);
})
ipcMain.on('terminal-cmd-close', (event, arg) => {
    Logger.log("ReadyToKill:----"+arg);
    var term = terminals[arg];
    term.kill();
    Logger.log('Closed terminal ' + term.pid);
    // Clean things up
    delete terminals[term.pid];
    delete logs[term.pid];
})