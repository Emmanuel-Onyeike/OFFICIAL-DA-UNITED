(function () {
    var KEY = 'da_fixtures';
    var tabs = document.getElementById('mtpTeamTabs');
    var empty = document.getElementById('mtpEmpty');
    var list = document.getElementById('mtpList');
    var activeTeam = 'men';
  
    function load() {
      try {
        var raw = localStorage.getItem(KEY);
        if (!raw) return [];
        var d = JSON.parse(raw);
        return Array.isArray(d) ? d : [];
      } catch (e) {
        return [];
      }
    }
  
    function esc(s) {
      var d = document.createElement('div');
      d.textContent = s == null ? '' : String(s);
      return d.innerHTML;
    }
  
    function crest(logo, name) {
      if (logo) return '<img class="mtp-crest" src="' + esc(logo) + '" alt="">';
      return '<div class="mtp-crest-fb">' + esc((name || '?').slice(0, 3).toUpperCase()) + '</div>';
    }
  
    function cardHtml(m) {
      var opp = m.opponent || 'TBD';
      var us = 'DA United';
      var home = !!m.home;
      var leftName = home ? us : opp;
      var rightName = home ? opp : us;
      var leftLogo = home ? '../img/logo.png' : m.opponentLogo;
      var rightLogo = home ? m.opponentLogo : '../img/logo.png';
  
      return (
        '<article class="mtp-card">' +
        '<div class="mtp-card-top">' +
        '<span class="mtp-comp">' + esc(m.type || 'Match') + '</span>' +
        '<span class="mtp-when">' + esc(m.dateLabel || '') +
        ' · <span class="mtp-ha">' + (home ? 'Home' : 'Away') + '</span></span>' +
        '</div>' +
        '<div class="mtp-match">' +
        '<div class="mtp-side">' + crest(leftLogo, leftName) +
        '<span class="mtp-team-name">' + esc(leftName) + '</span></div>' +
        '<div class="mtp-score">' + esc(m.score || '—') + '</div>' +
        '<div class="mtp-side away">' + crest(rightLogo, rightName) +
        '<span class="mtp-team-name">' + esc(rightName) + '</span></div>' +
        '</div>' +
        '<div class="mtp-meta">' +
        '<span><i class="fas fa-map-marker-alt"></i>' + esc(m.venue || 'Venue TBD') + '</span>' +
        '<span>Full time</span>' +
        '</div></article>'
      );
    }
  
    function render() {
      var items = load()
        .filter(function (m) {
          return (m.team || 'men') === activeTeam && m.status === 'result';
        })
        .reverse();
  
      if (!items.length) {
        empty.hidden = false;
        list.hidden = true;
        list.innerHTML = '';
        return;
      }
      empty.hidden = true;
      list.hidden = false;
      list.innerHTML = items.map(cardHtml).join('');
    }
  
    if (tabs) {
      tabs.querySelectorAll('.mtp-team-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          activeTeam = btn.getAttribute('data-team') || 'men';
          tabs.querySelectorAll('.mtp-team-tab').forEach(function (b) {
            b.classList.toggle('is-active', b === btn);
          });
          render();
        });
      });
    }
  
    render();
    window.DA_refreshMatches = render;
  })();