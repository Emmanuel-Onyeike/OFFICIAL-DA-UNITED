(function () {
    const modal = document.getElementById('menuModal');
    const openBtn = document.getElementById('menuOpenBtn');
    const closeBtn = document.getElementById('menuCloseBtn');
    const backdrop = document.getElementById('menuBackdrop');
    if (!modal || !openBtn) return;
  
    function openMenu() {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  
    function closeMenu() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  
    openBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (backdrop) backdrop.addEventListener('click', closeMenu);
  })();