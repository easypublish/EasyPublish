function DragAndDrop(easyPub) {

     function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var files = evt.target.files;
        readFiles(files);
      }

      function handleFileDrop(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var files = evt.dataTransfer.files; // FileList object.
        readFiles(files);
      }

      function readFiles(files) {
        // files is a FileList of File objects. List some properties.
        var output = [];
        var reader = new FileReader();
        for (var i = 0, f; f = files[i]; i++) {
          /*output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                      f.size, ' bytes, last modified: ',
                      f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                      '</li>');*/
            //console.log("loaded file name: " + f.name + ", type: " + f.type);
            $("#dropStatus1").html("<strong>Dropped file name: </strong>" + f.name + "<br/><br/><strong>File type:</strong> " + f.type);
            $("#dropStatus2").html("");
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

      function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
      }

      // Setup the dnd listeners.
      var dropZone = document.getElementById('drop_zone');
      //console.log("dropZone: " + dropZone);

      //var dropZone = $('drop_zone');
      dropZone.addEventListener('dragover', handleDragOver, false);
      dropZone.addEventListener('drop', handleFileDrop, false);

      var fileButton = document.getElementById('csvFile');
      //console.log("fileButton: " + fileButton);
      fileButton.addEventListener('change', handleFileSelect, false);

      
}
