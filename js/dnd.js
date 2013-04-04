function DragAndDrop(easyPub) {
      function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files; // FileList object.

        // files is a FileList of File objects. List some properties.
        var output = [];
        var reader = new FileReader();
        for (var i = 0, f; f = files[i]; i++) {
          /*output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                      f.size, ' bytes, last modified: ',
                      f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                      '</li>');*/
            //console.log("loaded file name: " + f.name + ", type: " + f.type);
            $("#dropStatus1").html("Dropped file name: " + f.name + "<br/><br/>File type: " + f.type);
            $("#dropStatus2").html("");
            reader.readAsText(f);
            reader.onload = function(e) {
              easyPub.importCSVData(e.target.result);
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

      //var dropZone = $('drop_zone');
      dropZone.addEventListener('dragover', handleDragOver, false);
      dropZone.addEventListener('drop', handleFileSelect, false);

      
}
