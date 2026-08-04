(function () {
    function $(id) { return document.getElementById(id); }
    function load(key) {
      try {
        var r = localStorage.getItem(key);
        if (!r) return [];
        var d = JSON.parse(r);
        return Array.isArray(d) ? d : [];
      } catch (e) { return []; }
    }
    function save(key, arr) {
      localStorage.setItem(key, JSON.stringify(arr));
    }
    function uid() {
      return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }
    function toast(msg) {
      var t = $('adToast');
      if (!t) return;
      t.textContent = msg;
      t.classList.add('is-show');
      clearTimeout(toast._tm);
      toast._tm = setTimeout(function () { t.classList.remove('is-show'); }, 2000);
    }
    function esc(s) {
      var d = document.createElement('div');
      d.textContent = s == null ? '' : String(s);
      return d.innerHTML;
    }
  
    /* Tabs */
    var tabs = document.querySelectorAll('.ad-tab');
    var panels = document.querySelectorAll('.ad-panel');
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-ad');
        tabs.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        panels.forEach(function (p) { p.hidden = p.getAttribute('data-ad') !== id; });
      });
    });
  
    /* —— SQUAD —— */
    var SQUAD = 'da_squad';
    function renderSquad() {
      var list = $('adSquadList');
      if (!list) return;
      var items = load(SQUAD);
      if (!items.length) {
        list.innerHTML = '<div class="ad-item"><span class="ad-item-sub">No players yet</span></div>';
        return;
      }
      list.innerHTML = items.map(function (p) {
        return '<div class="ad-item"><div><div class="ad-item-main">' +
          esc((p.number != null ? '#' + p.number + ' ' : '') + (p.name || '')) +
          '</div><div class="ad-item-sub">' + esc([p.team, p.pos, p.role].filter(Boolean).join(' · ')) +
          (p.goals || p.assists ? ' · G' + (p.goals || 0) + ' A' + (p.assists || 0) : '') +
          '</div></div><div class="ad-item-actions">' +
          '<button type="button" class="ad-icon-btn danger" data-del-squad="' + esc(p.id) + '"><i class="fas fa-trash"></i></button>' +
          '</div></div>';
      }).join('');
      list.querySelectorAll('[data-del-squad]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-del-squad');
          save(SQUAD, load(SQUAD).filter(function (x) { return x.id !== id; }));
          renderSquad();
          toast('Player removed');
        });
      });
    }
    var squadForm = $('adSquadForm');
    if (squadForm) {
      squadForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var items = load(SQUAD);
        items.push({
          id: uid(),
          name: $('adSqName').value.trim(),
          number: $('adSqNum').value.trim(),
          pos: $('adSqPos').value,
          team: $('adSqTeam').value,
          role: $('adSqRole').value.trim(),
          photo: $('adSqPhoto').value.trim(),
          goals: Number($('adSqGoals').value) || 0,
          assists: Number($('adSqAssists').value) || 0
        });
        save(SQUAD, items);
        squadForm.reset();
        renderSquad();
        toast('Player added');
      });
    }
  
    /* —— FIXTURES —— */
    var FX = 'da_fixtures';
    function renderFx() {
      var list = $('adFxList');
      if (!list) return;
      var items = load(FX);
      if (!items.length) {
        list.innerHTML = '<div class="ad-item"><span class="ad-item-sub">No fixtures yet</span></div>';
        return;
      }
      list.innerHTML = items.map(function (m) {
        return '<div class="ad-item"><div><div class="ad-item-main">vs ' + esc(m.opponent || '') +
          '</div><div class="ad-item-sub">' + esc([m.team, m.status, m.type, m.dateLabel, m.score || m.time].filter(Boolean).join(' · ')) +
          '</div></div><div class="ad-item-actions">' +
          '<button type="button" class="ad-icon-btn danger" data-del-fx="' + esc(m.id) + '"><i class="fas fa-trash"></i></button>' +
          '</div></div>';
      }).join('');
      list.querySelectorAll('[data-del-fx]').forEach(function (b) {
        b.addEventListener('click', function () {
          save(FX, load(FX).filter(function (x) { return x.id !== b.getAttribute('data-del-fx'); }));
          renderFx();
          toast('Fixture removed');
        });
      });
    }
    var fxForm = $('adFxForm');
    if (fxForm) {
      fxForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var items = load(FX);
        items.push({
          id: uid(),
          team: $('adFxTeam').value,
          type: $('adFxType').value.trim() || 'Match',
          opponent: $('adFxOpp').value.trim(),
          opponentLogo: $('adFxLogo').value.trim(),
          dateLabel: $('adFxDate').value.trim(),
          home: $('adFxHome').value === 'home',
          status: $('adFxStatus').value,
          score: $('adFxScore').value.trim(),
          time: $('adFxTime').value.trim(),
          venue: $('adFxVenue').value.trim()
        });
        save(FX, items);
        fxForm.reset();
        renderFx();
        toast('Fixture saved');
      });
    }
  
    /* —— FOR YOU —— */
    var FY = 'da_foryou_posts';
    function renderFy() {
      var list = $('adFyList');
      if (!list) return;
      var items = load(FY);
      if (!items.length) {
        list.innerHTML = '<div class="ad-item"><span class="ad-item-sub">No posts yet</span></div>';
        return;
      }
      list.innerHTML = items.map(function (p) {
        return '<div class="ad-item"><div><div class="ad-item-main">' + esc(p.title || '') +
          '</div><div class="ad-item-sub">' + esc([p.category, p.date].filter(Boolean).join(' · ')) +
          '</div></div><div class="ad-item-actions">' +
          '<button type="button" class="ad-icon-btn danger" data-del-fy="' + esc(p.id) + '"><i class="fas fa-trash"></i></button>' +
          '</div></div>';
      }).join('');
      list.querySelectorAll('[data-del-fy]').forEach(function (b) {
        b.addEventListener('click', function () {
          save(FY, load(FY).filter(function (x) { return x.id !== b.getAttribute('data-del-fy'); }));
          renderFy();
          toast('Post removed');
        });
      });
    }
    var fyForm = $('adFyForm');
    if (fyForm) {
      fyForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var items = load(FY);
        items.push({
          id: uid(),
          category: $('adFyCat').value.trim() || 'News',
          date: $('adFyDate').value.trim(),
          title: $('adFyTitle').value.trim(),
          excerpt: $('adFyExcerpt').value.trim(),
          body: $('adFyBody').value.trim(),
          image: $('adFyImage').value.trim()
        });
        save(FY, items);
        fyForm.reset();
        renderFy();
        toast('For You post added');
      });
    }
  
    /* —— NEWS —— */
    var NEWS = 'da_news';
    function renderNews() {
      var list = $('adNewsList');
      if (!list) return;
      var items = load(NEWS);
      if (!items.length) {
        list.innerHTML = '<div class="ad-item"><span class="ad-item-sub">No news yet</span></div>';
        return;
      }
      list.innerHTML = items.map(function (n) {
        return '<div class="ad-item"><div><div class="ad-item-main">' + esc(n.title || '') +
          '</div><div class="ad-item-sub">' + esc(n.category) + '</div></div>' +
          '<div class="ad-item-actions"><button type="button" class="ad-icon-btn danger" data-del-news="' + esc(n.id) + '"><i class="fas fa-trash"></i></button></div></div>';
      }).join('');
      list.querySelectorAll('[data-del-news]').forEach(function (b) {
        b.addEventListener('click', function () {
          save(NEWS, load(NEWS).filter(function (x) { return x.id !== b.getAttribute('data-del-news'); }));
          renderNews();
          toast('News removed');
        });
      });
    }
    var newsForm = $('adNewsForm');
    if (newsForm) {
      newsForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var items = load(NEWS);
        items.push({
          id: uid(),
          category: $('adNewsCat').value,
          title: $('adNewsTitle').value.trim(),
          excerpt: $('adNewsExcerpt').value.trim(),
          body: $('adNewsBody').value.trim(),
          image: $('adNewsImage').value.trim(),
          date: $('adNewsDate').value.trim()
        });
        save(NEWS, items);
        newsForm.reset();
        renderNews();
        toast('News published');
      });
    }
  
    /* —— DATV —— */
    var STREAMS = 'da_streams';
    function renderStreams() {
      var list = $('adStreamList');
      if (!list) return;
      var items = load(STREAMS);
      if (!items.length) {
        list.innerHTML = '<div class="ad-item"><span class="ad-item-sub">No streams yet</span></div>';
        return;
      }
      list.innerHTML = items.map(function (s) {
        return '<div class="ad-item"><div><div class="ad-item-main">' + esc(s.title || '') +
          '</div><div class="ad-item-sub">' + esc(s.status) + '</div></div>' +
          '<div class="ad-item-actions"><button type="button" class="ad-icon-btn danger" data-del-st="' + esc(s.id) + '"><i class="fas fa-trash"></i></button></div></div>';
      }).join('');
      list.querySelectorAll('[data-del-st]').forEach(function (b) {
        b.addEventListener('click', function () {
          save(STREAMS, load(STREAMS).filter(function (x) { return x.id !== b.getAttribute('data-del-st'); }));
          renderStreams();
          toast('Stream removed');
        });
      });
    }
    var streamForm = $('adStreamForm');
    if (streamForm) {
      streamForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var items = load(STREAMS);
        items.push({
          id: uid(),
          title: $('adStTitle').value.trim(),
          status: $('adStStatus').value,
          embedUrl: $('adStEmbed').value.trim(),
          opponent: $('adStOpp').value.trim(),
          venue: $('adStVenue').value.trim(),
          startLabel: $('adStWhen').value.trim()
        });
        save(STREAMS, items);
        streamForm.reset();
        renderStreams();
        toast('Stream saved');
      });
    }
  
    /* —— PREDICTION MATCH —— */
    var PRED = 'da_prediction_match';
    function loadPredMatch() {
      try {
        var r = localStorage.getItem(PRED);
        return r ? JSON.parse(r) : null;
      } catch (e) { return null; }
    }
    function renderPred() {
      var box = $('adPredCurrent');
      if (!box) return;
      var m = loadPredMatch();
      if (!m) {
        box.innerHTML = '<span class="ad-item-sub">No prediction match set</span>';
        return;
      }
      box.innerHTML = '<div class="ad-item-main">' + esc(m.home || 'DA United') + ' vs ' + esc(m.away || m.opponent || '') +
        '</div><div class="ad-item-sub">' + esc([m.dateLabel, m.venue].filter(Boolean).join(' · ')) + '</div>';
    }
    var predForm = $('adPredForm');
    if (predForm) {
      predForm.addEventListener('submit', function (e) {
        e.preventDefault();
        localStorage.setItem(PRED, JSON.stringify({
          id: uid(),
          home: 'DA United',
          away: $('adPredAway').value.trim(),
          dateLabel: $('adPredDate').value.trim(),
          venue: $('adPredVenue').value.trim()
        }));
        predForm.reset();
        renderPred();
        toast('Prediction match set');
      });
    }
    var predClear = $('adPredClear');
    if (predClear) {
      predClear.addEventListener('click', function () {
        localStorage.removeItem(PRED);
        renderPred();
        toast('Prediction match cleared');
      });
    }
  
    /* —— TRAINING —— */
    var TR = 'da_training';
    function renderTr() {
      var list = $('adTrList');
      if (!list) return;
      var items = load(TR);
      if (!items.length) {
        list.innerHTML = '<div class="ad-item"><span class="ad-item-sub">No sessions yet</span></div>';
        return;
      }
      list.innerHTML = items.map(function (t) {
        return '<div class="ad-item"><div><div class="ad-item-main">' + esc(t.title || '') +
          '</div><div class="ad-item-sub">' + esc([t.dayName, t.dayNum, t.time].filter(Boolean).join(' · ')) +
          '</div></div><div class="ad-item-actions"><button type="button" class="ad-icon-btn danger" data-del-tr="' + esc(t.id) + '"><i class="fas fa-trash"></i></button></div></div>';
      }).join('');
      list.querySelectorAll('[data-del-tr]').forEach(function (b) {
        b.addEventListener('click', function () {
          save(TR, load(TR).filter(function (x) { return x.id !== b.getAttribute('data-del-tr'); }));
          renderTr();
          toast('Session removed');
        });
      });
    }
    var trForm = $('adTrForm');
    if (trForm) {
      trForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var items = load(TR);
        items.push({
          id: uid(),
          title: $('adTrTitle').value.trim(),
          focus: $('adTrFocus').value.trim(),
          dayName: $('adTrDay').value.trim(),
          dayNum: $('adTrNum').value.trim(),
          time: $('adTrTime').value.trim(),
          venue: $('adTrVenue').value.trim(),
          team: $('adTrTeam').value.trim(),
          notes: $('adTrNotes').value.trim()
        });
        save(TR, items);
        trForm.reset();
        renderTr();
        toast('Training added');
      });
    }
  
    /* —— GALLERY —— */
    var GY = 'da_gallery';
    function renderGy() {
      var list = $('adGyList');
      if (!list) return;
      var items = load(GY);
      if (!items.length) {
        list.innerHTML = '<div class="ad-item"><span class="ad-item-sub">No photos yet</span></div>';
        return;
      }
      list.innerHTML = items.map(function (g) {
        return '<div class="ad-item"><div><div class="ad-item-main">' + esc(g.caption || g.src || '') +
          '</div><div class="ad-item-sub">' + esc(g.category) + '</div></div>' +
          '<div class="ad-item-actions"><button type="button" class="ad-icon-btn danger" data-del-gy="' + esc(g.id) + '"><i class="fas fa-trash"></i></button></div></div>';
      }).join('');
      list.querySelectorAll('[data-del-gy]').forEach(function (b) {
        b.addEventListener('click', function () {
          save(GY, load(GY).filter(function (x) { return x.id !== b.getAttribute('data-del-gy'); }));
          renderGy();
          toast('Photo removed');
        });
      });
    }
    var gyForm = $('adGyForm');
    if (gyForm) {
      gyForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var items = load(GY);
        items.push({
          id: uid(),
          src: $('adGySrc').value.trim(),
          caption: $('adGyCap').value.trim(),
          category: $('adGyCat').value
        });
        save(GY, items);
        gyForm.reset();
        renderGy();
        toast('Photo added');
      });
    }
  
    /* —— POINTS —— */
    var ptsBtn = $('adPtsAdd');
    if (ptsBtn) {
      ptsBtn.addEventListener('click', function () {
        var n = Number($('adPtsVal').value) || 0;
        var cur = Number(localStorage.getItem('da_user_points') || 0) || 0;
        localStorage.setItem('da_user_points', String(cur + n));
        toast('Points updated: ' + (cur + n));
      });
    }
  
    renderSquad();
    renderFx();
    renderFy();
    renderNews();
    renderStreams();
    renderPred();
    renderTr();
    renderGy();
  })();
  