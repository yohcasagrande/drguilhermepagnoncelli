/* Dr. Guilherme Pagnoncelli · Odontologia em Blumenau */

const WHATSAPP = '5547984891404';
const zapLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

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
  a.href = zapLink(`Olá, Dr. Guilherme! Vim pelo site e quero saber mais sobre ${a.dataset.zap}.`);
  a.target = '_blank';
  a.rel = 'noopener';
});

/* ---------- Revelar ao rolar ---------- */
const revelar = document.querySelectorAll('.revelar');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('visivel'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revelar.forEach((el) => io.observe(el));
} else {
  revelar.forEach((el) => el.classList.add('visivel'));
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

/* ---------- Antes e depois ---------- */
document.querySelectorAll('[data-comparar]').forEach((caixa) => {
  const controle = caixa.querySelector('input[type="range"]');
  const mover = () => caixa.style.setProperty('--pos', `${controle.value}%`);
  controle.addEventListener('input', mover);
  mover();
});

/* ---------- WhatsApp flutuante some perto do Mapa e do contato ---------- */
const zapFlutuante = document.querySelector('.zap');
const areasSemZap = [document.querySelector('[data-mapa]'), document.getElementById('contato'), document.querySelector('.heroi')].filter(Boolean);
if (zapFlutuante && 'IntersectionObserver' in window) {
  const visiveis = new Set();
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => { if (en.isIntersecting) visiveis.add(en.target); else visiveis.delete(en.target); });
    zapFlutuante.classList.toggle('oculto', visiveis.size > 0);
  }, { threshold: 0.12 });
  areasSemZap.forEach((el) => io.observe(el));
}

/* ---------- Dúvidas: uma aberta por vez ---------- */
const duvidas = document.querySelectorAll('.duvida');
duvidas.forEach((d) => d.addEventListener('toggle', () => {
  if (d.open) duvidas.forEach((outra) => { if (outra !== d) outra.open = false; });
}));
