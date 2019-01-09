onmessage = function (e) {
	var f = e.data;
    var fileReader = new FileReader();
    fileReader.readAsDataURL(f);
    fileReader.onload = function() {
    	var _this = this;
    	postMessage(_this.result)
    	return;
    }
};