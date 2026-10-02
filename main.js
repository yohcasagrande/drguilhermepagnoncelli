/* Dr. Guilherme Pagnoncelli · Odontologia em Blumenau */

const WHATSAPP = '5547984891404';
const zapLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
const msgZap = (assunto) => `Olá, Dr. Guilherme! Vim pelo site e quero saber mais sobre ${assunto}.`;
const raiz = document.documentElement;
const M = window.Motion;
const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
const anima = Boolean(M && M.animate && M.inView && !reduzir);
raiz.classList.add(anima ? 'motion-ok' : 'sem-motion');
const EASE = [0.2, 0.7, 0.2, 1];

/* ---------- Topo e menu ---------- */
const topo = document.querySelector('[data-topo]');
const menu = document.getElementById('menu');
const menuBotao = document.querySelector('[data-menu-botao]');

const marcarRolagem = () => topo.classList.toggle('rolou', window.scrollY > 8);
marcarRolagem();
window.addEventListener('scroll', marcarRolagem, { passive: true });

const fecharMenu = () => {
  menu.classList.remove('aberto');
  menuBotao.setAttribute('aria-expanded', 'false');
};
menuBotao.addEventListener('click', () => {
  const abrir = !menu.classList.contains('aberto');
  menu.classList.toggle('aberto', abrir);
  menuBotao.setAttribute('aria-expanded', String(abrir));
});
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', fecharMenu));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharMenu(); });
document.addEventListener('click', (e) => {
  if (menu.classList.contains('aberto') && !menu.contains(e.target) && !menuBotao.contains(e.target)) fecharMenu();
});

/* ---------- Links de WhatsApp ---------- */
document.querySelectorAll('[data-zap]').forEach((a) => {
  a.href = zapLink(msgZap(a.dataset.zap));
  a.target = '_blank';
  a.rel = 'noopener';
});

/* ---------- Barra de leitura ---------- */
const barraLeitura = document.querySelector('[data-progresso]');
if (barraLeitura) {
  if (anima && M.scroll) {
    M.scroll((p) => { barraLeitura.style.transform = `scaleX(${p})`; });
  } else {
    const ler = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      barraLeitura.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    };
    ler();
    window.addEventListener('scroll', ler, { passive: true });
  }
}

/* ---------- Qual é o seu caso ---------- */
const CASOS = {
  implante: {
    titulo: 'Implantes dentários',
    texto: 'Para repor um ou mais dentes com firmeza, sem depender de prótese móvel. O implante faz o papel da raiz e recebe uma coroa em porcelana por cima.',
    lista: ['Avaliação com exame de imagem, como a tomografia', 'Planejamento digital antes de começar', 'Provisório para você não ficar sem dente, quando o caso permite'],
    cta: 'Perguntar sobre implantes',
    zap: 'implantes dentários',
  },
  protocolo: {
    titulo: 'Dentes fixos sobre implantes',
    texto: 'Para quem usa dentadura ou perdeu os dentes de uma arcada e quer voltar a comer de tudo, com dentes fixos sobre implantes, o chamado protocolo.',
    lista: ['Tomografia para ver o osso disponível', 'Planejamento digital do sorriso e da mordida', 'As reabilitações completas que ele mostra no Instagram levaram de 7 a 10 meses'],
    cta: 'Perguntar sobre dentes fixos',
    zap: 'dentes fixos (protocolo)',
  },
  lentes: {
    titulo: 'Lentes de porcelana',
    texto: 'Lentes de contato dental para mudar cor, formato e tamanho dos dentes, com acabamento natural.',
    lista: ['Formato planejado antes de começar', 'Preparo definido caso a caso, sempre buscando preservar o dente', 'Porcelana com acabamento pensado para parecer natural'],
    cta: 'Perguntar sobre lentes',
    zap: 'lentes de porcelana',
  },
  coroa: {
    titulo: 'Coroas e reconstruções',
    texto: 'Quando dá para preservar o dente, a gente preserva: pinos, coroas em porcelana e reconstruções.',
    lista: ['Avaliação do que ainda dá para salvar', 'Coroa em porcelana ou reconstrução, conforme o caso', 'Pode entrar junto com lentes e implantes no mesmo plano'],
    cta: 'Perguntar sobre coroas',
    zap: 'coroas e reconstruções',
  },
  clareamento: {
    titulo: 'Clareamento dental',
    texto: 'Para deixar os dentes naturais mais claros, sozinho ou junto de outros tratamentos.',
    lista: ['Avaliação antes, para ver se o clareamento é indicado', 'Pode ser feito sozinho ou antes de lentes e coroas', 'Orientação para manter os dentes claros por mais tempo'],
    cta: 'Perguntar sobre clareamento',
    zap: 'clareamento dental',
  },
};

const guia = document.querySelector('[data-guia]');
if (guia) {
  const abas = [...guia.querySelectorAll('[data-caso]')];
  const painel = guia.querySelector('[role="tabpanel"]');
  const conteudo = guia.querySelector('[data-guia-conteudo]');
  const campo = (k) => guia.querySelector(`[data-g="${k}"]`);
  const botaoZap = guia.querySelector('[data-guia-zap]');
  const check = '<svg aria-hidden="true"><use href="#i-check"/></svg>';
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const mostrar = (aba, focar = false) => {
    const c = CASOS[aba.dataset.caso];
    abas.forEach((a) => {
      const ativa = a === aba;
      a.setAttribute('aria-selected', String(ativa));
      a.tabIndex = ativa ? 0 : -1;
    });
    painel.setAttribute('aria-labelledby', aba.id);
    campo('titulo').textContent = c.titulo;
    campo('texto').textContent = c.texto;
    campo('lista').innerHTML = c.lista.map((t) => `<li>${check}${esc(t)}</li>`).join('');
    campo('cta').textContent = c.cta;
    botaoZap.href = zapLink(msgZap(c.zap));
    botaoZap.target = '_blank';
    botaoZap.rel = 'noopener';
    if (focar) aba.focus();
    if (anima) M.animate(conteudo, { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] }, { duration: 0.45, ease: EASE });
    if (aba.scrollIntoView && guia.querySelector('.guia__opcoes').scrollWidth > guia.clientWidth) {
      aba.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  abas.forEach((aba, i) => {
    aba.addEventListener('click', () => mostrar(aba));
    aba.addEventListener('keydown', (e) => {
      const passo = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (passo) { e.preventDefault(); mostrar(abas[(i + passo + abas.length) % abas.length], true); }
      if (e.key === 'Home') { e.preventDefault(); mostrar(abas[0], true); }
      if (e.key === 'End') { e.preventDefault(); mostrar(abas[abas.length - 1], true); }
    });
  });
  botaoZap.href = zapLink(msgZap(CASOS.implante.zap));
  botaoZap.target = '_blank';
  botaoZap.rel = 'noopener';
}

/* ---------- Antes e depois ---------- */
const comparadores = [...document.querySelectorAll('[data-comparar]')];
comparadores.forEach((caixa) => {
  const controle = caixa.querySelector('input[type="range"]');
  const mover = () => caixa.style.setProperty('--pos', `${controle.value}%`);
  controle.addEventListener('input', () => { caixa.dataset.mexeu = '1'; mover(); });
  caixa.addEventListener('pointerdown', () => { caixa.dataset.mexeu = '1'; });
  mover();
});

/* Mostra que dá para arrastar: a linha passeia uma vez quando o primeiro caso aparece */
if (anima && comparadores.length) {
  const caixa = comparadores[0];
  const controle = caixa.querySelector('input[type="range"]');
  const ir = (de, para, duracao) => M.animate(de, para, {
    duration: duracao, ease: EASE,
    onUpdate: (v) => {
      if (caixa.dataset.mexeu) return;
      caixa.style.setProperty('--pos', `${v}%`);
      controle.value = Math.round(v);
    },
  }).finished;
  M.inView(caixa, () => {
    setTimeout(async () => {
      if (caixa.dataset.mexeu) return;
      await ir(50, 24, 0.7);
      if (caixa.dataset.mexeu) return;
      await ir(24, 76, 1);
      if (caixa.dataset.mexeu) return;
      await ir(76, 50, 0.7);
    }, 450);
  }, { amount: 0.6 });
}

/* ---------- Animações ---------- */
if (anima) {
  // Entrada do início
  M.animate('[data-entra]', { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0px)'] }, { duration: 0.9, ease: EASE, delay: M.stagger(0.09, { startDelay: 0.05 }) });
  const foto = document.querySelector('[data-foto]');
  if (foto) M.animate(foto, { opacity: [0, 1], transform: ['scale(1.05)', 'scale(1)'] }, { duration: 1.2, ease: EASE });
  document.querySelectorAll('.heroi__visual [data-flutua]').forEach((el, i) => {
    M.animate(el, { opacity: [0, 1], transform: ['translateY(28px)', 'translateY(0px)'] }, { duration: 0.9, ease: EASE, delay: 0.5 + i * 0.18 });
  });

  // Revela ao rolar, só o que ainda está fora da tela
  const foraDaTela = (el) => el.getBoundingClientRect().top > innerHeight * 0.9;
  const pendentes = new Set();
  const preparar = (el) => { el.style.opacity = '0'; el.style.transform = 'translateY(28px)'; pendentes.add(el); };
  const revelar = (el, atraso = 0) => {
    if (!pendentes.delete(el)) return;
    M.animate(el, { opacity: 1, transform: 'translateY(0px)' }, { duration: 0.85, ease: EASE, delay: atraso })
      .finished.then(() => { el.style.transform = ''; el.style.opacity = '1'; });
  };
  // Rede de segurança: se a pessoa pular direto para uma âncora, nada fica escondido acima da tela.
  let conferindo = false;
  window.addEventListener('scroll', () => {
    if (conferindo || !pendentes.size) return;
    conferindo = true;
    requestAnimationFrame(() => {
      pendentes.forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) revelar(el); });
      conferindo = false;
    });
  }, { passive: true });

  document.querySelectorAll('[data-revela]').forEach((el) => {
    if (!foraDaTela(el)) return;
    preparar(el);
    M.inView(el, () => revelar(el), { margin: '0px 0px -8% 0px' });
  });
  document.querySelectorAll('[data-revela-grupo]').forEach((grupo) => {
    const filhos = [...grupo.children];
    if (!foraDaTela(grupo)) return;
    filhos.forEach(preparar);
    M.inView(grupo, () => filhos.forEach((el, i) => revelar(el, i * 0.08)), { margin: '0px 0px -8% 0px' });
  });

  // Números contando
  document.querySelectorAll('[data-conta]').forEach((el) => {
    const alvo = Number(el.dataset.conta);
    const casas = Number(el.dataset.casas || 0);
    const prefixo = el.dataset.prefixo || '';
    const formatar = (v) => prefixo + (casas ? v.toFixed(casas).replace('.', ',') : Math.round(v).toLocaleString('pt-BR'));
    M.inView(el, () => {
      M.animate(0, alvo, { duration: 1.6, ease: EASE, onUpdate: (v) => { el.textContent = formatar(v); } });
    }, { amount: 0.8 });
  });
}

/* Linha do tempo enche conforme rola */
const linhaTempo = document.querySelector('[data-linha-tempo]');
if (linhaTempo) {
  if (anima && M.scroll) {
    M.scroll((p) => linhaTempo.style.setProperty('--p', p.toFixed(3)), { target: linhaTempo, offset: ['start 85%', 'end 60%'] });
  } else {
    linhaTempo.style.setProperty('--p', 1);
  }
}

/* ---------- Ano no rodapé ---------- */
document.querySelectorAll('[data-ano]').forEach((el) => { el.textContent = new Date().getFullYear(); });

/* ---------- Horário de atendimento ---------- */
// Dias: 0 domingo ... 6 sábado. Horário de Brasília (Blumenau, SC).
const HORARIO = {
  0: [],
  1: [['08:00', '12:00'], ['13:30', '19:00']],
  2: [['08:00', '12:00'], ['13:30', '19:00']],
  3: [['08:00', '12:00'], ['13:30', '19:00']],
  4: [['08:00', '12:00'], ['13:30', '19:00']],
  5: [['08:00', '12:00'], ['13:30', '18:30']],
  6: [],
};
const NOMES_DIA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const minutos = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const hora = (hhmm) => { const [h, m] = hhmm.split(':'); return `${Number(h)}h${m === '00' ? '' : m}`; };

function agoraEmBlumenau() {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const p = Object.fromEntries(partes.map((x) => [x.type, x.value]));
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  return { dia, min: Number(p.hour) * 60 + Number(p.minute) };
}

function statusHorario() {
  const el = document.querySelector('[data-status]');
  if (!el) return;
  const { dia, min } = agoraEmBlumenau();
  document.querySelectorAll('[data-horario] tr').forEach((tr) => {
    tr.classList.toggle('hoje', tr.dataset.dias.split(' ').map(Number).includes(dia));
  });

  let texto;
  const aberto = HORARIO[dia].find(([a, f]) => min >= minutos(a) && min < minutos(f));
  if (aberto) {
    texto = `Aberto agora · até as ${hora(aberto[1])}`;
  } else {
    let prox = null;
    for (let d = 0; d < 8 && !prox; d++) {
      const diaX = (dia + d) % 7;
      const faixa = HORARIO[diaX].find(([a]) => d > 0 || minutos(a) > min);
      if (faixa) prox = { d, diaX, abre: faixa[0] };
    }
    const quando = prox.d === 0 ? 'hoje' : prox.d === 1 ? 'amanhã' : NOMES_DIA[prox.diaX];
    texto = `Fechado agora · abre ${quando} às ${hora(prox.abre)}`;
  }
  el.classList.toggle('aberto', Boolean(aberto));
  el.innerHTML = `<span class="ponto" aria-hidden="true"></span><span>${texto}</span>`;
}
statusHorario();
setInterval(statusHorario, 60000);

/* ---------- WhatsApp flutuante e barra fixa do celular ---------- */
// Somem no início, no Mapa (para não cobrir os botões dele) e no contato.
const zapFlutuante = document.querySelector('.zap');
const barraFixa = document.querySelector('[data-barra-fixa]');
const areasSemAtalho = [document.querySelector('.heroi'), document.querySelector('[data-mapa]'), document.getElementById('contato'), document.querySelector('.rodape')].filter(Boolean);
if ('IntersectionObserver' in window) {
  const visiveis = new Set();
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => { if (en.isIntersecting) visiveis.add(en.target); else visiveis.delete(en.target); });
    const esconder = visiveis.size > 0;
    if (zapFlutuante) zapFlutuante.classList.toggle('oculto', esconder);
    if (barraFixa) barraFixa.classList.toggle('visivel', !esconder);
  }, { threshold: 0.12 });
  areasSemAtalho.forEach((el) => io.observe(el));
} else if (barraFixa) {
  barraFixa.classList.add('visivel');
}

/* ---------- Dúvidas: uma aberta por vez ---------- */
const duvidas = document.querySelectorAll('.duvida');
duvidas.forEach((d) => d.addEventListener('toggle', () => {
  if (d.open) {
    duvidas.forEach((outra) => { if (outra !== d) outra.open = false; });
    const p = d.querySelector('p');
    if (anima && p) M.animate(p, { opacity: [0, 1], transform: ['translateY(-6px)', 'translateY(0px)'] }, { duration: 0.35, ease: EASE });
  }
}));
