function DragAndDrop(easyPub) {

     function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var files = evt.target.files;
        readFiles(files);
      }

      function readFiles(files) {
        // files is a FileList of File objects. List some properties.
        var output = [];
        var reader = new FileReader();
        for (var i = 0, f; f = files[i]; i++) {
            reader.readAsText(f);
            reader.onload = function(e) {
              easyPub.fileDropped(e.target.result);
            }
            reader.onerror = function(stuff) {
              console.log("error", stuff)
              console.log (stuff.getMessage())
            }
        }
      }

      function bind(id) {
        var fileButton = document.getElementById(id);
        fileButton.addEventListener('change', handleFileSelect, false);            
      }

      return {
        bind: bind
      }

}
