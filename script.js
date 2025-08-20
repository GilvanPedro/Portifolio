function revealOnScroll() {
    const reveals = document.querySelectorAll(".reveal");

    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 100; // quanto antes ativa

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        } else {
            reveals[i].classList.remove("active");
        }
    }
}

window.addEventListener("scroll", revealOnScroll);

const texts = ["Hi! Welcome to my portifolio 🥰", 
                "I'm Gilvan Pedro", 
                "This is my site! 😎"];
let count = 0;
let index = 0;
let currentText = "";
let letter = "";
let isDeleting = false;

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

