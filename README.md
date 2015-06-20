# Usage
```javascript
var GamerCrawler = require('gamer-crawler');
GamerCrawler
  .download({onlyACGid: false,
             onCompleteACG: function(acg) {
               console.log(acg);
             }
            })
  .then(function(acgs) {
    console.log('download done.');
    console.log(acgs.length);
  });
```
