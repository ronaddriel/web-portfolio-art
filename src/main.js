import './style.css';

let isTransitioning = false;

// -------------------- Helper Elements --------------------
const overlay = document.getElementById('transition-overlay');
const header = document.querySelector('header');

function scrollToElementWithOffset(element, offset = 50) {
  if (!element) return;
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'auto' // or 'smooth' if desired
  });
}

// -------------------- Overlay Position --------------------
function positionOverlay() {
  if (!overlay || !header) return;
  const headerHeight = header.offsetHeight;
  overlay.style.top = `${headerHeight}px`;
  overlay.style.height = `calc(100% - ${headerHeight}px)`;
}
window.addEventListener('load', positionOverlay);
window.addEventListener('resize', positionOverlay);

// -------------------- Animation Restart Utility --------------------
function restartAnimationsInSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const animatedElements = section.querySelectorAll('[data-animate]');

  animatedElements.forEach(elem => {
    elem.classList.remove('animate-restart');
    elem.classList.add('reset-animation');
  });

  // Delay ensures browser applies the reset state before re-adding animations
  requestAnimationFrame(() => {
    animatedElements.forEach(elem => {
      void elem.offsetWidth; // force reflow
      elem.classList.remove('reset-animation');
      elem.classList.add('animate-restart');
    });
  });
}


// -------------------- Curtain Transition --------------------
function runCurtainTransition(callback, targetId = null) {
  if (!overlay || isTransitioning) return;
  isTransitioning = true;

document.body.classList.add('noscroll');
  overlay.classList.remove('hidden', 'slide-up', 'drop-down');
  overlay.classList.add('drop-down');

  overlay.addEventListener('animationend', function onDropDownEnd() {
    overlay.removeEventListener('animationend', onDropDownEnd);

    callback?.();

    if (targetId) {
      const targetSection = document.getElementById(targetId);
      const content = targetSection?.querySelector('.section-content');
      if (content) {
        content.classList.remove('content-visible');
        content.classList.add('content-hidden');
      }
    }

    overlay.classList.remove('drop-down');
    overlay.classList.add('slide-up');

    overlay.addEventListener('animationend', function onSlideUpEnd() {
      overlay.classList.add('hidden');
      overlay.classList.remove('slide-up');
      overlay.removeEventListener('animationend', onSlideUpEnd);

      setTimeout(() => {
  replayAnimationsInSection(targetId);
}, 10); // Delay is small but ensures repaint

      document.body.classList.remove('noscroll');
      isTransitioning = false;
      
    });
  });
}

// -------------------- Replay Animations --------------------
function replayAnimationsInSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  // Show content area
  const content = section.querySelector('.section-content');
  if (content) {
    content.classList.remove('content-hidden');
    content.classList.add('content-visible');
  }

  // Restart any custom [data-animate] animations
  restartAnimationsInSection(sectionId);

  // Re-trigger Tailwind-like animate-* classes
  const animatedElems = section.querySelectorAll('[class*="animate-"]');
  animatedElems.forEach(elem => {
    const classes = Array.from(elem.classList).filter(cls => cls.startsWith('animate-'));
    classes.forEach(cls => elem.classList.remove(cls));
    void elem.offsetWidth; // force reflow
    classes.forEach(cls => elem.classList.add(cls));
  });
  console.log("Restarting animations in:", sectionId);
}
// -------------------- DOM Loaded Setup --------------------
document.addEventListener('DOMContentLoaded', () => {
  // Navbar Links
  document.querySelectorAll('.nav-btn').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('href').substring(1);

      runCurtainTransition(() => {
        document.querySelectorAll('section').forEach(section => {
          section.classList.remove('hidden');
        });

        document.getElementById('art-gallery')?.classList.add('hidden');
        document.getElementById('gallery-wrapper')?.classList.remove('hidden');

        document.querySelectorAll('#art-gallery > div.thumbnail-grid').forEach(section => {
          section.classList.add('hidden');
        });

        document.querySelectorAll('#art-gallery .section-content').forEach(content => {
          content.classList.remove('content-hidden');
          content.classList.add('content-visible');
        });

        document.querySelector('.back-btn')?.classList.add('hidden');

       const targetEl = document.getElementById(target);
if (targetEl) {
  const headerOffset = 50; // adjust this number as needed
  const elementPosition = targetEl.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'auto' // or 'smooth' if you want smoother scroll
  });
}
      }, target);
    });
  });

  // Gallery Cards
  document.querySelectorAll('.gallery-card .enter-gallery-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();

      const card = button.closest('.gallery-card');
      const selectedType = card.dataset.type;

      runCurtainTransition(() => {
        document.getElementById('gallery-wrapper')?.classList.add('hidden');
        document.getElementById('art-gallery')?.classList.remove('hidden');

        document.querySelectorAll('#art-gallery > div.thumbnail-grid').forEach(section => {
          section.classList.add('hidden');
        });

        const selectedGallery = document.getElementById(`${selectedType}-gallery`);

        if (selectedGallery) {
          selectedGallery.classList.remove('hidden');

          const galleryContent = selectedGallery.querySelector('.section-content');
          if (galleryContent) {
            galleryContent.classList.remove('content-hidden');
            galleryContent.classList.add('content-visible');
          }
        }

        document.querySelectorAll('#art-gallery .section-content').forEach(content => {
          content.classList.remove('content-hidden');
          content.classList.add('content-visible');
        });

        document.querySelector('.back-btn')?.classList.remove('hidden');

       scrollToElementWithOffset(document.getElementById('art-gallery'));
      });
    });
  });

  // Back Button in Gallery
  const backBtn = document.querySelector('.back-btn');
  backBtn?.addEventListener('click', () => {
    runCurtainTransition(() => {
      document.getElementById('art-gallery')?.classList.add('hidden');
      document.getElementById('gallery-wrapper')?.classList.remove('hidden');

      document.querySelectorAll('#art-gallery > div.thumbnail-grid').forEach(section => {
        section.classList.add('hidden');
      });

      scrollToElementWithOffset(document.getElementById('gallery-wrapper'));
    });
  });

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-image');
  document.querySelectorAll('.thumb-img').forEach(img => {
    img.addEventListener('click', () => {
      const fullSrc = img.getAttribute('data-full') || img.src;
      lightboxImg.src = fullSrc;
      lightbox.classList.add('show');
    });
  });
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightboxImg.parentElement) {
      lightbox.classList.remove('show');
      lightboxImg.src = '';
    }
  });

  // Intersection Scroll Animations
  const fadeElements = document.querySelectorAll('.fade-scroll');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.2 });
  fadeElements.forEach(el => fadeObserver.observe(el));

  const scrollSections = document.querySelectorAll('.section-scroll');
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  }, { threshold: 0.3 });
  scrollSections.forEach(section => scrollObserver.observe(section));

  document.querySelectorAll('.section-content').forEach(content => {
    content.classList.remove('content-hidden');
    content.classList.add('content-visible');
  });
});
