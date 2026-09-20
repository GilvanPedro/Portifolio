const texts = ["Hi! Welcome to my portifolio ",
                "I'm Gilvan Pedro", 
                "This is my site! "];
let count = 0;
let index = 0;
let currentText = "";
let letter = "";
let isDeleting = false;

// The CSS min-height on #typewriter is a fallback guess (2 lines). This
// measures the real rendered height of each rotating phrase at the current
// viewport width and locks in the tallest one, so the subtitle and buttons
// below never jump while the text types or deletes.
const typewriterEl = document.getElementById("typewriter");

function lockTypewriterHeight() {
    if (!typewriterEl) return;
    const currentText = typewriterEl.textContent;
    typewriterEl.style.minHeight = "0";
    let tallest = 0;
    texts.forEach(text => {
        typewriterEl.textContent = text;
        tallest = Math.max(tallest, typewriterEl.offsetHeight);
    });
    typewriterEl.textContent = currentText;
    typewriterEl.style.minHeight = tallest + "px";
}

lockTypewriterHeight();
window.addEventListener("resize", lockTypewriterHeight);

function type() {
    currentText = texts[count];

    if (!isDeleting) {
        letter = currentText.slice(0, ++index);
    } else {
        letter = currentText.slice(0, --index);
    }

    document.getElementById("typewriter").textContent = letter;

    let speed = 100;

    if (isDeleting) {
        speed /= 2; // apaga mais rápido
    }

    if (!isDeleting && letter.length === currentText.length) {
        isDeleting = true;
        speed = 1500; // pausa antes de apagar
    } else if (isDeleting && letter.length === 0) {
        isDeleting = false;
        count++;
        if (count === texts.length) {
            count = 0; // reinicia loop
        }
        speed = 500;
    }

    setTimeout(type, speed);
}

type();

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

window.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-menu') && !e.target.closest('.hamburger')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Single scroll-reveal mechanism: IntersectionObserver instead of a
// "scroll" listener, which used to fire on every pixel of scroll and
// duplicated this same work.
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(element => {
    observer.observe(element);
});

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
