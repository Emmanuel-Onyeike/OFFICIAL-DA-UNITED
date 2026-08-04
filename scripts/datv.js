(function () {
    var KEY = 'da_streams';
    var playerEmpty = document.getElementById('dtvPlayerEmpty');
    var playerFrame = document.getElementById('dtvPlayerFrame');
    var liveBar = document.getElementById('dtvLiveBar');
    var streamTitle = document.getElementById('dtvStreamTitle');
    var streamMeta = document.getElementById('dtvStreamMeta');
    var upEmpty = document.getElementById('dtvUpcomingEmpty');
    var upList = document.getElementById('dtvUpcomingList');
  
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
  
    function setLive(stream) {
      if (!stream || !stream.embedUrl) {
        if (playerEmpty) playerEmpty.hidden = false;
        if (playerFrame) {
          playerFrame.hidden = true;
          playerFrame.removeAttribute('src');
        }
        if (liveBar) liveBar.hidden = true;
        return;
      }
      if (playerEmpty) playerEmpty.hidden = true;
      if (playerFrame) {
        playerFrame.hidden = false;
        playerFrame.src = stream.embedUrl;
      }
      if (liveBar) liveBar.hidden = false;
      if (streamTitle) streamTitle.textContent = stream.title || 'Live match';
      if (streamMeta) {
        streamMeta.textContent = [stream.opponent, stream.venue, stream.startLabel]
          .filter(Boolean)
          .join(' · ');
      }
    }
  
    function renderUpcoming(items) {
      if (!upEmpty || !upList) return;
      if (!items.length) {
        upEmpty.hidden = false;
        upList.hidden = true;
        upList.innerHTML = '';
        return;
      }
      upEmpty.hidden = true;
      upList.hidden = false;
      upList.innerHTML = items.map(function (s) {
        return (
          '<div class="dtv-up-card">' +
          '<div>' +
          '<div class="dtv-up-title">' + esc(s.title || 'Upcoming stream') + '</div>' +
          '<div class="dtv-up-meta">' +
          esc([s.startLabel, s.opponent, s.venue].filter(Boolean).join(' · ') || 'Time TBA') +
          '</div></div>' +
          '<button type="button" class="dtv-up-btn" disabled>Soon</button>' +
          '</div>'
        );
      }).join('');
    }
  
    function render() {
      var all = load();
      var live = all.filter(function (s) { return s.status === 'live'; });
      var upcoming = all.filter(function (s) { return s.status === 'upcoming'; });
      setLive(live[0] || null);
      renderUpcoming(upcoming);
    }
  
    render();
    window.DA_refreshDatv = render;
  })();