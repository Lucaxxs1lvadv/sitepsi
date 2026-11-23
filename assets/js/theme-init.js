/* Aplica o tema salvo antes da página aparecer (evita "piscar" claro→escuro). */
(function () {
    var root = document.documentElement;
    root.classList.add('js');
    try {
        var saved = localStorage.getItem('tema');
        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (saved === 'escuro' || (!saved && prefersDark)) root.classList.add('black-cat-mode');
    } catch (e) { /* armazenamento indisponível: segue no tema claro */ }
})();
