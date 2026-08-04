(function () {
    /* Admin sets match only:
       da_prediction_match: { id, home: "DA United", away, dateLabel, venue }
       OR first upcoming from da_fixtures (status upcoming, team men).
  
       Players from da_squad (team men) auto-fill selects.
  
       User prediction saved in:
       da_user_prediction
    */
    var MATCH_KEY = 'da_prediction_match';
    var FIXTURES_KEY = 'da_fixtures';
    var SQUAD_KEY = 'da_squad';
    var PRED_KEY = 'da_user_prediction';
  
    var emptyEl = document.getElementById('pdEmpty');
    var formWrap = document.getElementById('pdFormWrap');
    var homeName = document.getElementById('pdHomeName');
    var awayName = document.getElementById('pdAwayName');
    var matchMeta = document.getElementById('pdMatchMeta');
    var homeScore = document.getElementById('pdHomeScore');
    var awayScore = document.getElementById('pdAwayScore');
    var motm = document.getElementById('pdMotm');
    var firstScorer = document.getElementById('pdFirstScorer');
    var lastScorer = document.getElementById('pdLastScorer');
    var assistPlayer = document.getElementById('pdAssistPlayer');
    var assistCount = document.getElementById('pdAssistCount');
    var submitBtn = document.getElementById('pdSubmit');
    var savedMsg = document.getElementById('pdSaved');
    var noSquad = document.getElementById('pdNoSquad');
  
    function loadJSON(key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    }
  
    function getMatch() {
      var m = loadJSON(MATCH_KEY, null);
      if (m && (m.away || m.opponent)) {
        return {
          id: m.id || 'pred-1',
          home: m.home || 'DA United',
          away: m.away || m.opponent || 'Opponent',
          dateLabel: m.dateLabel || '',
          venue: m.venue || ''
        };
      }
      var fixtures = loadJSON(FIXTURES_KEY, []);
      if (!Array.isArray(fixtures)) fixtures = [];
      var up = fixtures.filter(function (f) {
        return f.status === 'upcoming' && (f.team || 'men') === 'men';
      });
      if (!up.length) return null;
      var f = up[0];
      return {
        id: f.id || 'fx-1',
        home: f.home ? 'DA United' : f.opponent || 'Opponent',
        away: f.home ? f.opponent || 'Opponent' : 'DA United',
        dateLabel: f.dateLabel || '',
        venue: f.venue || ''
      };
    }
  
    function getSquad() {
      var list = loadJSON(SQUAD_KEY, []);
      if (!Array.isArray(list)) return [];
      return list.filter(function (p) {
        return (p.team || 'men') === 'men';
      });
    }
  
    function fillSelect(sel, players, placeholder) {
      if (!sel) return;
      var opts =
        '<option value="">' + (placeholder || 'Select player') + '</option>';
      var order = { GK: 0, DEF: 1, MID: 2, FWD: 3 };
      players
        .slice()
        .sort(function (a, b) {
          var pa =
            order[(a.pos || '').toUpperCase()] != null
              ? order[(a.pos || '').toUpperCase()]
              : 9;
          var pb =
            order[(b.pos || '').toUpperCase()] != null
              ? order[(b.pos || '').toUpperCase()]
              : 9;
          if (pa !== pb) return pa - pb;
          return String(a.name || '').localeCompare(String(b.name || ''));
        })
        .forEach(function (p) {
          var label =
            (p.number != null && p.number !== '' ? '#' + p.number + ' ' : '') +
            (p.name || 'Unknown') +
            (p.pos ? ' (' + p.pos + ')' : '');
          opts +=
            '<option value="' +
            String(p.id || p.name).replace(/"/g, '') +
            '">' +
            label.replace(/</g, '&lt;') +
            '</option>';
        });
      sel.innerHTML = opts;
    }
  
    function render() {
      var match = getMatch();
      var players = getSquad();
  
      if (!match) {
        if (emptyEl) emptyEl.hidden = false;
        if (formWrap) formWrap.hidden = true;
        return;
      }
  
      if (emptyEl) emptyEl.hidden = true;
      if (formWrap) formWrap.hidden = false;
  
      if (homeName) homeName.textContent = match.home;
      if (awayName) awayName.textContent = match.away;
      if (matchMeta) {
        matchMeta.textContent = [match.dateLabel, match.venue]
          .filter(Boolean)
          .join(' · ');
      }
  
      fillSelect(motm, players, 'Man of the match');
      fillSelect(firstScorer, players, 'First goal scorer');
      fillSelect(lastScorer, players, 'Last goal scorer');
      fillSelect(assistPlayer, players, 'Assist provider');
  
      if (noSquad) noSquad.hidden = players.length > 0;
  
      [motm, firstScorer, lastScorer, assistPlayer].forEach(function (s) {
        if (s) s.disabled = players.length === 0;
      });
  
      var saved = loadJSON(PRED_KEY, null);
      if (saved && saved.matchId === match.id) {
        if (homeScore) homeScore.value = saved.homeScore != null ? saved.homeScore : '';
        if (awayScore) awayScore.value = saved.awayScore != null ? saved.awayScore : '';
        if (motm && saved.motm) motm.value = saved.motm;
        if (firstScorer && saved.firstScorer) firstScorer.value = saved.firstScorer;
        if (lastScorer && saved.lastScorer) lastScorer.value = saved.lastScorer;
        if (assistPlayer && saved.assistPlayer) assistPlayer.value = saved.assistPlayer;
        if (assistCount && saved.assistCount != null) assistCount.value = saved.assistCount;
        if (savedMsg) {
          savedMsg.hidden = false;
          savedMsg.textContent = 'Your prediction is saved for this match.';
        }
      } else if (savedMsg) {
        savedMsg.hidden = true;
      }
    }
  
    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        var match = getMatch();
        if (!match) return;
  
        var hs = homeScore ? Number(homeScore.value) : NaN;
        var as_ = awayScore ? Number(awayScore.value) : NaN;
        if (isNaN(hs) || isNaN(as_) || hs < 0 || as_ < 0) {
          if (savedMsg) {
            savedMsg.hidden = false;
            savedMsg.textContent = 'Enter a valid score (0 or higher).';
            savedMsg.style.color = '#f87171';
            savedMsg.style.borderColor = 'rgba(248, 113, 113, 0.35)';
            savedMsg.style.background = 'rgba(248, 113, 113, 0.1)';
          }
          return;
        }
  
        var data = {
          matchId: match.id,
          home: match.home,
          away: match.away,
          homeScore: hs,
          awayScore: as_,
          motm: motm ? motm.value : '',
          firstScorer: firstScorer ? firstScorer.value : '',
          lastScorer: lastScorer ? lastScorer.value : '',
          assistPlayer: assistPlayer ? assistPlayer.value : '',
          assistCount: assistCount ? Number(assistCount.value) || 0 : 0,
          savedAt: new Date().toISOString()
        };
  
        localStorage.setItem(PRED_KEY, JSON.stringify(data));
        if (savedMsg) {
          savedMsg.hidden = false;
          savedMsg.textContent = 'Prediction saved. Good luck!';
          savedMsg.style.color = '#34d399';
          savedMsg.style.borderColor = 'rgba(16, 185, 129, 0.3)';
          savedMsg.style.background = 'rgba(16, 185, 129, 0.1)';
        }
      });
    }
  
    render();
    window.DA_refreshPrediction = render;
  })();