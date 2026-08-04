(function () {
    var form = document.getElementById('loginForm');
    var msg = document.getElementById('loginMsg');
    var btn = document.getElementById('loginBtn');
    if (!form) return;
  
    function setMsg(text, type) {
      if (!msg) return;
      msg.textContent = text || '';
      msg.className = 'auth-msg' + (type ? ' ' + type : '');
    }
  
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      setMsg('');
  
      if (!window.sb) {
        setMsg('Supabase not loaded.', 'error');
        return;
      }
  
      var email = ((document.getElementById('loginEmail') || {}).value || '').trim();
      var password = (document.getElementById('loginPassword') || {}).value || '';
  
      if (!email || !password) {
        setMsg('Enter email and password.', 'error');
        return;
      }
  
      if (btn) btn.disabled = true;
      setMsg('Signing in…');
  
      var result = await window.sb.auth.signInWithPassword({
        email: email,
        password: password
      });
  
      if (result.error) {
        setMsg(result.error.message, 'error');
        if (btn) btn.disabled = false;
        return;
      }
  
      setMsg('Signed in. Redirecting…', 'ok');
      window.location.href = 'dashboard.html';
    });
  })();