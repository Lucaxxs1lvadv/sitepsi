/* ==========================================================================
   Camili Ribeiro · Psicóloga / Psicoterapeuta — scripts do site
   Sem dependências externas. Tudo roda no navegador do visitante;
   nenhum dado é salvo ou enviado a servidores.
   ========================================================================== */
(function () {
    'use strict';

    /* ----------------------------------------------------------------------
       CONFIGURAÇÃO (edite aqui)
       ---------------------------------------------------------------------- */
    var CONFIG = {
        nome: 'Camili Ribeiro',
        primeiroNome: 'Camili',
        crp: 'CRP 08/48173',
        funcao: 'Psicóloga / Psicoterapeuta',
        whatsapp: '5541988467240',            // só números: 55 + DDD + número
        instagram: '@psipsicrs',
        endereco: 'R. Chiden Kalil, 428 - Jardim Santa Helena, Bocaiúva do Sul - PR, 83453-054',

        // Agenda: 0 = domingo, 1 = segunda ... 6 = sábado
        diasDeAtendimento: [1, 2, 3, 4, 5, 6],
        quantidadeDeDias: 6,
        horarios: {
            'Manhã': ['09:30', '10:30', '11:30', '12:30'],
            'Tarde': ['14:30', '15:30', '16:30', '17:30'],
            'Noite': ['18:30', '19:30', '20:30']
        },

        limites: { nome: 60, observacao: 280 },

        // Futuro: grave a audiodescrição em MP3, coloque em assets/audio/
        // e informe o caminho aqui (ex.: 'assets/audio/audiodescricao.mp3').
        audioDescricaoGravada: ''
    };

    var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
    var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var storage = {
        get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
    };

    /** Remove caracteres de controle, junta espaços e limita o tamanho. */
    function cleanText(value, max) {
        return String(value || '')
            .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2066-\u2069]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, max);
    }

    function waLink(message) {
        return 'https://wa.me/' + CONFIG.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent(message);
    }

    function openExternal(url) {
        var w = window.open(url, '_blank', 'noopener,noreferrer');
        if (w) w.opener = null;
    }

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
        }
        return legacyCopy(text);
    }
    function legacyCopy(text) {
        return new Promise(function (resolve, reject) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.className = 'fixed opacity-0 pointer-events-none';
            document.body.appendChild(ta);
            ta.select();
            var ok = false;
            try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
            document.body.removeChild(ta);
            ok ? resolve() : reject(new Error('copy failed'));
        });
    }

    /* ----------------------------------------------------------------------
       1. TEMA CLARO / ESCURO
       ---------------------------------------------------------------------- */
    function initTheme() {
        var btn = $('#themeToggleBtn');
        var label = $('#themeToggleLabel');
        var root = document.documentElement;

        function sync() {
            var dark = root.classList.contains('black-cat-mode');
            btn.setAttribute('aria-pressed', String(dark));
            btn.setAttribute('aria-label', dark ? 'Tema Sombra ativo. Mudar para o Tema Luz' : 'Tema Luz ativo. Mudar para o Tema Sombra');
            label.textContent = dark ? 'Tema Sombra' : 'Tema Luz';
        }
        btn.addEventListener('click', function () {
            var dark = root.classList.toggle('black-cat-mode');
            storage.set('tema', dark ? 'escuro' : 'claro');
            sync();
        });
        sync();
    }

    /* ----------------------------------------------------------------------
       2. MENU MÓVEL
       ---------------------------------------------------------------------- */
    function initMobileMenu() {
        var btn = $('#mobileMenuBtn');
        var panel = $('#mobileMenuPanel');
        var icon = $('#mobileMenuIconPath');
        function set(open) {
            panel.classList.toggle('hidden', !open);
            btn.setAttribute('aria-expanded', String(open));
            btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
            icon.setAttribute('d', open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16');
        }
        btn.addEventListener('click', function () { set(panel.classList.contains('hidden')); });
        $$('a', panel).forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !panel.classList.contains('hidden')) { set(false); btn.focus(); }
        });
    }

    /* ----------------------------------------------------------------------
       3. FOTOS DO CONSULTÓRIO (troca suave)
       ---------------------------------------------------------------------- */
    function initOfficeSlides() {
        var slides = $$('.office-slide');
        var dotsWrap = $('#slideDots');
        if (!slides.length || !dotsWrap) return;
        var current = 0;
        var timer = null;
        var paused = false;

        slides.forEach(function (img, i) {
            img.addEventListener('error', function () {
                img.classList.add('is-broken');
                if (dotsWrap.children[i]) dotsWrap.children[i].hidden = true;
                if (i === current) next();
            });
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'slide-dot';
            dot.setAttribute('aria-label', 'Mostrar foto ' + (i + 1) + ' de ' + slides.length);
            dot.addEventListener('click', function () { show(i); restart(); });
            dotsWrap.appendChild(dot);
        });

        function usable(i) { return !slides[i].classList.contains('is-broken'); }
        function show(i) {
            current = i;
            slides.forEach(function (img, k) {
                img.classList.toggle('is-active', k === i);
                img.setAttribute('aria-hidden', String(k !== i));
                dotsWrap.children[k].setAttribute('aria-current', String(k === i));
            });
        }
        function next() {
            for (var step = 1; step <= slides.length; step++) {
                var k = (current + step) % slides.length;
                if (usable(k)) { show(k); return; }
            }
        }
        function restart() {
            clearInterval(timer);
            if (prefersReducedMotion) return;
            timer = setInterval(function () { if (!paused && !document.hidden) next(); }, 7000);
        }
        var figure = slides[0].closest('figure');
        figure.addEventListener('mouseenter', function () { paused = true; });
        figure.addEventListener('mouseleave', function () { paused = false; });
        figure.addEventListener('focusin', function () { paused = true; });
        figure.addEventListener('focusout', function () { paused = false; });

        show(0);
        restart();
    }

    /* ----------------------------------------------------------------------
       4. CARTÃO "LUZ & SOMBRA" — um carinho que ronrona
       ---------------------------------------------------------------------- */
    function initHarmonyCard() {
        var card = $('#harmonyCard');
        var container = $('#floatingPurrContainer');
        var bubble = $('#purrBubble');
        var counter = $('#purrCount');
        if (!card) return;

        var symbols = ['🤍', '🖤', '🐾', '✨'];
        var messages = [
            'Prrr… obrigado pelo carinho 🐾',
            'Respire fundo… tudo no seu tempo 🤍',
            'Luz e sombra em harmonia 🖤🤍',
            'Um ronrom suave para acalmar o dia ✨',
            'Até os gatinhos sabem a hora de descansar',
            'Você também merece colo hoje 🤍'
        ];
        var count = 0;
        var purrTimer = null, bubbleTimer = null;

        card.addEventListener('click', function () {
            count++;
            counter.textContent = '×' + count;
            counter.setAttribute('aria-label', count + (count === 1 ? ' ronrom' : ' ronrons'));
            counter.classList.remove('hidden');

            // corações e patinhas subindo
            if (container) {
                for (var i = 0; i < 2; i++) {
                    (function (delay, n) {
                        setTimeout(function () {
                            var el = document.createElement('span');
                            el.className = 'float-heart';
                            el.textContent = symbols[(count + n) % symbols.length];
                            el.style.left = (4 + Math.random() * 32) + '%';
                            container.appendChild(el);
                            setTimeout(function () { el.remove(); }, 1900);
                        }, delay);
                    })(i * 260, i);
                }
            }

            // os gatinhos vibram, abanam o rabo e o coração pulsa
            card.classList.remove('is-purring');
            void card.offsetWidth;
            card.classList.add('is-purring');
            clearTimeout(purrTimer);
            purrTimer = setTimeout(function () { card.classList.remove('is-purring'); }, 2600);

            // mensagem gentil
            if (bubble) {
                bubble.textContent = messages[(count - 1) % messages.length];
                bubble.classList.add('is-visible');
                clearTimeout(bubbleTimer);
                bubbleTimer = setTimeout(function () { bubble.classList.remove('is-visible'); }, 3200);
            }

            // o som do ronrom (e uma vibração leve no celular, quando houver)
            Sound.purr();
            if (!prefersReducedMotion && navigator.vibrate) {
                try { navigator.vibrate([18, 22, 18, 22, 18, 22, 18, 160, 18, 22, 18, 22, 18]); } catch (e) { /* ignore */ }
            }
        });
    }

    /* ----------------------------------------------------------------------
       5. RESPIRAÇÃO GUIADA (4s inspira · 4s segura · 6s solta) × 3
       ---------------------------------------------------------------------- */
    function initBreathing() {
        var btn = $('#breathingBtn');
        var text = $('#breathingText');
        var ring = $('#breathRing');
        var idleText = text.textContent;
        var timers = [];
        var running = false;

        var phases = [
            { t: 'Inspire suavemente pelo nariz…', cls: 'inhale', ms: 4000 },
            { t: 'Segure o ar com calma…', cls: 'hold', ms: 4000 },
            { t: 'Solte o ar devagar pela boca…', cls: 'exhale', ms: 6000 }
        ];

        function stop(finalText) {
            timers.forEach(clearTimeout);
            timers = [];
            running = false;
            ring.className = 'breath-ring';
            text.textContent = finalText || idleText;
        }
        btn.addEventListener('click', function () {
            if (running) { stop(); return; }
            running = true;
            var elapsed = 0;
            for (var cycle = 0; cycle < 3; cycle++) {
                phases.forEach(function (p) {
                    timers.push(setTimeout(function () {
                        text.textContent = p.t;
                        ring.className = 'breath-ring ' + p.cls;
                    }, elapsed));
                    elapsed += p.ms;
                });
            }
            timers.push(setTimeout(function () { stop('Pausa concluída. Sinta os ombros relaxarem. 🤍'); }, elapsed));
        });
    }

    /* ----------------------------------------------------------------------
       6. AGENDA
       ---------------------------------------------------------------------- */
    var DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    var DIAS_LONGOS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    var MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    var agenda = { days: [], dayIndex: 0, time: null };

    function buildDays() {
        var cursor = new Date();
        cursor.setHours(12, 0, 0, 0);
        var guard = 0;
        while (agenda.days.length < CONFIG.quantidadeDeDias && guard++ < 60) {
            cursor.setDate(cursor.getDate() + 1);
            var wd = cursor.getDay();
            if (CONFIG.diasDeAtendimento.indexOf(wd) === -1) continue;
            var dd = String(cursor.getDate()).padStart(2, '0');
            agenda.days.push({
                short: DIAS[wd],
                number: dd,
                month: MESES[cursor.getMonth()],
                label: DIAS[wd] + ', ' + dd + ' de ' + MESES[cursor.getMonth()],
                spoken: DIAS_LONGOS[wd] + ', ' + cursor.getDate() + ' de ' + MESES[cursor.getMonth()]
            });
        }
    }

    function renderDays() {
        var box = $('#daysGridContainer');
        box.textContent = '';
        agenda.days.forEach(function (d, i) {
            var selected = i === agenda.dayIndex;
            var b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('aria-pressed', String(selected));
            b.setAttribute('aria-label', d.spoken);
            b.className = 'p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-0.5 ' +
                (selected ? 'theme-btn-primary shadow-md scale-[1.03]' : 'border-current/20 hover:border-current/60 opacity-80 hover:opacity-100');
            [['text-[11px] uppercase tracking-wider opacity-75', d.short],
             ['font-serif text-2xl font-bold leading-none my-0.5', d.number],
             ['text-[10px] uppercase opacity-70', d.month]].forEach(function (p) {
                var s = document.createElement('span');
                s.className = p[0];
                s.textContent = p[1];
                s.setAttribute('aria-hidden', 'true');
                b.appendChild(s);
            });
            b.addEventListener('click', function () { agenda.dayIndex = i; renderAgenda(); hideFeedback(); });
            box.appendChild(b);
        });
    }

    function renderSlots() {
        var box = $('#timeSlotsContainer');
        box.textContent = '';
        Object.keys(CONFIG.horarios).forEach(function (period) {
            var wrap = document.createElement('div');
            wrap.className = 'space-y-2.5';
            wrap.setAttribute('role', 'group');
            wrap.setAttribute('aria-label', period);

            var head = document.createElement('p');
            head.className = 'text-xs font-medium opacity-75';
            head.textContent = '• ' + period;
            head.setAttribute('aria-hidden', 'true');
            wrap.appendChild(head);

            var grid = document.createElement('div');
            grid.className = 'grid grid-cols-2 sm:grid-cols-4 gap-2.5';
            CONFIG.horarios[period].forEach(function (time) {
                var selected = agenda.time === time;
                var b = document.createElement('button');
                b.type = 'button';
                b.setAttribute('aria-pressed', String(selected));
                b.className = 'py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-mono font-medium ' +
                    (selected ? 'theme-btn-primary shadow-md scale-[1.02]' : 'border-current/25 hover:border-current');
                b.textContent = selected ? '🐾 ' + time : time;
                b.setAttribute('aria-label', time);
                b.addEventListener('click', function () { agenda.time = time; renderAgenda(); hideFeedback(); });
                grid.appendChild(b);
            });
            wrap.appendChild(grid);
            box.appendChild(wrap);
        });
    }

    function renderSummary() {
        var display = $('#summaryDateTimeDisplay');
        var badge = $('#summaryStatusBadge');
        var d = agenda.days[agenda.dayIndex];
        if (!d) return;
        if (!agenda.time) {
            display.textContent = d.label + ' • escolha o horário';
            badge.textContent = 'Falta horário';
        } else {
            display.textContent = d.label + ' às ' + agenda.time;
            badge.textContent = 'Pronto para enviar';
        }
    }

    function renderAgenda() { renderDays(); renderSlots(); renderSummary(); }

    function showFeedback(msg) {
        $('#bookingFeedbackText').textContent = msg;
        $('#bookingFeedbackBox').classList.remove('hidden');
    }
    function hideFeedback() { $('#bookingFeedbackBox').classList.add('hidden'); }

    function collectBooking() {
        if (!agenda.time) {
            showFeedback('Escolha um horário (manhã, tarde ou noite) antes de enviar.');
            var first = $('#timeSlotsContainer button');
            if (first) first.focus();
            return null;
        }
        var nameInput = $('#patientNameInput');
        var name = cleanText(nameInput.value, CONFIG.limites.nome);
        if (name.length < 2) {
            showFeedback('Escreva seu nome (ou como prefere ser chamado) para a Camili identificar seu agendamento.');
            nameInput.setAttribute('aria-invalid', 'true');
            nameInput.focus();
            return null;
        }
        nameInput.removeAttribute('aria-invalid');
        var modality = cleanText($('#modalitySelect').value, 80);
        var notes = cleanText($('#patientNotesInput').value, CONFIG.limites.observacao);
        return { name: name, modality: modality, notes: notes, date: agenda.days[agenda.dayIndex].label, time: agenda.time };
    }

    function initAgenda() {
        buildDays();
        renderAgenda();

        $('#bookingForm').addEventListener('submit', function (e) {
            e.preventDefault();
            var b = collectBooking();
            if (!b) return;
            var msg = 'Olá, ' + CONFIG.primeiroNome + '! Gostaria de agendar uma sessão pelo site:\n\n' +
                '• *Nome:* ' + b.name + '\n' +
                '• *Data:* ' + b.date + '\n' +
                '• *Horário:* ' + b.time + '\n' +
                '• *Modalidade:* ' + b.modality +
                (b.notes ? '\n• *Observação:* ' + b.notes : '') +
                '\n\nAguardo sua confirmação. Obrigado(a)!';
            showFeedback('Tudo pronto! Abrindo o WhatsApp com a sua mensagem preenchida…');
            openExternal(waLink(msg));
        });

        $('#copySummaryBtn').addEventListener('click', function () {
            var b = collectBooking();
            if (!b) return;
            var text = 'Agendamento de sessão — ' + CONFIG.nome + ' (' + CONFIG.crp + ') | Nome: ' + b.name +
                ' | Data: ' + b.date + ' às ' + b.time + ' | Modalidade: ' + b.modality;
            copyText(text)
                .then(function () { showFeedback('Resumo copiado. É só colar na conversa com a Camili. 🤍'); })
                .catch(function () { showFeedback('Não foi possível copiar automaticamente. Resumo: ' + text); });
        });

        ['#patientNameInput', '#patientNotesInput'].forEach(function (s) {
            $(s).addEventListener('input', hideFeedback);
        });
    }

    /* ----------------------------------------------------------------------
       7. CARTÃO DE CONTATO
       ---------------------------------------------------------------------- */
    function initContactCard() {
        var btn = $('#copyCardBtn');
        var label = $('#copyCardBtnText');
        var original = label.textContent;
        btn.addEventListener('click', function () {
            var card = CONFIG.nome + ' — ' + CONFIG.funcao + ' (' + CONFIG.crp + ') | WhatsApp: +' + CONFIG.whatsapp +
                ' | Instagram: ' + CONFIG.instagram + ' | Endereço: ' + CONFIG.endereco;
            copyText(card)
                .then(function () { label.textContent = 'Cartão copiado!'; })
                .catch(function () { label.textContent = 'Não foi possível copiar'; })
                .then(function () { setTimeout(function () { label.textContent = original; }, 3000); });
        });
    }

    /* ----------------------------------------------------------------------
       8. AMBIENTE SONORO (gerado ao vivo com Web Audio, sem arquivos)
       ---------------------------------------------------------------------- */
    var Sound = (function () {
        var AC = window.AudioContext || window.webkitAudioContext;
        var ctx = null, master = null, reverb = null;
        var active = null;           // { stop: fn }
        var kind = storage.get('ambiente') || 'chuva';
        var volume = Number(storage.get('volume') || 45) / 100;
        var ducked = false;
        var listeners = [];

        function supported() { return !!AC; }

        function ensure() {
            if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
            ctx = new AC();
            master = ctx.createGain();
            master.gain.value = 0;
            var comp = ctx.createDynamicsCompressor();
            comp.threshold.value = -18;
            comp.ratio.value = 3;
            master.connect(comp).connect(ctx.destination);
            reverb = ctx.createConvolver();
            reverb.buffer = impulse(3.2, 2.6);
            var wet = ctx.createGain();
            wet.gain.value = 0.55;
            reverb.connect(wet).connect(master);
            return ctx;
        }

        function impulse(seconds, decay) {
            var len = Math.floor(ctx.sampleRate * seconds);
            var buf = ctx.createBuffer(2, len, ctx.sampleRate);
            for (var c = 0; c < 2; c++) {
                var d = buf.getChannelData(c);
                for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
            }
            return buf;
        }

        function noiseBuffer(type, seconds) {
            var len = Math.floor(ctx.sampleRate * (seconds || 4));
            var buf = ctx.createBuffer(1, len, ctx.sampleRate);
            var d = buf.getChannelData(0);
            var last = 0, b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (var i = 0; i < len; i++) {
                var w = Math.random() * 2 - 1;
                if (type === 'brown') {
                    last = (last + 0.02 * w) / 1.02;
                    d[i] = last * 3.5;
                } else if (type === 'pink') {
                    b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
                    b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
                    b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
                    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
                    b6 = w * 0.115926;
                } else {
                    d[i] = w;
                }
            }
            return buf;
        }

        function loop(buffer) {
            var s = ctx.createBufferSource();
            s.buffer = buffer;
            s.loop = true;
            return s;
        }

        function targetGain() { return Math.pow(volume, 2) * 0.9 * (ducked ? 0.35 : 1); }

        /* --- Ambientes --- */
        function rain() {
            var nodes = [];
            var hiss = loop(noiseBuffer('pink', 5));
            var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 400;
            var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
            var g = ctx.createGain(); g.gain.value = 0.55;
            hiss.connect(hp).connect(lp).connect(g).connect(master);

            var rumble = loop(noiseBuffer('brown', 6));
            var rlp = ctx.createBiquadFilter(); rlp.type = 'lowpass'; rlp.frequency.value = 220;
            var rg = ctx.createGain(); rg.gain.value = 0.35;
            rumble.connect(rlp).connect(rg).connect(master);

            hiss.start(); rumble.start();
            nodes.push(hiss, rumble);

            var white = noiseBuffer('white', 0.05);
            var dropTimer = null;
            (function drop() {
                var src = ctx.createBufferSource(); src.buffer = white;
                var bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
                bp.frequency.value = 1800 + Math.random() * 4200; bp.Q.value = 6 + Math.random() * 8;
                var dg = ctx.createGain();
                var t = ctx.currentTime, peak = 0.04 + Math.random() * 0.12;
                dg.gain.setValueAtTime(0, t);
                dg.gain.linearRampToValueAtTime(peak, t + 0.004);
                dg.gain.exponentialRampToValueAtTime(0.0001, t + 0.05 + Math.random() * 0.05);
                var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
                if (pan) { pan.pan.value = Math.random() * 1.6 - 0.8; src.connect(bp).connect(dg).connect(pan).connect(master); }
                else { src.connect(bp).connect(dg).connect(master); }
                if (Math.random() < 0.3) dg.connect(reverb);
                src.start(t); src.stop(t + 0.12);
                dropTimer = setTimeout(drop, 35 + Math.random() * 180);
            })();

            return { stop: function () { clearTimeout(dropTimer); nodes.forEach(function (n) { try { n.stop(); } catch (e) {} }); } };
        }

        function waves() {
            var src = loop(noiseBuffer('brown', 8));
            var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 650;
            var swell = ctx.createGain(); swell.gain.value = 0.45;
            var lfo = ctx.createOscillator(); lfo.frequency.value = 0.085;
            var depth = ctx.createGain(); depth.gain.value = 0.38;
            lfo.connect(depth).connect(swell.gain);
            var flfo = ctx.createOscillator(); flfo.frequency.value = 0.085;
            var fdepth = ctx.createGain(); fdepth.gain.value = 380;
            flfo.connect(fdepth).connect(lp.frequency);

            var foam = loop(noiseBuffer('pink', 5));
            var fhp = ctx.createBiquadFilter(); fhp.type = 'highpass'; fhp.frequency.value = 1500;
            var fg = ctx.createGain(); fg.gain.value = 0.05;
            var flfo2 = ctx.createGain(); flfo2.gain.value = 0.05;
            lfo.connect(flfo2).connect(fg.gain);

            src.connect(lp).connect(swell).connect(master);
            swell.connect(reverb);
            foam.connect(fhp).connect(fg).connect(master);
            [src, lfo, flfo, foam].forEach(function (n) { n.start(); });
            return { stop: function () { [src, lfo, flfo, foam].forEach(function (n) { try { n.stop(); } catch (e) {} }); } };
        }

        function chords() {
            // Am9 → Fmaj7 → Cmaj7 → G6 (frequências em Hz)
            var prog = [
                [110.00, 164.81, 196.00, 246.94, 261.63],
                [87.31, 130.81, 164.81, 220.00, 261.63],
                [130.81, 196.00, 246.94, 329.63],
                [98.00, 146.83, 164.81, 246.94, 293.66]
            ];
            var bus = ctx.createGain(); bus.gain.value = 0.16;
            var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1300; lp.Q.value = 0.4;
            var lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
            var ld = ctx.createGain(); ld.gain.value = 450;
            lfo.connect(ld).connect(lp.frequency); lfo.start();
            bus.connect(lp); lp.connect(master); lp.connect(reverb);

            var voices = [];
            var step = 0, timer = null;
            function play() {
                var t = ctx.currentTime;
                voices.forEach(function (v) {
                    v.g.gain.cancelScheduledValues(t);
                    v.g.gain.setValueAtTime(v.g.gain.value, t);
                    v.g.gain.linearRampToValueAtTime(0, t + 4);
                    v.o.forEach(function (o) { o.stop(t + 4.2); });
                });
                voices = prog[step++ % prog.length].map(function (f) {
                    var g = ctx.createGain(); g.gain.value = 0;
                    var o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = f;
                    var o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = f; o2.detune.value = 6;
                    var g2 = ctx.createGain(); g2.gain.value = 0.35;
                    o1.connect(g); o2.connect(g2).connect(g); g.connect(bus);
                    o1.start(t); o2.start(t);
                    g.gain.linearRampToValueAtTime(0.5, t + 4);
                    return { g: g, o: [o1, o2] };
                });
                timer = setTimeout(play, 10000);
            }
            play();
            return {
                stop: function () {
                    clearTimeout(timer);
                    try { lfo.stop(); } catch (e) {}
                    voices.forEach(function (v) { v.o.forEach(function (o) { try { o.stop(); } catch (e) {} }); });
                }
            };
        }

        var makers = { chuva: rain, ondas: waves, acordes: chords };

        function emit() { listeners.forEach(function (fn) { fn(); }); }

        function fadeTo(value, seconds) {
            var t = ctx.currentTime;
            master.gain.cancelScheduledValues(t);
            master.gain.setValueAtTime(master.gain.value, t);
            master.gain.linearRampToValueAtTime(value, t + seconds);
        }

        function start() {
            if (!supported()) return;
            ensure();
            if (active) return;
            active = makers[kind]();
            fadeTo(targetGain(), 2.5);
            emit();
        }

        function stop(cb) {
            if (!active) { if (cb) cb(); return; }
            var old = active;
            active = null;
            fadeTo(0, 1.2);
            setTimeout(function () { old.stop(); if (cb) cb(); }, 1300);
            emit();
        }

        return {
            supported: supported,
            isPlaying: function () { return !!active; },
            kind: function () { return kind; },
            volume: function () { return volume; },
            onChange: function (fn) { listeners.push(fn); },
            toggle: function () { active ? stop() : start(); },
            setKind: function (k) {
                if (!makers[k] || k === kind) return;
                kind = k; storage.set('ambiente', k);
                if (active) { stop(start); } else { emit(); }
            },
            setVolume: function (v) {
                volume = v; storage.set('volume', String(Math.round(v * 100)));
                if (active) fadeTo(targetGain(), 0.3);
            },
            duck: function (on) { ducked = on; if (active) fadeTo(targetGain(), 0.8); },
            /* ronrom: duas "respiradas" de um ronronar grave e macio */
            purr: function () {
                if (!supported()) return;
                ensure();
                var t = ctx.currentTime + 0.02;
                var dur = 2.8;
                var src = ctx.createBufferSource(); src.buffer = noiseBuffer('brown', dur + 0.2);
                var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; lp.Q.value = 0.7;
                var body = ctx.createBiquadFilter(); body.type = 'peaking'; body.frequency.value = 120; body.gain.value = 6;

                // pulsação ~26 Hz (o "rrrr"), mais lenta na expiração
                var am = ctx.createGain(); am.gain.value = 0.45;
                var lfo = ctx.createOscillator(); lfo.type = 'triangle';
                lfo.frequency.setValueAtTime(27, t);
                lfo.frequency.linearRampToValueAtTime(24, t + 1.3);
                lfo.frequency.setValueAtTime(26, t + 1.45);
                lfo.frequency.linearRampToValueAtTime(23, t + dur);
                var ld = ctx.createGain(); ld.gain.value = 0.55;
                lfo.connect(ld).connect(am.gain);

                var env = ctx.createGain(); env.gain.value = 0;
                var peak = Math.max(0.3, volume) * 1.1;
                env.gain.setValueAtTime(0, t);
                env.gain.linearRampToValueAtTime(peak * 0.8, t + 0.35);   // inspira
                env.gain.linearRampToValueAtTime(peak * 0.6, t + 1.2);
                env.gain.linearRampToValueAtTime(peak * 0.15, t + 1.4);
                env.gain.linearRampToValueAtTime(peak, t + 1.7);         // expira
                env.gain.linearRampToValueAtTime(peak * 0.7, t + 2.4);
                env.gain.linearRampToValueAtTime(0, t + dur);

                src.connect(lp).connect(body).connect(am).connect(env).connect(ctx.destination);
                src.start(t); lfo.start(t);
                src.stop(t + dur + 0.1); lfo.stop(t + dur + 0.1);
            }
        };
    })();

    /* ----------------------------------------------------------------------
       9. AUDIODESCRIÇÃO (voz do navegador, pt-BR)
       ---------------------------------------------------------------------- */
    var AD = (function () {
        var synth = window.speechSynthesis;
        var chapters = [];
        var queue = [];
        var chapterIdx = 0;
        var playing = false, paused = false;
        var voice = null;
        var ui = {};

        function pickVoice() {
            if (!synth) return;
            var voices = synth.getVoices();
            voice = voices.filter(function (v) { return /^pt[-_]BR/i.test(v.lang); })
                         .sort(function (a, b) { return (b.localService ? 1 : 0) - (a.localService ? 1 : 0); })[0] ||
                    voices.filter(function (v) { return /^pt/i.test(v.lang); })[0] || null;
        }

        function sentences(text) {
            return text.replace(/\s+/g, ' ').match(/[^.!?:;]+[.!?:;]*/g) || [text];
        }

        function setStatus(t) { ui.status.textContent = t; }

        function render() {
            ui.list.textContent = '';
            chapters.forEach(function (c, i) {
                var li = document.createElement('li');
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'ad-chapter w-full text-left px-3 py-1.5 rounded-lg hover:bg-current/10';
                b.textContent = (i + 1) + '. ' + c.title;
                if (playing && i === chapterIdx) b.setAttribute('aria-current', 'true');
                b.addEventListener('click', function () { playFrom(i); });
                li.appendChild(b);
                ui.list.appendChild(li);
            });
            ui.playLabel.textContent = playing && !paused ? 'Pausar' : (paused ? 'Continuar' : 'Ouvir');
            ui.playIcon.setAttribute('d', playing && !paused ? 'M6 5h4v14H6zM14 5h4v14h-4z' : 'M8 5v14l11-7z');
        }

        function speakNext() {
            if (!playing) return;
            if (!queue.length) {
                chapterIdx++;
                if (chapterIdx >= chapters.length) { finish('Audiodescrição concluída.'); return; }
                queue = sentences(chapters[chapterIdx].text);
                render();
            }
            var u = new SpeechSynthesisUtterance(queue.shift());
            u.lang = 'pt-BR';
            if (voice) u.voice = voice;
            u.rate = Number(ui.rate.value) || 1;
            u.pitch = 1;
            u.onend = speakNext;
            u.onerror = function (e) { if (e.error !== 'interrupted' && e.error !== 'canceled') speakNext(); };
            synth.speak(u);
        }

        function playFrom(i) {
            synth.cancel();
            chapterIdx = i;
            queue = sentences(chapters[i].text);
            playing = true; paused = false;
            Sound.duck(true);
            setStatus('Narrando…');
            render();
            speakNext();
        }

        function finish(msg) {
            playing = false; paused = false; queue = [];
            synth.cancel();
            Sound.duck(false);
            setStatus(msg || '');
            render();
        }

        function init() {
            ui.list = $('#adChapters');
            ui.status = $('#adStatus');
            ui.rate = $('#adRate');
            ui.playLabel = $('#adPlayLabel');
            ui.playIcon = $('#adPlayIcon');

            chapters = $$('#adTranscript [data-chapter]').map(function (sec) {
                return {
                    title: sec.getAttribute('data-chapter'),
                    text: $$('p', sec).map(function (p) { return p.textContent; }).join(' ')
                };
            });

            var recorded = $('#adRecorded');
            if (CONFIG.audioDescricaoGravada) {
                recorded.src = CONFIG.audioDescricaoGravada;
                recorded.classList.remove('hidden');
                $('#adTtsControls').classList.add('hidden');
                recorded.addEventListener('play', function () { Sound.duck(true); });
                recorded.addEventListener('pause', function () { Sound.duck(false); });
                return;
            }

            if (!synth || !window.SpeechSynthesisUtterance) {
                $('#adTtsControls').classList.add('hidden');
                setStatus('Leitura em voz indisponível neste navegador — veja a transcrição abaixo.');
                return;
            }
            pickVoice();
            if (typeof synth.onvoiceschanged !== 'undefined') synth.onvoiceschanged = pickVoice;

            $('#adPlayBtn').addEventListener('click', function () {
                if (!playing) { playFrom(0); return; }
                if (paused) { synth.resume(); paused = false; Sound.duck(true); setStatus('Narrando…'); }
                else { synth.pause(); paused = true; Sound.duck(false); setStatus('Pausado'); }
                render();
            });
            $('#adStopBtn').addEventListener('click', function () { finish(''); });
            ui.rate.addEventListener('change', function () { if (playing && !paused) playFrom(chapterIdx); });
            window.addEventListener('pagehide', function () { synth.cancel(); });
            render();
        }

        return { init: init, start: function () { if (synth && !playing && !CONFIG.audioDescricaoGravada) playFrom(0); } };
    })();

    /* ----------------------------------------------------------------------
       10. PAINEL FLUTUANTE DE SOM
       ---------------------------------------------------------------------- */
    function initSoundPanel() {
        var panel = $('#soundPanel');
        var fab = $('#soundFab');
        var playBtn = $('#ambPlayBtn');
        var playLabel = $('#ambPlayLabel');
        var status = $('#ambStatus');
        var vol = $('#ambVolume');

        function setOpen(open, focusTarget) {
            panel.hidden = !open;
            fab.setAttribute('aria-expanded', String(open));
            if (open && focusTarget) focusTarget.focus();
        }
        fab.addEventListener('click', function () { setOpen(panel.hidden, $('#soundPanelClose')); });
        $('#soundPanelClose').addEventListener('click', function () { setOpen(false); fab.focus(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !panel.hidden) { setOpen(false); fab.focus(); }
        });

        $$('[data-action="open-sound"]').forEach(function (b) {
            b.addEventListener('click', function () {
                setOpen(true, playBtn);
                if (!Sound.isPlaying()) Sound.toggle();
            });
        });
        $$('[data-action="open-ad"]').forEach(function (b) {
            b.addEventListener('click', function () { setOpen(true, $('#adPlayBtn')); AD.start(); });
        });

        if (!Sound.supported()) {
            playBtn.disabled = true;
            status.textContent = 'Indisponível neste navegador';
        }

        vol.value = Math.round(Sound.volume() * 100);
        vol.addEventListener('input', function () { Sound.setVolume(Number(vol.value) / 100); });
        playBtn.addEventListener('click', function () { Sound.toggle(); });
        $$('#ambChips .chip').forEach(function (chip) {
            chip.addEventListener('click', function () { Sound.setKind(chip.getAttribute('data-amb')); });
        });

        var names = { chuva: 'Chuva na janela', ondas: 'Ondas ao longe', acordes: 'Acordes serenos' };
        function sync() {
            var on = Sound.isPlaying();
            playBtn.setAttribute('aria-pressed', String(on));
            playBtn.classList.toggle('is-playing', on);
            fab.classList.toggle('is-playing', on);
            playLabel.textContent = on ? 'Pausar' : 'Tocar';
            if (Sound.supported()) status.textContent = on ? 'Tocando: ' + names[Sound.kind()] : 'Desligado';
            $$('#ambChips .chip').forEach(function (c) {
                c.setAttribute('aria-pressed', String(c.getAttribute('data-amb') === Sound.kind()));
            });
        }
        Sound.onChange(sync);
        sync();
    }

    /* ----------------------------------------------------------------------
       11. SCROLL REVEAL + PARTÍCULAS
       ---------------------------------------------------------------------- */
    function initReveal() {
        var items = $$('.reveal-item');
        if (!('IntersectionObserver' in window)) { items.forEach(function (i) { i.classList.add('revealed'); }); return; }
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
            });
        }, { threshold: 0.12 });
        items.forEach(function (i) { obs.observe(i); });
    }

    function initParticles() {
        if (prefersReducedMotion) return;
        var canvas = $('#calmParticlesCanvas');
        var ctx = canvas.getContext && canvas.getContext('2d');
        if (!ctx) return;
        var particles = [];
        function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        window.addEventListener('resize', resize, { passive: true });
        resize();
        for (var i = 0; i < 28; i++) {
            particles.push({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                r: Math.random() * 2.2 + 0.8,
                vy: -(Math.random() * 0.25 + 0.08), vx: (Math.random() - 0.5) * 0.2,
                dark: i % 2 === 0
            });
        }
        (function frame() {
            if (!document.hidden) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(function (p) {
                    p.y += p.vy; p.x += p.vx;
                    if (p.y < -10) p.y = canvas.height + 10;
                    if (p.x < -10) p.x = canvas.width + 10;
                    if (p.x > canvas.width + 10) p.x = -10;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = p.dark ? 'rgba(113,113,122,0.35)' : 'rgba(212,212,216,0.35)';
                    ctx.fill();
                });
            }
            requestAnimationFrame(frame);
        })();
    }

    /* ----------------------------------------------------------------------
       INICIALIZAÇÃO
       ---------------------------------------------------------------------- */
    function safe(fn) { try { fn(); } catch (e) { if (window.console) console.error(e); } }

    document.addEventListener('DOMContentLoaded', function () {
        var year = $('#currentYear');
        if (year) year.textContent = String(new Date().getFullYear());
        [initTheme, initMobileMenu, initOfficeSlides, initHarmonyCard, initBreathing, initAgenda,
         initContactCard, initSoundPanel, AD.init, initReveal, initParticles].forEach(safe);
    });
})();
