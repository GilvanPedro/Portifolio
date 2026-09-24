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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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

// --- Header shadow on scroll ---
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

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

// --- Scroll reveal ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });

document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

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
