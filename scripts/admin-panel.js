(function () {
  function $(id) { return document.getElementById(id); }
  function toast(msg) {
    var t = $('adToast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-show');
    clearTimeout(toast._tm);
    toast._tm = setTimeout(function () { t.classList.remove('is-show'); }, 2500);
  }
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }
  function push(title, body, url) {
    if (window.DA_pushNotify) window.DA_pushNotify(title, body, url);
  }
  function needSb() {
    if (!window.sb) {
      toast('Supabase not loaded — check CDN + /scripts/supabase-client.js order');
      console.error('window.sb missing');
      return false;
    }
    return true;
  }

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
  async function renderSquad() {
    var list = $('adSquadList');
    if (!list || !needSb()) return;
    var res = await window.sb.from('squad').select('*').order('created_at', { ascending: false });
    if (res.error) {
      list.innerHTML = '<div class="ad-item"><span class="ad-item-sub">' + esc(res.error.message) + '</span></div>';
      return;
    }
    var items = res.data || [];
    if (!items.length) {
      list.innerHTML = '<div class="ad-item"><span class="ad-item-sub">No players yet</span></div>';
      return;
    }
    list.innerHTML = items.map(function (p) {
      return '<div class="ad-item"><div><div class="ad-item-main">' +
        esc((p.number != null && p.number !== '' ? '#' + p.number + ' ' : '') + (p.name || '')) +
        '</div><div class="ad-item-sub">' + esc([p.team, p.pos, p.role].filter(Boolean).join(' · ')) +
        ' · G' + (p.goals || 0) + ' A' + (p.assists || 0) +
        '</div></div><div class="ad-item-actions">' +
        '<button type="button" class="ad-icon-btn danger" data-del-squad="' + esc(p.id) + '"><i class="fas fa-trash"></i></button></div></div>';
    }).join('');
    list.querySelectorAll('[data-del-squad]').forEach(function (b) {
      b.addEventListener('click', async function () {
        var { error } = await window.sb.from('squad').delete().eq('id', b.getAttribute('data-del-squad'));
        if (error) { toast(error.message); return; }
        renderSquad();
        toast('Player removed');
        push('DA United Squad', 'A player was removed', '/pages/squad.html');
      });
    });
  }

  var squadForm = $('adSquadForm');
  if (squadForm) {
    squadForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!needSb()) return;
      var row = {
        name: $('adSqName').value.trim(),
        number: $('adSqNum').value.trim() || null,
        pos: $('adSqPos').value,
        team: $('adSqTeam').value,
        role: $('adSqRole').value.trim() || null,
        photo: $('adSqPhoto').value.trim() || null,
        goals: Number($('adSqGoals').value) || 0,
        assists: Number($('adSqAssists').value) || 0
      };
      var { data, error } = await window.sb.from('squad').insert(row).select();
      if (error) {
        toast('DB error: ' + error.message);
        console.error(error);
        return;
      }
      console.log('Saved to Supabase', data);
      squadForm.reset();
      renderSquad();
      toast('Player saved to Supabase (all devices)');
      push('DA United Squad', 'New player: ' + row.name, '/pages/squad.html');
    });
  }

  /* —— FIXTURES —— */
  async function renderFx() {
    var list = $('adFxList');
    if (!list || !needSb()) return;
    var res = await window.sb.from('fixtures').select('*').order('created_at', { ascending: false });
    var items = res.data || [];
    if (res.error) {
      list.innerHTML = '<div class="ad-item"><span class="ad-item-sub">' + esc(res.error.message) + '</span></div>';
      return;
    }
    if (!items.length) {
      list.innerHTML = '<div class="ad-item"><span class="ad-item-sub">No fixtures yet</span></div>';
      return;
    }
    list.innerHTML = items.map(function (m) {
      return '<div class="ad-item"><div><div class="ad-item-main">vs ' + esc(m.opponent || '') +
        '</div><div class="ad-item-sub">' + esc([m.team, m.status, m.type, m.date_label, m.score || m.time].filter(Boolean).join(' · ')) +
        '</div></div><div class="ad-item-actions">' +
        '<button type="button" class="ad-icon-btn danger" data-del-fx="' + esc(m.id) + '"><i class="fas fa-trash"></i></button></div></div>';
    }).join('');
    list.querySelectorAll('[data-del-fx]').forEach(function (b) {
      b.addEventListener('click', async function () {
        await window.sb.from('fixtures').delete().eq('id', b.getAttribute('data-del-fx'));
        renderFx();
        toast('Fixture removed');
      });
    });
  }

  var fxForm = $('adFxForm');
  if (fxForm) {
    fxForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!needSb()) return;
      var row = {
        team: $('adFxTeam').value,
        type: $('adFxType').value.trim() || 'Match',
        opponent: $('adFxOpp').value.trim(),
        opponent_logo: $('adFxLogo').value.trim() || null,
        date_label: $('adFxDate').value.trim() || null,
        home: $('adFxHome').value === 'home',
        status: $('adFxStatus').value,
        score: $('adFxScore').value.trim() || null,
        time: $('adFxTime').value.trim() || null,
        venue: $('adFxVenue').value.trim() || null
      };
      var { error } = await window.sb.from('fixtures').insert(row);
      if (error) { toast('DB error: ' + error.message); return; }
      fxForm.reset();
      renderFx();
      toast('Fixture saved to Supabase');
      var body = 'DA United vs ' + row.opponent;
      if (row.status === 'live') body = 'LIVE: ' + body;
      else if (row.status === 'result') body = 'FT: ' + body + (row.score ? ' ' + row.score : '');
      else body = 'Fixture: ' + body;
      push('DA United', body, row.status === 'live' ? '/pages/live.html' : '/pages/fixtures.html');
    });
  }

  /* —— FOR YOU —— */
  async function renderFy() {
    var list = $('adFyList');
    if (!list || !needSb()) return;
    var res = await window.sb.from('foryou_posts').select('*').order('created_at', { ascending: false });
    var items = res.data || [];
    if (!items.length) {
      list.innerHTML = '<div class="ad-item"><span class="ad-item-sub">No posts yet</span></div>';
      return;
    }
    list.innerHTML = items.map(function (p) {
      return '<div class="ad-item"><div><div class="ad-item-main">' + esc(p.title || '') +
        '</div><div class="ad-item-sub">' + esc([p.category, p.date].filter(Boolean).join(' · ')) +
        '</div></div><div class="ad-item-actions">' +
        '<button type="button" class="ad-icon-btn danger" data-del-fy="' + esc(p.id) + '"><i class="fas fa-trash"></i></button></div></div>';
    }).join('');
    list.querySelectorAll('[data-del-fy]').forEach(function (b) {
      b.addEventListener('click', async function () {
        await window.sb.from('foryou_posts').delete().eq('id', b.getAttribute('data-del-fy'));
        renderFy();
        toast('Post removed');
      });
    });
  }

  var fyForm = $('adFyForm');
  if (fyForm) {
    fyForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!needSb()) return;
      var row = {
        category: $('adFyCat').value.trim() || 'News',
        date: $('adFyDate').value.trim() || null,
        title: $('adFyTitle').value.trim(),
        excerpt: $('adFyExcerpt').value.trim() || null,
        body: $('adFyBody').value.trim() || null,
        image: $('adFyImage').value.trim() || null
      };
      var { error } = await window.sb.from('foryou_posts').insert(row);
      if (error) { toast(error.message); return; }
      fyForm.reset();
      renderFy();
      toast('For You published (all devices)');
      push('DA United', row.title, '/pages/dashboard.html');
    });
  }

  /* —— NEWS —— */
  async function renderNews() {
    var list = $('adNewsList');
    if (!list || !needSb()) return;
    var res = await window.sb.from('news').select('*').order('created_at', { ascending: false });
    var items = res.data || [];
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
      b.addEventListener('click', async function () {
        await window.sb.from('news').delete().eq('id', b.getAttribute('data-del-news'));
        renderNews();
        toast('News removed');
      });
    });
  }

  var newsForm = $('adNewsForm');
  if (newsForm) {
    newsForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!needSb()) return;
      var row = {
        category: $('adNewsCat').value,
        title: $('adNewsTitle').value.trim(),
        excerpt: $('adNewsExcerpt').value.trim() || null,
        body: $('adNewsBody').value.trim() || null,
        image: $('adNewsImage').value.trim() || null,
        date: $('adNewsDate').value.trim() || null
      };
      var { error } = await window.sb.from('news').insert(row);
      if (error) { toast(error.message); return; }
      newsForm.reset();
      renderNews();
      toast('News published (all devices)');
      push('DA United News', row.title, '/pages/news.html');
    });
  }

  /* —— DATV —— */
  async function renderStreams() {
    var list = $('adStreamList');
    if (!list || !needSb()) return;
    var res = await window.sb.from('streams').select('*').order('created_at', { ascending: false });
    var items = res.data || [];
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
      b.addEventListener('click', async function () {
        await window.sb.from('streams').delete().eq('id', b.getAttribute('data-del-st'));
        renderStreams();
        toast('Stream removed');
      });
    });
  }

  var streamForm = $('adStreamForm');
  if (streamForm) {
    streamForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!needSb()) return;
      var row = {
        title: $('adStTitle').value.trim(),
        status: $('adStStatus').value,
        embed_url: $('adStEmbed').value.trim() || null,
        opponent: $('adStOpp').value.trim() || null,
        venue: $('adStVenue').value.trim() || null,
        start_label: $('adStWhen').value.trim() || null
      };
      var { error } = await window.sb.from('streams').insert(row);
      if (error) { toast(error.message); return; }
      streamForm.reset();
      renderStreams();
      toast('Stream saved');
      push('DA United DATV', (row.status === 'live' ? 'LIVE: ' : '') + row.title, '/pages/datv.html');
    });
  }

  /* —— PREDICTION —— */
  async function renderPred() {
    var box = $('adPredCurrent');
    if (!box || !needSb()) return;
    var res = await window.sb.from('prediction_match').select('*').eq('active', true).order('created_at', { ascending: false }).limit(1);
    var m = (res.data && res.data[0]) || null;
    if (!m) {
      box.innerHTML = '<span class="ad-item-sub">No prediction match set</span>';
      return;
    }
    box.innerHTML = '<div class="ad-item-main">' + esc(m.home || 'DA United') + ' vs ' + esc(m.away || '') +
      '</div><div class="ad-item-sub">' + esc([m.date_label, m.venue].filter(Boolean).join(' · ')) + '</div>';
  }

  var predForm = $('adPredForm');
  if (predForm) {
    predForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!needSb()) return;
      await window.sb.from('prediction_match').update({ active: false }).eq('active', true);
      var row = {
        home: 'DA United',
        away: $('adPredAway').value.trim(),
        date_label: $('adPredDate').value.trim() || null,
        venue: $('adPredVenue').value.trim() || null,
        active: true
      };
      var { error } = await window.sb.from('prediction_match').insert(row);
      if (error) { toast(error.message); return; }
      predForm.reset();
      renderPred();
      toast('Prediction match set');
      push('DA United Predictions', 'Predict: DA United vs ' + row.away, '/pages/prediction.html');
    });
  }
  var predClear = $('adPredClear');
  if (predClear) {
    predClear.addEventListener('click', async function () {
      if (!needSb()) return;
      await window.sb.from('prediction_match').update({ active: false }).eq('active', true);
      renderPred();
      toast('Cleared');
    });
  }

  /* —— TRAINING —— */
  async function renderTr() {
    var list = $('adTrList');
    if (!list || !needSb()) return;
    var res = await window.sb.from('training').select('*').order('created_at', { ascending: false });
    var items = res.data || [];
    if (!items.length) {
      list.innerHTML = '<div class="ad-item"><span class="ad-item-sub">No sessions yet</span></div>';
      return;
    }
    list.innerHTML = items.map(function (t) {
      return '<div class="ad-item"><div><div class="ad-item-main">' + esc(t.title || '') +
        '</div><div class="ad-item-sub">' + esc([t.day_name, t.day_num, t.time].filter(Boolean).join(' · ')) +
        '</div></div><div class="ad-item-actions"><button type="button" class="ad-icon-btn danger" data-del-tr="' + esc(t.id) + '"><i class="fas fa-trash"></i></button></div></div>';
    }).join('');
    list.querySelectorAll('[data-del-tr]').forEach(function (b) {
      b.addEventListener('click', async function () {
        await window.sb.from('training').delete().eq('id', b.getAttribute('data-del-tr'));
        renderTr();
        toast('Removed');
      });
    });
  }

  var trForm = $('adTrForm');
  if (trForm) {
    trForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!needSb()) return;
      var row = {
        title: $('adTrTitle').value.trim(),
        focus: $('adTrFocus').value.trim() || null,
        day_name: $('adTrDay').value.trim() || null,
        day_num: $('adTrNum').value.trim() || null,
        time: $('adTrTime').value.trim() || null,
        venue: $('adTrVenue').value.trim() || null,
        team: $('adTrTeam').value.trim() || null,
        notes: $('adTrNotes').value.trim() || null
      };
      var { error } = await window.sb.from('training').insert(row);
      if (error) { toast(error.message); return; }
      trForm.reset();
      renderTr();
      toast('Training saved');
      push('DA United Training', row.title, '/pages/training.html');
    });
  }

  /* —— GALLERY —— */
  async function renderGy() {
    var list = $('adGyList');
    if (!list || !needSb()) return;
    var res = await window.sb.from('gallery').select('*').order('created_at', { ascending: false });
    var items = res.data || [];
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
      b.addEventListener('click', async function () {
        await window.sb.from('gallery').delete().eq('id', b.getAttribute('data-del-gy'));
        renderGy();
        toast('Removed');
      });
    });
  }

  var gyForm = $('adGyForm');
  if (gyForm) {
    gyForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!needSb()) return;
      var row = {
        src: $('adGySrc').value.trim(),
        caption: $('adGyCap').value.trim() || null,
        category: $('adGyCat').value
      };
      var { error } = await window.sb.from('gallery').insert(row);
      if (error) { toast(error.message); return; }
      gyForm.reset();
      renderGy();
      toast('Photo saved');
      push('DA United Gallery', row.caption || 'New photo', '/pages/gallery.html');
    });
  }

  /* —— POINTS (still local for now) —— */
  var ptsBtn = $('adPtsAdd');
  if (ptsBtn) {
    ptsBtn.addEventListener('click', function () {
      var n = Number($('adPtsVal').value) || 0;
      var cur = Number(localStorage.getItem('da_user_points') || 0) || 0;
      localStorage.setItem('da_user_points', String(cur + n));
      toast('Points: ' + (cur + n));
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
