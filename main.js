// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
const fs = require('fs')
const { shell } = require('electron')
const path = require('path')
// const flashTrust = require('nw-flash-trust')

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
    let path = require('path');
    let pluginName
    switch (process.platform) {
        case 'win32':
            pluginName = './plugin/flash/pepflashplayer.dll'
            break
        case 'darwin':
            pluginName = 'PepperFlashPlayer.plugin'
            break
        case 'linux':
            pluginName = 'libpepflashplayer.so'
            break
    }
    // app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName))
    app.commandLine.appendSwitch('ppapi-flash-path', app.getPath('pepperFlashSystemPlugin'))
    // 可选：指定 flash 的版本，例如 v17.0.0.169
    app.commandLine.appendSwitch('ppapi-flash-version', '29.0.0.140')
    return path.join(__dirname, pluginName)
}
var configPath = usingFlash();
Logger.log(configPath);
Logger.log(app.getPath('pepperFlashSystemPlugin'))
// var appName = 'myApp';

// // Initialization and parsing config file for given appName (if already exists).
// var trustManager = flashTrust.initSync(appName);
// // Alternatively you can provide a custom flash config folder for initialization.
// // This is useful for example if you use Atom Electron and a PPAPI flash plugin (like Pepper Flash),
// // as the flash config folder in this case would be in the Atom Electron data path folder.
// var trustManager = flashTrust.initSync(appName, configPath);
// var list = trustManager.list();
// Logger.log(JSON.stringify(list));
// // adds given filepath to trusted locations
// // paths must be absolute
// trustManager.add(path.resolve('path-to', 'file.swf'));

// // whole folders are also allowed
// trustManager.add(path.resolve('path-to', 'folder'));

// // removes given path from trusted locations
// trustManager.remove(path.resolve('path-to', 'file.swf'));

// // returns true or false whether given path is trusted or not
// var isTrusted = trustManager.isTrusted(path.resolve('path-to', 'file.swf'));

// // returns array containing all trusted paths
// var list = trustManager.list();

// // removes all trusted locations from config file
// trustManager.empty();



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

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')
    // mainWindow.loadURL('http://192.168.30.241:8080/RtmpServer')

    // Open the DevTools. 开启F12调试 ctrl+shift+i  
    mainWindow.webContents.openDevTools()

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