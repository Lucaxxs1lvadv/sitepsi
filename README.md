# Site — Camili Ribeiro · Psicóloga / Psicoterapeuta

## Estrutura

```
index.html              → página (todo o texto fica aqui)
assets/css/style.css    → CSS final, já compilado (não editar à mão)
assets/js/theme-init.js → aplica o tema claro/escuro antes da página aparecer
assets/js/main.js       → agenda, tema, som, audiodescrição (CONFIG no topo)
assets/fonts/           → fontes hospedadas no próprio site
assets/img/             → coloque aqui as fotos reais do consultório
src/input.css           → fonte do CSS (Tailwind v4)
package.json            → só para recompilar o CSS
```

## Publicar no GitHub Pages
Suba **index.html** e a pasta **assets/** para o repositório `sitepsi`.
`src/`, `package.json` e `README.md` podem ir junto (não atrapalham). Não suba `node_modules/`.

## Editar
- **Textos, links, endereço:** direto no `index.html`.
- **WhatsApp, dias e horários da agenda:** objeto `CONFIG` no topo de `assets/js/main.js`.
- **Classes do Tailwind:** se adicionar classes novas no HTML, recompile o CSS:
  ```
  npm install
  npm run build
  ```
  (Só mudar texto não precisa recompilar.)

## Fotos do carrossel
As fotos ficam em `assets/img/`, em WebP, nos tamanhos 720/1080/1440 px de largura
(sem metadados: localização e dados do celular são removidos na conversão).
Para trocar ou adicionar uma foto:
1. Salve a imagem em `assets/img/` (formato retrato fica melhor).
2. Copie um dos blocos `<img class="office-slide">` no `index.html`, ajuste `src`, `srcset`, `width`/`height` e o `alt`.
3. Atualize a descrição das fotos no capítulo "Apresentação e fotos" da audiodescrição.

## Segurança
- CSP restritiva: scripts, estilos, fontes e imagens só do próprio site; nada de CDN, Google Fonts ou scripts inline.
- Nenhum dado de paciente é salvo ou enviado: a mensagem é montada no navegador e só sai pelo WhatsApp.
- Entradas higienizadas e com limite de tamanho; DOM gerado sem `innerHTML`.
- O GitHub Pages não permite cabeçalhos HTTP próprios (ex.: `frame-ancestors`, HSTS). Se um dia
  migrar para Cloudflare Pages/Netlify, dá para adicionar esses cabeçalhos.

## Imersão sonora e audiodescrição
- Os ambientes (chuva, ondas, acordes) são gerados ao vivo com Web Audio, sem arquivos de áudio.
- A audiodescrição usa a voz do navegador (pt-BR). O texto fica no `index.html`, em `#adTranscript`
  (cada `<section data-chapter>` vira um capítulo) — editar ali muda a narração e a transcrição.
- **Ideia para o futuro:** gravar a audiodescrição na voz da própria Camili, salvar em
  `assets/audio/audiodescricao.mp3` e preencher `audioDescricaoGravada` no `CONFIG`.
  O player troca automaticamente para o áudio gravado.

## Pendências
- Completar o link do LinkedIn (procure `linkedin.com/in/` no `index.html`).
- Convites do Discord podem expirar: prefira um convite “sem expiração”.
