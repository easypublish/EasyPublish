function Uploader() {
	this.fieldManager = new FieldManager();
	this.dataManager = new DataManager(this);
    this.dnd = new DragAndDrop(this);
    
    this.dnd.bind("csvFile");

    this.fileDropped = function (fileData) {
    	var arrData = this.dataManager.CSVToArray(fileData);
        var objData = this.dataManager.twoDArrayToObjectArray(arrData, this.fieldManager.englishNameDictionary);
        for (var i=0; i<objData.numRows; i++) {
        	
        }
    }
}