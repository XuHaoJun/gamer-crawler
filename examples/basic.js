var GamerCrawler = require('../index');
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
