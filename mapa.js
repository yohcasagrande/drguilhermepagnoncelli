/* Mapa do Sorriso · Dr. Guilherme Pagnoncelli
   A pessoa marca no desenho os dentes que incomodam, conta o que quer e envia o resumo
   pronto para o WhatsApp do consultório (WHATSAPP e zapLink vêm do main.js).
   Nada fica salvo no site. Os dentes seguem a numeração dos dentistas (11 a 48) e o desenho
   fica como no espelho: o lado direito da pessoa aparece à direita da tela. */

/* ---------- O que dá para marcar ---------- */
const CONDICOES = {
  falta: { nome: 'Falta o dente', cor: '#9db0c3' },
  quebrado: { nome: 'Quebrado ou gasto', cor: '#f0874a' },
  cor: { nome: 'Cor ou mancha', cor: '#e2b65a' },
  forma: { nome: 'Torto, espaço ou formato', cor: '#5e9cf2' },
  dor: { nome: 'Dor ou sensibilidade', cor: '#ef5468' },
  protese: { nome: 'Prótese ou coroa antiga', cor: '#a08ae6' },
};
const ORDEM = Object.keys(CONDICOES);

const GRADIENTES = {
  esmalte: [[0, '#e6dccb'], [0.38, '#fbf9f4'], [1, '#edf1f4']],
  mancha: [[0, '#d6ad5f'], [0.5, '#ebd08f'], [1, '#f5e7c2']],
  dor: [[0, '#f1b0ba'], [0.5, '#fbdfe4'], [1, '#fdf0f2']],
  protese: [[0, '#b6a7e6'], [0.5, '#dcd4f6'], [1, '#ece8fb']],
  gengiva: [[0, '#c9868f', 0], [0.4, '#cc8b94', 0.82], [1, '#dba0a7', 1]],
};
const ESTILO = {
  normal: { grad: 'esmalte', traco: '#c7d0d9', espessura: 1.2 },
  falta: { fundo: 'rgba(255,255,255,0.05)', traco: '#9db0c3', espessura: 2, tracejado: [5, 4] },
  quebrado: { grad: 'esmalte', traco: '#f0874a', espessura: 3 },
  cor: { grad: 'mancha', traco: '#d4a24a', espessura: 3 },
  forma: { grad: 'esmalte', traco: '#5e9cf2', espessura: 3, giro: 6 },
  dor: { grad: 'dor', traco: '#ef5468', espessura: 3 },
  protese: { grad: 'protese', traco: '#a08ae6', espessura: 3 },
};

/* ---------- Nomes ---------- */
const POSICOES = ['Incisivo central', 'Incisivo lateral', 'Canino', '1º pré-molar', '2º pré-molar', '1º molar', '2º molar', 'Siso'];
const QUADRANTE = { 1: ['de cima', 'direito'], 2: ['de cima', 'esquerdo'], 3: ['de baixo', 'esquerdo'], 4: ['de baixo', 'direito'] };
const nomeDente = (id) => {
  const [arcada, lado] = QUADRANTE[Math.floor(id / 10)];
  return `${POSICOES[(id % 10) - 1]} ${arcada}, lado ${lado}`;
};
const rotuloDente = (id, cond) => `${id}, ${nomeDente(id)}${cond ? `: ${CONDICOES[cond].nome}` : ''}`;

/* ---------- Geometria do desenho ---------- */
const VIEWBOX = [0, 58, 1000, 404];
const GEO = {
  cx: 500, meia: 452, curva: 30, folga: 4,
  sup: { borda: 262, larg: [80, 62, 58, 50, 46, 48, 42, 34], alt: [136, 118, 130, 110, 102, 94, 86, 76] },
  inf: { borda: 290, larg: [52, 54, 56, 52, 48, 50, 44, 36], alt: [104, 108, 120, 106, 100, 92, 84, 74] },
};
const TIPOS = ['inc', 'inc', 'can', 'pre', 'pre', 'mol', 'mol', 'mol'];
const f = (n) => Math.round(n * 10) / 10;

const DENTES = [];
['sup', 'inf'].forEach((arc) => {
  const g = GEO[arc];
  [1, -1].forEach((lado) => {
    let acumulado = GEO.folga / 2;
    g.larg.forEach((w, i) => {
      const x = GEO.cx + lado * (acumulado + w / 2);
      acumulado += w + GEO.folga;
      const dx = x - GEO.cx;
      const y = g.borda - GEO.curva * (dx / GEO.meia) ** 2;
      const ang = (Math.atan((-2 * GEO.curva * dx) / GEO.meia ** 2) * 180) / Math.PI;
      const quadrante = arc === 'sup' ? (lado === 1 ? 1 : 2) : (lado === 1 ? 4 : 3);
      DENTES.push({ id: quadrante * 10 + i + 1, arc, x, y, ang, w, h: g.alt[i], tipo: TIPOS[i] });
    });
  });
});
const DENTE = Object.fromEntries(DENTES.map((d) => [d.id, d]));
const FILA = {
  sup: DENTES.filter((d) => d.arc === 'sup').sort((a, b) => a.x - b.x).map((d) => d.id),
  inf: DENTES.filter((d) => d.arc === 'inf').sort((a, b) => a.x - b.x).map((d) => d.id),
};

// Contorno de um dente visto de frente: borda de corte em y = 0, colo do dente em y = -h.
function formaDente(tipo, w, h) {
  const a = w / 2;
  const n = a * (tipo === 'mol' ? 0.8 : 0.7);
  const r = Math.min(a * 0.32, 9);
  const colo = `Q0,${f(-h - 6)} ${f(-n)},${f(-h)} Z`;
  const esq = (y1, y2) => `M${f(-n)},${f(-h)} C${f(-a * 0.99)},${f(-h * y1)} ${f(-a * 1.02)},${f(-h * y2)}`;
  const dir = (y1, y2) => `C${f(a * 1.02)},${f(-h * y2)} ${f(a * 0.99)},${f(-h * y1)} ${f(n)},${f(-h)}`;
  if (tipo === 'inc') {
    return `M${f(-n)},${f(-h)} C${f(-a * 0.98)},${f(-h * 0.78)} ${f(-a)},${f(-h * 0.42)} ${f(-a)},${f(-r * 1.6)} Q${f(-a)},0 ${f(-a + r)},0 L${f(a - r)},0 Q${f(a)},0 ${f(a)},${f(-r * 1.6)} C${f(a)},${f(-h * 0.42)} ${f(a * 0.98)},${f(-h * 0.78)} ${f(n)},${f(-h)} ${colo}`;
  }
  if (tipo === 'can') {
    return `${esq(0.74, 0.38)} ${f(-a * 0.86)},${f(-h * 0.17)} C${f(-a * 0.6)},${f(-h * 0.06)} ${f(-a * 0.22)},-1 0,4 C${f(a * 0.22)},-1 ${f(a * 0.6)},${f(-h * 0.06)} ${f(a * 0.86)},${f(-h * 0.17)} ${dir(0.74, 0.38)} ${colo}`;
  }
  if (tipo === 'pre') {
    return `${esq(0.74, 0.36)} ${f(-a * 0.92)},${f(-h * 0.13)} C${f(-a * 0.72)},${f(-h * 0.02)} ${f(-a * 0.3)},2 0,2 C${f(a * 0.3)},2 ${f(a * 0.72)},${f(-h * 0.02)} ${f(a * 0.92)},${f(-h * 0.13)} ${dir(0.74, 0.36)} ${colo}`;
  }
  return `${esq(0.72, 0.34)} ${f(-a * 0.95)},${f(-h * 0.1)} C${f(-a * 0.86)},0 ${f(-a * 0.62)},2 ${f(-a * 0.4)},1 C${f(-a * 0.2)},0 ${f(-a * 0.08)},-4 0,-4 C${f(a * 0.08)},-4 ${f(a * 0.2)},0 ${f(a * 0.4)},1 C${f(a * 0.62)},2 ${f(a * 0.86)},0 ${f(a * 0.95)},${f(-h * 0.1)} ${dir(0.72, 0.34)} ${colo}`;
}

// Detalhes desenhados por cima do dente, iguais no SVG e na imagem baixada.
function detalhes(d, cond) {
  const a = d.w / 2;
  const h = d.h;
  const lista = cond === 'falta' ? [] : [{ elipse: [-a * 0.32, -h * 0.56, a * 0.13, h * 0.2], fundo: 'rgba(255,255,255,0.55)' }];
  if (cond === 'quebrado') {
    lista.push({ d: `M${f(-a * 0.1)},${f(-h * 0.66)} L${f(a * 0.2)},${f(-h * 0.48)} L${f(-a * 0.12)},${f(-h * 0.32)} L${f(a * 0.24)},${f(-h * 0.13)}`, traco: '#e0682a', espessura: 2.6 });
  } else if (cond === 'cor') {
    lista.push({ circulo: [a * 0.24, -h * 0.4, Math.max(2.5, a * 0.14)], fundo: 'rgba(150,104,40,0.42)' });
    lista.push({ circulo: [-a * 0.2, -h * 0.66, Math.max(2, a * 0.1)], fundo: 'rgba(150,104,40,0.32)' });
  } else if (cond === 'protese') {
    lista.push({ d: `M${f(-a * 0.8)},${f(-h * 0.74)} Q0,${f(-h * 0.83)} ${f(a * 0.8)},${f(-h * 0.74)}`, traco: '#8b6fd6', espessura: 2.2 });
  } else if (cond === 'dor') {
    const r = Math.min(a * 0.32, 8);
    lista.push({ circulo: [0, -h * 0.46, r], fundo: '#ef5468', pulso: true });
    lista.push({ circulo: [0, -h * 0.46, r], fundo: '#ef5468' });
  }
  return lista;
}

function giro(d, cond) {
  const e = ESTILO[cond || 'normal'];
  return e.giro ? (d.id % 2 ? e.giro : -e.giro) : 0;
}

// Leva um ponto do desenho do dente para o desenho inteiro.
function pontoGlobal(d, lx, ly) {
  const yy = d.arc === 'inf' ? -ly : ly;
  const r = (d.ang * Math.PI) / 180;
  return [d.x + lx * Math.cos(r) - yy * Math.sin(r), d.y + lx * Math.sin(r) + yy * Math.cos(r)];
}

function curvaSuave(pontos) {
  let s = '';
  for (let i = 0; i < pontos.length - 1; i++) {
    const p0 = pontos[i - 1] || pontos[i];
    const p1 = pontos[i];
    const p2 = pontos[i + 1];
    const p3 = pontos[i + 2] || p2;
    s += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return s;
}

// Gengiva com o contorno ondulado sobre o colo dos dentes.
const GENGIVA = {};
['sup', 'inf'].forEach((arc) => {
  const ds = FILA[arc].map((id) => DENTE[id]);
  const zenite = ds.map((d) => pontoGlobal(d, 0, -d.h * 0.9));
  const nos = [pontoGlobal(ds[0], -ds[0].w / 2 - 6, -ds[0].h * 0.6)];
  for (let i = 0; i < ds.length - 1; i++) {
    const p = pontoGlobal(ds[i], ds[i].w / 2, -ds[i].h * 0.7);
    const q = pontoGlobal(ds[i + 1], -ds[i + 1].w / 2, -ds[i + 1].h * 0.7);
    nos.push([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]);
  }
  const ultimo = ds[ds.length - 1];
  nos.push(pontoGlobal(ultimo, ultimo.w / 2 + 6, -ultimo.h * 0.6));

  let caminho = `M${f(nos[0][0])},${f(nos[0][1])}`;
  ds.forEach((_, i) => {
    const [x0, y0] = nos[i];
    const [x1, y1] = nos[i + 1];
    const [zx, zy] = zenite[i];
    caminho += ` Q${f(2 * zx - (x0 + x1) / 2)},${f(2 * zy - (y0 + y1) / 2)} ${f(x1)},${f(y1)}`;
  });
  const fora = [
    pontoGlobal(ultimo, ultimo.w / 2 + 10, -ultimo.h - 26),
    ...ds.slice().reverse().map((d) => pontoGlobal(d, 0, -d.h - 40)),
    pontoGlobal(ds[0], -ds[0].w / 2 - 10, -ds[0].h - 26),
  ];
  caminho += ` L${f(fora[0][0])},${f(fora[0][1])}${curvaSuave(fora)} Z`;
  const ys = [...nos, ...fora, ...zenite].map((p) => p[1]);
  GENGIVA[arc] = { d: caminho, y0: Math.min(...ys), y1: Math.max(...ys) };
});

/* ---------- Desenho em SVG ---------- */
const paradas = (lista) => lista.map(([o, c, op = 1]) => `<stop offset="${o}" stop-color="${c}"${op < 1 ? ` stop-opacity="${op}"` : ''}/>`).join('');

function primitivaSVG(p) {
  if (p.elipse) return `<ellipse cx="${f(p.elipse[0])}" cy="${f(p.elipse[1])}" rx="${f(p.elipse[2])}" ry="${f(p.elipse[3])}" fill="${p.fundo}" stroke="none"/>`;
  if (p.circulo) return `<circle${p.pulso ? ' class="dente__pulso"' : ''} cx="${f(p.circulo[0])}" cy="${f(p.circulo[1])}" r="${f(p.circulo[2])}" fill="${p.fundo}" stroke="none"/>`;
  return `<path d="${p.d}" fill="none" stroke="${p.traco}" stroke-width="${p.espessura}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function denteSVG(d, cond, prefixo, interativo) {
  const e = ESTILO[cond || 'normal'];
  const transforma = `translate(${f(d.x)} ${f(d.y)}) rotate(${f(d.ang + giro(d, cond))})${d.arc === 'inf' ? ' scale(1 -1)' : ''}`;
  const fundo = e.grad ? `url(#${prefixo}-${e.grad})` : e.fundo;
  const tracejado = e.tracejado ? ` stroke-dasharray="${e.tracejado.join(' ')}"` : '';
  const alvo = interativo
    ? `<rect class="dente__alvo" x="${f(-d.w / 2 - GEO.folga / 2)}" y="${f(-d.h - 34)}" width="${f(d.w + GEO.folga)}" height="${f(d.h + 48)}" rx="8" fill="transparent" stroke="none"/>`
    : '';
  const atributos = interativo
    ? ` role="button" tabindex="-1" aria-pressed="${cond ? 'true' : 'false'}" aria-label="${rotuloDente(d.id, cond)}"`
    : '';
  return `<g class="dente${cond ? ` dente--${cond}` : ''}" data-id="${d.id}" transform="${transforma}"${atributos}>${alvo}<path class="dente__coroa" d="${formaDente(d.tipo, d.w, d.h)}" fill="${fundo}" stroke="${e.traco}" stroke-width="${e.espessura}"${tracejado} stroke-linejoin="round"/>${detalhes(d, cond).map(primitivaSVG).join('')}</g>`;
}

function svgSorriso({ prefixo, marcas = new Map(), interativo = false, rotulo = '' }) {
  const grad = Object.entries(GRADIENTES)
    .filter(([k]) => k !== 'gengiva')
    .map(([k, v]) => `<linearGradient id="${prefixo}-${k}" x1="0" y1="0" x2="0" y2="1">${paradas(v)}</linearGradient>`)
    .join('');
  const gengivas = `<linearGradient id="${prefixo}-gengiva-sup" x1="0" y1="0" x2="0" y2="1">${paradas(GRADIENTES.gengiva)}</linearGradient><linearGradient id="${prefixo}-gengiva-inf" x1="0" y1="1" x2="0" y2="0">${paradas(GRADIENTES.gengiva)}</linearGradient>`;
  const dentes = [...FILA.sup, ...FILA.inf].map((id) => denteSVG(DENTE[id], marcas.get(id), prefixo, interativo)).join('');
  const papel = interativo ? 'role="group"' : 'role="img"';
  return `<svg class="sorriso" xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX.join(' ')}" width="${VIEWBOX[2]}" height="${VIEWBOX[3]}" ${papel} aria-label="${rotulo || 'Desenho do sorriso com os dentes de cima e de baixo'}" focusable="false"><defs>${grad}${gengivas}</defs><g class="sorriso__dentes">${dentes}</g><path d="${GENGIVA.sup.d}" fill="url(#${prefixo}-gengiva-sup)" stroke="none" pointer-events="none"/><path d="${GENGIVA.inf.d}" fill="url(#${prefixo}-gengiva-inf)" stroke="none" pointer-events="none"/></svg>`;
}

function iconeCondicao(cond) {
  const e = ESTILO[cond];
  const fundos = { falta: 'none', quebrado: '#fbf9f4', cor: '#e6c983', forma: '#fbf9f4', dor: '#fbdde2', protese: '#ddd5f7' };
  const d = { w: 20, h: 26 };
  const extra = detalhes({ ...d, id: 1 }, cond).filter((p) => !p.elipse && !p.pulso).map(primitivaSVG).join('');
  return `<svg viewBox="-13 -29 26 33" aria-hidden="true"><g${cond === 'forma' ? ' transform="rotate(12 0 -13)"' : ''}><path d="${formaDente('inc', d.w, d.h)}" fill="${fundos[cond]}" stroke="${e.traco}" stroke-width="2"${e.tracejado ? ' stroke-dasharray="3 2.5"' : ''} stroke-linejoin="round"/>${extra}</g></svg>`;
}

/* ---------- Desenho na imagem (canvas) ---------- */
function gradienteCanvas(ctx, nome, y0, y1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  GRADIENTES[nome].forEach(([o, c, op = 1]) => {
    if (op >= 1) { g.addColorStop(o, c); return; }
    const n = parseInt(c.slice(1), 16);
    g.addColorStop(o, `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${op})`);
  });
  return g;
}

function desenharSorrisoCanvas(ctx, marcas, ox, oy, largura) {
  const escala = largura / VIEWBOX[2];
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(escala, escala);
  ctx.translate(-VIEWBOX[0], -VIEWBOX[1]);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  [...FILA.sup, ...FILA.inf].forEach((id) => {
    const d = DENTE[id];
    const cond = marcas.get(id);
    const e = ESTILO[cond || 'normal'];
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(((d.ang + giro(d, cond)) * Math.PI) / 180);
    if (d.arc === 'inf') ctx.scale(1, -1);
    const contorno = new Path2D(formaDente(d.tipo, d.w, d.h));
    ctx.fillStyle = e.grad ? gradienteCanvas(ctx, e.grad, -d.h, 0) : e.fundo;
    ctx.fill(contorno);
    ctx.setLineDash(e.tracejado || []);
    ctx.lineWidth = e.espessura;
    ctx.strokeStyle = e.traco;
    ctx.stroke(contorno);
    ctx.setLineDash([]);
    detalhes(d, cond).filter((p) => !p.pulso).forEach((p) => {
      if (p.elipse || p.circulo) {
        ctx.beginPath();
        if (p.elipse) ctx.ellipse(p.elipse[0], p.elipse[1], p.elipse[2], p.elipse[3], 0, 0, Math.PI * 2);
        else ctx.arc(p.circulo[0], p.circulo[1], p.circulo[2], 0, Math.PI * 2);
        ctx.fillStyle = p.fundo;
        ctx.fill();
      } else {
        ctx.lineWidth = p.espessura;
        ctx.strokeStyle = p.traco;
        ctx.stroke(new Path2D(p.d));
      }
    });
    ctx.restore();
  });
  ['sup', 'inf'].forEach((arc) => {
    const { d, y0, y1 } = GENGIVA[arc];
    ctx.fillStyle = arc === 'sup' ? gradienteCanvas(ctx, 'gengiva', y0, y1) : gradienteCanvas(ctx, 'gengiva', y1, y0);
    ctx.fill(new Path2D(d));
  });
  ctx.restore();
}

/* ---------- Prévia animada no início ---------- */
const previa = document.querySelector('[data-previa]');
if (previa) {
  const legenda = document.querySelector('[data-previa-legenda]');
  const SEQUENCIA = [[21, 'cor'], [11, 'cor'], [12, 'quebrado'], [36, 'falta'], [46, 'falta'], [24, 'dor'], [16, 'protese'], [22, 'forma']];
  const marcas = new Map();
  const desenhar = () => { previa.innerHTML = svgSorriso({ prefixo: 'previa', marcas }); };
  const legendar = (id, cond) => {
    legenda.innerHTML = cond
      ? `<i style="background:${CONDICOES[cond].cor}"></i>${CONDICOES[cond].nome} · ${nomeDente(id).toLowerCase()}`
      : 'Toque nos dentes que incomodam';
  };

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    SEQUENCIA.forEach(([id, c]) => marcas.set(id, c));
    desenhar();
  } else {
    let i = 0;
    let relogio = null;
    const passo = () => {
      if (i < SEQUENCIA.length) {
        const [id, c] = SEQUENCIA[i++];
        marcas.set(id, c);
        desenhar();
        legendar(id, c);
        relogio = setTimeout(passo, 1300);
      } else {
        relogio = setTimeout(() => {
          marcas.clear();
          i = 0;
          desenhar();
          legendar();
          relogio = setTimeout(passo, 900);
        }, 2600);
      }
    };
    desenhar();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        if (en.isIntersecting && !relogio) relogio = setTimeout(passo, 700);
        if (!en.isIntersecting && relogio) { clearTimeout(relogio); relogio = null; }
      }).observe(previa);
    } else {
      relogio = setTimeout(passo, 700);
    }
  }
}

/* ---------- Mapa interativo ---------- */
const mapa = document.querySelector('[data-mapa]');
if (mapa) {
  const estado = { marcas: new Map(), ferramenta: 'falta', foco: 11 };
  const sorriso = mapa.querySelector('[data-sorriso]');
  const rolagem = mapa.querySelector('[data-rolagem]');
  const leitura = mapa.querySelector('[data-leitura]');
  const ferramentas = mapa.querySelector('[data-ferramentas]');
  const form = mapa.querySelector('[data-form]');
  const etapas = [...mapa.querySelectorAll('[data-etapa]')];
  const marcadores = [...mapa.querySelectorAll('[data-marcador]')];
  const barra = mapa.querySelector('[data-barra]');
  const btAvancar = mapa.querySelector('[data-avancar]');
  const btVoltar = mapa.querySelector('[data-voltar]');
  const btRefazer = mapa.querySelector('[data-refazer]');
  const btEnviar = mapa.querySelector('[data-enviar]');
  const btCopiar = mapa.querySelector('[data-copiar]');
  const btImagem = mapa.querySelector('[data-imagem]');
  const resumo = mapa.querySelector('[data-resumo]');
  const lista = mapa.querySelector('[data-lista]');
  const contagem = mapa.querySelector('[data-contagem]');
  const nome = form.querySelector('#nome');
  let atual = 1;
  let mensagem = '';
  let imagemPronta = null;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const quadrado = (cond) => `<i style="background:${CONDICOES[cond].cor}" aria-hidden="true"></i>`;

  /* Ferramentas */
  ferramentas.innerHTML = ORDEM.map((k) => `<button type="button" class="ferramenta" role="radio" data-ferramenta="${k}" style="--cor:${CONDICOES[k].cor}" aria-checked="${k === estado.ferramenta}" tabindex="${k === estado.ferramenta ? 0 : -1}">${iconeCondicao(k)}<span>${CONDICOES[k].nome}</span></button>`).join('');
  const botoesFerramenta = [...ferramentas.querySelectorAll('.ferramenta')];

  function escolherFerramenta(k, focar = false) {
    estado.ferramenta = k;
    botoesFerramenta.forEach((b) => {
      const sim = b.dataset.ferramenta === k;
      b.setAttribute('aria-checked', String(sim));
      b.tabIndex = sim ? 0 : -1;
      if (sim && focar) b.focus();
    });
    leitura.innerHTML = `${quadrado(k)}<span>Marcando: <b>${CONDICOES[k].nome}</b>. <small>Toque nos dentes.</small></span>`;
  }
  ferramentas.addEventListener('click', (e) => {
    const b = e.target.closest('.ferramenta');
    if (b) escolherFerramenta(b.dataset.ferramenta);
  });
  ferramentas.addEventListener('keydown', (e) => {
    const passo = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!passo) return;
    e.preventDefault();
    const i = ORDEM.indexOf(estado.ferramenta);
    escolherFerramenta(ORDEM[(i + passo + ORDEM.length) % ORDEM.length], true);
  });

  /* Desenho */
  function desenharMapa() {
    sorriso.innerHTML = svgSorriso({ prefixo: 'mapa', marcas: estado.marcas, interativo: true, rotulo: 'Mapa dos dentes. Use as setas para andar entre os dentes e Enter para marcar.' });
    const ativo = sorriso.querySelector(`.dente[data-id="${estado.foco}"]`);
    if (ativo) ativo.setAttribute('tabindex', '0');
  }

  function redesenharDente(id) {
    const velho = sorriso.querySelector(`.dente[data-id="${id}"]`);
    if (!velho) return;
    const tinhaFoco = document.activeElement === velho;
    const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tmp.innerHTML = denteSVG(DENTE[id], estado.marcas.get(id), 'mapa', true);
    const novo = tmp.firstElementChild;
    novo.setAttribute('tabindex', velho.getAttribute('tabindex'));
    novo.classList.add('dente--novo');
    velho.replaceWith(novo);
    if (tinhaFoco) novo.focus({ preventScroll: true });
  }

  function anunciar(id) {
    const cond = estado.marcas.get(id);
    leitura.innerHTML = cond
      ? `${quadrado(cond)}<span><b>${id}</b> · ${nomeDente(id)}: ${CONDICOES[cond].nome.toLowerCase()}</span>`
      : `<span><b>${id}</b> · ${nomeDente(id)} <small>sem marcação</small></span>`;
  }

  function alternar(id) {
    if (estado.marcas.get(id) === estado.ferramenta) estado.marcas.delete(id);
    else estado.marcas.set(id, estado.ferramenta);
    if (estado.foco !== id) {
      sorriso.querySelector(`.dente[data-id="${estado.foco}"]`)?.setAttribute('tabindex', '-1');
      sorriso.querySelector(`.dente[data-id="${id}"]`)?.setAttribute('tabindex', '0');
      estado.foco = id;
    }
    redesenharDente(id);
    anunciar(id);
    mudou();
  }

  // Lista ao lado e, se o resumo já estiver aberto, o resumo também.
  function mudou() {
    atualizarLista();
    if (atual === 4) montarResumo();
  }

  function focarDente(id) {
    sorriso.querySelectorAll('.dente[tabindex="0"]').forEach((g) => g.setAttribute('tabindex', '-1'));
    const g = sorriso.querySelector(`.dente[data-id="${id}"]`);
    if (!g) return;
    estado.foco = id;
    g.setAttribute('tabindex', '0');
    g.focus({ preventScroll: true });
    const caixa = g.getBoundingClientRect();
    const area = rolagem.getBoundingClientRect();
    if (caixa.left < area.left + 24 || caixa.right > area.right - 24) {
      rolagem.scrollBy({ left: caixa.left + caixa.width / 2 - (area.left + area.width / 2), behavior: 'smooth' });
    }
    const cond = estado.marcas.get(id);
    leitura.innerHTML = `${cond ? quadrado(cond) : ''}<span><b>${id}</b> · ${nomeDente(id)}${cond ? `: ${CONDICOES[cond].nome.toLowerCase()}` : ''}</span>`;
  }

  sorriso.addEventListener('click', (e) => {
    const g = e.target.closest('.dente');
    if (g) alternar(Number(g.dataset.id));
  });
  sorriso.addEventListener('keydown', (e) => {
    const g = e.target.closest && e.target.closest('.dente');
    if (!g) return;
    const id = Number(g.dataset.id);
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alternar(id); return; }
    const d = DENTE[id];
    const fila = FILA[d.arc];
    const i = fila.indexOf(id);
    let alvo = null;
    if (e.key === 'ArrowRight') alvo = fila[Math.min(fila.length - 1, i + 1)];
    if (e.key === 'ArrowLeft') alvo = fila[Math.max(0, i - 1)];
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') alvo = FILA[d.arc === 'sup' ? 'inf' : 'sup'][i];
    if (alvo) { e.preventDefault(); focarDente(alvo); }
  });
  sorriso.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const g = e.target.closest('.dente');
    if (!g) return;
    const id = Number(g.dataset.id);
    const cond = estado.marcas.get(id);
    leitura.innerHTML = `${cond ? quadrado(cond) : ''}<span><b>${id}</b> · ${nomeDente(id)}${cond ? `: ${CONDICOES[cond].nome.toLowerCase()}` : ''}</span>`;
  });

  /* Atalhos */
  mapa.querySelectorAll('[data-arcada]').forEach((bt) => bt.addEventListener('click', () => {
    const ids = FILA[bt.dataset.arcada];
    const todos = ids.every((id) => estado.marcas.get(id) === estado.ferramenta);
    ids.forEach((id) => (todos ? estado.marcas.delete(id) : estado.marcas.set(id, estado.ferramenta)));
    desenharMapa();
    mudou();
    const arcada = bt.dataset.arcada === 'sup' ? 'de cima' : 'de baixo';
    leitura.innerHTML = todos
      ? `<span>Arcada ${arcada} desmarcada.</span>`
      : `${quadrado(estado.ferramenta)}<span>Arcada ${arcada} inteira: <b>${CONDICOES[estado.ferramenta].nome.toLowerCase()}</b></span>`;
  }));
  mapa.querySelector('[data-limpar]').addEventListener('click', () => {
    estado.marcas.clear();
    desenharMapa();
    mudou();
    leitura.innerHTML = '<span>Mapa limpo. Escolha o que marcar e toque nos dentes.</span>';
  });

  /* Lista ao lado do mapa */
  function grupos() {
    return ORDEM.map((cond) => [cond, [...estado.marcas].filter(([, c]) => c === cond).map(([id]) => id).sort((a, b) => a - b)]).filter(([, ids]) => ids.length);
  }
  function atualizarLista() {
    const total = estado.marcas.size;
    contagem.textContent = total === 0 ? 'Nenhum dente marcado ainda.' : total === 1 ? '1 dente marcado' : `${total} dentes marcados`;
    const gs = grupos();
    lista.innerHTML = gs.length
      ? gs.map(([cond, ids]) => `<li>${quadrado(cond)}<div><b>${CONDICOES[cond].nome}</b> <span>· ${ids.length === 1 ? '1 dente' : `${ids.length} dentes`}</span><br><span>${ids.map((id) => `${id} (${nomeDente(id).toLowerCase()})`).join('; ')}</span></div></li>`).join('')
      : '<li class="vazia">Os dentes que você marcar aparecem aqui, com o nome de cada um.</li>';
  }

  /* Perguntas */
  form.querySelectorAll('.chips button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  form.addEventListener('click', (e) => {
    const b = e.target.closest('.chips button');
    if (!b) return;
    const grupoUnico = b.closest('[data-unico]');
    if (grupoUnico) {
      const ligar = b.getAttribute('aria-pressed') !== 'true';
      grupoUnico.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b && ligar)));
    } else {
      b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    }
    esconderAvisos();
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  nome.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); avancar(); } });

  const marcados = (campo) => [...form.querySelectorAll(`[data-chips="${campo}"] button[aria-pressed="true"]`)].map((b) => b.dataset.v);
  const unico = (campo) => form.querySelector(`[data-unico="${campo}"] button[aria-pressed="true"]`)?.dataset.v || '';

  // Link com ?origem=instagram (bio, stories, anúncios) já marca de onde a pessoa veio.
  const ORIGENS = { instagram: 'Instagram', insta: 'Instagram', ig: 'Instagram', google: 'Google', indicacao: 'Indicação' };
  const origemLink = (new URLSearchParams(location.search).get('origem') || '').toLowerCase();
  if (ORIGENS[origemLink]) {
    const b = form.querySelector(`[data-unico="origem"] button[data-v="${ORIGENS[origemLink]}"]`);
    if (b) b.setAttribute('aria-pressed', 'true');
  }

  function esconderAvisos() { form.querySelectorAll('[data-aviso]').forEach((a) => { a.hidden = true; }); }
  function avisar(n) { const a = form.querySelector(`[data-aviso="${n}"]`); if (a) a.hidden = false; }

  function valida(n) {
    if (n === 2) return estado.marcas.size > 0 || marcados('quero').length > 0;
    if (n === 3) return nome.value.trim().length > 0 && Boolean(unico('periodo'));
    return true;
  }

  function irPara(n, rolar = true) {
    atual = n;
    mapa.dataset.etapaAtual = String(n);
    etapas.forEach((et) => et.classList.toggle('ativa', Number(et.dataset.etapa) === n));
    marcadores.forEach((m) => {
      const k = Number(m.dataset.marcador);
      m.classList.toggle('ativa', k === n);
      m.classList.toggle('feita', k < n);
    });
    barra.style.width = `${n * 25}%`;
    btVoltar.hidden = n === 1;
    btAvancar.hidden = n === 4;
    btRefazer.hidden = n !== 4;
    btAvancar.innerHTML = n === 3
      ? 'Ver meu resumo <svg aria-hidden="true"><use href="#i-seta"/></svg>'
      : 'Continuar <svg aria-hidden="true"><use href="#i-seta"/></svg>';
    esconderAvisos();
    if (n === 1) centralizar();
    if (!rolar) return;
    const passos = form.getBoundingClientRect();
    if (passos.top < 0 || passos.top > window.innerHeight * 0.6) {
      const alvo = window.innerWidth <= 760 ? form : mapa;
      alvo.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
    const titulo = etapas[n - 1].querySelector('legend') || etapas[n - 1].querySelector('.resumo__ola') || etapas[n - 1];
    titulo.setAttribute('tabindex', '-1');
    titulo.focus({ preventScroll: true });
  }

  function avancar() {
    if (!valida(atual)) {
      avisar(atual);
      if (atual === 3 && !nome.value.trim()) nome.focus();
      return;
    }
    if (atual === 3) montarResumo();
    irPara(atual + 1);
  }
  btAvancar.addEventListener('click', avancar);
  btVoltar.addEventListener('click', () => irPara(Math.max(1, atual - 1)));
  btRefazer.addEventListener('click', () => {
    estado.marcas.clear();
    form.reset();
    form.querySelectorAll('.chips button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    desenharMapa();
    atualizarLista();
    escolherFerramenta('falta');
    irPara(1);
  });

  /* Caminhos possíveis (o diagnóstico é sempre na avaliação) */
  function caminhos(gs, quero, protese) {
    const conta = (c) => (gs.find(([k]) => k === c) || [null, []])[1].length;
    const faltaEm = (q) => [...estado.marcas].filter(([id, c]) => c === 'falta' && q.includes(Math.floor(id / 10))).length;
    const itens = [];
    if (conta('dor') || quero.includes('Resolver uma dor')) itens.push({ t: 'Cuidar da dor primeiro: a mensagem chega marcada como prioridade.', prioridade: true });
    const arcadaInteira = faltaEm([1, 2]) >= 10 || faltaEm([3, 4]) >= 10 || protese === 'Dentadura';
    if (arcadaInteira) itens.push({ t: 'Dentes fixos sobre implantes (protocolo)' });
    else if (conta('falta') || quero.includes('Ter dentes fixos')) itens.push({ t: 'Implantes para repor os dentes que faltam' });
    if (protese === 'Prótese móvel parcial' && !arcadaInteira) itens.push({ t: 'Implantes para trocar a prótese móvel por dentes fixos' });
    if (conta('quebrado')) itens.push({ t: 'Coroa, reconstrução ou lente de porcelana para os dentes quebrados ou gastos' });
    if (conta('cor') || quero.includes('Dentes mais brancos')) itens.push({ t: 'Clareamento ou lentes de porcelana para a cor' });
    if (conta('forma') || quero.includes('Um sorriso mais bonito')) itens.push({ t: 'Lentes de porcelana para formato e harmonia, quando indicadas' });
    if (conta('protese') || quero.includes('Trocar uma prótese antiga')) itens.push({ t: 'Revisão ou troca da prótese ou da coroa antiga' });
    if (!itens.length) itens.push({ t: 'Avaliação completa do sorriso, com planejamento digital' });
    return itens;
  }

  function montarResumo() {
    const pessoa = nome.value.trim().replace(/\s+/g, ' ');
    const primeiro = pessoa.split(' ')[0];
    const gs = grupos();
    const quero = marcados('quero');
    const protese = unico('protese');
    const tempo = unico('tempo');
    const ficha = [
      ['Quer', quero.join(', ')],
      ['Usa prótese', protese],
      ['Incomoda há', tempo],
      ['Melhor período', unico('periodo')],
      ['Paciente', unico('paciente')],
      ['Conheceu por', unico('origem')],
    ].filter(([, v]) => v);
    const itens = caminhos(gs, quero, protese);
    const prioridade = itens.some((c) => c.prioridade);

    resumo.innerHTML = `
      <p class="resumo__ola" tabindex="-1">${esc(primeiro)}, <em>este é o seu Mapa do Sorriso.</em></p>
      <p class="resumo__intro">Confira e envie para o Dr. Guilherme. Ele olha tudo com você na avaliação.</p>
      <h4>No mapa</h4>
      <div class="resumo__sorriso">${svgSorriso({ prefixo: 'resumo', marcas: estado.marcas, rotulo: 'Seu mapa do sorriso' })}</div>
      ${gs.length
        ? `<ul class="resumo__grupos">${gs.map(([cond, ids]) => `<li>${quadrado(cond)}<div><b>${CONDICOES[cond].nome}</b><span>${ids.map((id) => `${id} (${nomeDente(id).toLowerCase()})`).join('; ')}</span></div></li>`).join('')}</ul>`
        : '<p class="resumo__intro">Você não marcou dentes. Tudo bem: o Dr. Guilherme vê tudo na avaliação.</p>'}
      <h4>O que pode ser avaliado</h4>
      <ul class="caminhos">${itens.map((c) => `<li${c.prioridade ? ' class="prioridade"' : ''}><svg aria-hidden="true"><use href="#i-check"/></svg><span>${c.t}</span></li>`).join('')}</ul>
      ${ficha.length ? `<h4>Sua ficha</h4><dl class="ficha">${ficha.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
    `;

    const linhas = ['Olá, Dr. Guilherme! Montei o meu Mapa do Sorriso no site.', '', `*Nome:* ${pessoa}`];
    if (quero.length) linhas.push(`*O que eu quero:* ${quero.join(', ')}`);
    if (protese) linhas.push(`*Uso prótese:* ${protese}`);
    if (tempo) linhas.push(`*Incomoda há:* ${tempo}`);
    linhas.push('');
    if (gs.length) {
      linhas.push('*No mapa* (numeração dos dentistas):');
      gs.forEach(([cond, ids]) => linhas.push(`• ${CONDICOES[cond].nome}: ${ids.join(', ')}`));
    } else {
      linhas.push('*No mapa:* não marquei dentes.');
    }
    if (prioridade) linhas.push('*PRIORIDADE: estou com dor.*');
    linhas.push('');
    linhas.push(`*Melhor período:* ${unico('periodo')}`);
    if (unico('paciente')) linhas.push(`*Paciente:* ${unico('paciente')}`);
    if (unico('origem')) linhas.push(`*Conheci por:* ${unico('origem')}`);
    linhas.push('', 'Gostaria de agendar uma avaliação.');
    mensagem = linhas.join('\n');
    btEnviar.href = zapLink(mensagem);
    btCopiar.querySelector('span').textContent = 'Copiar resumo';
    imagemPronta = gerarImagem(pessoa, gs).catch(() => null);
  }

  /* Imagem do mapa para mandar junto no WhatsApp */
  const podeCompartilhar = (() => {
    try { return Boolean(navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.png', { type: 'image/png' })] })); } catch { return false; }
  })();
  if (podeCompartilhar) {
    btImagem.querySelector('span').textContent = 'Compartilhar imagem do mapa';
    btImagem.querySelector('use').setAttribute('href', '#i-compartilhar');
  }

  function quebrarTexto(ctx, texto, largura) {
    const palavras = texto.split(' ');
    const linhas = [];
    let linha = '';
    palavras.forEach((p) => {
      const teste = linha ? `${linha} ${p}` : p;
      if (ctx.measureText(teste).width > largura && linha) { linhas.push(linha); linha = p; } else { linha = teste; }
    });
    if (linha) linhas.push(linha);
    return linhas;
  }

  async function gerarImagem(pessoa, gs) {
    try { if (document.fonts) await document.fonts.ready; } catch { /* segue com a fonte do sistema */ }
    const W = 1080;
    const H = 1350;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d');
    const fonte = (peso, px) => `${peso} ${px}px Figtree, system-ui, sans-serif`;
    g.fillStyle = '#f5f2ec';
    g.fillRect(0, 0, W, H);

    g.fillStyle = '#1e6ba8';
    g.font = fonte(700, 24);
    g.fillText('MAPA DO SORRISO', 72, 100);
    g.fillStyle = '#14212b';
    g.font = fonte(800, 54);
    g.fillText(pessoa ? `O sorriso de ${pessoa.split(' ')[0]}` : 'O meu sorriso', 72, 166);
    g.fillStyle = '#46535e';
    g.font = fonte(500, 26);
    g.fillText(`Montado no site em ${new Date().toLocaleDateString('pt-BR')}`, 72, 210);

    g.fillStyle = '#0e1b26';
    g.beginPath();
    if (g.roundRect) g.roundRect(48, 250, W - 96, 470, 36); else g.rect(48, 250, W - 96, 470);
    g.fill();
    desenharSorrisoCanvas(g, estado.marcas, 76, 282, W - 152);
    g.fillStyle = '#93a3b1';
    g.font = fonte(700, 19);
    g.fillText('SEU LADO ESQUERDO', 84, 694);
    g.textAlign = 'right';
    g.fillText('SEU LADO DIREITO', W - 84, 694);
    g.textAlign = 'left';

    let y = 800;
    if (!gs.length) {
      g.fillStyle = '#46535e';
      g.font = fonte(500, 30);
      g.fillText('Nenhum dente marcado no mapa.', 72, y);
    }
    gs.forEach(([cond, ids]) => {
      if (y > H - 220) return;
      g.fillStyle = CONDICOES[cond].cor;
      g.beginPath();
      if (g.roundRect) g.roundRect(72, y - 24, 26, 26, 7); else g.rect(72, y - 24, 26, 26);
      g.fill();
      g.fillStyle = '#14212b';
      g.font = fonte(700, 30);
      g.fillText(CONDICOES[cond].nome, 118, y);
      const largura = g.measureText(CONDICOES[cond].nome).width;
      g.font = fonte(500, 28);
      g.fillStyle = '#46535e';
      const linhas = quebrarTexto(g, `${ids.length === 1 ? 'dente' : 'dentes'} ${ids.join(', ')}`, W - 190 - largura);
      linhas.forEach((l, i) => g.fillText(l, i === 0 ? 118 + largura + 18 : 118, y + i * 40));
      y += 40 * linhas.length + 22;
    });

    g.fillStyle = '#0e1b26';
    g.fillRect(0, H - 150, W, 150);
    g.fillStyle = '#ffffff';
    g.font = fonte(700, 30);
    g.fillText('Dr. Guilherme Pagnoncelli', 72, H - 88);
    g.fillStyle = '#93a3b1';
    g.font = fonte(500, 24);
    g.fillText('Cirurgião-dentista · CRO-SC 12489 · (47) 98489-1404', 72, H - 48);
    return new Promise((ok) => c.toBlob(ok, 'image/png'));
  }

  btImagem.addEventListener('click', async () => {
    const rotulo = btImagem.querySelector('span');
    const original = rotulo.textContent;
    const blob = await imagemPronta;
    if (!blob) { rotulo.textContent = 'Não deu para gerar a imagem'; setTimeout(() => { rotulo.textContent = original; }, 2500); return; }
    const primeiro = (nome.value.trim().split(' ')[0] || 'meu').toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
    const arquivo = new File([blob], `mapa-do-sorriso-${primeiro || 'meu'}.png`, { type: 'image/png' });
    if (podeCompartilhar) {
      try { await navigator.share({ files: [arquivo], title: 'Mapa do Sorriso' }); return; } catch (err) { if (err && err.name === 'AbortError') return; }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = arquivo.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    rotulo.textContent = 'Imagem baixada';
    setTimeout(() => { rotulo.textContent = original; }, 2500);
  });

  btCopiar.addEventListener('click', async () => {
    const rotulo = btCopiar.querySelector('span');
    try {
      await navigator.clipboard.writeText(mensagem);
    } catch {
      const t = document.createElement('textarea');
      t.value = mensagem;
      t.setAttribute('readonly', '');
      t.style.position = 'fixed';
      t.style.opacity = '0';
      document.body.appendChild(t);
      t.select();
      try { document.execCommand('copy'); } catch { /* sem cópia */ }
      t.remove();
    }
    rotulo.textContent = 'Resumo copiado';
    setTimeout(() => { rotulo.textContent = 'Copiar resumo'; }, 2500);
  });

  /* No celular o desenho rola de lado: começa nos dentes da frente */
  function centralizar() {
    requestAnimationFrame(() => { rolagem.scrollLeft = (rolagem.scrollWidth - rolagem.clientWidth) / 2; });
  }
  window.addEventListener('resize', () => { if (atual === 1) centralizar(); });

  desenharMapa();
  atualizarLista();
  escolherFerramenta('falta');
  irPara(1, false);
}
