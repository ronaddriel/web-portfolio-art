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
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.getAttribute('href').substring(1);
    const isMobile = window.innerWidth <= 768;

    function goToTargetSection() {
     
      if (header?.style.display === 'none') {
      header.style.display = '';
} 
      // Unhide all main sections
      document.querySelectorAll('main section').forEach(section => {
        section.classList.remove('hidden');
      });

      // Reset gallery state
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
        const elementPosition = targetEl.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: isMobile ? 'smooth' : 'auto'
        });
      }

      // Only replay animations if desktop
      if (!isMobile) {
        replayAnimationsInSection(target);
      }
    }

    // Desktop → with transition
    if (!isMobile) {
      runCurtainTransition(goToTargetSection, target);
    } else {
      // Mobile → skip curtain
      goToTargetSection();
    }
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

  // Back button: mobile fade-out gallery, desktop curtain transition back
const backBtn = document.querySelector('.back-btn');
backBtn?.addEventListener('click', () => {
  const isMobile = window.innerWidth <= 768;

  const goBack = () => {
    const artGallery = document.getElementById('art-gallery');
    const galleryWrapper = document.getElementById('gallery-wrapper');

    // Hide art gallery, show main gallery wrapper
    artGallery?.classList.add('hidden');
    galleryWrapper?.classList.remove('hidden');

    // Hide all thumbnail grids inside art gallery
    document.querySelectorAll('#art-gallery > div.thumbnail-grid').forEach(section => {
      section.classList.add('hidden');
    });

    // Show all section contents in gallery wrapper
    document.querySelectorAll('#gallery-wrapper .section-content').forEach(content => {
      content.classList.remove('content-hidden');
      content.classList.add('content-visible');
    });

    backBtn.classList.add('hidden');
    scrollToElementWithOffset(galleryWrapper);
  };

  if (isMobile) {
    // On mobile: fade out the currently visible gallery grid then go back
    const visibleGallery = document.querySelector('#art-gallery > div.thumbnail-grid:not(.hidden)');
    if (visibleGallery) {
      visibleGallery.classList.remove('fade-in'); // reset fade
      visibleGallery.classList.add('fade-out');
      visibleGallery.addEventListener('animationend', function onFadeOut() {
        visibleGallery.removeEventListener('animationend', onFadeOut);
        visibleGallery.classList.remove('fade-out');
        goBack();
      });
    } else {
      goBack();
    }
  } else {
    // Desktop: use curtain transition
    runCurtainTransition(goBack);
  }
});

  // Gallery enter buttons: mobile fade-in, desktop curtain transition
document.querySelectorAll('.gallery-card .enter-gallery-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    e.stopPropagation();

    const card = button.closest('.gallery-card');
    if (!card) return;
    const selectedType = card.dataset.type;

    const isMobile = window.innerWidth <= 768;

    const runGallery = () => {
      const selectedGallery = document.getElementById(`${selectedType}-gallery`);
      const galleryWrapper = document.getElementById('gallery-wrapper');
      const artGallery = document.getElementById('art-gallery');

      // Hide gallery wrapper & show art gallery container
      galleryWrapper?.classList.add('hidden');
      artGallery?.classList.remove('hidden');

      // Hide all thumbnail grids inside art gallery
      document.querySelectorAll('#art-gallery > div.thumbnail-grid').forEach(section => {
        section.classList.add('hidden');
      });

      if (selectedGallery) {
        selectedGallery.classList.remove('hidden');

        if (isMobile) {
          // Trigger fade-in animation on mobile
          selectedGallery.classList.remove('fade-in'); // reset animation
          void selectedGallery.offsetWidth; // force reflow
          selectedGallery.classList.add('fade-in');
        }

        // Ensure content visible
        const galleryContent = selectedGallery.querySelector('.section-content');
        if (galleryContent) {
          galleryContent.classList.remove('content-hidden');
          galleryContent.classList.add('content-visible');
        }
      }

      // Show all section contents in gallery (fallback)
      document.querySelectorAll('#art-gallery .section-content').forEach(content => {
        content.classList.remove('content-hidden');
        content.classList.add('content-visible');
      });

      document.querySelector('.back-btn')?.classList.remove('hidden');
      scrollToElementWithOffset(artGallery);
    };

    if (isMobile) {
      runGallery();
    } else {
      runCurtainTransition(runGallery);
    }
  });
});

const pressables = document.querySelectorAll('.portfolio-box, .retro-btn, .nav-btn, .enter-gallery-btn');

pressables.forEach(elem => {
  elem.addEventListener('pointerdown', () => {
    elem.classList.add('pressed');
  });
  elem.addEventListener('animationend', () => {
    elem.classList.remove('pressed');
  });
  elem.addEventListener('pointercancel', () => {
    elem.classList.remove('pressed');
  });
  elem.addEventListener('pointerup', () => {
    elem.classList.remove('pressed');
  });
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
