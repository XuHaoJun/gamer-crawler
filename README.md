# gamer-crawler
*gamer-crawler* is a http://www.gamer.com.tw 's crawler for download ACG basic data.

# Install
```sh
npm install gamer-crawler
```

# Quick Start
```javascript
var GamerCrawler = require('gamer-crawler');
var options = {
  delay: 1000,
  maxConnections: 5,
  takeNumPages: 1,
  onCompleteACG: function(acg) {
    console.log(acg.nameTW);
  }
};
GamerCrawler
  .download(options)
  .then(function(acgs) {
    console.log('download done.');
    console.log(acgs.length);
  });
```

# Options
```javascript
GamerCrawler.defaultOptions();
{
  maxConnections: 4,      // maxConnections of http client, and Infinity is no limit.
  takeNumPages: Infinity, // only take first num page on target platform.
  onCompleteACG: null,    // callback on download acg and after parse it.
  onlyACGid: true,        // only pass acg's id on final download callback
  delay: 300,             // delay on each download, 0 is no delay.
  // target platforms, you can edit it.
  platforms: ['ANIME', 'COMIC', 'novel', 'PC', 'PS4',
              'PS3', 'wiiu', 'XBONE', 'xbox360',
              'PSV', 'PSP',
              'OLG', 'WEB', 'FACEBOOK', 'Android',
              'ios', 'GBA']
}
```
