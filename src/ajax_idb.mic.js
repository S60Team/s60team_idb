function StoreImageInIDB(e,t){
var n,r=window.indexedDB||window.webkitIndexedDB||window.mozIndexedDB||window.OIndexedDB||window.msIndexedDB,o=(window.IDBTransaction||window.webkitIDBTransaction||window.OIDBTransaction||window.msIDBTransaction,
window.URL||window.webkitURL),c=r.open("s60teamFiles",1),i=function(){var t,n=new XMLHttpRequest;n.open("GET",e,!0),n.responseType="blob",n.addEventListener("load",function(){200===n.status&&(t=n.response,s(t))},!1),n.send()},s=function(e){
var r=n.transaction(["pictures"],"readwrite");try{r.objectStore("pictures").put(e,t);r.objectStore("pictures").get(t).onsuccess=function(e){var n=e.target.result,r=o.createObjectURL(n);document.getElementById(t).setAttribute("src",r)}
}catch(e){}};c.onerror=function(e){},c.onsuccess=function(e){(n=c.result).onerror=function(e){};var r=n.transaction(["pictures"],"readwrite");r.objectStore("pictures").get(t).onsuccess=function(e){try{
var n=e.target.result,r=o.createObjectURL(n);document.getElementById(t).setAttribute("src",r)}catch(e){i()}},r.objectStore("pictures").get(t).onerror=function(e){i()}},c.onupgradeneeded=function(e){
e.target.result.createObjectStore("pictures")}}