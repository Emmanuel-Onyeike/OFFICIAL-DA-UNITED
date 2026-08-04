(function () {
    var KEY = 'da_fixtures';
    var tabs = document.getElementById('fxpTeamTabs');
    var empty = document.getElementById('fxpEmpty');
    var list = document.getElementById('fxpList');
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
      if (logo) return '<img class="fxp-crest" src="' + esc(logo) + '" alt="">';
      return '<div class="fxp-crest-fb">' + esc((name || '?').slice(0, 3).toUpperCase()) + '</div>';
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
        '<article class="fxp-card">' +
        '<div class="fxp-card-top">' +
        '<span class="fxp-comp">' + esc(m.type || 'Match') + '</span>' +
        '<span class="fxp-when">' + esc(m.dateLabel || 'Date TBD') +
        ' · <span class="fxp-ha">' + (home ? 'Home' : 'Away') + '</span></span>' +
        '</div>' +
        '<div class="fxp-match">' +
        '<div class="fxp-side">' + crest(leftLogo, leftName) +
        '<span class="fxp-team-name">' + esc(leftName) + '</span></div>' +
        '<span class="fxp-vs">VS</span>' +
        '<div class="fxp-side away">' + crest(rightLogo, rightName) +
        '<span class="fxp-team-name">' + esc(rightName) + '</span></div>' +
        '</div>' +
        '<div class="fxp-meta">' +
        '<span class="fxp-venue"><i class="fas fa-map-marker-alt"></i>' +
        esc(m.venue || 'Venue TBD') + '</span>' +
        '<span class="fxp-time-pill">' + esc(m.time || 'TBD') + '</span>' +
        '</div></article>'
      );
    }
  
    function render() {
      var items = load().filter(function (m) {
        return (m.team || 'men') === activeTeam && m.status === 'upcoming';
      });
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
      tabs.querySelectorAll('.fxp-team-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          activeTeam = btn.getAttribute('data-team') || 'men';
          tabs.querySelectorAll('.fxp-team-tab').forEach(function (b) {
            b.classList.toggle('is-active', b === btn);
          });
          render();
        });
      });
    }
  
    render();
    window.DA_refreshFixturesPage = render;
  })();