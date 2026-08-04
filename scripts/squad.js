(function () {
    var KEY = 'da_squad';
    var teamTabs = document.getElementById('sqTeamTabs');
    var posTabs = document.getElementById('sqPosTabs');
    var emptyGlobal = document.getElementById('sqEmptyGlobal');
    var sectionsWrap = document.getElementById('sqSections');
    var POS = ['GK', 'DEF', 'MID', 'FWD'];
    var activeTeam = 'men';
    var activePos = 'all';
  
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
  
    function cardHtml(p) {
      var photo = p.photo
        ? '<img src="' + esc(p.photo) + '" alt="">'
        : '<span class="sq-card-photo-fallback">' +
          esc((p.name || '?').charAt(0).toUpperCase()) +
          '</span>';
      var num =
        p.number != null && p.number !== ''
          ? '<span class="sq-card-num">#' + esc(String(p.number)) + '</span>'
          : '';
      var meta = [p.pos, p.role].filter(Boolean).join(' · ');
      return (
        '<article class="sq-card">' +
        '<div class="sq-card-photo">' + photo + num + '</div>' +
        '<div class="sq-card-body">' +
        '<h4 class="sq-card-name">' + esc(p.name || 'Unknown') + '</h4>' +
        '<div class="sq-card-meta">' + esc(meta) + '</div>' +
        '</div></article>'
      );
    }
  
    function render() {
      var all = load().filter(function (p) {
        return (p.team || 'men') === activeTeam;
      });
  
      if (!all.length) {
        emptyGlobal.hidden = false;
        sectionsWrap.hidden = true;
        return;
      }
  
      emptyGlobal.hidden = true;
      sectionsWrap.hidden = false;
  
      POS.forEach(function (pos) {
        var section = document.querySelector('[data-pos-section="' + pos + '"]');
        var grid = document.getElementById('sqGrid' + pos);
        var emptyPos = document.getElementById('sqEmpty' + pos);
        if (!section || !grid || !emptyPos) return;
  
        var list = all.filter(function (p) {
          return (p.pos || '').toUpperCase() === pos;
        });
  
        if (activePos !== 'all' && activePos !== pos) {
          section.hidden = true;
          return;
        }
        section.hidden = false;
        grid.innerHTML = list.map(cardHtml).join('');
        emptyPos.hidden = list.length > 0;
      });
    }
  
    if (teamTabs) {
      teamTabs.querySelectorAll('.sq-team-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          activeTeam = btn.getAttribute('data-team') || 'men';
          teamTabs.querySelectorAll('.sq-team-tab').forEach(function (b) {
            b.classList.toggle('is-active', b === btn);
          });
          render();
        });
      });
    }
  
    if (posTabs) {
      posTabs.querySelectorAll('.sq-pos-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          activePos = btn.getAttribute('data-pos') || 'all';
          posTabs.querySelectorAll('.sq-pos-tab').forEach(function (b) {
            b.classList.toggle('is-active', b === btn);
          });
          render();
        });
      });
    }
  
    render();
    window.DA_refreshSquad = render;
  })();