(function () {
    var KEY = 'da_training';
    var emptyEl = document.getElementById('trEmpty');
    var listEl = document.getElementById('trList');
  
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
  
    function cardHtml(t) {
      return (
        '<article class="tr-card">' +
        '<div class="tr-card-top">' +
        '<div>' +
        '<h3 class="tr-title">' + esc(t.title || 'Training session') + '</h3>' +
        (t.focus ? '<span class="tr-focus">' + esc(t.focus) + '</span>' : '') +
        '</div>' +
        '<div class="tr-day">' +
        '<div class="tr-day-name">' + esc(t.dayName || 'Day') + '</div>' +
        '<div class="tr-day-num">' + esc(t.dayNum != null ? String(t.dayNum) : '—') + '</div>' +
        '</div></div>' +
        '<div class="tr-meta">' +
        (t.time ? '<span><i class="fas fa-clock"></i>' + esc(t.time) + '</span>' : '') +
        (t.venue ? '<span><i class="fas fa-map-marker-alt"></i>' + esc(t.venue) + '</span>' : '') +
        (t.team ? '<span><i class="fas fa-users"></i>' + esc(t.team) + '</span>' : '') +
        '</div>' +
        (t.notes ? '<div class="tr-notes">' + esc(t.notes) + '</div>' : '') +
        '</article>'
      );
    }
  
    function render() {
      var items = load();
      if (!items.length) {
        if (emptyEl) emptyEl.hidden = false;
        if (listEl) {
          listEl.hidden = true;
          listEl.innerHTML = '';
        }
        return;
      }
      if (emptyEl) emptyEl.hidden = true;
      if (listEl) {
        listEl.hidden = false;
        listEl.innerHTML = items.map(cardHtml).join('');
      }
    }
  
    render();
    window.DA_refreshTraining = render;
  })();