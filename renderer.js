// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require('electron');
window.operate_window = function(self,e,cmd){//操作窗口
	let cmdStr = "";
	switch(cmd){
		case 1:
			cmdStr = 'close';
			break;
		case 2:
			cmdStr = 'max';
			break;
		case 3:
			cmdStr = 'min';
			break;
		case 4:
			cmdStr = 'restore'
			break;
	}
    ipcRenderer.send('operate-window', cmdStr)
}
window.open_app = function(self,e){//执行cmd命令 一般用于开启应用程序
    ipcRenderer.send('open-app', self.cmd)
}
// 分界线 上方为原生exe 下方为 html版本
const BrowserWindow = require('electron').remote.BrowserWindow
const path = require('path')
window.open_webapp = function(self,e){
    let win = new BrowserWindow({ useContentSize: true })
	win.on('close', function () { win = null })
	let modalPath = path.join('file://', __dirname, self.url)
	console.log(modalPath)
	win.loadURL(modalPath)
	win.show()
}