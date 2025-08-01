# Храним изображения в indexedDB
Началось всё с того, что у заказчика на сайте отключено кэширование.

А я живу в городе, где скорость интернета ограничена 40кб в секунду. И то, бывает он редко.

Предложил заказчику загружать изображения посетителю в indexedDB (при первом посещении),
и при обновлении страницы показывать их уже из indexedDB, чтобы сэкономить время и траффик.

Прочитав замечательные статьи [Храним изображения и файлы в indexedDB](https://hacks.mozilla.org/2012/02/storing-images-and-files-in-indexeddb/)
  и [техника Заглушки-изображения низкого качества (LQIP)](https://www.guypo.com/introducing-lqip-low-quality-image-placeholders),
  написал небольшую функцию.

Версия AJAX: Firefox 17, Chrome 49, Opera 36 и Internet Explorer 10 (4.8кб исходник и 1.9кб в сжатом виде).
Версия Fetch: Firefox 53, Chrome 49, Opera 36 и Safari 10.3 (4.4кб исходник и 1.6кб в сжатом виде).

## Как применить:
1. Для начала нам нужно создать изображения-заглушки: размер 10% от оригинала и качеством 40%.
На Windows рекомендую программу для просмотра фото [imagine](http://www.nyam.pe.kr):

Если конвертируем один файл:

```shell
imagine.exe /resize:(17)"%" /save:"out.jpg" --quality:65 in.jpg
imagine.exe /resize:(11)"%" /save:"out.png" in.png
```

Если изображений много, помещаем их в папку "in"

```shell
imagine.exe /resize:(17)"%" /save:jpg --quality:65 in\*.jpg
imagine.exe /resize:(11)"%" /save:png in\*.png
```

2. Скачиваем [b64.exe](http://base64.sourceforge.net) и используем:

```shell
b64 -e -l80000 out.jpg out.txt
```
3. Копируем содержимое файла "out.txt" в "src" тега "img" (не забываем указывать правильный mime-тип изображения).
4. Заглушка готова!

### Подробный пример

```html
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <title>Пример</title>
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <!-- Для больших изображений используем класс .image и обязательно указываем размер в теге! -->
    <style>.image{max-width: 100%;height: auto;}</style>
  </head>
  <body>
    <img
      id="fox"
      class="image"
      alt="Чёрно-рыжая лиса"
      width="960px"
      height="727px"
      src="data:image/jpeg;charset=UTF-8;base64,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" />
    <!-- И в конце страницы: -->
    <script type="text/javascript">
      // Версия AJAX:
      function StoreImageInIDB(e,t){
      var n,r="MozAppearance"in document.documentElement.style==!0||"mozInnerScreenX"in window,o=window.indexedDB||window.webkitIndexedDB||window.mozIndexedDB||window.OIndexedDB||window.msIndexedDB,i=window.IDBTransaction||window.webkitIDBTransaction||window.OIDBTransaction||window.msIDBTransaction,c=window.URL||window.webkitURL,s=o.open("s60teamFiles",1),a=function(){
      var t,n=new XMLHttpRequest;n.open("GET",e,!0),n.responseType="blob",n.addEventListener("load",function(){200===n.status&&(t=n.response,u(t))},!1),n.send()},d=function(e){if(-1==e.indexOf(";base64,")){
      var t=(r=e.split(","))[0].split(":")[1],n=r[1];return new Blob([n],{type:t})}t=(r=e.split(";base64,"))[0].split(":")[1];for(var r,o=(n=window.atob(r[1])).length,i=new Uint8Array(o),c=0;c<o;++c)i[c]=n.charCodeAt(c);return new Blob([i],{
      type:t})},u=function(e){function o(e){var o=n.transaction(["pictures"],i.READ_WRITE?i.READ_WRITE:"readwrite");try{o.objectStore("pictures").put(e,t);o.objectStore("pictures").get(t).onsuccess=function(e){var n=e.target.result
      ;!1===r&&(n=d(n));var o=(window.URL||window.webkitURL).createObjectURL(n);document.getElementById(t).setAttribute("src",o)}}catch(e){}}!0===r?o(e):function(e,t){var n=new FileReader;n.onload=function(e){t(e.target.result)},
      n.readAsDataURL(e)}(e,o)};s.onerror=function(e){},s.onsuccess=function(e){(n=s.result).onerror=function(e){};var o=n.transaction(["pictures"],"readwrite");o.objectStore("pictures").get(t).onsuccess=function(e){try{var n=e.target.result
      ;if(!1===r)if(void 0!==n){document.getElementById(t).setAttribute("src",n)}else{var o=c.createObjectURL(n);document.getElementById(t).setAttribute("src",o)}else{var i=c.createObjectURL(n);document.getElementById(t).setAttribute("src",i)}
      }catch(e){a()}},o.objectStore("pictures").get(t).onerror=function(e){a()}},s.onupgradeneeded=function(e){e.target.result.createObjectStore("pictures")}}
      // Используем:
      StoreImageInIDB('fox-960.jpg', 'fox');
      // Где 'fox-960.jpg' это путь к изображению на вашем сервере,
      //   а 'fox' это id тэга img.
    </script>
  </body>
</html>
```
