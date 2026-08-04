(function () {
    var form = document.getElementById('registerForm');
    var msg = document.getElementById('registerMsg');
    var btn = document.getElementById('registerBtn');
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
  
      var name = ((document.getElementById('regName') || {}).value || '').trim();
      var email = ((document.getElementById('regEmail') || {}).value || '').trim();
      var password = (document.getElementById('regPassword') || {}).value || '';
      var confirm = (document.getElementById('regConfirm') || {}).value || '';
      var terms = document.getElementById('regTerms');
  
      if (!name || !email || !password) {
        setMsg('Fill in name, email and password.', 'error');
        return;
      }
      if (password.length < 6) {
        setMsg('Password must be at least 6 characters.', 'error');
        return;
      }
      if (password !== confirm) {
        setMsg('Passwords do not match.', 'error');
        return;
      }
      if (terms && !terms.checked) {
        setMsg('Accept the club portal rules to continue.', 'error');
        return;
      }
  
      if (btn) btn.disabled = true;
      setMsg('Creating your account…');
  
      var result = await window.sb.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { full_name: name, display_name: name },
          emailRedirectTo: window.location.origin + '/pages/dashboard.html'
        }
      });
  
      if (result.error) {
        setMsg(result.error.message, 'error');
        if (btn) btn.disabled = false;
        return;
      }
  
      try {
        localStorage.setItem(
          'da_profile',
          JSON.stringify({ name: name, bio: '', bestWorld: null, bestDa: null })
        );
      } catch (_) {}
  
      setMsg('Account created. Redirecting…', 'ok');
      window.location.href = 'dashboard.html';
    });
  })();