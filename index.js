"use strict";

var _ = require('lodash');
var Promise = require('bluebird');
var cheerio = require('cheerio');
var assign = require('object-assign');
var rp = require('superagent-promise')(require('superagent'), Promise);

function handlePageLinks(platform, res) {
  let $ = cheerio.load(res.text);
  let linksJquery = $('h1.ACG-maintitle > a:nth-child(1)');
  let links = new Array(linksJquery.length);
  linksJquery.each(function(index, a) {
    let link = $(a).attr('href');
    links[index] = {link: link,
                    platform: platform};
  });
  return links;
}

function handleFirstPage(platform, res) {
  let $ = cheerio.load(res.text);
  let numPage = parseInt($('#BH-pagebtn > p > a').last().text());
  var ps = new Array();
  let i = 1;
  for(i = 1; i <= numPage; i++) {
    if (i > this.options.takeNumPages) {
      break;
    }
    let url = 'http://acg.gamer.com.tw/index.php?page='+ i +'&p='+ platform;
    ps.push(
      rp.get(url)
        .set('Accept', 'text/html')
        .end()
        .delay((i - 1) * this.options.delay)
        .then(handlePageLinks.bind(this, platform))
    );
  }
  return Promise.all(ps).then(_.flatten);
}

function handleACG(platform, res) {
  let $ = cheerio.load(res.text);
  $('script').remove();
  let id = parseInt(res.request.url.replace(/http:\/\/acg\.gamer\.com\.tw\/acgDetail\.php\?s=/, ''));
  let nameTW = $('#BH-master > div.BH-lbox.ACG-mster_box1.hreview-aggregate.hreview > h1');
  nameTW = nameTW ? nameTW.text() : '';
  let nameJP = $('#BH-master > div.BH-lbox.ACG-mster_box1.hreview-aggregate.hreview > h2');
  nameJP = nameJP ? nameJP.first().text() : '';
  let nameEN = $('#BH-master > div.BH-lbox.ACG-mster_box1.hreview-aggregate.hreview > h2');
  nameEN = nameEN ? nameEN.last().text() : '';
  $('#BH-master > div.BH-lbox.ACG-mster_box6 > .wikiContent table').remove();
  let desc = $('#BH-master > div.BH-lbox.ACG-mster_box6 > .wikiContent').text() || '';
  let acg = {
    id: id,
    acgType: platform,
    nameTW: nameTW,
    nameJP: nameJP,
    nameEN: nameEN,
    description: desc
  };
  let attrLines = $('#BH-master > div.BH-lbox.ACG-mster_box1.hreview-aggregate.hreview > ul').text().replace(/^\s*[\r\n]/gm, '').split('\n');
  let regex = /(.+)：(.*)/;
  let i = 0;
  let length = attrLines.length;
  for(i = 0; i < length; i++) {
    regex.exec(attrLines[i]);
    let attr = RegExp.$1;
    let attrValue = RegExp.$2;
    switch(attr) {
    case '作品平台':
    case '主機平台':
      acg.platform = attrValue;
      break;
    case '播映方式':
      acg.broadcastType = attrValue;
      break;
    case '當地首播':
      acg.firstBroadcastLocal = attrValue == '不明' ? null: new Date(attrValue);
      break;
    case '當地發售':
      acg.sellDateLocal = attrValue == '不明' ? null: new Date(attrValue);
      break;
    case '台灣首播':
      acg.firstBroadcastTaiwan = attrValue == '不明' ? null: new Date(attrValue);
      break;
    case '台灣發售':
      acg.sellDateTaiwan = attrValue == '不明' ? null: new Date(attrValue);
      break;
    case '播出集數':
    case '發行集數':
      {
        let numEpisodes = parseInt(attrValue);
        acg.numEpisodes = isNaN(numEpisodes) ? 0 : numEpisodes;
      }
      break;
    case '作品類型':
    case '遊戲類型':
      acg.type = attrValue;
      break;
    case '對象族群':
      acg.targetGroup = attrValue;
      break;
    case '作品分級':
      acg.ceroRating = attrValue;
      break;
    case '原著作者':
      if (platform === 'comic' || platform === 'novel') {
        acg.originAuthor = attrValue;
      } else {
        acg.author = attrValue;
      }
      break;
    case '小說作者':
      acg.novelAuthor = attrValue;
      break;
    case '插畫作者':
      acg.iiiustrator = attrValue;
      break;
    case '原廠出版':
      acg.publisher = attrValue;
      break;
    case '漫畫作者':
      acg.comicAuthor = attrValue;
      break;
    case '導演監督':
      acg.director = attrValue;
      break;
    case '製作廠商':
    case '原廠出版':
      if (platform === 'novel') {
        acg.publisher = attrValue;
      } else {
        acg.company = attrValue;
      }
      break;
    case '台灣代理':
      acg.taiwanAgent = attrValue;
      break;
    case '遊戲人數':
      acg.numPlayer = attrValue;
      break;
    case '作品分級':
      acg.ceroRating = attrValue;
      break;
    case '發行廠商':
      acg.dirturbuteCompany = attrValue;
      break;
    case '製作廠商':
      acg.productCompany = attrValue.replace(/掃描安裝/, '');
      break;
    case '遊戲售價':
      acg.price = attrValue;
      break;
    case '收費模式':
      acg.priceType = attrValue;
      break;
    case '封測日期':
      acg.closeBetaDate = attrValue == '不明' ? null: new Date(attrValue);
      break;
    case '公測日期':
      acg.openBetaDate = attrValue == '不明' ? null: new Date(attrValue);
      break;
    case '代理廠商':
      acg.agent = attrValue;
      break;
    case '官方網站':
      {
        let gamerLink, realLink, link;
        if (platform === 'PC' || platform === 'PS4' ||
            platform === 'PS3' || platform === 'GBA' ||
            platform === 'wiiu' || platform === 'xbone' ||
            platform === 'xbox360' || platform === '3DS' ||
            platform === 'OLG' || platform === 'PSV' ||
            platform === 'PSP' || platform === 'FACEBOOK') {
          gamerLink = $('ul.ACG-box1listB').find('a').last();
          if (!_.isUndefined(gamerLink.attr('href'))) {
            realLink = gamerLink.attr('href').replace(/http:\/\/ref\.gamer\.com\.tw\/redir\.php\?url=/, '');
            link = decodeURIComponent(realLink);
            acg.officalSite = link;
          } else {
            acg.officalSite = '';
          }
        } else {
          gamerLink = $('#BH-master > div.BH-lbox.ACG-mster_box1.hreview-aggregate.hreview > ul.ACG-box1listB > li:nth-child(5) > a');
          if (gamerLink.length == 1) {
            realLink = gamerLink.attr('href').replace(/http:\/\/ref\.gamer\.com\.tw\/redir\.php\?url=/, '');
            link = decodeURIComponent(realLink);
            acg.officalSite = link;
          } else {
            acg.officalSite = '';
          }
        }
      }
      break;
    case 'Play 商店':
    case 'App Store':
      {
        let gamerLink = $('ul.ACG-box1listB').find('a').last();
        if (!_.isUndefined(gamerLink.attr('href'))) {
          let realLink = gamerLink.attr('href').replace(/http:\/\/ref\.gamer\.com\.tw\/redir\.php\?url=/, '');
          acg.storeSite = decodeURIComponent(realLink);
        } else {
          acg.storeSite = '';
        }
      }
      break;
    default:
      // just skip it.
      break;
    }
  }
  if (this.options.onCompleteACG) {
    this.options.onCompleteACG(acg);
  }
  if (this.options.onlyACGid) {
    return id;
  }
  return acg;
}

function downloadACGs(acgLinks) {
  let i = 0;
  let length = acgLinks.length;
  let ps = new Array(length);
  for(i = 0; i < length; i++) {
    let acgLink = acgLinks[i];
    let platform = acgLink.platform;
    let url = acgLink.link;
    ps[i] = (
      rp.get(url)
        .set('Accept', 'text/html')
        .end()
        .delay(i * this.options.delay)
        .then(handleACG.bind(this, platform))
    );
  }
  return Promise.all(ps);
}

function defaultOptions() {
  return {
    takeNumPages: Infinity,
    onCompleteACG: null,
    onlyACGid: true,
    delay: 300,
    platforms: ['ANIME', 'COMIC', 'novel', 'PC', 'PS4',
                'PS3', 'wiiu', 'XBONE', 'xbox360',
                'PSV', 'PSP',
                'OLG', 'WEB', 'FACEBOOK', 'Android',
                'ios', 'GBA']
  };
}

function download(options) {
  if (options) {
    options = assign(defaultOptions(), options);
  } else {
    options = defaultOptions();
  }
  var self = {
    options: options
  };
  let delay = options.delay;
  let i = 0;
  let platforms = options.platforms;
  let length = platforms.length;
  let ps = new Array(platforms.length);
  for(i = 0; i<length; i++) {
    let platform = platforms[i];
    self.platform = platform;
    let url = 'http://acg.gamer.com.tw/index.php?page=1&p=' + platform;
    ps[i] = (
      Promise
        .delay(i * delay)
        .then(function() {
          return (
            rp.get(url)
              .set('Accept', 'text/html')
              .end()
              .then(handleFirstPage.bind(this, platform))
          );
        }.bind(self))
    );
  }
  return (
    Promise.all(ps)
      .then(_.flatten)
      .then(downloadACGs.bind(self))
  );
}

exports.download = download;
exports.defaultOptions = defaultOptions;
