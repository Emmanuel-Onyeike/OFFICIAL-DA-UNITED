(function () {
    var KEY_STATS = 'da_stats';
    var KEY_SQUAD = 'da_squad';
    var mobBtns = document.querySelectorAll('.ga-mob-btn');
    var colGoals = document.getElementById('gaColGoals');
    var colAssists = document.getElementById('gaColAssists');
    var emptyG = document.getElementById('gaEmptyGoals');
    var emptyA = document.getElementById('gaEmptyAssists');
    var listG = document.getElementById('gaListGoals');
    var listA = document.getElementById('gaListAssists');
    var badgeG = document.getElementById('gaBadgeGoals');
    var badgeA = document.getElementById('gaBadgeAssists');
  
    function loadPlayers() {
      function parse(key) {
        try {
          var raw = localStorage.getItem(key);
          if (!raw) return [];
          var d = JSON.parse(raw);
          return Array.isArray(d) ? d : [];
        } catch (e) {
          return [];
        }
      }
      var stats = parse(KEY_STATS);
      if (stats.length) return stats;
      return parse(KEY_SQUAD);
    }
  
    function esc(s) {
      var d = document.createElement('div');
      d.textContent = s == null ? '' : String(s);
      return d.innerHTML;
    }
  
    function rowHtml(p, rank, value) {
      var av = p.photo
        ? '<img src="' + esc(p.photo) + '" alt="">'
        : esc((p.name || '?').charAt(0).toUpperCase());
      return (
        '<div class="ga-row">' +
        '<span class="ga-rank' + (rank <= 3 ? ' top' : '') + '">' + rank + '</span>' +
        '<div class="ga-avatar">' + av + '</div>' +
        '<div class="ga-info">' +
        '<div class="ga-name">' + esc(p.name || 'Unknown') + '</div>' +
        '<div class="ga-sub">' + esc(p.pos || p.team || '') + '</div>' +
        '</div>' +
        '<div class="ga-stat">' + value + '</div>' +
        '</div>'
      );
    }
  
    function render() {
      var players = loadPlayers();
      var scorers = players
        .filter(function (p) { return Number(p.goals) > 0; })
        .sort(function (a, b) { return Number(b.goals) - Number(a.goals); });
      var makers = players
        .filter(function (p) { return Number(p.assists) > 0; })
        .sort(function (a, b) { return Number(b.assists) - Number(a.assists); });
  
      if (badgeG) badgeG.textContent = scorers.length ? scorers.length + ' players' : 'Empty';
      if (badgeA) badgeA.textContent = makers.length ? makers.length + ' players' : 'Empty';
  
      if (!scorers.length) {
        emptyG.hidden = false;
        listG.hidden = true;
        listG.innerHTML = '';
      } else {
        emptyG.hidden = true;
        listG.hidden = false;
        listG.innerHTML = scorers.map(function (p, i) {
          return rowHtml(p, i + 1, Number(p.goals));
        }).join('');
      }
  
      if (!makers.length) {
        emptyA.hidden = false;
        listA.hidden = true;
        listA.innerHTML = '';
      } else {
        emptyA.hidden = true;
        listA.hidden = false;
        listA.innerHTML = makers.map(function (p, i) {
          return rowHtml(p, i + 1, Number(p.assists));
        }).join('');
      }
    }
  
    function showMobile(which) {
      mobBtns.forEach(function (b) {
        b.classList.toggle('is-active', b.getAttribute('data-panel') === which);
      });
      if (window.matchMedia('(min-width: 900px)').matches) return;
      if (colGoals) colGoals.hidden = which !== 'goals';
      if (colAssists) colAssists.hidden = which !== 'assists';
    }
  
    mobBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        showMobile(b.getAttribute('data-panel'));
      });
    });
  
    function onResize() {
      if (window.matchMedia('(min-width: 900px)').matches) {
        if (colGoals) colGoals.hidden = false;
        if (colAssists) colAssists.hidden = false;
      } else {
        var active = document.querySelector('.ga-mob-btn.is-active');
        showMobile(active ? active.getAttribute('data-panel') : 'goals');
      }
    }
  
    window.addEventListener('resize', onResize);
    onResize();
    render();
    window.DA_refreshGoals = render;
  })();