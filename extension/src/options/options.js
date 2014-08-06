/**
 * Created by skaczorowski on 18/07/14.
 */
(function () {
    var player = localStorage.getItem('player'),
      playerCheckbox = document.querySelector('.player');
    playerCheckbox.checked = player == 'on' ? true : false;
    playerCheckbox.addEventListener('change', function () {
      localStorage.setItem('player', this.checked ? 'on' : 'off');
    });
})();