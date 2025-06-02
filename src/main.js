import './style.css';
let isTransitioning = false;


// -------------------- Helper Functions --------------------
const overlay = document.getElementById('transition-overlay');
const header = document.querySelector('header');

function positionOverlay() {
  if (!overlay || !header) return;
  const headerHeight = header.offsetHeight;
  overlay.style.top = `${headerHeight}px`;
  overlay.style.height = `calc(100% - ${headerHeight}px)`;
}

// Position overlay on load and resize
window.addEventListener('load', positionOverlay);
window.addEventListener('resize', positionOverlay);

// -------------------- Curtain Transition --------------------
function runCurtainTransition(callback) {
  if (!overlay || isTransitioning) return;
  isTransitioning = true;

  overlay.classList.remove('hidden', 'slide-up', 'drop-down');
  overlay.classList.add('drop-down');

  overlay.addEventListener('animationend', function onDropDownEnd() {
    overlay.removeEventListener('animationend', onDropDownEnd);

    callback?.();

    overlay.classList.remove('drop-down');
    overlay.classList.add('slide-up');

    overlay.addEventListener('animationend', function onSlideUpEnd() {
      overlay.classList.add('hidden');
      overlay.classList.remove('slide-up');
      overlay.removeEventListener('animationend', onSlideUpEnd);
      isTransitioning = false; // allow new transitions
    });
  });
}
// -------------------- DOM Loaded Setup --------------------
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-btn');

 navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.getAttribute('href').substring(1); // remove the '#'

    runCurtainTransition(() => {
      // Hide art-gallery when switching sections
      const artGallery = document.getElementById('art-gallery');
      if (artGallery) artGallery.classList.add('hidden');

      // Show gallery-wrapper only when target is 'gallery-wrapper'
      const galleryWrapper = document.getElementById('gallery-wrapper');
      if (target === 'gallery-wrapper') {
        if (galleryWrapper) galleryWrapper.classList.remove('hidden');
      } else {
        // For other sections, just make sure gallery-wrapper is visible if needed
        if (galleryWrapper) galleryWrapper.classList.remove('hidden');
      }

      // Hide all thumbnail grids inside art-gallery, just in case
      document.querySelectorAll('#art-gallery > div.thumbnail-grid').forEach(section => {
        section.classList.add('hidden');
      });

      // Scroll to the target section
      const targetSection = document.getElementById(target);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'auto' });
      }
    });
  });
});

  // -------------------- Enter Gallery Buttons --------------------
  document.querySelectorAll('.gallery-card .enter-gallery-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();

      const card = button.closest('.gallery-card');
      const selectedType = card.dataset.type;

      runCurtainTransition(() => {
        document.getElementById('gallery-wrapper').classList.add('hidden');
        document.getElementById('art-gallery').classList.remove('hidden');

        document.querySelectorAll('#art-gallery > div.thumbnail-grid').forEach(section => {
          section.classList.add('hidden');
        });

        const selectedGallery = document.getElementById(`${selectedType}-gallery`);
        if (selectedGallery) {
          selectedGallery.classList.remove('hidden');
        }

        document.getElementById('art-gallery').scrollIntoView({ behavior: 'instant' });
      });
    });
  });

  // -------------------- Back to Gallery Button --------------------
  const backBtn = document.querySelector('.back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      runCurtainTransition(() => {
        document.getElementById('art-gallery').classList.add('hidden');
        document.getElementById('gallery-wrapper').classList.remove('hidden');

        document.querySelectorAll('#art-gallery > div.thumbnail-grid').forEach(section => {
          section.classList.add('hidden');
        });

        document.getElementById('gallery-wrapper').scrollIntoView({ behavior: 'instant' });
      });
    });
  }

  // -------------------- Lightbox --------------------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-image');

  document.querySelectorAll('.thumb-img').forEach(img => {
    img.addEventListener('click', () => {
      const fullSrc = img.getAttribute('data-full') || img.src;
      lightboxImg.src = fullSrc;
      lightbox.classList.add('show');
    });
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightboxImg.parentElement) {
      lightbox.classList.remove('show');
      lightboxImg.src = '';
    }
  });
});
