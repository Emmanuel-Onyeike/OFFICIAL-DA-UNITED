(function () {
    function esc(s) {
      var d = document.createElement('div');
      d.textContent = s == null ? '' : String(s);
      return d.innerHTML;
    }
  
    /* —— Hi, Name —— */
    async function setGreeting() {
      var el = document.getElementById('dashGreeting');
      if (!el) return;
      var name = '';
  
      try {
        if (window.sb) {
          var ses = await window.sb.auth.getSession();
          var user = ses.data && ses.data.session && ses.data.session.user;
          if (user) {
            name =
              (user.user_metadata && (user.user_metadata.display_name || user.user_metadata.full_name)) ||
              (user.email ? user.email.split('@')[0] : '');
          }
        }
      } catch (_) {}
  
      if (!name) {
        try {
          var p = JSON.parse(localStorage.getItem('da_profile') || '{}');
          name = (p.name || '').trim();
        } catch (_) {}
      }
  
      if (name) {
        el.textContent = 'Hi, ' + name;
      } else {
        el.textContent = 'Home';
      }
    }
  
    /* —— Tabs —— */
    var nav = document.getElementById('dashNav');
    var panels = document.querySelectorAll('.dash-panel');
    if (nav) {
      nav.querySelectorAll('.dash-nav-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-tab');
          nav.querySelectorAll('.dash-nav-btn').forEach(function (b) {
            b.classList.toggle('is-active', b === btn);
          });
          panels.forEach(function (panel) {
            var match = panel.getAttribute('data-panel') === id;
            panel.hidden = !match;
            panel.classList.toggle('is-active', match);
          });
        });
      });
    }
  
    /* —— For You (Supabase) —— */
    var fyEmpty = document.getElementById('fyEmpty');
    var fyTrack = document.getElementById('fyTrack');
    var fyDots = document.getElementById('fyDots');
    var fyModal = document.getElementById('fyModal');
    var fyModalImg = document.getElementById('fyModalImg');
    var fyModalMeta = document.getElementById('fyModalMeta');
    var fyModalTitle = document.getElementById('fyModalTitle');
    var fyModalText = document.getElementById('fyModalText');
    var fyModalClose = document.getElementById('fyModalClose');
    var fyModalBackdrop = document.getElementById('fyModalBackdrop');
    var posts = [];
    var autoTimer = null;
  
    function openModal(p) {
      if (!fyModal) return;
      if (fyModalImg) {
        fyModalImg.src = p.image || '';
        fyModalImg.style.display = p.image ? '' : 'none';
      }
      if (fyModalMeta) fyModalMeta.textContent = [p.category, p.date].filter(Boolean).join(' · ');
      if (fyModalTitle) fyModalTitle.textContent = p.title || '';
      if (fyModalText) fyModalText.textContent = p.body || p.excerpt || '';
      fyModal.classList.add('is-open');
      fyModal.setAttribute('aria-hidden', 'false');
    }
  
    function closeModal() {
      if (!fyModal) return;
      fyModal.classList.remove('is-open');
      fyModal.setAttribute('aria-hidden', 'true');
    }
  
    if (fyModalClose) fyModalClose.addEventListener('click', closeModal);
    if (fyModalBackdrop) fyModalBackdrop.addEventListener('click', closeModal);
  
    function renderFy(list) {
      posts = list || [];
      if (!posts.length) {
        if (fyEmpty) fyEmpty.hidden = false;
        if (fyTrack) { fyTrack.hidden = true; fyTrack.innerHTML = ''; }
        if (fyDots) { fyDots.hidden = true; fyDots.innerHTML = ''; }
        return;
      }
      if (fyEmpty) fyEmpty.hidden = true;
      if (fyTrack) {
        fyTrack.hidden = false;
        fyTrack.innerHTML = posts
          .map(function (p, i) {
            return (
              '<article class="fy-card" data-i="' + i + '">' +
              (p.image
                ? '<img class="fy-card-img" src="' + esc(p.image) + '" alt="">'
                : '<div class="fy-card-img fy-card-img-empty"></div>') +
              '<div class="fy-card-overlay">' +
              '<div class="fy-card-meta">' +
              esc([p.category, p.date].filter(Boolean).join(' · ')) +
              '</div>' +
              '<h3 class="fy-card-title">' +
              esc(p.title || '') +
              '</h3>' +
              '<p class="fy-card-excerpt">' +
              esc(p.excerpt || '') +
              '</p>' +
              '<button type="button" class="fy-read-btn" data-i="' +
              i +
              '">Read</button>' +
              '</div></article>'
            );
          })
          .join('');
        fyTrack.querySelectorAll('.fy-read-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            openModal(posts[Number(btn.getAttribute('data-i'))]);
          });
        });
      }
      if (fyDots) {
        fyDots.hidden = posts.length < 2;
        fyDots.innerHTML = posts
          .map(function (_, i) {
            return (
              '<button type="button" class="fy-dot' +
              (i === 0 ? ' is-active' : '') +
              '" data-i="' +
              i +
              '"></button>'
            );
          })
          .join('');
        fyDots.querySelectorAll('.fy-dot').forEach(function (d) {
          d.addEventListener('click', function () {
            var i = Number(d.getAttribute('data-i'));
            if (fyTrack) fyTrack.scrollTo({ left: fyTrack.clientWidth * i, behavior: 'smooth' });
          });
        });
      }
      if (autoTimer) clearInterval(autoTimer);
      if (posts.length > 1 && fyTrack) {
        var idx = 0;
        autoTimer = setInterval(function () {
          idx = (idx + 1) % posts.length;
          fyTrack.scrollTo({ left: fyTrack.clientWidth * idx, behavior: 'smooth' });
          if (fyDots) {
            fyDots.querySelectorAll('.fy-dot').forEach(function (d, j) {
              d.classList.toggle('is-active', j === idx);
            });
          }
        }, 5000);
      }
    }
  
    async function loadFy() {
      if (!window.sb) {
        renderFy([]);
        return;
      }
      var res = await window.sb.from('foryou_posts').select('*').order('created_at', { ascending: false });
      renderFy(res.data || []);
    }
  
    /* —— Fixture summary (Supabase) —— */
    var fxTabs = document.getElementById('fxTeamTabs');
    var fxEmpty = document.getElementById('fxEmpty');
    var fxPair = document.getElementById('fxPair');
    var fxLast = document.getElementById('fxLast');
    var fxNext = document.getElementById('fxNext');
    var fxTeam = 'men';
  
    function colHtml(label, m) {
      if (!m) {
        return (
          '<div class="fx-col-inner"><div class="fx-col-label">' +
          esc(label) +
          '</div><div class="fx-col-empty">—</div></div>'
        );
      }
      var score =
        m.status === 'result' || m.status === 'live' ? m.score || '—' : m.time || 'TBD';
      return (
        '<div class="fx-col-inner">' +
        '<div class="fx-col-label">' +
        esc(label) +
        '</div>' +
        '<div class="fx-col-teams">DA United vs ' +
        esc(m.opponent || '') +
        '</div>' +
        '<div class="fx-col-score">' +
        esc(score) +
        '</div>' +
        '<div class="fx-col-meta">' +
        esc([m.date_label, m.venue].filter(Boolean).join(' · ')) +
        '</div></div>'
      );
    }
  
    async function loadFx() {
      if (!window.sb) return;
      var res = await window.sb.from('fixtures').select('*').order('created_at', { ascending: false });
      var all = (res.data || []).filter(function (m) {
        return (m.team || 'men') === fxTeam;
      });
      var last = all.filter(function (m) {
        return m.status === 'result';
      })[0] || null;
      var next =
        all
          .filter(function (m) {
            return m.status === 'upcoming' || m.status === 'live';
          })
          .slice()
          .reverse()[0] || null;
  
      if (!last && !next) {
        if (fxEmpty) fxEmpty.hidden = false;
        if (fxPair) fxPair.hidden = true;
        return;
      }
      if (fxEmpty) fxEmpty.hidden = true;
      if (fxPair) fxPair.hidden = false;
      if (fxLast) fxLast.innerHTML = colHtml('Last result', last);
      if (fxNext) fxNext.innerHTML = colHtml('Next up', next);
    }
  
    if (fxTabs) {
      fxTabs.querySelectorAll('.fx-team-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          fxTeam = btn.getAttribute('data-team') || 'men';
          fxTabs.querySelectorAll('.fx-team-tab').forEach(function (b) {
            b.classList.toggle('is-active', b === btn);
          });
          loadFx();
        });
      });
    }
  
    setGreeting();
    loadFy();
    loadFx();
  })();