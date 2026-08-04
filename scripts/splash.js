/* Splash → welcome after logo animation (~5s) */
(function () {
    const REDIRECT_MS = 5000;
    const TARGET = 'pages/welcome.html';
  
    // Prefer session so back-button from welcome doesn't re-loop forever
    // (remove this block if you always want the splash)
    if (sessionStorage.getItem('splash_seen') === '1') {
      window.location.replace(TARGET);
      return;
    }
  
    setTimeout(function () {
      sessionStorage.setItem('splash_seen', '1');
      window.location.replace(TARGET);
    }, REDIRECT_MS);
  })();