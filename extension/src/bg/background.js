/**
 * Copyright Sławek Kaczorowski
 */
(function () {
  var tabId;
  var contextId;
  var updateTrackInfoInPlayer = function (request) {
    chrome.tabs.query({active: true}, function (tabs) {
      tabs.forEach(function (tab) {
        chrome.tabs.sendMessage(tab.id, request);
      });
    });
  }
  var updatePlayButtonInPlayer = function (request) {
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        chrome.tabs.sendMessage(tab.id, request);
      });
    });
  }
  var getInfoTimeout = null;
  var getTrackInfo = function () {
    clearTimeout(getInfoTimeout);
    chrome.tabs.sendMessage(tabId, 'getTrackInfo', updateIcons);
    getInfoTimeout = setTimeout(getTrackInfo, 1000);
  }
  var updateIcons = function (request, sendResponse) {
    try {
      var title = {title: "Play SoundCloud"};
      switch (request.type) {
        case "isPlaying":
          _gaq.push(['_trackEvent', 'Music', 'Play', 'Playing']);
          chrome.browserAction.setIcon({
            path: "../../icons/pause19.png"
          });
          updatePlayButtonInPlayer(request);
          chrome.tabs.sendMessage(tabId, 'getTrackInfo', updateIcons);
          title.title = "Pause SoundCloud";
          break;
        case "isPaused":
          _gaq.push(['_trackEvent', 'Music', 'Play', 'Pausing']);
          chrome.browserAction.setIcon({
            path: "../../icons/play19.png"
          });
          clearTimeout(getInfoTimeout);
          updatePlayButtonInPlayer(request);
          break;
        case "trackInfo":
          updateTrackInfoInPlayer(request);
          break;
        case "getTrackInfo":
          if (tabId)
            getTrackInfo();
          break;
        case "stopGettingTrackInfo":
          clearTimeout(getInfoTimeout);
          break;
        case "playerPlay":
          browserActionFire();
          break;
        case "playerNext":
          browserActionFire('next');
          break;
        case "playerPrev":
          browserActionFire('prev');
          break;
        case "track":
          _gaq.push(['_trackEvent', request.msg.category, request.msg.action, request.msg.label]);
          break;
        case "isActive":
          sendResponse(localStorage.getItem('player'))
          break;
      }
      chrome.browserAction.setTitle(title);
      chrome.contextMenus.update(contextId, title);
    } catch (err) {
      console.log(err);
    }
  }

  var clickButton = function (type) {
    if (type && (type === 'next' || type === 'prev')) {
      chrome.tabs.sendMessage(tabId, type, updateIcons);
    }
    else {
      chrome.tabs.sendMessage(tabId, 'clicked', updateIcons);
    }
  }

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      updateIcons(request, sendResponse);
      if (request.type == 'isPlaying' || request.type == 'isPaused') {
        tabId = sender.tab.id;
      }
    });
  var browserActionFire = function (type) {
    var title = {title: "Play SoundCloud"};
    var createCallback = function (tab) {
      _gaq.push(['_trackEvent', 'Created', 'Created Soundcloud Tab']);
      tabId = tab.id;
      var loaded = function (tabId, info) {
        if (info.status == "complete") {
          clickButton(type);
          chrome.tabs.onUpdated.removeListener(loaded);
        }
      };
      chrome.tabs.onUpdated.addListener(loaded);
    }
    var findExistingTab = function () {
      chrome.tabs.query({url: "*://soundcloud.com/*"}, function (tabs) {
        var activeTabs = [],
          promisesArray = [];
        tabs.forEach(function (tab) {
          promisesArray.push(new Promise(function (resolve, reject) {
            chrome.tabs.sendMessage(tab.id, 'testConnection', function (resp) {
              if (resp) {
                activeTabs.push(tab);
              }
              resolve();
            });
          }));
        });
        Promise.all(promisesArray).then(function () {
          if (activeTabs.length) {
            tabId = activeTabs[0].id;
            clickButton(type)
          } else {
            chrome.tabs.create({
              url: "https://soundcloud.com"
            }, createCallback);
          }
        })

      })
    }
    if (tabId) {
      try {
        chrome.tabs.get(tabId, function (tab) {
          // check if tab still exist
          if (tab) {
            clickButton(type);
          }
          else {
            chrome.browserAction.setIcon({
              path: "../../icons/play19.png"
            });
            chrome.browserAction.setTitle({title: "Play SoundCloud"});
            chrome.contextMenus.update(contextId, title);
            findExistingTab();
          }
        });
      } catch (err) {
        findExistingTab();
      }
    } else {
      findExistingTab();
    }
  }
  chrome.browserAction.onClicked.addListener(browserActionFire);
  contextId = chrome.contextMenus.create({title: "Play SoundCloud", onclick: clickButton});
  chrome.commands.onCommand.addListener(browserActionFire);
  chrome.runtime.onInstalled.addListener(function () {
    var player = localStorage.getItem('player');
    var toolbar = localStorage.getItem('toolbar');
    if (!player)
      localStorage.setItem('player', 'on');
    if (!toolbar)
      localStorage.setItem('toolbar', 'on');
  });
})();