// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require('electron');
const fs = require('fs');
const BrowserWindow = require('electron').remote.BrowserWindow
const app = require('electron').remote.app
const path = require('path')
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
            pluginName = 'libpepflashplayer.so'
            break
    }
    app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName))
    return path.join(__dirname, pluginName)
}
var configPath = usingFlash();
console.log(configPath);
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
window.drop_open_app = function(self,e){//执行drop文件到指定的程序
	try{
		var cmdwithfile = self.cmd +" " + e.dataTransfer.files[0].path
		ipcRenderer.send('open-app', cmdwithfile)
	}catch(e){
		//捕获拉取的不是文件而是快捷方式等
	}
}
window.drop_add_app = function(self,e){//执行drop文件到指定的程序
	try{
		var file = e.dataTransfer.files[0];
		if(file.name.indexOf(".exe")>=0){
			var fielNameShort = file.name.replace('.exe','');
			var filepath = "";
			var x = file.path.split('\\');
			x.forEach(function(item,i){
				if(item.indexOf(" ")>=0){
					item =  "\""+item+"\"";
				}
				if(i == x.length - 1){
					filepath += item;
				}else{
					filepath += (item+"\\");
				}
			});
			var other_apps = window.vm.apps();
			other_apps.push({
                "name": fielNameShort,
                "icon": "#icon-EXE",
                "cmd": filepath
            });
			window.webapplicationmenu.other_applicationmenu.apps = other_apps;
            var configJSON = JSON.stringify(window.webapplicationmenu);
            var path = "./resources/app/config/config.json"
            fs.writeFile(path, configJSON, function(err) {
            	if(err){
            		let myNotification = new Notification('告警', {
				    	body: 'exe添加失败,缺少config文件'
				  	})
            	}else{
            		window.vm.apps(other_apps);
            	}
            });
		}else{
			let myNotification = new Notification('告警', {
		    	body: '只支持添加exe格式的文件'
		  	})
		}
	}catch(e){
		let myNotification = new Notification('告警', {
	    	body: '只支持添加exe格式的文件'
	  	})
	  	myNotification.onclick = () => {
		    console.log('通知被点击')
	  	}
	}
}
// 分界线 上方为原生exe 下方为 html 版本

window.open_webapp = function(self,e){
    let win = new BrowserWindow({ 
    	useContentSize: true,
    	webSecurity: false,
    	webPreferences: {
            plugins: true   
        }
    })
	win.on('close', function () { win = null })
	let modalPath = "";
	if(self.url.indexOf('http://')==0 || self.url.indexOf('https://') == 0){
		modalPath = self.url;
	}else{
		modalPath = path.join('file://', __dirname, self.url)
	}
	console.log(modalPath)
	win.loadURL(modalPath)
	win.webContents.openDevTools()
	win.once('ready-to-show', () => {
	    win.show()
  	})
}
