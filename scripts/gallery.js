(function () {
    var KEY = 'da_gallery';
    var tabs = document.querySelectorAll('.gy-tab');
    var emptyEl = document.getElementById('gyEmpty');
    var gridEl = document.getElementById('gyGrid');
    var lb = document.getElementById('gyLightbox');
    var lbImg = document.getElementById('gyLbImg');
    var lbCap = document.getElementById('gyLbCap');
    var lbClose = document.getElementById('gyLbClose');
    var lbBackdrop = document.getElementById('gyLbBackdrop');
    var activeCat = 'all';
  
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
  
    function openLb(item) {
      if (!lb || !lbImg) return;
      lbImg.src = item.src || '';
      if (lbCap) lbCap.textContent = item.caption || '';
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  
    function closeLb() {
      if (!lb) return;
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  
    if (lbClose) lbClose.addEventListener('click', closeLb);
    if (lbBackdrop) lbBackdrop.addEventListener('click', closeLb);
  
    function render() {
      var all = load();
      var items =
        activeCat === 'all'
          ? all
          : all.filter(function (g) {
              return (g.category || 'all') === activeCat;
            });
  
      if (!items.length) {
        if (emptyEl) emptyEl.hidden = false;
        if (gridEl) {
          gridEl.hidden = true;
          gridEl.innerHTML = '';
        }
        return;
      }
  
      if (emptyEl) emptyEl.hidden = true;
      if (gridEl) {
        gridEl.hidden = false;
        gridEl.innerHTML = '';
        items.forEach(function (item) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'gy-item';
          btn.innerHTML =
            '<img src="' + esc(item.src) + '" alt="' + esc(item.caption || 'Gallery photo') + '">' +
            (item.caption
              ? '<span class="gy-item-cap">' + esc(item.caption) + '</span>'
              : '');
          btn.addEventListener('click', function () {
            openLb(item);
          });
          gridEl.appendChild(btn);
        });
      }
    }
  
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        activeCat = t.getAttribute('data-cat') || 'all';
        tabs.forEach(function (b) {
          b.classList.toggle('is-active', b === t);
        });
        render();
      });
    });
  
    render();
    window.DA_refreshGallery = render;
  })();