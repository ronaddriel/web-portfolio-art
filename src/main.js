import './style.css';

let isTransitioning = false;

const overlay = document.getElementById('transition-overlay');
const header = document.querySelector('header');

function scrollToElementWithOffset(element, offset = 50) {
  if (!element) return;
  const y = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: y, behavior: 'auto' });
}

function positionOverlay() {
  if (!overlay || !header) return;
  overlay.style.top = `${header.offsetHeight}px`;
  overlay.style.height = `calc(100% - ${header.offsetHeight}px)`;
}
window.addEventListener('load', positionOverlay);
window.addEventListener('resize', positionOverlay);

function restartAnimationsInSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  const animatedElements = section.querySelectorAll('[data-animate]');
  animatedElements.forEach(elem => {
    elem.classList.remove('animate-restart');
    elem.classList.add('reset-animation');
  });
  requestAnimationFrame(() => {
    animatedElements.forEach(elem => {
      void elem.offsetWidth;
      elem.classList.remove('reset-animation');
      elem.classList.add('animate-restart');
    });
  });
}

function replayAnimationsInSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  const content = section.querySelector('.section-content');
  if (content) {
    content.classList.remove('content-hidden');
    content.classList.add('content-visible');
  }
  restartAnimationsInSection(sectionId);
  section.querySelectorAll('[class*="animate-"]').forEach(elem => {
    const animClasses = Array.from(elem.classList).filter(cls => cls.startsWith('animate-'));
    animClasses.forEach(cls => elem.classList.remove(cls));
    void elem.offsetWidth;
    animClasses.forEach(cls => elem.classList.add(cls));
  });
}

function runCurtainTransition(callback, targetId = null) {
  if (!overlay || isTransitioning) return;
  isTransitioning = true;
  document.body.classList.add('noscroll');

  overlay.classList.remove('hidden', 'slide-up', 'drop-down');
  overlay.classList.add('drop-down');

  overlay.addEventListener('animationend', function onDrop() {
    overlay.removeEventListener('animationend', onDrop);

    callback?.();

    if (targetId) {
      const content = document.getElementById(targetId)?.querySelector('.section-content');
      if (content) {
        content.classList.remove('content-visible');
        content.classList.add('content-hidden');
      }
    }

    overlay.classList.remove('drop-down');
    overlay.classList.add('slide-up');

    overlay.addEventListener('animationend', function onUp() {
      overlay.classList.add('hidden');
      overlay.classList.remove('slide-up');
      overlay.removeEventListener('animationend', onUp);

      setTimeout(() => {
        replayAnimationsInSection(targetId);
      }, 10);

      document.body.classList.remove('noscroll');
      isTransitioning = false;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Navbar Buttons
  document.querySelectorAll('.nav-btn').forEach(link => {
    e.preventDefault();
  const target = link.getAttribute('href').substring(1);

  const isMobile = window.innerWidth <= 768;

  const handleScrollAndShow = () => {
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
      const headerOffset = 50;
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: isMobile ? 'smooth' : 'auto'
      });
    }

    if (!isMobile) replayAnimationsInSection(target);
  };

  if (isMobile) {
    handleScrollAndShow();
  } else {
    runCurtainTransition(handleScrollAndShow, target);
  }
});

  // Gallery Enter Buttons
  document.querySelectorAll('.gallery-card .enter-gallery-btn').forEach(button => {
    button.addEventListener('click', e => {
      e.stopPropagation();
      const type = button.closest('.gallery-card')?.dataset.type;
      runCurtainTransition(() => {
        document.getElementById('gallery-wrapper')?.classList.add('hidden');
        document.getElementById('art-gallery')?.classList.remove('hidden');

        // Hide all thumbnail grids
        document.querySelectorAll('#art-gallery > div.thumbnail-grid').forEach(div =>
          div.classList.add('hidden')
        );

        // Show selected gallery
        const gallery = document.getElementById(`${type}-gallery`);
        if (gallery) {
          gallery.classList.remove('hidden');
          gallery.querySelector('.section-content')?.classList.add('content-visible');
        }

        document.querySelector('.back-btn')?.classList.remove('hidden');
        scrollToElementWithOffset(document.getElementById('art-gallery'));
      });
    });
  });

  // Back Button in Art Gallery
  document.querySelector('.back-btn')?.addEventListener('click', () => {
    runCurtainTransition(() => {
      document.getElementById('art-gallery')?.classList.add('hidden');
      document.getElementById('gallery-wrapper')?.classList.remove('hidden');

      document.querySelectorAll('#art-gallery > div.thumbnail-grid').forEach(div =>
        div.classList.add('hidden')
      );

      scrollToElementWithOffset(document.getElementById('gallery-wrapper'));
    });
  });

  // Lightbox setup
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-image');
  document.querySelectorAll('.thumb-img').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.dataset.full || img.src;
      lightbox.classList.add('show');
    });
  });
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightboxImg.parentElement) {
      lightbox.classList.remove('show');
      lightboxImg.src = '';
    }
  });

  // Scroll Animations
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.fade-scroll').forEach(el => fadeObserver.observe(el));

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.section-scroll').forEach(section => scrollObserver.observe(section));

  // Ensure all section content starts visible
  document.querySelectorAll('.section-content').forEach(content => {
    content.classList.remove('content-hidden');
    content.classList.add('content-visible');
  });
});
