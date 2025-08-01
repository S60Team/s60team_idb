function StoreImageInIDB(img_link, img_id) {
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
          putFoxInDb(blob);
        }
      }, false);
      // Send XHR
      xhr.send();
    },
    putFoxInDb = function (blob) {
      // Open a transaction to the database:
      var transaction = db.transaction(['pictures'], 'readwrite');
      // Put the blob into the database:
      try{
        transaction.objectStore("pictures").put(blob, img_id);
        // Retrieve the file that was just stored
        transaction.objectStore("pictures").get(img_id).onsuccess = function (event) {
          var imgFile = event.target.result;
          // Create and revoke ObjectURL
          var imgURL = URL.createObjectURL(imgFile);
          // Set img src to ObjectURL
          document.getElementById(img_id).setAttribute('src', imgURL);
        };
      }catch(e){} // technology is not supported.
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
        // Create and revoke ObjectURL
        var imgURL2 = URL.createObjectURL(imgFile2);
        // Set img src to ObjectURL
        document.getElementById(img_id).setAttribute('src', imgURL2);
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
