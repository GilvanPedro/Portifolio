const menuHamburguer = document.querySelector('.menu-hamburguer');
menuHamburguer.addEventListener('click', () => {
    toggleMenu();
});

function toggleMenu(){
    const nav = document.querySelector('.nav-responsive');
    menuHamburguer.classList.toggle('change');

    if (menuHamburguer.classList.contains('change')){
        nav.style.display = 'block';
    } else{
        nav.style.display = 'none';
    }
}

function downloadWord() {
    const content = `\
        <html>
        <head><meta charset='UTF-8'></head>
        <body>
            <h1>Documento Word</h1>
            <p>Este é um arquivo Word gerado via HTML e JavaScript.</p>
        </body>
        </html>
    `;
    const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Currículo.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}