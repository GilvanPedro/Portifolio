// Marks that JS is running, so CSS only hides "reveal" content when the
// script is actually there to show it again.
document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const headerHeight = () => document.querySelector('.site-header').offsetHeight;

// --- Typewriter (hero role line) ---
const texts = [
    "Backend Developer",
    "Java & Spring Boot",
    "Software Engineering Student",
    "Desktop & Web Apps"
];
const typewriterEl = document.getElementById("typewriter");
let count = 0;
let index = 0;
let isDeleting = false;

function type() {
    const currentText = texts[count];
    index += isDeleting ? -1 : 1;
    typewriterEl.textContent = currentText.slice(0, index);

    let speed = isDeleting ? 45 : 90;

    if (!isDeleting && index === currentText.length) {
        isDeleting = true;
        speed = 1600; // pausa antes de apagar
    } else if (isDeleting && index === 0) {
        isDeleting = false;
        count = (count + 1) % texts.length;
        speed = 400;
    }

    setTimeout(type, speed);
}

if (typewriterEl) {
    if (reduceMotion.matches) {
        typewriterEl.textContent = texts[0];
    } else {
        type();
    }
}

// --- Mobile menu ---
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

function setMenu(open) {
    hamburger.classList.toggle('active', open);
    navMenu.classList.toggle('active', open);
    document.body.classList.toggle('menu-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

hamburger.addEventListener('click', () => {
    setMenu(!navMenu.classList.contains('active'));
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
});

window.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-menu') && !e.target.closest('.hamburger')) {
        setMenu(false);
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
});

// Close the drawer if the viewport grows back to desktop size while it's open.
window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
});

// --- Highlight the nav link of the section in view ---
const navLinks = Array.from(document.querySelectorAll('.menu-item'));
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
    });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));

// --- Scroll reveal (staggered) ---
// Section headings and group titles get the effect too, without having to
// mark them up by hand.
document.querySelectorAll('.section-head, .group-title, .stats').forEach(el => {
    el.classList.add('reveal');
});
document.querySelector('.stats')?.setAttribute('data-reveal', 'zoom');

const revealEls = Array.from(document.querySelectorAll('.reveal'));

// Each skill tag gets its own position so CSS can cascade them in.
document.querySelectorAll('.skill-list').forEach(list => {
    Array.from(list.children).forEach((skill, i) => skill.style.setProperty('--i', i));
});

// Elements that enter the screen together (a row of cards, for example)
// come in one after another instead of all at once.
const revealObserver = new IntersectionObserver((entries) => {
    entries
        .filter(entry => entry.isIntersecting)
        .forEach((entry, order) => {
            const el = entry.target;
            const delay = Math.min(order, 5) * 0.12;
            el.style.setProperty('--reveal-delay', delay + 's');
            el.classList.add('active');
            revealObserver.unobserve(el);
            // Drop the stagger delay once the entrance is over, otherwise
            // hover effects on the card would also wait for it.
            setTimeout(() => el.style.setProperty('--reveal-delay', '0s'), (delay + 1.6) * 1000);
        });
}, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

revealEls.forEach(el => revealObserver.observe(el));

// --- Animated counters in the stats bar ---
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        counterObserver.unobserve(entry.target);
        const el = entry.target;
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        if (reduceMotion.matches) return;

        const duration = 1400;
        const start = performance.now();
        const tick = (now) => {
            const t = clamp((now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });
}, { threshold: 0.6 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// --- Card tilt + spotlight following the mouse ---
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

document.querySelectorAll('.project, .skill-group').forEach(card => {
    card.addEventListener('pointermove', (e) => {
        if (!finePointer.matches) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        card.style.setProperty('--mx', (x * 100) + '%');
        card.style.setProperty('--my', (y * 100) + '%');
        if (!reduceMotion.matches && card.classList.contains('project')) {
            card.style.setProperty('--rx', ((0.5 - y) * 6).toFixed(2) + 'deg');
            card.style.setProperty('--ry', ((x - 0.5) * 8).toFixed(2) + 'deg');
        }
    });
    card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
    });
});

// --- Featured projects: pinned "scrollytelling" showcase ---
// On large screens the featured block sticks to the viewport; scrolling
// through its extra height swaps which project is shown (image wipe + text
// slide) instead of moving the page. Smaller screens, very short windows and
// reduced-motion users keep the normal list of cards.
const scrolly = (() => {
    const group = document.querySelector('[data-scrolly]');
    if (!group) return null;

    const sticky = group.querySelector('.scrolly-sticky');
    const dotsWrap = group.querySelector('.scrolly-dots');
    const currentLabel = group.querySelector('.scrolly-current');
    const totalLabel = group.querySelector('.scrolly-total');
    const allProjects = Array.from(group.querySelectorAll('.project'));
    const largeScreen = window.matchMedia('(min-width: 901px) and (min-height: 620px)');

    let items = [];
    let dots = [];
    let enabled = false;
    let current = -1;

    const pad = (n) => String(n).padStart(2, '0');

    function build() {
        items = allProjects.filter(p => !p.classList.contains('is-hidden'));
        enabled = largeScreen.matches && !reduceMotion.matches && items.length > 1;
        group.classList.toggle('is-scrolly', enabled);
        current = -1;

        allProjects.forEach(p => p.classList.remove('is-current', 'is-before'));
        dotsWrap.innerHTML = '';
        dots = [];

        if (!enabled) {
            group.style.height = '';
            return;
        }

        // Projects in the pinned stage skip the regular scroll reveal.
        allProjects.forEach(p => p.classList.add('active'));

        items.forEach((project, i) => {
            project.querySelector('.project-body').dataset.step = pad(i + 1);

            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'scrolly-dot';
            dot.setAttribute('aria-label', 'Show featured project ' + (i + 1));
            dot.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(dot);
            dots.push(dot);
        });
        totalLabel.textContent = pad(items.length);

        measure();
    }

    // Each project gets ~70% of a screen of scroll distance.
    function measure() {
        if (!enabled) return;
        const stepLength = window.innerHeight * 0.7;
        group.style.height = (sticky.offsetHeight + stepLength * items.length) + 'px';
    }

    function progress() {
        const rect = group.getBoundingClientRect();
        const scrollable = group.offsetHeight - sticky.offsetHeight;
        return clamp((headerHeight() - rect.top) / scrollable);
    }

    function goTo(i) {
        const scrollable = group.offsetHeight - sticky.offsetHeight;
        const target = (i + 0.5) / items.length;
        const groupTop = group.getBoundingClientRect().top + window.scrollY - headerHeight();
        window.scrollTo({ top: groupTop + target * scrollable, behavior: 'smooth' });
    }

    function update() {
        if (!enabled) return;
        const p = progress() * items.length;
        // Nothing is shown until the block is well into view, so the first
        // project's wipe-in happens where the visitor can see it.
        const inView = group.getBoundingClientRect().top < window.innerHeight * 0.7;
        const active = inView ? Math.min(items.length - 1, Math.floor(p)) : -1;
        const step = clamp(p - active);

        if (active !== current) {
            current = active;
            items.forEach((project, i) => {
                project.classList.toggle('is-current', i === active);
                project.classList.toggle('is-before', i < active);
            });
            currentLabel.textContent = pad(Math.max(active, 0) + 1);
        }

        dots.forEach((dot, i) => {
            dot.classList.toggle('is-current', i === active);
            dot.classList.toggle('is-done', i < active);
            dot.style.setProperty('--step', i === active ? step.toFixed(3) : 0);
        });
    }

    build();
    largeScreen.addEventListener('change', () => { build(); update(); });
    reduceMotion.addEventListener('change', () => { build(); update(); });
    document.addEventListener('projects:filtered', () => { build(); update(); });
    window.addEventListener('resize', measure);

    return { update };
})();

// --- Scroll-driven effects, batched into one frame ---
const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
const heroText = document.querySelector('.hero-text');
const heroVisual = document.querySelector('.hero-visual');
const timeline = document.querySelector('.timeline');
const timelineItems = timeline ? Array.from(timeline.querySelectorAll('.timeline-item')) : [];
const root = document.documentElement;
let ticking = false;

function onScrollFrame() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;

    header.classList.toggle('scrolled', y > 10);

    // Page progress bar
    const max = root.scrollHeight - vh;
    root.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);

    // Hero parallax: the illustration drifts slower than the page and the
    // text fades out as it leaves.
    if (!reduceMotion.matches && hero && y < hero.offsetHeight) {
        const h = hero.offsetHeight;
        hero.style.setProperty('--hero-y', y.toFixed(1));
        heroVisual.style.transform = `translate3d(0, ${(y * 0.22).toFixed(1)}px, 0)`;
        heroText.style.transform = `translate3d(0, ${(y * 0.08).toFixed(1)}px, 0)`;
        heroText.style.opacity = clamp(1 - (y / h) * 1.3).toFixed(3);
    }

    // Timeline line fills up as you scroll through it.
    if (timeline) {
        const rect = timeline.getBoundingClientRect();
        const fill = clamp((vh * 0.65 - rect.top) / rect.height);
        timeline.style.setProperty('--fill', fill.toFixed(3));
        timelineItems.forEach(item => {
            const itemTop = item.offsetTop / rect.height;
            item.classList.toggle('passed', fill >= itemTop);
        });
    }

    if (scrolly) scrolly.update();
}

function requestScrollFrame() {
    if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScrollFrame);
    }
}

window.addEventListener('scroll', requestScrollFrame, { passive: true });
window.addEventListener('resize', requestScrollFrame);
onScrollFrame();

// --- Footer year ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Project tag filter ---
// Selecting one or more tags shows every project that has at least one of
// them (union, not intersection): pick "Java" and "HTML/CSS" and you get
// both the Java projects and the HTML/CSS ones together.
(function setupProjectFilters() {
    const filterBar = document.getElementById('project-filters');
    const projects = Array.from(document.querySelectorAll('.project'));
    if (!filterBar || !projects.length) return;

    const tagNames = [];
    projects.forEach(project => {
        project.querySelectorAll('.tag').forEach(tagEl => {
            const name = tagEl.textContent.trim();
            if (name && !tagNames.includes(name)) tagNames.push(name);
        });
    });

    const activeTags = new Set();

    function projectTags(project) {
        return Array.from(project.querySelectorAll('.tag')).map(t => t.textContent.trim());
    }

    function applyFilter() {
        projects.forEach(project => {
            const tags = projectTags(project);
            const show = activeTags.size === 0 || tags.some(t => activeTags.has(t));
            project.classList.toggle('is-hidden', !show);
        });

        // Hide a group (and its heading) when the filter leaves nothing in it.
        document.querySelectorAll('.project-group').forEach(group => {
            const groupHasVisible = Array.from(group.querySelectorAll('.project'))
                .some(p => !p.classList.contains('is-hidden'));
            group.classList.toggle('is-hidden', !groupHasVisible);
            const heading = group.previousElementSibling;
            if (heading && heading.classList.contains('group-title')) {
                heading.classList.toggle('is-hidden', !groupHasVisible);
            }
        });

        // Lets the featured showcase recount its steps.
        document.dispatchEvent(new CustomEvent('projects:filtered'));
    }

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'filter-tag filter-clear active';
    clearBtn.textContent = 'All';
    clearBtn.setAttribute('aria-pressed', 'true');
    clearBtn.addEventListener('click', () => {
        activeTags.clear();
        filterBar.querySelectorAll('.filter-tag').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
        });
        clearBtn.classList.add('active');
        clearBtn.setAttribute('aria-pressed', 'true');
        applyFilter();
    });
    filterBar.appendChild(clearBtn);

    tagNames.forEach(tagName => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'filter-tag';
        btn.textContent = tagName;
        btn.setAttribute('aria-pressed', 'false');
        btn.addEventListener('click', () => {
            if (activeTags.has(tagName)) {
                activeTags.delete(tagName);
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            } else {
                activeTags.add(tagName);
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            }
            const noneActive = activeTags.size === 0;
            clearBtn.classList.toggle('active', noneActive);
            clearBtn.setAttribute('aria-pressed', String(noneActive));
            applyFilter();
        });
        filterBar.appendChild(btn);
    });
})();
