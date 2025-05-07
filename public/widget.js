// widget.js
(function () {
    // 1) injecter CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'widget.css';
    document.head.appendChild(link);

    // 2) créer le bouton flottant avec SVG inline
    const btn = document.createElement('div');
    btn.className = 'twowin-widget-button';
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>`;
    document.body.appendChild(btn);

    // 3) créer le conteneur de chat
    const container = document.createElement('div');
    container.className = 'twowin-widget-container';
    document.body.appendChild(container);

    // 4) embarquer le chat dans un iframe
    const iframe = document.createElement('iframe');
    iframe.src = '/index.html';      // ou '/index.html' selon votre setup
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    container.appendChild(iframe);

    // 5) toggler l’affichage au clic : on ajoute/retire la classe .open
    btn.addEventListener('click', () => {
        if (container.classList.contains('open')) {
            container.classList.remove('open');
        } else {
            container.classList.add('open');
        }
    });
})();
