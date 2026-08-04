(function () {
    var KEY = 'da_fixtures';
    var tabs = document.querySelectorAll('.lv-tab');
    var panelLive = document.getElementById('lvPanelLive');
    var panelDone = document.getElementById('lvPanelDone');
    var emptyLive = document.getElementById('lvEmptyLive');
    var emptyDone = document.getElementById('lvEmptyDone');
    var listLive = document.getElementById('lvListLive');
    var listDone = document.getElementById('lvListDone');
  
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
  
    function cardHtml(m, isLive) {
      var home = !!m.home;
      var us = 'DA United';
      var opp = m.opponent || 'Opponent';
      var left = home ? us : opp;
      var right = home ? opp : us;
      var score = m.score || (isLive ? '0 - 0' : '—');
  
      return (
        '<article class="lv-card' + (isLive ? ' is-live' : '') + '">' +
        '<div class="lv-card-top">' +
        '<span class="lv-badge ' + (isLive ? 'live' : 'done') + '">' +
        (isLive ? 'Live' : 'FT') +
        '</span>' +
        '<span class="lv-comp">' + esc(m.type || 'Match') + '</span>' +
        '</div>' +
        '<div class="lv-match">' +
        '<div class="lv-side">' + esc(left) + '</div>' +
        '<div class="lv-score">' + esc(score) + '</div>' +
        '<div class="lv-side away">' + esc(right) + '</div>' +
        '</div>' +
        '<div class="lv-meta">' +
        esc(m.dateLabel || '') +
        (m.venue ? ' · ' + esc(m.venue) : '') +
        '</div></article>'
      );
    }
  
    function renderLists() {
      var all = load();
      var live = all.filter(function (m) { return m.status === 'live'; });
      var done = all.filter(function (m) { return m.status === 'result'; }).reverse();
  
      if (!live.length) {
        emptyLive.hidden = false;
        listLive.hidden = true;
        listLive.innerHTML = '';
      } else {
        emptyLive.hidden = true;
        listLive.hidden = false;
        listLive.innerHTML = live.map(function (m) { return cardHtml(m, true); }).join('');
      }
  
      if (!done.length) {
        emptyDone.hidden = false;
        listDone.hidden = true;
        listDone.innerHTML = '';
      } else {
        emptyDone.hidden = true;
        listDone.hidden = false;
        listDone.innerHTML = done.map(function (m) { return cardHtml(m, false); }).join('');
      }
    }
  
    function showTab(name) {
      tabs.forEach(function (t) {
        t.classList.toggle('is-active', t.getAttribute('data-tab') === name);
      });
      if (panelLive) panelLive.hidden = name !== 'live';
      if (panelDone) panelDone.hidden = name !== 'concluded';
    }
  
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        showTab(t.getAttribute('data-tab'));
      });
    });
  
    renderLists();
    window.DA_refreshLive = renderLists;
  })();