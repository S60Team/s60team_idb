// Using some code from https://hacks.mozilla.org/2012/02/storing-images-and-files-in-indexeddb/
function StoreImageInIDB(img_link, img_id) {
  // Firefox 3.6+:
  var isFirefox = 'MozAppearance' in document.documentElement.style === true || "mozInnerScreenX" in window;
  // IndexedDB
  var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
    IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
    dbVersion = 1.0;
  // Get window.URL object
  var URL = window.URL || window.webkitURL;
  // Create/open database
  var request = indexedDB.open("s60teamFiles", dbVersion),
    db,
    createObjectStore = function (dataBase) {
      // Create an objectStore
      dataBase.createObjectStore("pictures");
    },
    getImageFile = function () {
      // Create XHR and BlobBuilder
      var xhr = new XMLHttpRequest(), blob;
      xhr.open("GET", img_link, true);
      // Set the responseType to blob
      xhr.responseType = "blob";
      xhr.addEventListener("load", function () {
        if (xhr.status === 200) {
          // Blob as response:
          blob = xhr.response;
          // Put the received blob into IndexedDB:
          putImageInDb(blob);
        }
      }, false);
      // Send XHR
      xhr.send();
    },
    convertToBase64 = function(blob, cb) {
      var fr = new FileReader();
      fr.onload = function(e) {
        cb(e.target.result);
      }
      fr.readAsDataURL(blob);
    },
    dataURLToBlob = function(dataURL) {
      var BASE64_MARKER = ';base64,';
      if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = parts[1];
        return new Blob([raw], {type: contentType});
      }
      var parts = dataURL.split(BASE64_MARKER);
      var contentType = parts[0].split(':')[1];
      var raw = window.atob(parts[1]);
      var rawLength = raw.length;
      var uInt8Array = new Uint8Array(rawLength);
      for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], {type: contentType});
    },
    putImageInDb = function (blob) {
      if(isFirefox === true){
        continuation(blob);
      } else {
        convertToBase64(blob, continuation);
      }
      function continuation(blob) {
        // Open a transaction to the database:
        var transaction = db.transaction(['pictures'], (IDBTransaction.READ_WRITE ? IDBTransaction.READ_WRITE : 'readwrite'));
        // Put the blob into the database:
        try{
          var put = transaction.objectStore("pictures").put(blob, img_id);
          // Retrieve the file that was just stored
          transaction.objectStore("pictures").get(img_id).onsuccess = function (event) {
            var imgFile = event.target.result;
            if(isFirefox === false){
              imgFile = dataURLToBlob(imgFile);
            }
            // Create and revoke ObjectURL
            var URL = window.URL || window.webkitURL;
            var imgURL = URL.createObjectURL(imgFile);
            // Set img src to ObjectURL
            document.getElementById(img_id).setAttribute('src', imgURL);
          };
        }catch(e){} // technology is not supported.
      }
    };
  request.onerror = function (event) {
    //console.log("Error creating/accessing IndexedDB database: 1");
  };
  request.onsuccess = function (event) {
    //console.log("Success creating/accessing IndexedDB database");
    db = request.result;
    db.onerror = function (event) {
      //console.log("Error creating/accessing IndexedDB database: 2");
    };
    var transaction2 = db.transaction(['pictures'], 'readwrite');
    transaction2.objectStore("pictures").get(img_id).onsuccess = function (event) {
      try{
        var imgFile2 = event.target.result;
        // Set img src to ObjectURL
        if(isFirefox === false){
          if(imgFile2 !== undefined){
            var that_image = document.getElementById(img_id);
            that_image.setAttribute('src', imgFile2);
          }
          else {
            // Create an ObjectURL
            var imgURL2 = URL.createObjectURL(imgFile2);
            document.getElementById(img_id).setAttribute('src', imgURL2);
          }
        } else {
          var imgURL3 = URL.createObjectURL(imgFile2);
          document.getElementById(img_id).setAttribute('src', imgURL3);
        }
      } catch(e){
        getImageFile();
      }
    }
    transaction2.objectStore("pictures").get(img_id).onerror = function (event) {
      getImageFile();
    }
  }
  // For future use. Currently only in latest Firefox versions:
  request.onupgradeneeded = function (event) {
    createObjectStore(event.target.result);
  };
}
