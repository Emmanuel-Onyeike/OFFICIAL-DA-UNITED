(function () {
    var KEY = 'da_news';
    var CATS = ['transfer', 'loan', 'injury', 'suspended', 'unavailable'];
    var tabs = document.querySelectorAll('.nw-tab');
    var panels = document.querySelectorAll('.nw-panel');
  
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
  
    function labelFor(cat) {
      var map = {
        transfer: 'Transfer',
        loan: 'Loan',
        injury: 'Injury',
        suspended: 'Suspended',
        unavailable: 'Not available'
      };
      return map[cat] || cat;
    }
  
    function cardHtml(n) {
      var img = n.image
        ? '<img class="nw-card-img" src="' + esc(n.image) + '" alt="">'
        : '';
      return (
        '<article class="nw-card">' +
        img +
        '<div class="nw-card-body">' +
        '<div class="nw-card-meta">' + esc(labelFor(n.category)) + '</div>' +
        '<h3 class="nw-card-title">' + esc(n.title || 'Untitled') + '</h3>' +
        '<p class="nw-card-excerpt">' + esc(n.excerpt || n.body || '') + '</p>' +
        (n.date ? '<div class="nw-card-date">' + esc(n.date) + '</div>' : '') +
        '</div></article>'
      );
    }
  
    function render() {
      var all = load();
      CATS.forEach(function (cat) {
        var list = document.getElementById('nwList-' + cat);
        var empty = document.getElementById('nwEmpty-' + cat);
        if (!list || !empty) return;
        var items = all.filter(function (n) {
          return (n.category || '') === cat;
        });
        if (!items.length) {
          empty.hidden = false;
          list.hidden = true;
          list.innerHTML = '';
        } else {
          empty.hidden = true;
          list.hidden = false;
          list.innerHTML = items.map(cardHtml).join('');
        }
      });
    }
  
    function showTab(cat) {
      tabs.forEach(function (t) {
        t.classList.toggle('is-active', t.getAttribute('data-cat') === cat);
      });
      panels.forEach(function (p) {
        p.hidden = p.getAttribute('data-panel') !== cat;
      });
    }
  
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        showTab(t.getAttribute('data-cat'));
      });
    });
  
    render();
    window.DA_refreshNews = render;
  })();