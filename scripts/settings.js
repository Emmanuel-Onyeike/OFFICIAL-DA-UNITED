(function () {
    var SETTINGS_KEY = 'da_settings';
  
    function load() {
      try {
        var raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return { notify: true, sound: true };
        var d = JSON.parse(raw);
        return {
          notify: d.notify !== false,
          sound: d.sound !== false
        };
      } catch (e) {
        return { notify: true, sound: true };
      }
    }
  
    function save(s) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
  
    var state = load();
    var toast = document.getElementById('stToast');
  
    function showToast(text) {
      if (!toast) return;
      toast.textContent = text;
      toast.classList.add('is-show');
      clearTimeout(showToast._t);
      showToast._t = setTimeout(function () {
        toast.classList.remove('is-show');
      }, 2200);
    }
  
    function bindToggle(id, key) {
      var btn = document.getElementById(id);
      if (!btn) return;
      function sync() {
        btn.classList.toggle('is-on', !!state[key]);
        btn.setAttribute('aria-pressed', state[key] ? 'true' : 'false');
      }
      sync();
      btn.addEventListener('click', function () {
        state[key] = !state[key];
        save(state);
        sync();
        showToast(
          key === 'notify'
            ? state.notify ? 'Notifications on' : 'Notifications off'
            : state.sound ? 'Sounds on' : 'Sounds off'
        );
      });
    }
  
    bindToggle('stNotify', 'notify');
    bindToggle('stSound', 'sound');
  
    var resetPred = document.getElementById('stResetPred');
    if (resetPred) {
      resetPred.addEventListener('click', function () {
        if (!confirm('Clear your saved match prediction?')) return;
        localStorage.removeItem('da_user_prediction');
        showToast('Prediction cleared');
      });
    }
  
    var resetProfile = document.getElementById('stResetProfile');
    if (resetProfile) {
      resetProfile.addEventListener('click', function () {
        if (!confirm('Reset your profile name, bio, and favourite players?')) return;
        localStorage.removeItem('da_profile');
        showToast('Profile reset');
      });
    }
  
    var exitBtn = document.getElementById('stExit');
    if (exitBtn) {
      exitBtn.addEventListener('click', function () {
        window.location.href = 'welcome.html';
      });
    }
  })();