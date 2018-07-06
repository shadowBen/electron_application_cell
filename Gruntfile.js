var grunt = require("grunt");
grunt.config.init({
    pkg: grunt.file.readJSON('package.json'),
    'create-windows-installer': {
        x64: {
            appDirectory: './platform/win32/WebApplication-win32-x64',
            exe: 'WebApplication.exe',
            description:"BenjaminWYj的html5版本的桌面软件",
            title:'Web Application',
            noMsi: true,
            setupIcon: 'favicon.ico',
            version:'1.1.1'
        }       
    }
})
 
grunt.loadNpmTasks('grunt-electron-installer');
grunt.registerTask('default', ['create-windows-installer']);