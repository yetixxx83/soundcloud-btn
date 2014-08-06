(function () {
  var playButton = document.querySelector('.playControl');
  var trackInfoElement = document.querySelector('.playbackTitle__link');
  var progressBar = document.querySelector('.progressBar__bar');
  var prevButton = document.querySelector('.skipControl__previous');
  var nextButton = document.querySelector('.skipControl__next');
  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

      if (request == "clicked") {
        play();
      } else if (request == 'testConnection') {
        sendResponse(true);
      } else if (request == 'getTrackInfo') {
        getTrackInfo();
      } else if (request == 'next') {
        if (!nextButton)
          nextButton = document.querySelector('.skipControl__next')
        nextButton.click();
      } else if (request == 'prev') {
        if (!prevButton)
          prevButton = document.querySelector('.skipControl__previous');
        if (!prevButton.classList.contains('disabled')) {
          prevButton.click();
        }
      }
    });
  var play = function () {
    try{
      playButton.click();
    } catch(error){
      setObserver(true);
    }
  }
  var getTrackInfo = function () {
    var procentage = false;
    if (!trackInfoElement)
      trackInfoElement = document.querySelector('.playbackTitle__link');
    if (!playButton)
      playButton = document.querySelector('.playControl');
    if (!prevButton)
      prevButton = document.querySelector('.skipControl__previous');
    progressBar = document.querySelector('.playControls__wrapper .progressBar__bar');
    if (progressBar) {
      procentage = ((progressBar.style.width.replace('px', '') / progressBar.parentNode.offsetWidth) * 100);
    }
    try {
      chrome.runtime.sendMessage({
        type: 'trackInfo',
        msg: {
          procentage: procentage,
          trackTitle: trackInfoElement && trackInfoElement.textContent || '',
          trackUrl: trackInfoElement && trackInfoElement.href || '',
          isPlaying: playButton.classList.contains('playing'),
          prevDisabled: prevButton.classList.contains('disabled')
        }
      });
    } catch (err) {
      console.log(err);
    }
  }
  var setObserver = function (play) {
    try {
      playButton = document.querySelector('.playControl');
      var playButtonObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.attributeName === 'class') {
            if (mutation.target.classList.contains('playing')) {
              chrome.runtime.sendMessage({
                type: 'isPlaying'
              });
            } else {
              chrome.runtime.sendMessage({
                type: 'isPaused'
              });
            }
          }
        });
      });
      var playButtonConfig = { attributes: true};
      playButtonObserver.observe(playButton, playButtonConfig);
      if (play)
        playButton.click();
    } catch (err) {
      setTimeout(setObserver.bind(this, play), 200);
    }
  };
  setObserver();
})();
