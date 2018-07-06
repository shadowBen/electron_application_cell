const electron = require('electron')
const {ipcMain} = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  // mainWindow = new BrowserWindow({width: 800, height: 600})
  //autoHideMenuBar: true  带头 不带menu
  //无标题操作栏
  mainWindow = new BrowserWindow({width: 1366, height: 768, resizable: false, maximizable: false})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../dist/index.html'),
    protocol: 'file:',
    slashes: true
  }))
  // mainWindow.loadURL('http://m.baidu.com/')

  //模态窗口
  // let child = new BrowserWindow({parent: mainWindow, modal: true, show: false, frame: false})
  // child.loadURL('https://github.com')
  // child.once('ready-to-show', () => {
  //   child.show()
  // })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
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
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('resize-window', (event, arg) => {
  console.log(arg);
  if('min' == arg){
    mainWindow.minimize()//窗口最小化
  }else if('max' == arg){
    mainWindow.maximize()//窗口最大化
  }else if('close' == arg){
    mainWindow.close()
    app.quit()
  }else{
    mainWindow.restore()//窗口恢复
  }
})

//通信模块，mian process与renderer process（web page）页面和主进程通信
//监听web page里发出的message
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log("mian1" + arg)  // prints "ping"
  event.sender.send('asynchronous-reply', 'pong')//在main process里向web page发出message
})
ipcMain.on('synchronous-message', (event, arg) => {
  console.log("mian2" + arg)  // prints "ping"
  event.returnValue = 'pong'
})