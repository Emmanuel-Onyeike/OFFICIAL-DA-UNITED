(function () {
    var PROFILE_KEY = 'da_profile';
    var POINTS_KEY = 'da_user_points';
  
    var WORLD_PLAYERS = [
      'Lionel Messi', 'Cristiano Ronaldo', 'Kylian Mbappé', 'Erling Haaland',
      'Kevin De Bruyne', 'Mohamed Salah', 'Vinícius Júnior', 'Robert Lewandowski',
      'Harry Kane', 'Jude Bellingham', 'Bukayo Saka', 'Phil Foden',
      'Luka Modrić', 'Neymar Jr', 'Son Heung-min', 'Pedri', 'Rodri',
      'Thibaut Courtois', 'Virgil van Dijk', 'Bruno Fernandes', 'Martin Ødegaard',
      'Antoine Griezmann', 'Lautaro Martínez', 'Jamal Musiala', 'Florian Wirtz'
    ];
  
    var nameInput = document.getElementById('pfName');
    var bioInput = document.getElementById('pfBio');
    var displayName = document.getElementById('pfDisplayName');
    var avatarLetter = document.getElementById('pfAvatarLetter');
    var pointsVal = document.getElementById('pfPointsVal');
    var saveBtn = document.getElementById('pfSave');
    var msg = document.getElementById('pfMsg');
  
    var worldSearch = document.getElementById('pfWorldSearch');
    var worldResults = document.getElementById('pfWorldResults');
    var worldFav = document.getElementById('pfWorldFav');
    var daSearch = document.getElementById('pfDaSearch');
    var daResults = document.getElementById('pfDaResults');
    var daFav = document.getElementById('pfDaFav');
  
    function loadProfile() {
      try {
        var raw = localStorage.getItem(PROFILE_KEY);
        if (!raw) return {};
        return JSON.parse(raw) || {};
      } catch (e) {
        return {};
      }
    }
  
    function saveProfileLocal(p) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    }
  
    function getPoints() {
      var n = Number(localStorage.getItem(POINTS_KEY) || 0);
      return isNaN(n) ? 0 : n;
    }
  
    function esc(s) {
      var d = document.createElement('div');
      d.textContent = s == null ? '' : String(s);
      return d.innerHTML;
    }
  
    function renderFav(el, player, emptyText) {
      if (!el) return;
      if (!player || !player.name) {
        el.innerHTML = '<span class="pf-fav-empty">' + esc(emptyText) + '</span>';
        return;
      }
      var av = player.photo
        ? '<img src="' + esc(player.photo) + '" alt="">'
        : esc((player.name || '?').charAt(0).toUpperCase());
      el.innerHTML =
        '<div class="pf-fav-avatar">' + av + '</div>' +
        '<div class="pf-fav-info">' +
        '<div class="pf-fav-name">' + esc(player.name) + '</div>' +
        (player.sub ? '<div class="pf-fav-sub">' + esc(player.sub) + '</div>' : '') +
        '</div>';
    }
  
    function renderHeader(p) {
      var name = (p.name || '').trim() || 'DA Fan';
      if (displayName) displayName.textContent = name;
      if (avatarLetter) avatarLetter.textContent = name.charAt(0).toUpperCase();
      if (nameInput) nameInput.value = p.name || '';
      if (bioInput) bioInput.value = p.bio || '';
      if (pointsVal) pointsVal.textContent = String(getPoints());
      renderFav(worldFav, p.bestWorld, 'Search and pick your favourite real-world player');
      renderFav(daFav, p.bestDa, 'Search and pick your favourite DA United player');
    }
  
    /** Save name to Auth metadata → dashboard "Hi, Name" reads this */
    async function syncNameToSupabase(p) {
      if (!window.sb) return { ok: false, error: 'Supabase not loaded' };
  
      var name = (p.name || '').trim();
      var bio = (p.bio || '').trim();
  
      var authRes = await window.sb.auth.updateUser({
        data: {
          full_name: name,
          display_name: name
        }
      });
      if (authRes.error) return { ok: false, error: authRes.error.message };
  
      var ses = await window.sb.auth.getSession();
      var user = ses.data && ses.data.session && ses.data.session.user;
      if (user) {
        await window.sb.from('profiles').upsert(
          {
            user_id: user.id,
            name: name,
            bio: bio,
            best_world: p.bestWorld || null,
            best_da: p.bestDa || null,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        );
      }
      return { ok: true };
    }
  
    async function getSquad() {
      if (window.sb) {
        var res = await window.sb.from('squad').select('*').eq('team', 'men');
        return res.data || [];
      }
      return [];
    }
  
    function showResults(box, items, onPick) {
      if (!box) return;
      if (!items.length) {
        box.innerHTML = '<div class="pf-search-none">No matches — press Enter to use your typed name</div>';
        box.classList.add('is-open');
        return;
      }
      box.innerHTML = '';
      items.forEach(function (item) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pf-search-item';
        btn.textContent = item.label;
        btn.addEventListener('click', function () {
          onPick(item);
          box.classList.remove('is-open');
          box.innerHTML = '';
        });
        box.appendChild(btn);
      });
      box.classList.add('is-open');
    }
  
    function bindWorldSearch() {
      if (!worldSearch || !worldResults) return;
      worldSearch.addEventListener('input', function () {
        var q = worldSearch.value.trim().toLowerCase();
        if (!q) {
          worldResults.classList.remove('is-open');
          return;
        }
        var hits = WORLD_PLAYERS.filter(function (n) {
          return n.toLowerCase().indexOf(q) !== -1;
        })
          .slice(0, 8)
          .map(function (n) {
            return { id: n, name: n, sub: 'Real world', label: n };
          });
        showResults(worldResults, hits, function (item) {
          var p = loadProfile();
          p.bestWorld = { id: item.id, name: item.name, sub: 'Favourite player' };
          saveProfileLocal(p);
          worldSearch.value = '';
          renderHeader(p);
        });
      });
      worldSearch.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var name = worldSearch.value.trim();
          if (!name) return;
          var p = loadProfile();
          p.bestWorld = { id: name, name: name, sub: 'Favourite player' };
          saveProfileLocal(p);
          worldSearch.value = '';
          worldResults.classList.remove('is-open');
          renderHeader(p);
        }
      });
    }
  
    function bindDaSearch() {
      if (!daSearch || !daResults) return;
      daSearch.addEventListener('input', async function () {
        var q = daSearch.value.trim().toLowerCase();
        if (!q) {
          daResults.classList.remove('is-open');
          return;
        }
        var squad = await getSquad();
        var hits = squad
          .filter(function (pl) {
            return String(pl.name || '').toLowerCase().indexOf(q) !== -1;
          })
          .slice(0, 8)
          .map(function (pl) {
            var label =
              (pl.number != null ? '#' + pl.number + ' ' : '') +
              (pl.name || '') +
              (pl.pos ? ' · ' + pl.pos : '');
            return {
              id: pl.id || pl.name,
              name: pl.name,
              sub: [pl.pos, pl.number != null ? '#' + pl.number : ''].filter(Boolean).join(' · '),
              photo: pl.photo || '',
              label: label
            };
          });
        showResults(daResults, hits, function (item) {
          var p = loadProfile();
          p.bestDa = {
            id: item.id,
            name: item.name,
            sub: item.sub || 'DA United',
            photo: item.photo || ''
          };
          saveProfileLocal(p);
          daSearch.value = '';
          renderHeader(p);
        });
      });
    }
  
    document.addEventListener('click', function (e) {
      if (worldResults && !worldResults.contains(e.target) && e.target !== worldSearch) {
        worldResults.classList.remove('is-open');
      }
      if (daResults && !daResults.contains(e.target) && e.target !== daSearch) {
        daResults.classList.remove('is-open');
      }
    });
  
    if (saveBtn) {
      saveBtn.addEventListener('click', async function () {
        var p = loadProfile();
        p.name = nameInput ? nameInput.value.trim() : p.name;
        p.bio = bioInput ? bioInput.value.trim() : p.bio;
        if (!p.name) {
          if (msg) {
            msg.hidden = false;
            msg.textContent = 'Enter a display name.';
            msg.classList.add('error');
          }
          return;
        }
        saveProfileLocal(p);
        renderHeader(p);
  
        var sync = await syncNameToSupabase(p);
        if (msg) {
          msg.hidden = false;
          if (sync.ok) {
            msg.textContent = 'Profile saved. Dashboard will show: Hi, ' + p.name;
            msg.classList.remove('error');
          } else {
            msg.textContent = 'Saved on this device. Cloud sync: ' + (sync.error || 'failed');
            msg.classList.add('error');
          }
        }
      });
    }
  
    /** Load name from Auth when opening profile */
    async function boot() {
      var p = loadProfile();
      if (window.sb) {
        try {
          var ses = await window.sb.auth.getSession();
          var user = ses.data && ses.data.session && ses.data.session.user;
          if (user && user.user_metadata) {
            var n = user.user_metadata.display_name || user.user_metadata.full_name;
            if (n && !p.name) p.name = n;
          }
        } catch (_) {}
      }
      saveProfileLocal(p);
      renderHeader(p);
    }
  
    bindWorldSearch();
    bindDaSearch();
    boot();
    window.DA_refreshProfile = function () {
      renderHeader(loadProfile());
    };
  })();