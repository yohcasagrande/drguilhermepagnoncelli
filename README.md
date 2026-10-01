# Site do Dr. Guilherme Pagnoncelli

Site estático (HTML, CSS e JavaScript puro, sem build) para a Vercel, no padrão dos nossos sites: seções escuras e claras, fonte sem serifa (Figtree), faixa final e uma funcionalidade própria que termina no WhatsApp. Todos os arquivos ficam na raiz.

Cirurgião-dentista em Blumenau, CRO-SC 12489, EPAO 2564. Atende na Clínica de Odontologia Inove (R. Erich Steinbach, 22, sala 202, Itoupava Seca). Instagram: @drguilhermepagnoncelli.

```
index.html      página única
style.css       visual (paleta porcelana e azul)
main.js         menu, horário ao vivo, antes e depois, links de WhatsApp
mapa.js         Mapa do Sorriso: desenho dos dentes, passos, resumo e imagem
*.jpg           fotos do Instagram @drguilhermepagnoncelli
vercel.json     URLs limpas e cache das imagens
robots.txt, sitemap.xml, favicon.svg, apple-touch-icon.png, og-image.jpg
```

## Funcionalidade própria: Mapa do Sorriso

A pessoa vê um desenho do sorriso (32 dentes, de frente, como no espelho), escolhe o que quer marcar (falta o dente, quebrado ou gasto, cor ou mancha, torto ou formato, dor, prótese ou coroa antiga) e toca nos dentes. Depois conta o que quer, se usa prótese, há quanto tempo incomoda, nome e melhor período.

O resumo mostra os dentes marcados com o nome de cada um, os caminhos que podem ser avaliados (implante, protocolo, lentes, clareamento, coroa) e sai pronto para o WhatsApp, com a numeração que os dentistas usam (11 a 48). Quem marca dor chega com **PRIORIDADE** na mensagem. Dá para baixar ou compartilhar uma imagem do mapa (1080 x 1350) para mandar junto. Nada fica salvo no site e nada é diagnóstico: o texto deixa claro que a indicação sai da avaliação.

- Número do WhatsApp: constante `WHATSAPP` no topo de `main.js` (os links `data-zap` usam ela).
- Condições, cores e caminhos sugeridos: `CONDICOES` e a função `caminhos()` em `mapa.js`.
- Horário de atendimento: `HORARIO` em `main.js` e a tabela no `index.html`.

Links prontos para divulgar (bio, stories, anúncios):

| Link | O que faz |
| --- | --- |
| `/?origem=instagram#mapa` | Abre o Mapa e já marca "Instagram" em "Como conheceu" |
| `/?origem=google#mapa` | Mesmo, marcando "Google" |

## Publicação

Repositório no GitHub com deploy automático na Vercel: cada push na branch `main` atualiza o site. Commits com o e-mail noreply do GitHub (`330556868+yohcasagrande@users.noreply.github.com`), senão a Vercel bloqueia o deploy.

Se o endereço mudar (domínio próprio), troque `drguilhermepagnoncelli.vercel.app` em `index.html` (canonical, og:url, og:image e JSON-LD), `robots.txt` e `sitemap.xml`.

Domínios em 01/10/2026: `drguilhermepagnoncelli.com.br` é de um homônimo (Guilherme Vinicius Pagnoncelli, oftalmologista em Curitiba, que também aparece nas buscas pelo nome). Livres: `guilhermepagnoncelli.com.br`, `drguilhermepagnoncelli.odo.br`, `guilhermepagnoncelli.odo.br`, `pagnoncelli.odo.br`, `pagnoncelliodonto.com.br` (o `.odo.br` é a categoria do Registro.br para dentistas).

## Validar com o Dr. Guilherme

- WhatsApp (47) 98489-1404: veio do Google Maps da Clínica Inove. Confirmar se é o número de agendamento.
- Autorização (TCLE) dos pacientes para usar no site os antes e depois e a foto do abraço, que hoje estão no Instagram dele (Resolução CFO-196/2019).
- Especialidade: ele aparece na lista de especialistas do CRO-SC. Se quiser anunciar a especialidade, entra com o número do registro.
- EPAO 2564 e responsável técnico da Clínica Inove (o rodapé usa o que está na bio).
- "+20.000 vidas transformadas" vem da bio do Instagram. Nota 4,9 com 72 avaliações no Google em 01/10/2026: atualizar de tempos em tempos.
- O site não fala de preço, forma de pagamento nem "avaliação gratuita" (Código de Ética Odontológica).
