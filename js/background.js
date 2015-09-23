function setClipboardValue(string) {
	var copyDiv = document.createElement('div');
	copyDiv.contentEditable = true;
	document.body.appendChild(copyDiv);
	copyDiv.innerHTML = string;
	copyDiv.unselectable = "off";
	copyDiv.focus();
	document.execCommand('SelectAll');
	document.execCommand("Copy", false, null);
	document.body.removeChild(copyDiv);	
};