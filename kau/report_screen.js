// Active-section highlighting in sidebar TOC + smooth nav.
(function () {
  const links = Array.from(document.querySelectorAll('.toc a[data-target]'));
  if (!links.length) return;

  const targets = links
    .map((a) => ({ a, el: document.getElementById(a.dataset.target) }))
    .filter((t) => t.el);

  const setActive = (id) => {
    links.forEach((a) => {
      if (a.dataset.target === id) {
        a.classList.add('active');
        a.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        a.classList.remove('active');
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) {
        const id = visible[0].target.id;
        setActive(id);
      }
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
  );

  targets.forEach((t) => observer.observe(t.el));

  // Close mobile TOC on click
  links.forEach((a) =>
    a.addEventListener('click', () => {
      if (window.innerWidth <= 1100) {
        document.body.classList.remove('toc-open');
      }
    })
  );
})();
