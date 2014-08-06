/**
 * Created by skaczorowski on 08/07/14.
 */
(function () {
    var init = function () {
      chrome.runtime.sendMessage({type: 'track', msg: {
        category: 'Player',
        action: 'init',
        label: 'inited'
      }});
      var player = [
        '<player-div id="player">',
        '<player-tag class="player-tag">',
            '<a target="_blank" href="https://soundcloud.com"></a>',
        '</player-tag>',
        '<player-wrapper class="player-wrapper">',
        '<player-button class="player-prev disabled"></player-button>',
        '<player-button class="player-play"></player-button>',
        '<player-button class="player-next"></player-button>',
        '<player-info class="player-info"><a href="#"></a></player-info>',
        '<player-state class="player-state-wrapper">',
        '<player-div class="player-state-progress"></player-div>',
        '</player-state>',
        '</player-wrapper>',
        '</player-div>'].join('\n');
      var div = document.createElement('div');
      div.innerHTML = player;
      document.body.appendChild(div.children[0]);
      var playerWrapper = document.getElementById('player'),
        playButton = playerWrapper.querySelector('.player-play'),
        nextButton = playerWrapper.querySelector('.player-next'),
        prevButton = playerWrapper.querySelector('.player-prev'),
        playerStateProgress = playerWrapper.querySelector('.player-state-progress'),
        playerInfo = playerWrapper.querySelector('.player-info'),
        currentPlayingTrack = {title: '', url: ''};

      var changeTrack = function (trackTitle, trackUrl) {
        chrome.runtime.sendMessage({type: 'track', msg: {
          category: 'Player',
          action: 'changeTrack',
          label: 'changeTrack'
        }});
        if (currentPlayingTrack.title !== trackTitle) {
          playerInfo.classList.remove('disappear');
          playerInfo.classList.remove('appear');
          currentPlayingTrack = {title: trackTitle, url: trackUrl};
          playerInfo.classList.add('disappear');
        }
      }

      chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
          switch (request.type) {
            case "trackInfo":
              if (request.msg.procentage) {
                playerStateProgress.style.width = request.msg.procentage + "%";
                playerStateProgress.style.display = 'block';
              }
              else
                playerStateProgress.style.display = 'none';
              if (request.msg.trackTitle) {
                changeTrack(request.msg.trackTitle, request.msg.trackUrl);
              }
              if (request.msg.isPlaying)
                playButton.classList.add('playing');
              else
                playButton.classList.remove('playing');
              if (request.msg.prevDisabled)
                prevButton.classList.add('disabled-prev');
              else
                prevButton.classList.remove('disabled-prev');
              break;
            case "isPlaying":
              playButton.classList.add('playing');
              break;
            case "isPaused":
              playButton.classList.remove('playing');
              break;


          }
        });

      playerInfo.addEventListener('webkitAnimationEnd', function (ev) {
        switch (ev.animationName) {
          case 'disappear':
            playerInfo.classList.remove('disappear');
            playerInfo.innerHTML = '<a target="_blank" href="' + currentPlayingTrack.url + '">' + currentPlayingTrack.title + '</a>';
            break;
          case 'appear':
            console.log('here')
            playerInfo.classList.remove('appear');
            break;
        }
        playerInfo.classList.add('appear');
      })
      playerWrapper.addEventListener('mouseenter', function (e) {
        chrome.runtime.sendMessage({type: 'track', msg: {
          category: 'Player',
          action: 'mouseEnter',
          label: 'mouseEnter'
        }});
        playerInfo.classList.add('appear');
        chrome.runtime.sendMessage({type: 'getTrackInfo'});
      }, false);
      playerWrapper.addEventListener('mouseleave', function (e) {
        chrome.runtime.sendMessage({type: 'track', msg: {
          category: 'Player',
          action: 'mouseLeave',
          label: 'mouseLeave'
        }});
        chrome.runtime.sendMessage({type: 'stopGettingTrackInfo'});
      }, false);
      playButton.addEventListener('click', function (e) {
        chrome.runtime.sendMessage({type: 'track', msg: {
          category: 'Player',
          action: 'Button',
          label: 'Play'
        }});
        chrome.runtime.sendMessage({type: 'playerPlay'});
        chrome.runtime.sendMessage({type: 'getTrackInfo'});
      });
      nextButton.addEventListener('click', function (e) {
        chrome.runtime.sendMessage({type: 'track', msg: {
          category: 'Player',
          action: 'Button',
          label: 'Next'
        }});
        chrome.runtime.sendMessage({type: 'playerNext'});
        playerInfo.querySelector('a').classList.add('changing');
      });
      prevButton.addEventListener('click', function (e) {
        chrome.runtime.sendMessage({type: 'track', msg: {
          category: 'Player',
          action: 'Button',
          label: 'Prev'
        }});
        chrome.runtime.sendMessage({type: 'playerPrev'});
        playerInfo.querySelector('a').classList.add('changing');
      });

    }
    chrome.runtime.sendMessage({type: 'isActive'}, function (activePlayer) {
      if (activePlayer && activePlayer === 'on') {
        init();
      } else {
        chrome.runtime.sendMessage({type: 'track', msg: {
          category: 'Player',
          action: 'Disabled',
          label: 'True'
        }});
      }
    })
})();
