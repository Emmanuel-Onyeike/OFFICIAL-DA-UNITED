(function () {
    /* PIN not stored as plain "123789".
       Char codes [49,50,51,55,56,57] = 1 2 3 7 8 9
       Plus hash check on input. */
    var PIN_CODES = [49, 50, 51, 55, 56, 57];
  
    function hashPin(str) {
      var h = 0;
      for (var i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i);
        h |= 0;
      }
      return (h >>> 0).toString(16);
    }
  
    var EXPECTED_HASH = hashPin(
      String.fromCharCode(49, 50, 51, 55, 56, 57)
    );
  
    function pinOk(value) {
      var t = String(value || '').replace(/\D/g, '');
      if (t.length !== 6) return false;
      for (var i = 0; i < 6; i++) {
        if (t.charCodeAt(i) !== PIN_CODES[i]) return false;
      }
      return hashPin(t) === EXPECTED_HASH;
    }
  
    var gate = document.getElementById('pinGate');
    var app = document.getElementById('adminApp');
    var input = document.getElementById('pinInput');
    var err = document.getElementById('pinError');
    var submit = document.getElementById('pinSubmit');
    var lockBtn = document.getElementById('adminLockBtn');
  
    var fails = Number(sessionStorage.getItem('da_pin_fails') || 0);
    if (fails >= 3) {
      window.location.replace('dashboard.html');
      return;
    }
  
    function unlock() {
      if (gate) gate.classList.add('is-hidden');
      if (app) {
        app.classList.remove('is-locked');
        app.classList.add('is-open');
      }
      sessionStorage.setItem('da_admin_ok', '1');
      sessionStorage.setItem('da_pin_fails', '0');
    }
  
    function lock() {
      sessionStorage.removeItem('da_admin_ok');
      if (app) {
        app.classList.add('is-locked');
        app.classList.remove('is-open');
      }
      if (gate) gate.classList.remove('is-hidden');
      if (input) input.value = '';
      if (err) err.textContent = '';
    }
  
    if (sessionStorage.getItem('da_admin_ok') === '1') {
      unlock();
    }
  
    function tryUnlock() {
      if (!input) return;
      if (pinOk(input.value)) {
        fails = 0;
        unlock();
        return;
      }
      fails += 1;
      sessionStorage.setItem('da_pin_fails', String(fails));
      if (err) {
        err.textContent = fails >= 3
          ? 'Too many attempts. Redirecting…'
          : 'Wrong PIN (' + fails + '/3)';
      }
      if (fails >= 3) {
        setTimeout(function () {
          window.location.replace('dashboard.html');
        }, 900);
      }
    }
  
    if (submit) submit.addEventListener('click', tryUnlock);
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') tryUnlock();
      });
    }
    if (lockBtn) {
      lockBtn.addEventListener('click', function (e) {
        e.preventDefault();
        lock();
      });
    }
  })();
