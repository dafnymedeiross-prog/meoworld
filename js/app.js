/* MEOWorld — a rede social para pai ou mãe de gatos.
   Tudo roda no navegador: perfil/posts no localStorage, fotos e vídeos no IndexedDB. */
(() => {
  const app = document.getElementById('app');
  const modal = document.getElementById('modal');
  const KEY = 'meoworld:v1';

  // ---------- Estado ----------
  const defaults = () => ({
    user: null,
    albums: [],          // { id, name, items: [mediaId] }
    tiks: [],            // { id, mediaId, caption, trend, liked, ts }
    likedSeeds: [],
    settings: { showOwner: true, showBirth: true, privateProfile: false, motion: true },
    savedFacts: [],
    chats: {
      c1: [{ from: 'c1', text: 'Miau! Bem-vindo(a) ao MEOWorld 😺' }],
      c2: [{ from: 'c2', text: 'Oi! Você também dorme 16h por dia?' }],
      c3: [{ from: 'c3', text: 'Miaaau miau miau. (Eu falo muito.)' }]
    }
  });
  // Contas ficam só neste navegador: { usuario: { salt, hash } }. Cada conta tem o próprio estado.
  const ACC = 'meoworld:accounts', SES = 'meoworld:session';
  const readJSON = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) || fallback; } catch { return fallback; } };
  let accounts = readJSON(ACC, {});
  let session = localStorage.getItem(SES);
  if (!accounts[session]) session = null;
  let S;
  const loadState = () => {
    S = Object.assign(defaults(), session ? readJSON(`${KEY}:${session}`, {}) : {});
    S.settings = Object.assign(defaults().settings, S.settings);
  };
  loadState();
  const save = () => {
    if (!session) return;
    try { localStorage.setItem(`${KEY}:${session}`, JSON.stringify(S)); }
    catch { alert('Não foi possível salvar: o armazenamento do navegador está cheio ou bloqueado.'); }
  };
  const saveAccounts = () => localStorage.setItem(ACC, JSON.stringify(accounts));
  function setSession(name) {
    session = name;
    if (name) localStorage.setItem(SES, name); else localStorage.removeItem(SES);
    loadState();
  }
  // A senha nunca é guardada: só o hash com salt.
  async function hashPw(pw, salt) {
    const text = salt + ':' + pw;
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    // Sem contexto seguro (ex.: aberto por IP na rede local) não há crypto.subtle.
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
    return 'f' + (h >>> 0).toString(16);
  }

  // ---------- Utilidades ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const today = () => new Date().toISOString().slice(0, 10);
  const findCat = (id) => COMMUNITY.find((c) => c.id === id);

  function age(birth) {
    const b = new Date(birth + 'T00:00:00');
    if (isNaN(b)) return null;
    const n = new Date();
    let months = (n.getFullYear() - b.getFullYear()) * 12 + n.getMonth() - b.getMonth();
    if (n.getDate() < b.getDate()) months--;
    return Math.max(0, months);
  }
  function ageText(birth) {
    const m = age(birth);
    if (m === null) return '—';
    if (m < 12) return m === 1 ? '1 mês' : `${m} meses`;
    const y = Math.floor(m / 12);
    return y === 1 ? '1 ano' : `${y} anos`;
  }
  const dateBR = (iso) => (iso ? iso.split('-').reverse().join('/') : '—');

  // Gatinho ilustrado para quem ainda não tem foto.
  function catSVG(coat = '#f2a65a', eyes = '#7dbb6a') {
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="#e6f6ff"/>
      <path d="M18 46 22 12 46 30zM82 46 78 12 54 30z" fill="${coat}"/><circle cx="50" cy="58" r="34" fill="${coat}"/>
      <path d="M25 40 26 22 40 32zM75 40 74 22 60 32z" fill="#ffc9d4"/>
      <ellipse cx="37" cy="54" rx="6" ry="8" fill="#fff"/><ellipse cx="63" cy="54" rx="6" ry="8" fill="#fff"/>
      <ellipse cx="37" cy="55" rx="3.5" ry="6" fill="${eyes}"/><ellipse cx="63" cy="55" rx="3.5" ry="6" fill="${eyes}"/>
      <ellipse cx="37" cy="55" rx="1.3" ry="5" fill="#222"/><ellipse cx="63" cy="55" rx="1.3" ry="5" fill="#222"/>
      <path d="M46 66h8l-4 5z" fill="#ff9fb2"/><path d="M50 71c0 5-7 6-9 2M50 71c0 5 7 6 9 2" fill="none" stroke="#3338" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M30 68 12 64M30 72 12 76M70 68 88 64M70 72 88 76" stroke="#3336" stroke-width="1.4" stroke-linecap="round"/></svg>`;
  }
  // Só o rostinho, para a cabeça do PerfilCat (as orelhas já são desenhadas por fora).
  const catFace = (coat, eyes) => catSVG(coat, eyes)
    .replace('viewBox="0 0 100 100"', 'viewBox="12 10 76 76"')
    .replace('<rect width="100" height="100" fill="#e6f6ff"/>', `<rect width="100" height="100" fill="${coat}"/>`)
    .replace('<path d="M25 40 26 22 40 32zM75 40 74 22 60 32z" fill="#ffc9d4"/>', '');
  const userFace = () => (S.user.photo ? `<img src="${S.user.photo}" alt="Foto de ${esc(S.user.catName)}">` : catSVG(S.user.coat));

  const LOGO = `<span class="logo" role="img" aria-label="MEOWorld">${LOGO_MARK}${LOGO_WORD}</span>`;

  const I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    tik: '<svg viewBox="0 0 36 28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><rect x="2" y="2" width="32" height="24" rx="3"/><path d="M14 8v12l10-6z"/></svg>',
    book: '<svg viewBox="0 0 36 28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M2 9V2h8M26 2h8v7M34 19v7h-8M10 26H2v-7"/><circle cx="18" cy="14" r="4"/></svg>',
    twin: '<svg viewBox="0 0 36 28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1.5" y="1.5" width="33" height="25" rx="3"/><path d="M5 20V9l3 4h4l3-4v11zM21 20V9l3 4h4l3-4v11z"/></svg>',
    curious: '<svg viewBox="0 0 36 28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="1.5" y="1.5" width="33" height="25" rx="3"/><path d="M6 7h4v4H6zM6 16h4v4H6zM15 9h14M15 18h14"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.3 1a7.6 7.6 0 0 0-2.6-1.5L14.1 2.5H9.9l-.4 2.6A7.6 7.6 0 0 0 6.9 6.6l-2.3-1-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.3-1a7.6 7.6 0 0 0 2.6 1.5l.4 2.6h4.2l.4-2.6a7.6 7.6 0 0 0 2.6-1.5l2.3 1 2-3.4z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>'
  };

  // ---------- Mídia (IndexedDB) ----------
  let dbp;
  const db = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open('meoworld', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('media');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }));
  const tx = async (mode, fn) => {
    const d = await db();
    return new Promise((res, rej) => {
      const t = d.transaction('media', mode);
      const rq = fn(t.objectStore('media'));
      t.oncomplete = () => res(rq.result);
      t.onerror = t.onabort = () => rej(t.error);
    });
  };
  const urls = new Map();
  const putMedia = async (blob) => { const id = uid(); await tx('readwrite', (s) => s.put(blob, id)); return id; };
  const delMedia = (id) => { URL.revokeObjectURL(urls.get(id)); urls.delete(id); return tx('readwrite', (s) => s.delete(id)); };
  async function mediaURL(id) {
    if (!urls.has(id)) {
      const blob = await tx('readonly', (s) => s.get(id));
      if (!blob) return '';
      urls.set(id, URL.createObjectURL(blob));
    }
    return urls.get(id);
  }
  // Preenche <img data-media> / <video data-media> depois de cada render.
  function hydrate(root = app) {
    root.querySelectorAll('[data-media]').forEach(async (el) => {
      try { el.src = await mediaURL(el.dataset.media); } catch { /* mídia indisponível */ }
    });
  }

  // Reduz a imagem antes de guardar (as fotos do celular são enormes).
  function shrink(file, max, type = 'image/jpeg') {
    return new Promise((res, rej) => {
      const img = new Image();
      const src = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(src);
        res(c);
      };
      img.onerror = () => { URL.revokeObjectURL(src); rej(new Error('imagem inválida')); };
      img.src = src;
    });
  }
  const pickFile = (accept, multiple = false) => new Promise((res) => {
    const i = document.createElement('input');
    i.type = 'file'; i.accept = accept; i.multiple = multiple;
    i.onchange = () => res([...i.files]);
    i.click();
  });

  // ---------- Modal ----------
  function openModal(html, cls = '') {
    modal.className = cls;
    modal.innerHTML = html;
    modal.showModal();
  }
  modal.addEventListener('click', (e) => {
    if ((e.target === modal && !modal.classList.contains('cropping')) || e.target.closest('[data-close]')) modal.close();
  });

  // ---------- Telas ----------
  const breedList = `<datalist id="breeds">${BREEDS.map((b) => `<option value="${esc(b)}">`).join('')}</datalist>`;

  let authView = Object.keys(accounts).length ? 'login' : 'account';
  let pending = null; // { username, password } entre o passo 1 e o passo 2

  const authShell = (inner) => `<div class="signup">
      <div class="signup-head">${LOGO}<hr><p class="tagline">Venha ronronar com nós!</p></div>${inner}</div>`;
  const showPw = '<label class="check"><input type="checkbox" data-act="toggle-pw"> Mostrar senha</label>';

  function viewLogin() {
    return authShell(`<form class="card" id="login" novalidate>
        <h1>Que bom te ver de novo! Entre com as suas patinhas.</h1>
        <label class="field"><span>Usuário:</span><span class="paw"><input name="username" maxlength="20" required autocomplete="username" autocapitalize="none" spellcheck="false"></span></label>
        <label class="field"><span>Senha:</span><span class="paw"><input name="password" type="password" maxlength="64" required autocomplete="current-password"></span></label>
        ${showPw}
        <p class="error" role="alert"></p>
        <button class="btn btn-big">Entrar</button>
        <p class="switch">Ainda não tem conta? <button type="button" class="link" data-act="go-account">Meowdastre-se</button></p>
      </form>`);
  }

  function viewAccount() {
    return authShell(`<form class="card" id="signup-account" novalidate>
        <p class="steps"><b>1</b><i></i><span>2</span></p>
        <h1>Vamos iniciar seu cadastro? Coloque as patinhas pra trabalhar.</h1>
        <label class="field"><span>Usuário:</span><span class="paw"><input name="username" maxlength="20" required autocomplete="username" autocapitalize="none" spellcheck="false" value="${esc(pending ? pending.username : '')}"></span>
          <small class="hint">3 a 20 caracteres: letras, números, ponto ou _</small></label>
        <label class="field"><span>Senha:</span><span class="paw"><input name="password" type="password" maxlength="64" required autocomplete="new-password"></span>
          <small class="hint">Pelo menos 6 caracteres</small></label>
        <label class="field"><span>Confirmar senha:</span><span class="paw"><input name="confirm" type="password" maxlength="64" required autocomplete="new-password"></span></label>
        ${showPw}
        <p class="error" role="alert"></p>
        <button class="btn btn-big">Continuar</button>
        <p class="switch">Já tem conta? <button type="button" class="link" data-act="go-login">Entrar</button></p>
      </form>`);
  }

  function viewSignup() {
    return authShell(`<form class="card" id="signup" novalidate>
        <p class="steps"><span>1</span><i></i><b>2</b></p>
        <h1>Agora conte quem manda na casa, @${esc(pending.username)}.</h1>
        <label class="field"><span>Nome do(a) gatinho(a):</span><span class="paw"><input name="catName" maxlength="30" required autocomplete="off"></span></label>
        <label class="field"><span>Nome do(a) dono(a):</span><span class="paw"><input name="owner" maxlength="40" required autocomplete="name"></span></label>
        <label class="field"><span>Data de nascimento do(a) gato(a):</span><span class="paw"><input name="birth" type="date" max="${today()}" required></span></label>
        <div class="row2">
          <label class="field"><span>Raça:</span><span class="plain"><input name="breed" list="breeds" maxlength="40" required autocomplete="off"></span></label>
          <label class="field"><span>Gênero:</span><span class="paw"><select name="gender" required><option value="">—</option><option>Fêmea</option><option>Macho</option></select></span></label>
        </div>
        ${breedList}
        <p class="error" role="alert"></p>
        <button class="btn btn-big">Meowdastre-se</button>
        <p class="switch"><button type="button" class="link" data-act="go-account">← Voltar</button></p>
      </form>`);
  }
  const viewAuth = () => (authView === 'login' ? viewLogin() : authView === 'cat' && pending ? viewSignup() : viewAccount());

  function chatList(activeId) {
    const ids = Object.keys(S.chats).filter(findCat);
    return `<ul class="chat-list">${ids.map((id) => {
      const c = findCat(id);
      const last = S.chats[id][S.chats[id].length - 1];
      return `<li><a href="#/chats/${id}" class="${id === activeId ? 'on' : ''}"><span class="avatar">${catSVG(c.coat, c.eyes)}</span>
        <span><b>${esc(c.catName)}</b><small>${esc(last ? last.text : 'Diga miau!')}</small></span></a></li>`;
    }).join('')}</ul>`;
  }
  const chatPanel = (activeId) => `<div class="chat-panel"><h2>C(h)ats</h2><p class="muted">Um meow-papo para donos e gatos</p>${chatList(activeId)}</div>`;

  function viewHome() {
    const tiles = [
      ['tikcats', I.tik, 'TikCats', 'Vídeos e trends de gatos'],
      ['catbooks', I.book, 'CatBooks', 'Álbuns de fotos'],
      ['twincats', I.twin, 'TwinCats?', 'Encontre seu(s) gêmeo(s)'],
      ['curiouscats', I.curious, 'CuriousCats', 'Curiosidades sobre gatos']
    ];
    return `<div class="hello"><h1 class="page-title">Miau, ${esc(S.user.catName)}!</h1><p class="page-sub">A rede social para pai ou mãe de gatos.</p></div>
      <div class="tiles">${tiles.map(([r, ic, t, d]) => `<a class="tile" href="#/${r}">${ic}<b>${t}</b><small>${d}</small></a>`).join('')}</div>
      <div class="home-chats only-mobile">${chatPanel()}</div>`;
  }

  function viewTik() {
    const mine = [...S.tiks].reverse().map((t) => `<article class="tik">
        <video data-media="${t.mediaId}" loop playsinline preload="metadata" data-act="playpause"></video>
        <div class="tik-info"><b>${esc(S.user.catName)}</b>${esc(t.caption)} <span>${esc(t.trend)}</span></div>
        <div class="tik-side">
          <button class="${t.liked ? 'on' : ''}" data-act="like-tik" data-id="${t.id}" aria-label="Curtir" aria-pressed="${!!t.liked}">${I.heart}</button>
          <button data-act="del-tik" data-id="${t.id}" aria-label="Excluir vídeo">${I.trash}</button>
        </div></article>`).join('');
    const seeds = SEED_TIKS.map((t) => {
      const c = findCat(t.cat), liked = S.likedSeeds.includes(t.id);
      return `<article class="tik demo" style="background:${t.bg}"><span class="badge">Demonstração</span>
        <div class="demo-cat">${catSVG(c.coat, c.eyes).replace('<rect width="100" height="100" fill="#e6f6ff"/>', '')}</div>
        <div class="tik-info"><b><a href="#/gato/${c.id}">${esc(c.catName)}</a></b>${esc(t.caption)} <span>${t.trend}</span></div>
        <div class="tik-side"><button class="${liked ? 'on' : ''}" data-act="like-seed" data-id="${t.id}" aria-label="Curtir" aria-pressed="${liked}">${I.heart}</button><small>${t.likes + (liked ? 1 : 0)}</small></div></article>`;
    }).join('');
    return `<div class="head-row"><div><h1 class="page-title">TikCats</h1><p class="page-sub">Vídeos de gatos e trends de gatos</p></div>
        <button class="btn" data-act="new-tik">+ Postar vídeo</button></div>
      <div class="chips">${TRENDS.map((t) => `<span class="chip">${t}</span>`).join('')}</div>
      <div class="feed">${mine}${seeds}</div>`;
  }

  function viewBooks() {
    const albums = S.albums.map((a) => `<a class="album" href="#/catbooks/${a.id}">
        <div class="cover">${a.items[0] ? `<img data-media="${a.items[0]}" alt="">` : I.book}</div>
        <b>${esc(a.name)}</b><small class="muted">${a.items.length} foto${a.items.length === 1 ? '' : 's'}</small></a>`).join('');
    return `<div class="head-row"><div><h1 class="page-title">CatBooks</h1><p class="page-sub">Fotos de gatos. Bem como o nome diz: álbum.</p></div>
        <button class="btn" data-act="new-album">+ Novo álbum</button></div>
      ${albums ? `<div class="grid">${albums}</div>` : `<div class="card empty">Nenhum álbum ainda. Crie o primeiro e encha de fotos do(a) ${esc(S.user.catName)}!</div>`}`;
  }

  function viewAlbum(id) {
    const a = S.albums.find((x) => x.id === id);
    if (!a) return viewBooks();
    return `<div class="head-row"><div><h1 class="page-title">${esc(a.name)}</h1><p class="page-sub"><a href="#/catbooks">← Todos os álbuns</a></p></div>
        <div class="actions" style="margin:0"><button class="btn" data-act="add-photos" data-id="${a.id}">+ Fotos</button>
        <button class="btn danger" data-act="del-album" data-id="${a.id}">Excluir álbum</button></div></div>
      ${a.items.length ? `<div class="grid">${a.items.map((m) => `<button class="photo" data-act="open-photo" data-id="${a.id}" data-m="${m}"><img data-media="${m}" alt="Foto do álbum ${esc(a.name)}" loading="lazy"></button>`).join('')}</div>`
        : '<div class="card empty">Álbum vazio. Toque em “+ Fotos”.</div>'}`;
  }

  function twinScore(c) {
    const u = S.user;
    let s = 0;
    if (c.breed.toLowerCase() === u.breed.trim().toLowerCase()) s += 45;
    if (c.gender === u.gender) s += 15;
    if (c.coat === u.coat) s += 20;
    const d = Math.abs((age(c.birth) ?? 0) - (age(u.birth) ?? 0));
    s += d <= 12 ? 20 : d <= 36 ? 10 : 0;
    return s;
  }
  function viewTwins() {
    const list = COMMUNITY.map((c) => ({ c, s: twinScore(c) })).sort((a, b) => b.s - a.s);
    return `<h1 class="page-title">TwinCats</h1><p class="page-sub">Para encontrar seu(s) gêmeo(s). Comparamos raça, pelagem, gênero e idade.</p>
      <div class="list">${list.map(({ c, s }) => `<div class="card twin">
        <a class="avatar big" href="#/gato/${c.id}" aria-label="Perfil de ${esc(c.catName)}">${catSVG(c.coat, c.eyes)}</a>
        <div class="grow"><b>${esc(c.catName)}</b><span class="muted">${esc(c.breed)} · ${ageText(c.birth)}</span>
          <div class="meter"><i style="width:${s}%"></i></div></div>
        <span class="pct">${s}%</span>
        <a class="btn small" href="#/chats/${c.id}">Miau</a></div>`).join('')}</div>
      <p class="muted" style="margin-top:14px">Dica: escolha a cor da pelagem no seu PerfilCat para melhorar as combinações. Os gatos da comunidade são de demonstração.</p>`;
  }

  let factFilter = 'Todas';
  function factCard(f, extra = '') {
    const on = S.savedFacts.includes(f.id);
    return `<article class="card fact ${extra}"><small>${extra ? 'Curiosidade do dia · ' : ''}${f.cat}</small><h3>${f.title}</h3><p>${f.text}</p>
      <button class="save ${on ? 'on' : ''}" data-act="save-fact" data-id="${f.id}" aria-label="Salvar curiosidade" aria-pressed="${on}">${I.heart}</button></article>`;
  }
  function viewCurious() {
    const cats = ['Todas', ...new Set(FACTS.map((f) => f.cat)), 'Salvas'];
    const day = FACTS[Math.floor(Date.now() / 864e5) % FACTS.length];
    const list = FACTS.filter((f) => factFilter === 'Todas' || (factFilter === 'Salvas' ? S.savedFacts.includes(f.id) : f.cat === factFilter));
    return `<h1 class="page-title">CuriousCats</h1><p class="page-sub">Aprenda alguma curiosidade sobre gatos e outras diversas coisas sobre eles.</p>
      <div class="list" style="margin-bottom:14px">${factCard(day, 'today')}</div>
      <div class="chips">${cats.map((c) => `<button class="chip ${c === factFilter ? 'on' : ''}" data-act="filter-fact" data-id="${c}">${c}</button>`).join('')}</div>
      <div class="list">${list.map((f) => factCard(f)).join('') || '<div class="card empty">Nada salvo ainda. Toque no coração de uma curiosidade.</div>'}</div>`;
  }

  function viewChats() {
    return `<h1 class="page-title">C(h)ats</h1><p class="page-sub">Um meow-papo para donos e gatos</p>${chatPanel()}`;
  }
  function viewConvo(id) {
    const c = findCat(id);
    if (!c) return viewChats();
    const msgs = S.chats[id] || [];
    return `<div class="card convo">
      <div class="convo-head"><a class="icon-btn only-mobile" href="#/chats" aria-label="Voltar">←</a>
        <a class="avatar" href="#/gato/${id}">${catSVG(c.coat, c.eyes)}</a>
        <div><b>${esc(c.catName)}</b><br><small class="muted">com ${esc(c.owner)} · conversa de demonstração</small></div></div>
      <div class="msgs" id="msgs">${msgs.map((m) => `<div class="msg ${m.from === 'me' ? 'me' : ''}">${esc(m.text)}</div>`).join('') || '<p class="empty">Diga miau para começar!</p>'}</div>
      <form id="send" data-id="${id}"><input name="text" placeholder="Escreva um miau…" maxlength="500" autocomplete="off" aria-label="Mensagem"><button class="btn">Enviar</button></form></div>`;
  }

  // Silhueta do corpo e do rabo, em coordenadas do desenho (1040 x 332).
  // PerfilCat: capa retangular; a foto é recortada em formato de cabeça de gato (com orelhas) e
  // abre um vão na capa e no cartão por onde aparece o fundo da página.
  function profileHTML(p, face, mine, action, stats) {
    const tag = mine ? 'button' : 'div';
    return `<section class="pf" style="--coat:${p.coat}">
      <div class="pf-top">
        <div class="pf-shadow"><${tag} class="pf-cover" ${mine ? 'data-act="edit-profile" aria-label="Editar capa do perfil"' : ''}>${p.cover ? `<img src="${p.cover}" alt="">` : mine ? '<span class="pf-hint">+ Adicionar capa</span>' : ''}</${tag}></div>
        <${tag} class="pf-face" ${mine ? 'data-act="edit-profile" aria-label="Editar foto do perfil"' : ''}>${face}</${tag}>
      </div>
      <div class="pf-shadow"><div class="card pf-card">
        <div class="pf-id">
          <div class="pf-name"><h1>${esc(p.catName)}</h1><p>${[p.username && '@' + esc(p.username), p.owner && 'com ' + esc(p.owner)].filter(Boolean).join(' · ')}</p></div>
          ${action}
        </div>
        ${p.bio ? `<p class="pf-bio">${esc(p.bio)}</p>` : ''}
        <ul class="pf-tags"><li>${esc(p.breed)}</li><li>${esc(p.gender)}</li><li>${ageText(p.birth)}</li>${p.hideBirth ? '' : `<li>Nasceu em ${dateBR(p.birth)}</li>`}</ul>
        <div class="pf-stats">${stats.map(([n, label]) => `<div><b>${n}</b><span>${label}</span></div>`).join('')}</div>
      </div></div></section>`;
  }
  function viewProfile() {
    const albums = S.albums.slice(0, 4).map((a) => `<a class="album" href="#/catbooks/${a.id}"><div class="cover">${a.items[0] ? `<img data-media="${a.items[0]}" alt="">` : I.book}</div><b>${esc(a.name)}</b></a>`).join('');
    const photos = S.albums.reduce((n, a) => n + a.items.length, 0);
    return `${profileHTML({ ...S.user, owner: S.settings.showOwner ? S.user.owner : '', hideBirth: !S.settings.showBirth }, S.user.photo ? userFace() : catFace(S.user.coat), true,
        '<button class="btn" data-act="edit-profile">Editar perfil</button>',
        [[S.albums.length, S.albums.length === 1 ? 'álbum' : 'álbuns'], [photos, photos === 1 ? 'foto' : 'fotos'], [S.tiks.length, S.tiks.length === 1 ? 'vídeo' : 'vídeos']])}
      <h2 class="section-title">CatBooks</h2>
      ${albums ? `<div class="grid">${albums}</div>` : '<div class="card empty">Seus álbuns aparecem aqui. <a href="#/catbooks"><u>Criar um álbum</u></a></div>'}`;
  }
  function viewCat(id) {
    const c = findCat(id);
    if (!c) return viewHome();
    return `${profileHTML(c, catFace(c.coat, c.eyes), false, `<a class="btn" href="#/chats/${c.id}">Mandar um miau</a>`, [[twinScore(c) + '%', 'gêmeo seu']])}
      <p class="muted" style="margin-top:12px">Perfil de demonstração.</p>`;
  }

  function viewSettings() {
    const u = S.user;
    return `<h1 class="page-title">Configurações</h1><p class="page-sub">Sua conta no MEOWorld</p>
      <div class="list settings">
        <section class="card"><h2>Conta</h2>
          <div class="set-row"><span class="avatar big">${userFace()}</span>
            <div class="grow"><b>${esc(u.catName)}</b><small>@${esc(u.username || session)} · com ${esc(u.owner)}</small></div>
            <button class="btn small ghost" data-act="edit-profile">Editar perfil</button></div>
        </section>
        <section class="card"><h2>Nome de usuário</h2>
          <form id="user-form" novalidate>
            <label class="field"><span>Novo usuário</span><span class="plain"><input name="username" maxlength="20" required autocomplete="username" autocapitalize="none" spellcheck="false" value="${esc(u.username || session)}"></span>
              <small class="hint">3 a 20 caracteres: letras, números, ponto ou _</small></label>
            <label class="field"><span>Senha (para confirmar)</span><span class="plain"><input name="current" type="password" maxlength="64" required autocomplete="current-password"></span></label>
            <p class="error" role="alert"></p>
            <button class="btn">Trocar usuário</button>
          </form>
        </section>
        <section class="card"><h2>Senha</h2>
          <form id="pw-form" novalidate>
            <label class="field"><span>Senha atual</span><span class="plain"><input name="current" type="password" maxlength="64" required autocomplete="current-password"></span></label>
            <label class="field"><span>Nova senha</span><span class="plain"><input name="password" type="password" maxlength="64" required autocomplete="new-password"></span></label>
            <label class="field"><span>Confirmar nova senha</span><span class="plain"><input name="confirm" type="password" maxlength="64" required autocomplete="new-password"></span></label>
            <p class="error" role="alert"></p>
            <button class="btn">Alterar senha</button>
          </form>
        </section>
        <section class="card"><h2>Privacidade</h2>
          <label class="switch-row"><span><b>Mostrar o nome do(a) dono(a)</b><small>Aparece no perfil como “com Fulano”.</small></span><input type="checkbox" role="switch" data-act="set" data-id="showOwner" ${S.settings.showOwner ? 'checked' : ''}></label>
          <label class="switch-row"><span><b>Mostrar a data de nascimento</b><small>A idade continua aparecendo.</small></span><input type="checkbox" role="switch" data-act="set" data-id="showBirth" ${S.settings.showBirth ? 'checked' : ''}></label>
          <label class="switch-row"><span><b>Perfil privado</b><small>Só quem você aprovar vê álbuns e vídeos. Passa a valer quando houver outros usuários de verdade.</small></span><input type="checkbox" role="switch" data-act="set" data-id="privateProfile" ${S.settings.privateProfile ? 'checked' : ''}></label>
        </section>
        <section class="card"><h2>Aparência</h2>
          <label class="switch-row"><span><b>Fundo animado</b><small>Desligue para deixar o degradê do fundo parado.</small></span><input type="checkbox" role="switch" data-act="set" data-id="motion" ${S.settings.motion ? 'checked' : ''}></label>
        </section>
        <section class="card"><h2>Sessão</h2>
          <p>Sair não apaga nada: seu perfil, álbuns e conversas continuam guardados neste navegador.</p>
          <button class="btn ghost" data-act="logout">Sair da conta</button>
        </section>
        <section class="card danger-zone"><h2>Excluir conta</h2>
          <p>Apaga o perfil, os álbuns, os vídeos e as conversas de @${esc(u.username || session)} neste navegador. Não dá para desfazer.</p>
          <button class="btn danger" data-act="delete-account">Excluir conta</button>
        </section>
      </div>`;
  }

  // ---------- Roteamento ----------
  const NAV = [['', 'Início', I.home], ['tikcats', 'TikCats', I.tik], ['catbooks', 'CatBooks', I.book], ['twincats', 'TwinCats', I.twin], ['curiouscats', 'Curious', I.curious]];

  // ---------- Doca de C(h)ats (computador): fica fechada no canto inferior direito e abre ao clicar ----------
  // Cria a doca se o index.html em cache ainda não a tiver.
  const dock = document.getElementById('dock') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'dock' }));
  const isDesktop = () => window.matchMedia('(min-width: 900px)').matches;
  let dockOpen = false, dockChat = null;

  function renderDock(clearDraft = false) {
    if (!session || !S.user) { dock.innerHTML = ''; dockOpen = false; dockChat = null; return; }
    const old = dock.querySelector('#dock-send input');
    const draft = old && !clearDraft ? old.value : '';
    const focused = !!old && document.activeElement === old;
    const c = dockChat && findCat(dockChat);
    const win = c ? `<section class="dock-win" aria-label="Conversa com ${esc(c.catName)}">
        <header><a class="avatar" href="#/gato/${c.id}">${catSVG(c.coat, c.eyes)}</a>
          <div class="grow"><b>${esc(c.catName)}</b><small>com ${esc(c.owner)} · demonstração</small></div>
          <button class="dock-x" data-act="dock-close" aria-label="Fechar conversa">×</button></header>
        <div class="msgs" id="dock-msgs">${(S.chats[c.id] || []).map((m) => `<div class="msg ${m.from === 'me' ? 'me' : ''}">${esc(m.text)}</div>`).join('') || '<p class="empty">Diga miau para começar!</p>'}</div>
        <form id="dock-send" data-id="${c.id}"><input name="text" placeholder="Escreva um miau…" maxlength="500" autocomplete="off" aria-label="Mensagem"><button class="btn small">Enviar</button></form>
      </section>` : '';
    const ids = Object.keys(S.chats).filter(findCat);
    dock.innerHTML = `${win}<section class="dock-list">
        <button class="dock-bar" data-act="dock-toggle" aria-expanded="${dockOpen}"><span class="avatar">${userFace()}</span><b>C(h)ats</b><span class="dock-chev" aria-hidden="true">${dockOpen ? '▾' : '▴'}</span></button>
        ${dockOpen ? `<p class="muted">Um meow-papo para donos e gatos</p><ul class="chat-list">${ids.map((id) => {
          const k = findCat(id), last = S.chats[id][S.chats[id].length - 1];
          return `<li><a href="#/chats/${id}" class="${id === dockChat ? 'on' : ''}"><span class="avatar">${catSVG(k.coat, k.eyes)}</span><span><b>${esc(k.catName)}</b><small>${esc(last ? last.text : 'Diga miau!')}</small></span></a></li>`;
        }).join('')}</ul>` : ''}
      </section>`;
    const m = dock.querySelector('#dock-msgs');
    if (m) m.scrollTop = m.scrollHeight;
    const input = dock.querySelector('#dock-send input');
    if (input) { input.value = draft; if (focused || clearDraft) input.focus(); }
  }
  function openDockChat(id) {
    dockChat = id; renderDock();
    dock.querySelector('#dock-send input')?.focus();
  }
  // Atualiza a conversa onde ela estiver aberta (página no celular, doca no computador).
  function refreshChat(id, clearDraft = false) {
    const page = document.querySelector(`#send[data-id="${id}"]`);
    if (page) {
      const input = page.querySelector('input'), draft = clearDraft ? '' : input.value, focused = document.activeElement === input;
      render();
      const i = document.querySelector('#send input');
      if (i) { i.value = draft; if (focused || clearDraft) i.focus(); }
    } else renderDock(clearDraft && dockChat === id);
  }

  const applyPrefs = () => document.body.classList.toggle('no-motion', !!session && !S.settings.motion);

  function render() {
    applyPrefs();
    renderDock();
    if (!session || !S.user) { app.innerHTML = viewAuth(); return; }
    const [route = '', arg] = location.hash.replace(/^#\/?/, '').split('/');
    const views = {
      '': viewHome, tikcats: viewTik, catbooks: () => (arg ? viewAlbum(arg) : viewBooks()), twincats: viewTwins,
      curiouscats: viewCurious, chats: () => (arg ? viewConvo(arg) : viewChats()), perfil: viewProfile, config: viewSettings, gato: () => viewCat(arg)
    };
    const view = (views[route] || viewHome)();
    app.innerHTML = `<div class="shell">
      <header class="topbar"><a href="#/">${LOGO}</a>
        <div class="topbar-actions only-mobile"><a class="icon-btn" href="#/config" aria-label="Configurações">${I.gear}</a><a class="icon-btn" href="#/chats" aria-label="C(h)ats">${I.chat}</a>
        <a class="avatar" href="#/perfil" aria-label="Meu PerfilCat">${userFace()}</a></div></header>
      <nav class="nav" aria-label="Principal">${NAV.map(([r, t, ic]) => `<a href="#/${r}" class="${r === route ? 'on' : ''}" ${r === route ? 'aria-current="page"' : ''}>${ic}<span>${t}</span></a>`).join('')}
        <a href="#/chats" class="only-desktop">${I.chat}<span>C(h)ats</span></a>
        <a href="#/config" class="nav-cfg only-desktop ${route === 'config' ? 'on' : ''}" ${route === 'config' ? 'aria-current="page"' : ''}>${I.gear}<span>Configurações</span></a>
        <a href="#/perfil" class="nav-me only-desktop ${route === 'perfil' ? 'on' : ''}" ${route === 'perfil' ? 'aria-current="page"' : ''}><span class="avatar">${userFace()}</span><span><b>${esc(S.user.catName)}</b><small>@${esc(S.user.username || 'perfil')}</small></span></a></nav>
      <main class="main">${view}</main></div>`;
    hydrate();
    const msgs = document.getElementById('msgs');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

  // ---------- Ações ----------
  // ---------- Editar perfil (rascunho) e ajuste de foto/capa ----------
  let draft = null; // cópia do perfil enquanto o formulário está aberto; só vira S.user no Salvar
  let crop = null;

  function showEdit() {
    const u = draft;
    const mediaRow = (kind, title, thumb) => `<div class="media-row">${thumb}<div><b>${title}</b><div class="actions">
        <button type="button" class="btn small ghost" data-act="pick-${kind}">${u[kind] ? 'Trocar' : 'Escolher imagem'}</button>
        ${u[kind] ? `<button type="button" class="btn small danger" data-act="clear-${kind}">Remover</button>` : ''}</div></div></div>`;
    openModal(`<form id="profile-form"><h2>Editar PerfilCat</h2>
      <div class="media-edit">
        ${mediaRow('photo', 'Foto de perfil', `<span class="avatar big">${u.photo ? `<img src="${u.photo}" alt="">` : catSVG(u.coat)}</span>`)}
        ${mediaRow('cover', 'Capa (corpo do gato)', `<span class="cover-thumb" style="background-color:${esc(u.coat)}">${u.cover ? `<img src="${u.cover}" alt="">` : ''}</span>`)}
      </div>
      <label class="field"><span>Nome do(a) gatinho(a)</span><span class="plain"><input name="catName" maxlength="30" required value="${esc(u.catName)}"></span></label>
      <label class="field"><span>Nome do(a) dono(a)</span><span class="plain"><input name="owner" maxlength="40" required value="${esc(u.owner)}"></span></label>
      <label class="field"><span>Nascimento</span><span class="plain"><input name="birth" type="date" max="${today()}" required value="${esc(u.birth)}"></span></label>
      <label class="field"><span>Raça</span><span class="plain"><input name="breed" list="breeds" maxlength="40" required value="${esc(u.breed)}"></span></label>${breedList}
      <label class="field"><span>Gênero</span><span class="plain"><select name="gender">${['Fêmea', 'Macho'].map((g) => `<option ${g === u.gender ? 'selected' : ''}>${g}</option>`).join('')}</select></span></label>
      <div class="field"><span>Pelagem (cor do gato no perfil)</span><div class="swatches">${COATS.map((c) => `<label title="${c.name}"><input type="radio" name="coat" value="${c.color}" ${c.color === u.coat ? 'checked' : ''} aria-label="${c.name}"><i style="background:${c.color}"></i></label>`).join('')}</div></div>
      <label class="field"><span>Bio</span><span class="plain"><textarea name="bio" maxlength="140" rows="2">${esc(u.bio || '')}</textarea></span></label>
      <p class="error" role="alert"></p>
      <div class="actions"><button type="button" class="btn ghost" data-close>Cancelar</button><button class="btn">Salvar</button></div></form>`);
  }
  // O que foi digitado vai para o rascunho, para não se perder ao abrir o ajuste de imagem.
  document.addEventListener('input', (e) => {
    if (draft && e.target.form && e.target.form.id === 'profile-form' && e.target.name) draft[e.target.name] = e.target.value;
  });

  async function startCrop(kind) {
    const [file] = await pickFile('image/*');
    if (!file) return;
    const img = new Image();
    img.onerror = () => alert('Não consegui abrir essa imagem.');
    img.onload = () => {
      const out = kind === 'photo' ? [320, 320] : [1200, 400];
      openModal(`<div class="cropper"><h2>${kind === 'photo' ? 'Ajustar foto de perfil' : 'Ajustar capa'}</h2>
        <p class="muted">Arraste a imagem para posicionar e use o zoom para aproximar.</p>
        <div class="crop-view ${kind}" id="crop-view" tabindex="0" aria-label="Área de recorte: use as setas para mover" style="aspect-ratio:${out[0]}/${out[1]}"></div>
        <label class="zoom"><span>Zoom</span><input type="range" id="crop-zoom" min="1" max="4" step="0.01" value="1"></label>
        <div class="actions"><button type="button" class="btn ghost" data-act="crop-cancel">Voltar</button><button type="button" class="btn" data-act="crop-apply">Usar esta imagem</button></div></div>`, 'cropping');
      const view = modal.querySelector('#crop-view'), zoom = modal.querySelector('#crop-zoom');
      img.alt = ''; img.draggable = false;
      view.appendChild(img);
      const V = [view.clientWidth, view.clientHeight];
      const s0 = Math.max(V[0] / img.naturalWidth, V[1] / img.naturalHeight);
      crop = { kind, img, out, V, s0, z: 1, x: (V[0] - img.naturalWidth * s0) / 2, y: (V[1] - img.naturalHeight * s0) / 2 };
      placeCrop();
      const setZoom = (z) => {
        z = Math.min(4, Math.max(1, z));
        const o = crop.s0 * crop.z, n = crop.s0 * z;
        crop.x = V[0] / 2 - ((V[0] / 2 - crop.x) / o) * n;
        crop.y = V[1] / 2 - ((V[1] / 2 - crop.y) / o) * n;
        crop.z = z; zoom.value = z; placeCrop();
      };
      let last = null;
      view.onpointerdown = (e) => { last = [e.clientX, e.clientY]; view.setPointerCapture(e.pointerId); };
      view.onpointermove = (e) => { if (!last) return; crop.x += e.clientX - last[0]; crop.y += e.clientY - last[1]; last = [e.clientX, e.clientY]; placeCrop(); };
      view.onpointerup = view.onpointercancel = () => { last = null; };
      view.onwheel = (e) => { e.preventDefault(); setZoom(crop.z * (e.deltaY < 0 ? 1.08 : 1 / 1.08)); };
      view.onkeydown = (e) => {
        const d = { ArrowLeft: [12, 0], ArrowRight: [-12, 0], ArrowUp: [0, 12], ArrowDown: [0, -12] }[e.key];
        if (!d) return;
        e.preventDefault(); crop.x += d[0]; crop.y += d[1]; placeCrop();
      };
      zoom.oninput = () => setZoom(+zoom.value);
    };
    img.src = URL.createObjectURL(file);
  }
  function placeCrop() {
    const { img, V } = crop, sc = crop.s0 * crop.z, w = img.naturalWidth * sc, h = img.naturalHeight * sc;
    crop.x = Math.min(0, Math.max(V[0] - w, crop.x));
    crop.y = Math.min(0, Math.max(V[1] - h, crop.y));
    img.style.width = w + 'px'; img.style.height = h + 'px';
    img.style.transform = `translate(${crop.x}px, ${crop.y}px)`;
  }
  function cropResult() {
    const { img, V, out } = crop, sc = crop.s0 * crop.z;
    const c = document.createElement('canvas');
    c.width = out[0]; c.height = out[1];
    c.getContext('2d').drawImage(img, -crop.x / sc, -crop.y / sc, V[0] / sc, V[1] / sc, 0, 0, out[0], out[1]);
    return c.toDataURL('image/jpeg', 0.85);
  }

  const actions = {
    'like-seed': (id) => { S.likedSeeds = S.likedSeeds.includes(id) ? S.likedSeeds.filter((x) => x !== id) : [...S.likedSeeds, id]; keepFeed(); },
    'like-tik': (id) => { const t = S.tiks.find((x) => x.id === id); t.liked = !t.liked; keepFeed(); },
    'del-tik': async (id) => {
      if (!confirm('Excluir este vídeo?')) return;
      const t = S.tiks.find((x) => x.id === id);
      S.tiks = S.tiks.filter((x) => x.id !== id);
      save(); await delMedia(t.mediaId); render();
    },
    playpause: (_, el) => (el.paused ? el.play() : el.pause()),
    'new-tik': () => openModal(`<form id="tik-form"><h2>Postar no TikCats</h2>
      <label class="field"><span>Vídeo</span><span class="plain"><input type="file" name="file" accept="video/*" required style="padding-top:14px"></span></label>
      <label class="field"><span>Legenda</span><span class="plain"><input name="caption" maxlength="120" required></span></label>
      <label class="field"><span>Trend</span><span class="plain"><select name="trend"><option value="">Sem trend</option>${TRENDS.map((t) => `<option>${t}</option>`).join('')}</select></span></label>
      <p class="error" role="alert"></p>
      <div class="actions"><button type="button" class="btn ghost" data-close>Cancelar</button><button class="btn">Postar</button></div></form>`),
    'new-album': () => openModal(`<form id="album-form"><h2>Novo álbum</h2>
      <label class="field"><span>Nome do álbum</span><span class="plain"><input name="name" maxlength="40" required></span></label>
      <div class="actions"><button type="button" class="btn ghost" data-close>Cancelar</button><button class="btn">Criar</button></div></form>`),
    'add-photos': async (id) => {
      const files = await pickFile('image/*', true);
      const a = S.albums.find((x) => x.id === id);
      for (const f of files) {
        try {
          const c = await shrink(f, 1280);
          const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
          a.items.push(await putMedia(blob));
        } catch { alert(`Não consegui adicionar “${f.name}”.`); }
      }
      save(); render();
    },
    'del-album': async (id) => {
      const a = S.albums.find((x) => x.id === id);
      if (!confirm(`Excluir o álbum “${a.name}” e todas as fotos dele?`)) return;
      S.albums = S.albums.filter((x) => x.id !== id);
      save(); await Promise.all(a.items.map(delMedia));
      location.hash = '#/catbooks';
    },
    'open-photo': (id, el) => {
      openModal(`<img data-media="${el.dataset.m}" alt="Foto ampliada"><div class="actions">
        <button class="btn danger" data-act="del-photo" data-id="${id}" data-m="${el.dataset.m}">Excluir foto</button><button class="btn ghost" data-close>Fechar</button></div>`, 'lightbox');
      hydrate(modal);
    },
    'del-photo': async (id, el) => {
      if (!confirm('Excluir esta foto?')) return;
      const a = S.albums.find((x) => x.id === id);
      a.items = a.items.filter((m) => m !== el.dataset.m);
      save(); await delMedia(el.dataset.m); modal.close(); render();
    },
    'save-fact': (id) => { S.savedFacts = S.savedFacts.includes(id) ? S.savedFacts.filter((x) => x !== id) : [...S.savedFacts, id]; save(); render(); },
    'filter-fact': (id) => { factFilter = id; render(); },
    'edit-profile': () => { draft = { ...S.user }; showEdit(); },
    'pick-photo': () => startCrop('photo'),
    'pick-cover': () => startCrop('cover'),
    'clear-photo': () => { draft.photo = ''; showEdit(); },
    'clear-cover': () => { draft.cover = ''; showEdit(); },
    'crop-cancel': () => showEdit(),
    'crop-apply': () => { draft[crop.kind] = cropResult(); showEdit(); },
    'go-login': () => { authView = 'login'; render(); },
    'go-account': () => { authView = 'account'; render(); },
    'toggle-pw': (_, el) => el.form.querySelectorAll('[name=password], [name=confirm]').forEach((i) => { i.type = el.checked ? 'text' : 'password'; }),
    set: (id, el) => { S.settings[id] = el.checked; save(); applyPrefs(); },
    'dock-toggle': () => { dockOpen = !dockOpen; renderDock(); },
    'dock-close': () => { dockChat = null; renderDock(); },
    logout: () => { setSession(null); authView = 'login'; location.hash = ''; render(); },
    'delete-account': async () => {
      if (!confirm(`Excluir a conta @${session}? Isso apaga o perfil, álbuns, vídeos e conversas dela neste navegador.`)) return;
      const media = [...S.albums.flatMap((a) => a.items), ...S.tiks.map((t) => t.mediaId)];
      try { await Promise.all(media.map(delMedia)); } catch { /* sem mídia para limpar */ }
      localStorage.removeItem(`${KEY}:${session}`);
      delete accounts[session]; saveAccounts();
      setSession(null); authView = Object.keys(accounts).length ? 'login' : 'account';
      location.hash = ''; render();
    }
  };

  // Curtir não deve fazer o feed voltar ao topo.
  function keepFeed() {
    const y = document.querySelector('.feed')?.scrollTop ?? 0;
    save(); render();
    const f = document.querySelector('.feed');
    if (f) f.scrollTop = y;
  }

  document.addEventListener('click', (e) => {
    if (isDesktop() && e.target.closest('a[href="#/chats"]')) { e.preventDefault(); dockOpen = true; renderDock(); dock.querySelector('.chat-list a')?.focus(); return; }
    const chat = e.target.closest('a[href^="#/chats/"]');
    if (chat && isDesktop()) { e.preventDefault(); openDockChat(chat.getAttribute('href').slice(8)); return; }
    const el = e.target.closest('[data-act]');
    if (el && actions[el.dataset.act]) actions[el.dataset.act](el.dataset.id, el);
  });

  document.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const d = Object.fromEntries(new FormData(f));
    const err = f.querySelector('.error');
    const str = (k) => String(d[k] || '').trim();

    if (f.id === 'user-form') {
      const name = str('username').toLowerCase(), acc = accounts[session];
      err.classList.remove('ok');
      const problem = name === session ? 'Esse já é o seu usuário.'
        : !/^[a-z0-9._]{3,20}$/.test(name) ? 'O usuário precisa ter de 3 a 20 caracteres: letras sem acento, números, ponto ou _.'
        : accounts[name] ? 'Esse usuário já existe. Escolha outro.'
        : (await hashPw(String(d.current || ''), acc.salt)) !== acc.hash ? 'A senha não confere.' : '';
      if (problem) { err.textContent = problem; return; }
      const old = session;
      accounts[name] = acc; delete accounts[old]; saveAccounts();
      S.user.username = name;
      localStorage.setItem(`${KEY}:${name}`, JSON.stringify(S));
      localStorage.removeItem(`${KEY}:${old}`);
      session = name; localStorage.setItem(SES, name);
      render();
      const msg = document.querySelector('#user-form .error');
      if (msg) { msg.classList.add('ok'); msg.textContent = `Pronto! Agora você é @${name}.`; }
      return;
    }

    if (f.id === 'pw-form') {
      const acc = accounts[session], password = String(d.password || '');
      err.classList.remove('ok');
      const problem = (await hashPw(String(d.current || ''), acc.salt)) !== acc.hash ? 'A senha atual não confere.'
        : password.length < 6 ? 'A nova senha precisa ter pelo menos 6 caracteres.'
        : password !== String(d.confirm || '') ? 'As senhas novas não são iguais.' : '';
      if (problem) { err.textContent = problem; return; }
      const salt = uid() + uid();
      accounts[session] = { salt, hash: await hashPw(password, salt) };
      saveAccounts(); f.reset();
      err.classList.add('ok'); err.textContent = 'Senha alterada.';
      return;
    }

    if (f.id === 'login') {
      const name = str('username').toLowerCase(), acc = accounts[name];
      if (!acc || (await hashPw(String(d.password || ''), acc.salt)) !== acc.hash) { err.textContent = 'Usuário ou senha incorretos.'; return; }
      setSession(name); render();
      return;
    }

    if (f.id === 'signup-account') {
      const username = str('username').toLowerCase(), password = String(d.password || '');
      const problem = !/^[a-z0-9._]{3,20}$/.test(username) ? 'O usuário precisa ter de 3 a 20 caracteres: letras sem acento, números, ponto ou _.'
        : accounts[username] ? 'Esse usuário já existe. Escolha outro ou entre na sua conta.'
        : password.length < 6 ? 'A senha precisa ter pelo menos 6 caracteres.'
        : password !== String(d.confirm || '') ? 'As senhas não são iguais.' : '';
      if (problem) { err.textContent = problem; return; }
      pending = { username, password }; authView = 'cat'; render(); window.scrollTo(0, 0);
      return;
    }

    if (f.id === 'signup' || f.id === 'profile-form') {
      const u = { catName: str('catName'), owner: str('owner'), birth: str('birth'), breed: str('breed'), gender: str('gender') };
      const bad = Object.values(u).some((v) => !v) || isNaN(new Date(u.birth)) || u.birth > today();
      if (bad) {
        if (err) err.textContent = 'Preencha todos os campos (a data não pode ser no futuro).';
        else f.reportValidity();
        return;
      }
      if (f.id === 'signup') {
        if (!pending || accounts[pending.username]) { authView = 'account'; render(); return; }
        const salt = uid() + uid();
        accounts[pending.username] = { salt, hash: await hashPw(pending.password, salt) };
        saveAccounts(); setSession(pending.username);
        u.username = pending.username; pending = null; authView = 'login';
      }
      S.user = Object.assign({ coat: COATS[0].color, bio: '', photo: '' }, S.user, u, f.id === 'profile-form' ? { coat: str('coat') || S.user.coat, bio: str('bio'), photo: (draft && draft.photo) || '', cover: (draft && draft.cover) || '' } : {});
      draft = null;
      save(); modal.open && modal.close(); render();
    }

    if (f.id === 'album-form') {
      if (!str('name')) return;
      const a = { id: uid(), name: str('name'), items: [] };
      S.albums.push(a); save(); modal.close();
      location.hash = `#/catbooks/${a.id}`;
    }

    if (f.id === 'tik-form') {
      const file = f.file.files[0];
      if (!file || !file.type.startsWith('video/')) { err.textContent = 'Escolha um arquivo de vídeo.'; return; }
      if (file.size > 80 * 1024 * 1024) { err.textContent = 'Vídeo muito grande (máximo 80 MB).'; return; }
      try {
        const mediaId = await putMedia(file);
        S.tiks.push({ id: uid(), mediaId, caption: str('caption'), trend: str('trend'), liked: false, ts: Date.now() });
        save(); modal.close(); render();
      } catch { err.textContent = 'Não foi possível salvar o vídeo neste navegador.'; }
    }

    if (f.id === 'send' || f.id === 'dock-send') {
      const id = f.dataset.id, text = str('text');
      if (!text) return;
      (S.chats[id] = S.chats[id] || []).push({ from: 'me', text });
      save(); refreshChat(id, true);
      // Resposta automática: a comunidade é fictícia nesta versão.
      setTimeout(() => {
        if (!S.chats[id]) return;
        S.chats[id].push({ from: id, text: MEOW_REPLIES[Math.floor(Math.random() * MEOW_REPLIES.length)] });
        save(); refreshChat(id);
      }, 900);
    }
  });

  render();
})();
