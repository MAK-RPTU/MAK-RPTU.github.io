(function () {
  var targets = document.querySelectorAll('.pipeline-row img, .flowchart-row img, img.zoomable');
  if (!targets.length) return;

  var lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML =
    '<button class="lightbox-close" aria-label="Close">&times;</button>' +
    '<img src="" alt="">' +
    '<span class="lightbox-hint">scroll to zoom · drag to pan · Esc to close</span>';
  document.body.appendChild(lightbox);

  var lightboxImg = lightbox.querySelector('img');
  var closeBtn = lightbox.querySelector('.lightbox-close');

  var scale = 1, tx = 0, ty = 0;

  function applyTransform() {
    lightboxImg.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(' + scale + ')';
  }

  function resetView() {
    scale = 1; tx = 0; ty = 0;
    applyTransform();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    resetView();
  }

  targets.forEach(function (img) {
    img.addEventListener('click', function () {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      resetView();
      lightbox.classList.add('open');
    });
  });

  // Zoom with mouse wheel, keeping the point under the cursor fixed
  lightbox.addEventListener('wheel', function (e) {
    e.preventDefault();
    var factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
    var newScale = Math.min(8, Math.max(1, scale * factor));
    factor = newScale / scale;
    if (factor === 1) return;
    var rect = lightboxImg.getBoundingClientRect();
    var dx = e.clientX - (rect.left + rect.width / 2);
    var dy = e.clientY - (rect.top + rect.height / 2);
    tx += dx * (1 - factor);
    ty += dy * (1 - factor);
    scale = newScale;
    if (scale === 1) { tx = 0; ty = 0; }
    applyTransform();
  }, { passive: false });

  // Drag to pan
  lightboxImg.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    var startX = e.clientX - tx, startY = e.clientY - ty;
    lightboxImg.classList.add('dragging');
    lightboxImg.setPointerCapture(e.pointerId);
    function onMove(ev) {
      tx = ev.clientX - startX;
      ty = ev.clientY - startY;
      applyTransform();
    }
    function onUp() {
      lightboxImg.classList.remove('dragging');
      lightboxImg.removeEventListener('pointermove', onMove);
      lightboxImg.removeEventListener('pointerup', onUp);
    }
    lightboxImg.addEventListener('pointermove', onMove);
    lightboxImg.addEventListener('pointerup', onUp);
  });

  // Double-click toggles between fit and 2.5x
  lightboxImg.addEventListener('dblclick', function () {
    if (scale > 1) { resetView(); }
    else { scale = 2.5; applyTransform(); }
  });

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
})();
