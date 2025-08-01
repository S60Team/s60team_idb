// Using some code from https://hacks.mozilla.org/2012/02/storing-images-and-files-in-indexeddb/
function StoreImageInIDB(img_link, img_id) {
  // Firefox 3.6+:
  let isFirefox = 'MozAppearance' in document.documentElement.style === true || "mozInnerScreenX" in window;
  // IndexedDB
  let indexedDB = window.indexedDB, dbVersion = 1.0;
  // Get window.URL object
  let URL = window.URL || window.webkitURL;
  // Create/open database
  let request = indexedDB.open("s60teamFiles", dbVersion),
    db,
    createObjectStore = function (dataBase) {
      // Create an objectStore
      dataBase.createObjectStore("pictures");
    },
    getImageFile = function () {
      fetch(img_link)
        .then(response => response.blob())
        .then(imag => putImageInDb(imag));
    },
    convertToBase64 = function(blob, cb) {
      let fr = new FileReader();
      fr.onload = function(e) {
        cb(e.target.result);
      }
      fr.readAsDataURL(blob);
    },
    dataURLToBlob = function(dataURL) {
      let BASE64_MARKER = ';base64,';
      if (dataURL.indexOf(BASE64_MARKER) == -1) {
        let parts = dataURL.split(',');
        let contentType = parts[0].split(':')[1];
        let raw = parts[1];
        return new Blob([raw], {type: contentType});
      }
      let parts = dataURL.split(BASE64_MARKER);
      let contentType = parts[0].split(':')[1];
      let raw = window.atob(parts[1]);
      let rawLength = raw.length;
      let uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], {type: contentType});
    },
    putImageInDb = function (blob) {
      if(isFirefox === true){
        continuation(blob);
      } else { // Chrome, Safari
        convertToBase64(blob, continuation);
      }
      function continuation(blob) {
        // Open a transaction to the database:
        let transaction = db.transaction(['pictures'], 'readwrite');
        // Put the blob into the database:
        try{
          let put = transaction.objectStore("pictures").put(blob, img_id);
          // Retrieve the file that was just stored
          transaction.objectStore("pictures").get(img_id).onsuccess = function (event) {
            let imgFile = event.target.result;
            if(isFirefox === false){ // Chrome, Safari
              imgFile = dataURLToBlob(imgFile);
            }
            // Create and revoke ObjectURL
            let URL = window.URL || window.webkitURL;
            let imgURL = URL.createObjectURL(imgFile);
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
    let transaction2 = db.transaction(['pictures'], 'readwrite');
    transaction2.objectStore("pictures").get(img_id).onsuccess = function (event) {
      try{
        let imgFile2 = event.target.result;
        // Set img src to ObjectURL
        if(isFirefox === false){
          if(imgFile2 !== undefined){
            let imagg = document.getElementById(img_id);
            imagg.setAttribute('src', imgFile2);
          } else {
            // Create an ObjectURL
            let imgURL2 = URL.createObjectURL(imgFile2);
            document.getElementById(img_id).setAttribute('src', imgURL2);
          }
        } else {
          let imgURL3 = URL.createObjectURL(imgFile2);
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
