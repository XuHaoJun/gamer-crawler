# Usage
```javascript
var GamerCrawler = require('gamer-crawler');
GamerCrawler
  .download({
    takeNumPages: 1,
    onCompleteACG:
    function(acg) {
      console.log(acg.nameTW);
    }
  })
  .then(function(acgs) {
    console.log('download done.');
    console.log(acgs.length);
  });
```
