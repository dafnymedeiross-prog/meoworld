/* MEOWorld — a rede social de quem ama gatos.
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
    posts: [],           // { id, mediaId, caption, ts }
    likedPosts: [],
    onboard: false,      // lista de primeiros passos (ligada no cadastro)
    chatColors: {},      // cor de cada conversa com gatos de demonstração
    stickers: [],        // { id, src } criados pela pessoa
    blocked: [],         // ids bloqueados
    reports: [],         // denúncias registradas
    twin: null,          // { photo, emb } da foto enviada ao TwinCats
    following: [],       // ids dos gatinhos seguidos
    settings: { showOwner: true, showBirth: true, privateProfile: false, showInTwins: true, motion: true },
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
    catch (e) { console.error('MEOWorld: falha ao salvar', e); alert(`Não foi possível salvar. O espaço deste navegador para o MEOWorld está cheio (${storageUsed()} de cerca de 5 MB) ou bloqueado. Remova a capa ou exclua contas de teste em Configurações e tente de novo.`); }
  };
  // Espaço ocupado pelo MEOWorld no localStorage (o limite dos navegadores fica perto de 5 MB).
  function storageUsed() {
    let n = 0;
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('meoworld')) n += k.length + localStorage.getItem(k).length; } } catch { return '?'; }
    return n > 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' MB' : Math.round(n / 1e3) + ' KB';
  }
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
  const findCat = (id) => allCats().find((c) => c.id === id);

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
  // Foto do gatinho (quando houver) ou o desenho na cor da pelagem.
  const catPic = (c) => (c.photo ? `<img src="${c.photo}" alt="" loading="lazy">` : catSVG(c.coat, c.eyes));
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
    shop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2 0-1.6-1.2-2 .3-3.2 1-.8 2.7-.3 4.2-.8A4 4 0 0 0 21 11c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15" cy="8" r="1"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4.5 6v5.500c0 4.5 3 8 7.5 9.5 4.5-1.5 7.5-5 7.5-9.500V6z"/><path d="m9 12 2.2 2.200L15.2 10"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1"/><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m5 18 5-5 3 3 2-2 4 4"/></svg>',
    dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
    sticker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-8z"/><path d="M14 3v4a3 3 0 0 0 3 3h4"/><path d="M8.5 14.500c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2"/></svg>',
    clip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m20 11-8.5 8.500a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.3 8.300a2 2 0 0 1-2.9-2.900L14.5 7"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>',
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
        <small class="hint" style="margin-top:-6px">Não sabe a raça? Escolha “SRD (vira-lata)”: é o caso da grande maioria dos gatos.</small>
        <p class="error" role="alert"></p>
        <button class="btn btn-big">Meowdastre-se</button>
        <p class="switch"><button type="button" class="link" data-act="go-account">← Voltar</button></p>
      </form>`);
  }
  const viewAuth = () => (authView === 'login' ? viewLogin() : authView === 'cat' && pending ? viewSignup() : viewAccount());

  // ---------- C(h)ats: mensagens, mídia, stickers, cor, "miaugitando" e apagar para todos ----------
  const EMOJIS = ['😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🐱', '🐈', '🐾', '❤️', '💙', '💛', '💜', '🧡', '✨', '🎉', '😂', '🥰', '😍', '😎', '😴', '🤔', '👍', '👏', '🙏', '🔥', '🐟', '🥛', '🧶', '📦', '🌙', '☀️', '🌈'];
  const CHAT_COLORS = ['#6aadcf', '#e0557a', '#8e7cc3', '#4caf7d', '#f2a65a', '#35789c'];
  const BASE_STICKERS = ['😻', '🙀', '😹', '😾', '🐾', '💤'];
  let chatUI = { id: null, panel: null }; // painel aberto (emoji, sticker ou cor) e em qual conversa
  let botTyping = null;                   // gato de demonstração que está "miaugitando"

  // Conversa com conta real (id "u:nome") fica numa chave compartilhada entre as duas contas;
  // conversa com gato de demonstração fica no estado da própria conta.
  const isDM = (id) => String(id).startsWith('u:');
  const dmKey = (id) => 'meoworld:dm:' + [session, id.slice(2)].sort().join('|');
  const meId = (id) => (isDM(id) ? session : 'me');
  function getConvo(id) {
    if (isDM(id)) { const c = readJSON(dmKey(id), null) || { msgs: [] }; c.typing = c.typing || {}; c.color = c.color || ''; return c; }
    const msgs = S.chats[id] || [];
    msgs.forEach((m, i) => { if (!m.id) m.id = 'o' + i; });
    return { msgs, color: S.chatColors[id] || '', typing: {} };
  }
  function putConvo(id, c) {
    if (isDM(id)) {
      try { localStorage.setItem(dmKey(id), JSON.stringify(c)); }
      catch { alert('Não foi possível salvar a conversa: o espaço deste navegador está cheio.'); }
    } else {
      S.chats[id] = c.msgs;
      if (c.color) S.chatColors[id] = c.color; else delete S.chatColors[id];
      save();
    }
  }
  const preview = (m) => (!m ? 'Diga miau!' : m.deleted ? 'Mensagem apagada' : m.kind === 'image' ? '📷 Foto' : m.kind === 'video' ? '🎬 Vídeo' : m.kind === 'gif' ? 'GIF' : m.kind === 'sticker' ? 'Sticker' : m.text);
  // Conversas da lista: gatos de demonstração com histórico e as outras contas deste navegador.
  const chatIds = () => [...localCats().filter((c) => !isBlocked(c.id) && !blockedMe(c)).map((c) => c.id), ...Object.keys(S.chats).filter((id) => findCat(id) && !isBlocked(id))];

  function msgHTML(m, id) {
    const mine = m.from === meId(id);
    if (m.deleted) return `<div class="msg ${mine ? 'me' : ''} gone">Mensagem apagada</div>`;
    const body = m.kind === 'image' || m.kind === 'gif' ? `<img class="msg-media" data-media="${m.mediaId}" alt="${m.kind === 'gif' ? 'GIF enviado' : 'Foto enviada'}">`
      : m.kind === 'video' ? `<video class="msg-media" data-media="${m.mediaId}" controls playsinline preload="metadata"></video>`
      : m.kind === 'sticker' ? (m.src ? `<img class="msg-sticker" src="${m.src}" alt="Sticker">` : `<span class="msg-sticker emoji">${esc(m.text)}</span>`)
      : esc(m.text);
    return `<div class="msg ${mine ? 'me' : ''} ${m.kind && m.kind !== 'text' ? 'rich' : ''}">${body}${mine ? `<button type="button" class="msg-del" data-act="msg-del" data-id="${id}" data-m="${m.id}" aria-label="Apagar para todos" title="Apagar para todos">×</button>` : ''}</div>`;
  }
  // Partes da conversa, usadas tanto na página (celular) quanto na doca (computador).
  function chatParts(id, formId, msgsId) {
    const c = findCat(id), cv = getConvo(id);
    const typing = isDM(id) ? Date.now() - (cv.typing[id.slice(2)] || 0) < 4000 : botTyping === id;
    const panel = chatUI.id === id ? chatUI.panel : null;
    const tool = (name, label, icon) => `<button type="button" class="chat-tool ${panel === name ? 'on' : ''}" data-act="chat-panel" data-id="${id}" data-m="${name}" aria-label="${label}" aria-expanded="${panel === name}">${icon}</button>`;
    return {
      style: cv.color ? `style="--chat:${cv.color}"` : '',
      tools: `${tool('color', 'Cor do chat', I.palette)}<button type="button" class="chat-tool" data-act="more" data-id="${id}" aria-label="Mais opções">${I.dots}</button>`,
      msgs: `<div class="msgs" id="${msgsId}">${cv.msgs.map((m) => msgHTML(m, id)).join('') || '<p class="empty">Diga miau para começar!</p>'}${typing ? `<div class="typing" role="status">${esc(c.catName)} está miaugitando<span aria-hidden="true">…</span></div>` : ''}</div>`,
      panel: panel === 'emoji' ? `<div class="chat-pop emojis">${EMOJIS.map((e) => `<button type="button" data-act="chat-emoji" data-id="${id}" data-m="${e}">${e}</button>`).join('')}</div>`
        : panel === 'sticker' ? `<div class="chat-pop stickers">${BASE_STICKERS.map((e) => `<button type="button" class="emoji" data-act="chat-sticker" data-id="${id}" data-m="e:${e}" aria-label="Sticker ${e}">${e}</button>`).join('')}${S.stickers.map((s) => `<span class="mine"><button type="button" data-act="chat-sticker" data-id="${id}" data-m="${s.id}" aria-label="Meu sticker"><img src="${s.src}" alt=""></button><button type="button" class="x" data-act="sticker-del" data-id="${id}" data-m="${s.id}" aria-label="Excluir sticker">×</button></span>`).join('')}<button type="button" class="new" data-act="sticker-new" data-id="${id}">+ Criar sticker</button></div>`
        : panel === 'color' ? `<div class="chat-pop colors"><button type="button" class="reset ${cv.color ? '' : 'on'}" data-act="chat-color" data-id="${id}" data-m="default">Padrão</button>${CHAT_COLORS.map((col) => `<button type="button" class="${cv.color === col ? 'on' : ''}" data-act="chat-color" data-id="${id}" data-m="${col}" style="background:${col}" aria-label="Cor ${col}"></button>`).join('')}<small>${isDM(id) ? 'A cor muda para vocês dois.' : 'Cor desta conversa.'}</small></div>` : '',
      form: `<form id="${formId}" data-id="${id}" class="chat-form">
          ${tool('emoji', 'Emojis', '😺')}${tool('sticker', 'Stickers', I.sticker)}
          <button type="button" class="chat-tool" data-act="chat-attach" data-id="${id}" aria-label="Enviar foto, vídeo ou GIF">${I.clip}</button>
          <input name="text" placeholder="Escreva um miau…" maxlength="500" autocomplete="off" aria-label="Mensagem"><button class="btn small">Enviar</button></form>`
    };
  }
  function sendMsg(id, m) {
    const cv = getConvo(id);
    cv.msgs.push({ id: uid(), from: meId(id), ts: Date.now(), ...m });
    if (isDM(id)) delete cv.typing[session];
    putConvo(id, cv);
    chatUI.panel = null;
    if (!isDM(id)) botTyping = id;
    refreshChat(id, true);
    if (isDM(id)) return;
    // Resposta automática dos gatos de demonstração.
    setTimeout(() => {
      botTyping = null;
      if (S.chats[id] && !isBlocked(id)) {
        const c2 = getConvo(id);
        c2.msgs.push({ id: uid(), from: id, kind: 'text', text: MEOW_REPLIES[Math.floor(Math.random() * MEOW_REPLIES.length)], ts: Date.now() });
        putConvo(id, c2);
      }
      refreshChat(id);
    }, 900);
  }
  // Entre duas abas com contas diferentes, a conversa atualiza sozinha (inclusive o "miaugitando").
  window.addEventListener('storage', (e) => {
    if (!session || !e.key || !e.key.startsWith('meoworld:dm:')) return;
    const names = e.key.slice(12).split('|');
    if (!names.includes(session)) return;
    const other = 'u:' + names.find((n) => n !== session);
    refreshChat(other);
    setTimeout(() => refreshChat(other), 4200);
  });
  let lastTyping = 0;
  document.addEventListener('input', (e) => {
    const f = e.target.form;
    if (!f || !f.classList.contains('chat-form') || e.target.name !== 'text' || !isDM(f.dataset.id) || Date.now() - lastTyping < 1500) return;
    lastTyping = Date.now();
    const cv = getConvo(f.dataset.id);
    cv.typing[session] = lastTyping;
    putConvo(f.dataset.id, cv);
  });

  function chatList(activeId) {
    return `<ul class="chat-list">${chatIds().map((id) => {
      const c = findCat(id), cv = getConvo(id);
      return `<li><a href="#/chats/${id}" class="${id === activeId ? 'on' : ''}"><span class="avatar">${catPic(c)}</span>
        <span><b>${esc(c.catName)}</b><small>${esc(preview(cv.msgs[cv.msgs.length - 1]))}</small></span></a></li>`;
    }).join('')}</ul>`;
  }
  const chatPanel = (activeId) => `<div class="chat-panel"><h2>C(h)ats</h2><p class="muted">Meow-papo entre tutores e seus gatos</p>${chatList(activeId)}</div>`;

  // ---------- Editor de posts (estilo blog): cada parágrafo tem um estilo, o texto tem cor e formatação,
  // e as fotos entram no meio do texto, em fileiras de até três ----------
  const TEXT_COLORS = ['#ff4930', '#ff8a00', '#00cf35', '#00b8ff', '#7c5cff', '#ff62ce'];
  const RICH_STYLES = [['normal', 'Normal'], ['maior', 'Maior'], ['gigante', 'Gigante'], ['citacao', 'Citação'], ['dialogo', 'Diálogo'], ['cursiva', 'Cursiva'], ['recuado', 'Recuado'], ['ul', 'Lista com pontos'], ['ol', 'Lista numerada']];
  const toRGB = (c) => { const el = document.createElement('span'); el.style.color = c; const m = el.style.color.match(/\d+/g); return m ? m.slice(0, 3).join(',') : ''; };
  const COLOR_RGB = TEXT_COLORS.map(toRGB);
  // Só passam negrito, itálico, riscado, link http(s), quebra de linha e as cores da paleta. O resto vira texto puro.
  function cleanInline(node) {
    let out = '';
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) { out += esc(n.nodeValue); return; }
      if (n.nodeType !== 1 || n.classList.contains('rich-ctl')) return;
      const tag = n.tagName, inner = cleanInline(n);
      if (tag === 'BR') out += '<br>';
      else if (tag === 'B' || tag === 'STRONG') out += `<b>${inner}</b>`;
      else if (tag === 'I' || tag === 'EM') out += `<i>${inner}</i>`;
      else if (tag === 'S' || tag === 'STRIKE' || tag === 'DEL') out += `<s>${inner}</s>`;
      else if (tag === 'A' && /^https?:\/\//i.test(n.getAttribute('href') || '')) out += `<a href="${esc(n.getAttribute('href'))}" target="_blank" rel="noopener noreferrer nofollow">${inner}</a>`;
      else {
        const cls = [...n.classList].find((c) => /^tc-[0-5]$/.test(c));
        const idx = cls ? +cls.slice(3) : COLOR_RGB.indexOf(toRGB(n.style.color || n.getAttribute('color') || ''));
        let h = inner;
        if (n.style.fontWeight === 'bold' || +n.style.fontWeight >= 600) h = `<b>${h}</b>`;
        if (n.style.fontStyle === 'italic') h = `<i>${h}</i>`;
        if (/line-through/.test(`${n.style.textDecoration} ${n.style.textDecorationLine}`)) h = `<s>${h}</s>`;
        out += idx >= 0 ? `<span class="tc-${idx}">${h}</span>` : h;
      }
    });
    return out;
  }
  const cleanHTML = (html) => { const t = document.createElement('template'); t.innerHTML = String(html); return cleanInline(t.content); };
  const postMedia = (p) => (p.kind === 'rich' ? (p.blocks || []).flatMap((b) => b.ids || []) : p.mediaId ? [p.mediaId] : []);
  function richHTML(p) {
    return `<div class="rich">${(p.blocks || []).map((b) => (b.t === 'img'
      ? `<div class="rich-imgs n${Math.min(3, b.ids.length)}${b.stack ? ' stack' : ''}">${b.ids.slice(0, 3).map((id) => `<img data-media="${esc(id)}" alt="Imagem do post" loading="lazy">`).join('')}</div>`
      : `<p class="rs-${RICH_STYLES.some(([k]) => k === b.s) ? b.s : 'normal'}">${cleanHTML(b.h)}</p>`)).join('')}</div>${(p.tags || []).length ? `<p class="post-tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join(' ')}</p>` : ''}`;
  }

  let richSel = null, richMedia = [], richDone = false;
  function openRich() {
    richSel = null; richMedia = []; richDone = false;
    openModal(`<form id="rich-form" class="rich-form">
      <div class="rich-author"><span class="avatar">${userFace()}</span><b>${esc(S.user.catName)}</b></div>
      <div id="rich-editor" class="rich rich-editor" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Conteúdo do post" data-ph="Conte o que o seu gatinho aprontou…"><p class="rs-normal"><br></p></div>
      <label class="rich-tags"><span aria-hidden="true">#</span><input name="tags" maxlength="120" placeholder="Tags separadas por espaço" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Tags"></label>
      <div class="rich-styles" id="rich-styles" hidden>${RICH_STYLES.map(([k, n]) => `<button type="button" class="rs-${k}" data-act="rich-style" data-id="${k}">${n}</button>`).join('')}</div>
      <div class="rich-colors" role="group" aria-label="Cor do texto"><button type="button" class="tc-btn" data-act="rich-color" data-id="default" style="background:#2b3f4c" aria-label="Cor padrão"></button>${TEXT_COLORS.map((c, i) => `<button type="button" class="tc-btn" data-act="rich-color" data-id="${c}" style="background:${c}" aria-label="Cor ${i + 1}"></button>`).join('')}</div>
      <div class="rich-bar" role="toolbar" aria-label="Formatação">
        <button type="button" data-act="rich-menu" aria-label="Estilo do parágrafo" aria-haspopup="true"><b>Aa</b></button>
        <button type="button" data-act="rich-cmd" data-id="bold" aria-label="Negrito"><b>B</b></button>
        <button type="button" data-act="rich-cmd" data-id="italic" aria-label="Itálico"><i>i</i></button>
        <button type="button" data-act="rich-cmd" data-id="strikeThrough" aria-label="Riscado"><s>S</s></button>
        <button type="button" data-act="rich-link" aria-label="Link">${I.link}</button>
        <button type="button" data-act="rich-img" aria-label="Fotos ou GIFs">${I.image}</button>
        <span class="grow"></span>
        <button type="button" class="btn small ghost" data-close>Cancelar</button><button class="btn small">Postar</button>
      </div>
      <p class="error" role="alert"></p></form>`, 'rich-modal');
    const ed = document.getElementById('rich-editor');
    try { document.execCommand('defaultParagraphSeparator', false, 'p'); document.execCommand('styleWithCSS', false, false); } catch { /* navegador sem suporte: segue com o padrão */ }
    // Colar sempre como texto puro, para não trazer formatação (ou código) de fora.
    ed.addEventListener('paste', (e) => { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain')); });
    ed.focus();
  }
  // A seleção do texto é guardada, porque tocar nos botões da barra tira o foco do editor.
  document.addEventListener('selectionchange', () => {
    const ed = document.getElementById('rich-editor'), sel = window.getSelection();
    if (ed && sel.rangeCount && ed.contains(sel.anchorNode)) richSel = sel.getRangeAt(0).cloneRange();
  });
  document.addEventListener('mousedown', (e) => { if (e.target.closest('.rich-bar, .rich-colors, .rich-styles') && !e.target.closest('input')) e.preventDefault(); });
  function richFocus() {
    const ed = document.getElementById('rich-editor');
    ed.focus();
    if (richSel) { const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(richSel); }
    return ed;
  }
  // Parágrafo (filho direto do editor) onde está um nó.
  const richBlock = (ed, node) => { let n = node && node.nodeType === 3 ? node.parentNode : node; while (n && n !== ed && n.parentNode !== ed) n = n.parentNode; return n && n !== ed ? n : null; };
  // Quando o post é cancelado, as imagens já guardadas são apagadas.
  modal.addEventListener('close', () => {
    if (!richDone && richMedia.length) richMedia.forEach((id) => { delMedia(id).catch(() => {}); });
    richMedia = [];
  });

  // ---------- Timeline ----------
  let feedTab = 'foryou';
  const BOOT = Date.now();
  function timeAgo(ts) {
    const m = Math.max(1, Math.round((Date.now() - ts) / 60000));
    if (m < 60) return `há ${m} min`;
    const h = Math.round(m / 60);
    if (h < 24) return `há ${h} h`;
    const dd = Math.round(h / 24);
    return dd === 1 ? 'ontem' : `há ${dd} dias`;
  }
  function doBlock(id) {
    if (!isBlocked(id)) S.blocked.push(id);
    S.following = S.following.filter((x) => x !== id);
    if (dockChat === id) dockChat = null;
    save();
  }
  // Junta os meus posts, os das outras contas deste navegador e os de demonstração (menos quem está bloqueado).
  function allPosts() {
    const me = { id: 'me', catName: S.user.catName, username: S.user.username || session };
    const mine = S.posts.map((p) => ({ ...p, author: me, mine: true, likes: 0 }));
    const locals = localCats().filter((c) => !isBlocked(c.id) && !blockedMe(c)).flatMap((c) => (readJSON(`${KEY}:${c.username}`, {}).posts || []).map((p) => ({ ...p, author: c, likes: 0 })));
    const seeds = SEED_POSTS.filter((p) => !isBlocked(p.cat) && findCat(p.cat) && !getMod().removedPosts[p.id]).map((p) => ({ id: p.id, caption: p.caption, likes: p.likes, ts: BOOT - p.h * 3600e3, author: findCat(p.cat), photo: findCat(p.cat).photo }));
    return [...mine, ...locals, ...seeds].sort((x, y) => y.ts - x.ts);
  }
  function postCard(p) {
    const c = p.author, liked = S.likedPosts.includes(p.id);
    const who = p.mine ? `<a class="avatar" href="#/perfil">${userFace()}</a>` : `<a class="avatar" href="#/gato/${c.id}">${catPic(c)}</a>`;
    const media = p.kind === 'rich' ? '' : p.mediaId ? `<img class="post-img" data-media="${p.mediaId}" alt="Imagem do post de ${esc(c.catName)}" loading="lazy">` : p.photo ? `<img class="post-img" src="${p.photo}" alt="Foto do post de ${esc(c.catName)}" loading="lazy">` : '';
    const bg = safeColor(p.bg, '#fff7e6');
    const content = p.kind === 'rich' ? richHTML(p) : p.kind === 'blog'
      ? `<div class="blog" style="--blog-bg:${bg};--blog-ink:${inkFor(bg)};--blog-font:${PF_FONTS[p.font] || PF_FONTS.Fredoka}">${media}<h2>${esc(p.title)}</h2><div class="blog-body">${fmt(p.body)}</div></div>`
      : `${media}${p.caption ? `<p class="post-cap">${esc(p.caption)}</p>` : ''}`;
    return `<article class="card post">
      <header>${who}<div class="grow"><a href="${p.mine ? '#/perfil' : '#/gato/' + c.id}"><b>${esc(c.catName)}</b></a><small>@${esc(c.username)} · ${timeAgo(p.ts)}</small></div>
        ${p.mine ? `<button class="icon-btn soft" data-act="del-post" data-id="${p.id}" aria-label="Excluir post">${I.trash}</button>`
          : `${isFollowing(c.id) ? '' : followBtn(c.id)}<button class="icon-btn soft" data-act="more" data-id="${c.id}" data-m="${p.id}" aria-label="Mais opções">${I.dots}</button>`}</header>
      ${content}
      <footer><button class="like ${liked ? 'on' : ''}" data-act="like-post" data-id="${p.id}" aria-pressed="${liked}" aria-label="Curtir">${I.heart}<span>${p.likes + (liked ? 1 : 0)}</span></button></footer>
    </article>`;
  }
  function viewHome() {
    const posts = allPosts();
    const list = feedTab === 'following' ? posts.filter((p) => p.mine || isFollowing(p.author.id)) : posts;
    return `<div class="hello"><h1 class="page-title">Miau, ${esc(S.user.catName)}!</h1><p class="page-sub">O cantinho de quem é louco por gatos.</p></div>
      <div class="chips only-mobile"><a class="chip" href="#/compras">Guia de compras</a><a class="chip" href="#/catbooks">CatBooks</a></div>
      <div class="feed-bar">
        <div class="tabs" role="tablist">
          <button role="tab" aria-selected="${feedTab === 'foryou'}" class="${feedTab === 'foryou' ? 'on' : ''}" data-act="feed-tab" data-id="foryou">Para você</button>
          <button role="tab" aria-selected="${feedTab === 'following'}" class="${feedTab === 'following' ? 'on' : ''}" data-act="feed-tab" data-id="following">Seguindo</button>
        </div>
        <span class="feed-new"><button class="btn small" data-act="new-post">${I.plus} Foto</button><button class="btn small ghost" data-act="new-rich">${I.plus} Post</button></span>
      </div>
      <div class="timeline">${list.map(postCard).join('') || `<div class="card empty">Você ainda não segue ninguém. Dê uma olhada em “Para você” ou <a href="#/buscar"><u>busque gatinhos</u></a> para seguir.</div>`}</div>`;
  }

  function viewTik() {
    const mine = [...S.tiks].reverse().map((t) => `<article class="tik">
        <video data-media="${t.mediaId}" loop playsinline preload="metadata" data-act="playpause"></video>
        <div class="tik-info"><b>${esc(S.user.catName)}</b>${esc(t.caption)} <span>${esc(t.trend)}</span></div>
        <div class="tik-side">
          <button class="${t.liked ? 'on' : ''}" data-act="like-tik" data-id="${t.id}" aria-label="Curtir" aria-pressed="${!!t.liked}">${I.heart}</button>
          <button data-act="del-tik" data-id="${t.id}" aria-label="Excluir vídeo">${I.trash}</button>
        </div></article>`).join('');
    const seeds = SEED_TIKS.filter((t) => findCat(t.cat)).map((t) => {
      const c = findCat(t.cat), liked = S.likedSeeds.includes(t.id);
      return `<article class="tik demo" style="background:${t.bg}"><span class="badge">Demonstração</span>
        <div class="demo-cat">${catPic(c).replace('<rect width="100" height="100" fill="#e6f6ff"/>', '')}</div>
        <div class="tik-info"><b><a href="#/gato/${c.id}">${esc(c.catName)}</a></b>${esc(t.caption)} <span>${t.trend}</span></div>
        <div class="tik-side"><button class="${liked ? 'on' : ''}" data-act="like-seed" data-id="${t.id}" aria-label="Curtir" aria-pressed="${liked}">${I.heart}</button><small>${t.likes + (liked ? 1 : 0)}</small></div></article>`;
    }).join('');
    return `<div class="head-row"><div><h1 class="page-title">TikCats</h1><p class="page-sub">Os vídeos e as trends mais fofas da gatosfera.</p></div>
        <button class="btn" data-act="new-tik">+ Postar vídeo</button></div>
      <div class="chips">${TRENDS.map((t) => `<span class="chip">${t}</span>`).join('')}</div>
      <div class="feed">${mine}${seeds}</div>`;
  }

  function viewBooks() {
    const albums = S.albums.map((a) => `<a class="album" href="#/catbooks/${a.id}">
        <div class="cover">${a.items[0] ? `<img data-media="${a.items[0]}" alt="">` : I.book}</div>
        <b>${esc(a.name)}</b><small class="muted">${a.items.length} foto${a.items.length === 1 ? '' : 's'}</small></a>`).join('');
    return `<div class="head-row"><div><h1 class="page-title">CatBooks</h1><p class="page-sub">Guarde em álbuns os melhores cliques do seu gatinho.</p></div>
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

  // ---------- TwinCats: semelhança por foto (IA no próprio navegador) ----------
  // 100% não existe (cada gato é único). 99% fica para o "gêmeo perfeito": mesmo nome e mesma pelagem.
  const sameName = (x, y) => plain(x).trim() === plain(y).trim();
  const cosine = (p, q) => { let t = 0; for (let i = 0; i < p.length; i++) t += p[i] * q[i]; return t; };
  // Converte a semelhança do modelo (na prática entre ~0,30 e ~0,75 para gatos diferentes) em porcentagem.
  function photoScore(c) {
    const e = c.emb || (typeof TWIN_EMB !== 'undefined' && TWIN_EMB[c.id]);
    if (!S.twin || !e) return null;
    return Math.max(1, Math.min(98, Math.round(((cosine(S.twin.emb, e) - 0.25) / 0.6) * 98)));
  }
  function profileScore(c) {
    const u = S.user;
    let n = 0;
    if (c.breed.toLowerCase() === u.breed.trim().toLowerCase()) n += 45;
    if (c.gender === u.gender) n += 15;
    if (c.coat === u.coat) n += 20;
    const dif = Math.abs((age(c.birth) ?? 0) - (age(u.birth) ?? 0));
    n += dif <= 12 ? 20 : dif <= 36 ? 10 : 0;
    return Math.min(98, n);
  }
  function twinScore(c) {
    const photo = photoScore(c);
    if (sameName(c.catName, S.user.catName) && (c.coat === S.user.coat || (photo !== null && photo >= 75))) return 99;
    return photo !== null ? photo : profileScore(c);
  }

  const loadScript = (src) => new Promise((res, rej) => {
    const el = document.createElement('script');
    el.src = src; el.onload = res; el.onerror = () => rej(new Error('não carregou ' + src));
    document.head.appendChild(el);
  });
  let twinModel = null, twinBusy = '', twinMsg = '';
  let twinPending = null; // { file, url, post } da foto escolhida, antes de comparar
  async function getTwinModel() {
    if (twinModel) return twinModel;
    // A IA fica na pasta vendor/ do próprio site: nada é baixado de servidores externos.
    if (!window.tf) await loadScript('vendor/tf.min.js');
    if (!window.mobilenet) await loadScript('vendor/mobilenet.min.js');
    twinModel = await window.mobilenet.load({ version: 2, alpha: 1.0, modelUrl: 'vendor/mobilenet/model.json', inputRange: [0, 1] });
    return twinModel;
  }
  async function analyzeTwinPhoto(file, alsoPost) {
    const setBusy = (t) => { twinBusy = t; if (location.hash.startsWith('#/twincats')) render(); };
    twinMsg = '';
    let step = 'abrir a foto';
    try {
      setBusy('Preparando a foto…');
      const big = await shrink(file, 600);
      const side = Math.min(big.width, big.height);
      const cv = document.createElement('canvas');
      cv.width = cv.height = 224;
      cv.getContext('2d').drawImage(big, (big.width - side) / 2, (big.height - side) / 2, side, side, 0, 0, 224, 224);
      step = 'carregar a IA';
      setBusy('Carregando a IA (só demora na primeira vez)…');
      const model = await getTwinModel();
      step = 'analisar a foto';
      setBusy('Procurando os gatinhos mais parecidos…');
      const top = await model.classify(cv, 5);
      const isCat = top.some((t) => /cat|tabby|lynx|kitt|cougar|leopard|lion|tiger/i.test(t.className));
      const v = window.tf.tidy(() => { const e = model.infer(cv, true); return e.div(e.norm()); });
      const emb = Array.from(await v.data()).map((x) => Math.round(x * 1e4) / 1e4);
      v.dispose();
      // Esta IA só distingue com segurança dois tipos de raça: Siamês (pontas escuras) e Persa (pelo longo).
      const strong = top.find((t) => t.probability >= 0.5 && /Siamese|Persian/i.test(t.className));
      const look = strong ? (/Siamese/i.test(strong.className) ? 'Siamês' : 'Persa') : '';
      S.twin = { photo: cv.toDataURL('image/jpeg', 0.85), emb, look };
      // O post do TwinCats é único: comparar de novo substitui o anterior.
      const old = S.posts.filter((p) => p.twin);
      S.posts = S.posts.filter((p) => !p.twin);
      if (alsoPost) {
        step = 'publicar na timeline';
        const full = await shrink(file, 1080);
        const blob = await new Promise((r) => full.toBlob(r, 'image/jpeg', 0.85));
        S.posts.push({ id: uid(), mediaId: await putMedia(blob), caption: `${S.user.catName} entrou no TwinCats! Será que tem um sósia por aqui?`, ts: Date.now(), twin: true });
      }
      save();
      for (const p of old) { try { await delMedia(p.mediaId); } catch { /* já removida */ } }
      twinMsg = isCat ? '' : 'Não tenho certeza de que há um gato nessa foto. Para um resultado melhor, use uma foto nítida, de frente e com boa luz.';
    } catch (e) {
      console.error('TwinCats:', step, e);
      twinMsg = `Não consegui ${step}. Recarregue a página com Ctrl+F5 e tente de novo. Se continuar, me avise com este detalhe: ${esc(String((e && e.message) || e).slice(0, 120))}`;
    }
    setBusy('');
  }

  function viewTwins() {
    const list = visibleCats().filter((c) => !c.local || c.inTwins).map((c) => ({ c, s: twinScore(c) })).sort((x, y) => y.s - x.s);
    const byPhoto = !!S.twin;
    return `<h1 class="page-title">TwinCats</h1><p class="page-sub">Será que seu gato tem um sósia? Envie uma foto e a IA procura os gatinhos mais parecidos.</p>
      <div class="card twin-up">
        ${twinPending ? `<img class="twin-photo" src="${twinPending.url}" alt="Foto escolhida">` : byPhoto ? `<img class="twin-photo" src="${S.twin.photo}" alt="Foto enviada para o TwinCats">` : `<span class="twin-photo empty">${I.twin}</span>`}
        <div class="grow">
          ${twinPending ? `<b>Foto escolhida</b>
            <p class="muted">Toque em Comparar para a IA procurar os gatinhos mais parecidos e colocar o seu na comparação dos outros tutores.</p>
            ${twinBusy ? `<div class="actions"><span class="twin-busy" role="status">${twinBusy}</span></div>` : `
            <label class="check twin-check"><input type="checkbox" data-act="twin-post-toggle" ${twinPending.post ? 'checked' : ''}> Publicar a foto também na timeline</label>
            <div class="actions"><button class="btn" data-act="twin-compare">Comparar</button><button class="btn ghost" data-act="twin-cancel">Cancelar</button></div>`}` : `
          <b>${byPhoto ? 'Comparando pela foto' : 'Compare pela foto'}</b>
          <p class="muted">${byPhoto ? 'A porcentagem mostra o quanto cada gatinho se parece com a foto que você enviou.' : 'Sem foto, comparamos só raça, pelagem, gênero e idade do perfil.'}</p>
          <div class="actions">
            <button class="btn small" data-act="twin-photo">${byPhoto ? 'Trocar foto' : 'Enviar foto do meu gato'}</button>
            ${byPhoto ? '<button class="btn small ghost" data-act="twin-clear">Remover foto</button>' : ''}</div>
          ${byPhoto ? `<p class="twin-look">${S.twin.look ? `Pela foto, parece ter traços de <b>${S.twin.look}</b>. Só pedigree ou teste de DNA confirmam uma raça.` : 'Pela foto, não reconheci traços de Siamês nem de Persa, as únicas raças que esta IA sabe apontar. O mais comum é ser SRD (vira-lata), como a grande maioria dos gatos.'} A raça não entra na porcentagem: a comparação é só pela aparência.</p>` : ''}`}
          ${twinMsg ? `<p class="twin-warn" role="alert">${twinMsg}</p>` : ''}
        </div>
      </div>
      <p class="muted twin-note">100% não tem como: seu gatinho é único. O máximo é 99%, para quem tem o mesmo nome e a mesma pelagem.</p>
      <p class="muted twin-note">${S.settings.showInTwins ? 'Sua foto entra na comparação dos outros tutores, para eles também encontrarem o seu gatinho. Em modo de teste local, isso vale para as contas criadas neste navegador.' : 'Você escolheu não aparecer no TwinCats de outras pessoas. Dá para mudar em Configurações.'}</p>
      <div class="list">${list.map(({ c, s }) => `<div class="card twin">
        <a class="avatar big" href="#/gato/${c.id}" aria-label="Perfil de ${esc(c.catName)}">${catPic(c)}</a>
        <div class="grow"><b>${esc(c.catName)}${c.local ? ' <span class="tag-real">conta real</span>' : ''}</b><span class="muted">${esc(c.breed)} · ${ageText(c.birth)}</span>
          <div class="meter"><i style="width:${s}%"></i></div></div>
        <span class="pct">${s}%</span>${s === 99 ? '<span class="twin-badge">Gêmeo perfeito!</span>' : ''}
        <a class="btn small" href="#/chats/${c.id}">Miau</a></div>`).join('')}</div>
      <p class="muted" style="margin-top:14px">Em modo de teste local, entram na comparação as outras contas criadas neste navegador que enviaram foto (marcadas como “conta real”) e os gatos de demonstração, com fotos em domínio público do Wikimedia Commons.</p>`;
  }

  let factFilter = 'Mais importantes';
  // Idade em anos humanos: 1º ano ≈ 15, 2º ano +9, depois +4 por ano.
  function humanAge(m) {
    if (m === null) return null;
    const y = m <= 6 ? m * 10 / 6 : m <= 12 ? 10 + (m - 6) * 5 / 6 : m <= 24 ? 15 + (m - 12) * 9 / 12 : 24 + (m - 24) * 4 / 12;
    return Math.round(y);
  }
  function factCard(f, extra = '') {
    const on = S.savedFacts.includes(f.id);
    return `<article class="card fact ${extra}"><small>${extra ? 'Curiosidade do dia · ' : ''}${f.cat}</small><h3>${f.title}</h3><p>${f.text}</p>
      <button class="save ${on ? 'on' : ''}" data-act="save-fact" data-id="${f.id}" aria-label="Salvar curiosidade" aria-pressed="${on}">${I.heart}</button></article>`;
  }
  function viewCurious() {
    const cats = ['Mais importantes', ...new Set(FACTS.map((f) => f.cat)), 'Todas', 'Salvas'];
    const day = FACTS[Math.floor(Date.now() / 864e5) % FACTS.length];
    const list = factFilter === 'Mais importantes' ? TOP_FACTS.map((t) => FACTS.find((f) => f.title === t)).filter(Boolean)
      : FACTS.filter((f) => factFilter === 'Todas' || (factFilter === 'Salvas' ? S.savedFacts.includes(f.id) : f.cat === factFilter));
    return `<h1 class="page-title">CuriousCats</h1><p class="page-sub">${FACTS.length} curiosidades, das fofuras aos cuidados de saúde.</p>
      <div class="list" style="margin-bottom:14px">
        ${humanAge(age(S.user.birth)) === null ? '' : `<article class="card age-card"><small>Calculadora de idade</small>
          <p><b>${esc(S.user.catName)}</b> tem ${ageText(S.user.birth)}, o que equivale a cerca de <b>${humanAge(age(S.user.birth))} anos humanos</b>.</p></article>`}
        ${factCard(day, 'today')}</div>
      <div class="chips">${cats.map((c) => `<button class="chip ${c === factFilter ? 'on' : ''}" data-act="filter-fact" data-id="${c}">${c}</button>`).join('')}</div>
      <div class="list">${list.map((f) => factCard(f)).join('') || '<div class="card empty">Nada salvo ainda. Toque no coração de uma curiosidade.</div>'}</div>
      <p class="muted" style="margin-top:14px">As curiosidades são informativas e não substituem a consulta com um veterinário.</p>`;
  }

  function viewChats() {
    return `<h1 class="page-title">C(h)ats</h1><p class="page-sub">Meow-papo entre tutores e seus gatos</p>${chatPanel()}`;
  }
  function viewConvo(id) {
    const c = findCat(id);
    if (!c || blockedMe(c)) return viewChats();
    if (isBlocked(id)) return blockedHTML(c);
    const p = chatParts(id, 'send', 'msgs');
    return `<div class="card convo" ${p.style}>
      <div class="convo-head"><a class="icon-btn only-mobile" href="#/chats" aria-label="Voltar">←</a>
        <a class="avatar" href="#/gato/${id}">${catPic(c)}</a>
        <div class="grow"><b>${esc(c.catName)}</b><br><small class="muted">${c.local ? 'conta real' : 'conversa de demonstração'}</small></div>${p.tools}</div>
      ${p.msgs}${p.panel}${p.form}</div>`;
  }

  // ---------- Bloquear e denunciar ----------
  const isBlocked = (id) => S.blocked.includes(id);
  // Uma conta deste navegador que me bloqueou também deixa de aparecer para mim.
  const blockedMe = (c) => !!c.local && (readJSON(`${KEY}:${c.username}`, {}).blocked || []).includes('u:' + session);
  const visibleCats = () => allCats().filter((c) => !isBlocked(c.id) && !blockedMe(c));
  const blockedHTML = (c) => `<div class="card empty"><p>Você bloqueou <b>${esc(c.catName)}</b> (@${esc(c.username)}). Posts, perfil e mensagens ficam escondidos.</p>
      <p style="margin-top:14px"><button class="btn" data-act="unblock" data-id="${c.id}">Desbloquear</button></p></div>`;
  const REPORT_REASONS = ['Spam ou golpe', 'Assédio ou ofensa', 'Conteúdo impróprio', 'Maus-tratos a animais', 'Perfil falso', 'Outro motivo'];

  // ---------- Perfil personalizável (estilo blog) ----------
  const PF_FONTS = { Fredoka: "'Fredoka', sans-serif", Pacifico: "'Pacifico', cursive", 'Baloo 2': "'Baloo 2', sans-serif", Caveat: "'Caveat', cursive",
    'Playfair Display': "'Playfair Display', serif", Comfortaa: "'Comfortaa', sans-serif", 'Press Start 2P': "'Press Start 2P', monospace" };
  const PF_DEFAULT = { bg: '#c9ecff', bg2: '#e6f6ff', card: '#ffffff', name: '#35789c', accent: '#6aadcf', font: 'Fredoka' };
  const PF_PRESETS = {
    'Algodão-doce': { bg: '#ffd6e8', bg2: '#d6e4ff', card: '#ffffff', name: '#d6478a', accent: '#d6478a', font: 'Pacifico' },
    Noite: { bg: '#1d2440', bg2: '#3a2a5c', card: '#262d4d', name: '#ffd76a', accent: '#8ea2ff', font: 'Comfortaa' },
    Floresta: { bg: '#cfe8c9', bg2: '#f1f0d0', card: '#fffdf4', name: '#2f6b3f', accent: '#4c9a5f', font: 'Baloo 2' },
    Jornal: { bg: '#f3efe6', bg2: '#e2dac8', card: '#fffdf8', name: '#22201c', accent: '#8a3b2a', font: 'Playfair Display' },
    Caderno: { bg: '#fff3c4', bg2: '#ffd9b0', card: '#fffef6', name: '#b0562b', accent: '#e08a3c', font: 'Caveat' },
    Fliperama: { bg: '#12122b', bg2: '#33124a', card: '#1c1c3a', name: '#5df2c4', accent: '#ff5fa2', font: 'Press Start 2P' }
  };
  const safeColor = (c, d) => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : d);
  const lum = (hex) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)); return (r * 299 + g * 587 + b * 114) / 1000; };
  const inkFor = (bg) => (lum(bg) > 150 ? '#2b3f4c' : '#f3f6fa');
  function themeStyle(t) {
    if (!t) return '';
    const card = safeColor(t.card, PF_DEFAULT.card), accent = safeColor(t.accent, PF_DEFAULT.accent);
    return `--pf-bg:${safeColor(t.bg, PF_DEFAULT.bg)};--pf-bg2:${safeColor(t.bg2, PF_DEFAULT.bg2)};--pf-card:${card};--pf-ink:${inkFor(card)};--pf-name:${safeColor(t.name, PF_DEFAULT.name)};--pf-accent:${accent};--pf-on-accent:${lum(accent) > 165 ? '#2b3f4c' : '#ffffff'};--pf-font:${PF_FONTS[t.font] || PF_FONTS.Fredoka}`;
  }
  // Formatação simples dos posts de blog: "# título", "> citação", **negrito** e *itálico*.
  function fmt(text) {
    const inline = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');
    return String(text).split(/\n{2,}/).map((blk) => {
      const b = blk.trim();
      if (!b) return '';
      if (b.startsWith('# ')) return `<h3>${inline(b.slice(2))}</h3>`;
      if (b.startsWith('> ')) return `<blockquote>${inline(b.replace(/^> ?/gm, '')).replace(/\n/g, '<br>')}</blockquote>`;
      return `<p>${inline(b).replace(/\n/g, '<br>')}</p>`;
    }).join('');
  }

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
          <div class="pf-name"><h1>${esc(p.catName)}${typeof ADMINS !== 'undefined' && ADMINS.includes(p.username) ? ` <span class="mod-badge" title="Moderadora do MEOWorld">${I.shield}Moderadora</span>` : ''}</h1><p>${[p.username && '@' + esc(p.username), p.owner && 'com ' + esc(p.owner)].filter(Boolean).join(' · ')}</p></div>
          ${action}
        </div>
        ${p.bio ? `<p class="pf-bio">${esc(p.bio)}</p>` : ''}
        <ul class="pf-tags"><li>${esc(p.breed)}</li><li>${esc(p.gender)}</li><li>${ageText(p.birth)}</li>${p.hideBirth ? '' : `<li>Nasceu em ${dateBR(p.birth)}</li>`}</ul>
        <div class="pf-stats">${stats.map(([n, label]) => `<div><b>${n}</b><span>${label}</span></div>`).join('')}</div>
      </div></div></section>`;
  }
  // ---------- Primeiros passos (lista de tarefas depois do cadastro) ----------
  function onboardHTML() {
    if (!S.onboard) return '';
    const steps = [
      ['Colocar uma biografia', !!S.user.bio, '<button class="btn small" data-act="edit-profile">Escrever</button>'],
      ['Colocar foto no perfil', !!S.user.photo, '<button class="btn small" data-act="edit-profile">Escolher</button>'],
      ['Colocar uma capa', !!S.user.cover, '<button class="btn small" data-act="edit-profile">Escolher</button>'],
      ['Fazer a primeira postagem', S.posts.length > 0, '<button class="btn small" data-act="new-rich">Postar</button>'],
      ['Seguir o primeiro gatinho', S.following.filter(findCat).length > 0, '<a class="btn small" href="#/buscar">Buscar</a>']
    ];
    const done = steps.filter((s) => s[1]).length;
    return `<section class="card onboard" aria-label="Primeiros passos">
      <header><div><h2>${done === steps.length ? 'Perfil completo!' : 'Primeiros passos'}</h2>
        <p class="muted">${done === steps.length ? `${esc(S.user.catName)} está pronto(a) para ronronar por aí.` : `Deixe o perfil de ${esc(S.user.catName)} com a carinha dele(a). ${done} de ${steps.length} feitos.`}</p></div>
        <button class="btn small ghost" data-act="onboard-close">${done === steps.length ? 'Fechar' : 'Agora não'}</button></header>
      <div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="${steps.length}" aria-valuenow="${done}"><i style="width:${(done / steps.length) * 100}%"></i></div>
      <ul>${steps.map(([label, ok, action]) => `<li class="${ok ? 'ok' : ''}"><span class="tick" aria-hidden="true">${ok ? '✓' : ''}</span><span class="grow">${label}${ok ? '<span class="sr"> (feito)</span>' : ''}</span>${ok ? '' : action}</li>`).join('')}</ul>
    </section>`;
  }

  const pfPage = (theme, inner) => `<div class="pf-page ${theme ? 'themed' : ''}" style="${themeStyle(theme)}">${inner}</div>`;
  const postsSection = (list, empty) => `<h2 class="section-title">Posts</h2>${list.length ? `<div class="timeline">${list.map(postCard).join('')}</div>` : `<div class="card empty">${empty}</div>`}`;
  function viewProfile() {
    const albums = S.albums.slice(0, 4).map((a) => `<a class="album" href="#/catbooks/${a.id}"><div class="cover">${a.items[0] ? `<img data-media="${a.items[0]}" alt="">` : I.book}</div><b>${esc(a.name)}</b></a>`).join('');
    const photos = S.albums.reduce((n, a) => n + a.items.length, 0);
    return pfPage(S.user.theme, `${profileHTML({ ...S.user, owner: S.settings.showOwner ? S.user.owner : '', hideBirth: !S.settings.showBirth }, S.user.photo ? userFace() : catFace(S.user.coat), true,
        `<span class="pf-actions"><button class="btn" data-act="edit-profile">Editar perfil</button></span>`,
        [[S.posts.length, S.posts.length === 1 ? 'post' : 'posts'], [localFollowers('u:' + session), 'seguidores'], [S.following.filter(findCat).length, 'seguindo'], [S.albums.length, S.albums.length === 1 ? 'álbum' : 'álbuns'], [photos, photos === 1 ? 'foto' : 'fotos'], [S.tiks.length, S.tiks.length === 1 ? 'vídeo' : 'vídeos']])}
      ${onboardHTML()}
      ${postsSection(allPosts().filter((p) => p.mine), 'Seus posts aparecem aqui. <button class="link" data-act="new-rich">Criar o primeiro</button>')}
      <h2 class="section-title">CatBooks</h2>
      ${albums ? `<div class="grid">${albums}</div>` : '<div class="card empty">Seus álbuns aparecem aqui. <a href="#/catbooks"><u>Criar um álbum</u></a></div>'}`);
  }
  const isFollowing = (id) => S.following.includes(id);
  const followBtn = (id, small = true) => `<button class="btn ${small ? 'small' : ''} ${isFollowing(id) ? 'ghost' : ''}" data-act="follow" data-id="${id}" aria-pressed="${isFollowing(id)}">${isFollowing(id) ? 'Seguindo' : 'Seguir'}</button>`;

  function viewCat(id) {
    const c = findCat(id);
    if (!c || blockedMe(c)) return viewHome();
    if (isBlocked(id)) return blockedHTML(c);
    const followers = c.local ? localFollowers(c.id) : c.followers;
    return pfPage(c.theme, `${profileHTML(c, c.photo ? catPic(c) : catFace(c.coat, c.eyes), false,
        `<span class="pf-actions">${followBtn(c.id, false)}<a class="btn ghost" href="#/chats/${c.id}">Miau</a><button class="icon-btn soft" data-act="more" data-id="${c.id}" aria-label="Mais opções">${I.dots}</button></span>`,
        [[followers + (isFollowing(c.id) ? 1 : 0), 'seguidores'], [twinScore(c) + '%', 'gêmeo seu']])}
      ${postsSection(allPosts().filter((p) => !p.mine && p.author.id === c.id), 'Nenhum post ainda.')}
      <p class="muted" style="margin-top:12px">${c.local ? 'Conta criada neste navegador (modo de teste local).' : `Perfil de demonstração.${c.credit ? ` Foto: ${esc(c.credit.by)}, ${esc(c.credit.license)}, via <a href="${esc(c.credit.url)}" target="_blank" rel="noopener noreferrer"><u>Wikimedia Commons</u></a>.` : ''}`}</p>`);
  }

  // ---- Buscar gatinhos pelo @usuário, nome do gato ou do(a) dono(a) ----
  let searchQ = '';
  const plain = (t) => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function catRow(c) {
    return `<div class="card twin"><a class="avatar big" href="#/gato/${c.id}" aria-label="Perfil de ${esc(c.catName)}">${catPic(c)}</a>
      <a class="grow" href="#/gato/${c.id}"><b>${esc(c.catName)}</b><span class="muted">@${esc(c.username)}${c.owner ? ` · com ${esc(c.owner)}` : ''}${c.local ? ' · conta real' : ''}</span></a>
      ${followBtn(c.id)}</div>`;
  }
  function searchResults() {
    const q = plain(searchQ.trim().replace(/^@/, ''));
    if (!q) {
      const mine = visibleCats().filter((c) => isFollowing(c.id)), rest = visibleCats().filter((c) => !isFollowing(c.id));
      return `${mine.length ? `<h2 class="section-title">Você segue</h2><div class="list">${mine.map(catRow).join('')}</div>` : ''}
        ${rest.length ? `<h2 class="section-title">Sugestões</h2><div class="list">${rest.map(catRow).join('')}</div>` : ''}`;
    }
    const hits = visibleCats().filter((c) => [c.username, c.catName, c.owner].some((v) => plain(v).includes(q)));
    return hits.length ? `<div class="list" style="margin-top:14px">${hits.map(catRow).join('')}</div>`
      : `<div class="card empty" style="margin-top:14px">Nenhum gatinho encontrado para “${esc(searchQ.trim())}”.</div>`;
  }
  function viewSearch() {
    return `<h1 class="page-title">Buscar</h1><p class="page-sub">Encontre o gatinho dos amigos pelo @usuário ou pelo nome.</p>
      <label class="search-box">${I.search}<input id="search-input" type="search" placeholder="@usuario ou nome do gatinho" value="${esc(searchQ)}" maxlength="40" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Buscar gatinhos"></label>
      <div id="search-results" aria-live="polite">${searchResults()}</div>
      <p class="muted" style="margin-top:14px">Em modo de teste local, a busca encontra os gatinhos de demonstração e as outras contas criadas neste navegador.</p>`;
  }
  document.addEventListener('input', (e) => {
    if (e.target.id !== 'search-input') return;
    searchQ = e.target.value;
    document.getElementById('search-results').innerHTML = searchResults();
  });

  function viewSettings() {
    const u = S.user;
    return `<h1 class="page-title">Configurações</h1><p class="page-sub">Sua conta, do seu jeito.</p>
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
          <label class="switch-row"><span><b>Aparecer no TwinCats dos outros</b><small>Deixa a foto do seu gato entrar na comparação de outros tutores. Em modo de teste local, vale para as contas deste navegador.</small></span><input type="checkbox" role="switch" data-act="set" data-id="showInTwins" ${S.settings.showInTwins ? 'checked' : ''}></label>
          <label class="switch-row"><span><b>Perfil privado</b><small>Só quem você aprovar vê álbuns e vídeos. Passa a valer quando houver outros usuários de verdade.</small></span><input type="checkbox" role="switch" data-act="set" data-id="privateProfile" ${S.settings.privateProfile ? 'checked' : ''}></label>
        </section>
        <section class="card"><h2>Aparência</h2>
          <label class="switch-row"><span><b>Fundo animado</b><small>Desligue para deixar o degradê do fundo parado.</small></span><input type="checkbox" role="switch" data-act="set" data-id="motion" ${S.settings.motion ? 'checked' : ''}></label>
        </section>
        <section class="card"><h2>Bloqueios e denúncias</h2>
          ${S.blocked.filter(findCat).length ? `<ul class="plain-list">${S.blocked.filter(findCat).map((id) => { const c = findCat(id); return `<li><span class="avatar">${catPic(c)}</span><span class="grow"><b>${esc(c.catName)}</b><small>@${esc(c.username)}</small></span><button class="btn small ghost" data-act="unblock" data-id="${id}">Desbloquear</button></li>`; }).join('')}</ul>` : '<p>Você não bloqueou ninguém.</p>'}
          ${S.reports.length ? `<p style="margin-top:12px"><b>${S.reports.length}</b> ${S.reports.length === 1 ? 'denúncia registrada' : 'denúncias registradas'}:</p><ul class="plain-list small">${S.reports.slice(-5).reverse().map((r) => `<li><span class="grow">${esc(r.reason)}${r.post ? ' (post)' : ''} · @${esc((findCat(r.target) || {}).username || 'conta removida')}<small>${timeAgo(r.ts)}</small></span></li>`).join('')}</ul>` : ''}
          <p class="muted" style="margin:10px 0 0">Para bloquear ou denunciar, use o botão ⋯ no perfil, no post ou na conversa. Em modo de teste local, as denúncias ficam guardadas só neste navegador.</p>
        </section>
        <section class="card"><h2>Armazenamento</h2>
          <p>Em modo de teste local, tudo fica guardado neste navegador. Em uso: <b>${storageUsed()}</b> de cerca de 5 MB (contas: ${Object.keys(accounts).length}). Fotos de perfil e capas são o que mais ocupa.</p>
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

  function viewShop() {
    return `<h1 class="page-title">Guia de compras</h1><p class="page-sub">As marcas mais bem avaliadas em cada faixa de preço, com o valor médio.</p>
      <div class="chips">${SHOP.groups.map((g, i) => `<a class="chip" href="#/compras" data-act="shop-jump" data-id="shop-${i}">${g.name}</a>`).join('')}</div>
      ${SHOP.groups.map((g, i) => `<h2 class="section-title" id="shop-${i}">${g.name}</h2><p class="muted shop-note">${g.note}</p>
        <div class="shop-grid">${g.tiers.map((t) => `<article class="card shop-card">
          <span class="shop-tier t-${plain(t.tier)}">${t.tier}</span>
          <h3>${esc(t.brand)}</h3>
          <p class="shop-price"><b>${t.price}</b> ${g.unit} <span>em média</span></p>
          <p>${t.why}</p>
          <p class="muted">${t.pack}</p>
          ${t.also ? `<p class="muted">Na mesma faixa: ${esc(t.also)}</p>` : ''}
          <a class="btn small ghost shop-link" href="https://www.petlove.com.br/busca?q=${encodeURIComponent(t.q)}" target="_blank" rel="noopener noreferrer">Ver preço na Petlove ↗</a>
        </article>`).join('')}</div>`).join('')}
      ${SHOP.tips.map((g) => `<h2 class="section-title">${g.name}</h2>
        <div class="list">${g.items.map(([t, x]) => `<article class="card fact"><h3>${t}</h3><p>${x}</p></article>`).join('')}</div>`).join('')}
      <p class="muted" style="margin-top:14px">Preços pesquisados em lojas online em ${SHOP.date}. Mudam por loja, região e promoção: use como referência. Os rankings consultados são de sites de recomendação, não de laboratórios.</p>`;
  }

  // ---------- Moderação (painel da administradora, em modo de teste local) ----------
  // As decisões ficam numa chave global: valem para todas as contas deste navegador.
  const MODKEY = 'meoworld:mod';
  const getMod = () => Object.assign({ handled: {}, suspended: {}, removedPosts: {} }, readJSON(MODKEY, {}));
  const putMod = (m) => localStorage.setItem(MODKEY, JSON.stringify(m));
  const isAdmin = () => typeof ADMINS !== 'undefined' && ADMINS.includes(session);
  const accountState = (name) => (name === session ? S : readJSON(`${KEY}:${name}`, {}));
  // Denúncias de todas as contas deste navegador, da mais nova para a mais antiga.
  const allReports = () => Object.keys(accounts).flatMap((name) => (accountState(name).reports || []).map((r) => ({ ...r, by: name }))).sort((x, y) => y.ts - x.ts);
  const pendingReports = () => { const m = getMod(); return allReports().filter((r) => !m.handled[r.id]); };
  // Dados de qualquer conta ou gato, mesmo suspenso (só a moderação usa).
  function anyCat(id) {
    if (isDM(id)) { const u = accountState(id.slice(2)).user; return u ? { id, local: true, username: id.slice(2), catName: u.catName, coat: u.coat, photo: u.photo || '' } : null; }
    return COMMUNITY.find((c) => c.id === id) || null;
  }
  function findPost(postId) {
    const seed = SEED_POSTS.find((p) => p.id === postId);
    if (seed) return { post: { ...seed, photo: (COMMUNITY.find((c) => c.id === seed.cat) || {}).photo }, owner: '', seed: true };
    for (const name of Object.keys(accounts)) {
      const post = (accountState(name).posts || []).find((p) => p.id === postId);
      if (post) return { post, owner: name };
    }
    return null;
  }
  function reportCard(r, done) {
    const c = anyCat(r.target), found = r.post ? findPost(r.post) : null, m = getMod();
    const removed = r.post && (!found || m.removedPosts[r.post]);
    const suspended = !!m.suspended[isDM(r.target) ? r.target.slice(2) : r.target];
    const p = found && found.post;
    return `<article class="card mod-card">
      <header><span class="avatar">${c ? catPic(c) : ''}</span><div class="grow"><b>${esc(r.reason)}</b>
        <small>${r.post ? 'Post de' : 'Perfil de'} ${c ? `${esc(c.catName)} (@${esc(c.username)})` : 'conta removida'} · denunciado por @${esc(r.by)} · ${timeAgo(r.ts)}</small></div>
        ${done ? `<span class="tag-done">${esc(done.action)}</span>` : ''}</header>
      ${r.details ? `<p class="mod-details">“${esc(r.details)}”</p>` : ''}
      ${r.post ? (removed ? '<p class="muted">O post já foi removido.</p>' : `<div class="mod-post">${postMedia(p)[0] ? `<img data-media="${postMedia(p)[0]}" alt="">` : p.photo ? `<img src="${p.photo}" alt="">` : ''}<p>${p.kind === 'blog' ? `<b>${esc(p.title)}</b><br>${esc(String(p.body).slice(0, 160))}` : p.kind === 'rich' ? esc((p.blocks || []).filter((b) => b.t === 'p').map((b) => b.h.replace(/<[^>]+>/g, ' ')).join(' ').slice(0, 200) || '(só imagens)') : esc(p.caption || '(sem legenda)')}</p></div>`) : ''}
      ${suspended ? '<p class="muted">Esta conta está suspensa.</p>' : ''}
      ${done ? '' : `<div class="actions">
        ${r.post && !removed ? `<button class="btn small danger" data-act="mod-remove" data-id="${r.id}">Remover post</button>` : ''}
        ${c && !suspended && r.target !== 'u:' + session ? `<button class="btn small danger" data-act="mod-suspend" data-id="${r.id}">Suspender conta</button>` : ''}
        <button class="btn small ghost" data-act="mod-dismiss" data-id="${r.id}">Arquivar sem ação</button>
      </div>`}</article>`;
  }
  function viewMod() {
    if (!isAdmin()) return viewHome();
    const m = getMod(), all = allReports();
    const pending = all.filter((r) => !m.handled[r.id]), handled = all.filter((r) => m.handled[r.id]);
    const susp = Object.keys(m.suspended);
    return `<h1 class="page-title">Moderação</h1><p class="page-sub">Denúncias recebidas e ações da administradora.</p>
      <h2 class="section-title">Pendentes (${pending.length})</h2>
      <div class="list">${pending.map((r) => reportCard(r)).join('') || '<div class="card empty">Nenhuma denúncia pendente. Tudo em paz no MEOWorld.</div>'}</div>
      <h2 class="section-title">Contas suspensas (${susp.length})</h2>
      ${susp.length ? `<div class="card"><ul class="plain-list">${susp.map((k) => { const c = anyCat(COMMUNITY.some((x) => x.id === k) ? k : 'u:' + k); return `<li><span class="avatar">${c ? catPic(c) : ''}</span><span class="grow"><b>${c ? esc(c.catName) : esc(k)}</b><small>@${esc(c ? c.username : k)} · suspensa ${timeAgo(m.suspended[k])}</small></span><button class="btn small ghost" data-act="mod-restore" data-id="${esc(k)}">Reativar</button></li>`; }).join('')}</ul></div>` : '<div class="card empty">Nenhuma conta suspensa.</div>'}
      <h2 class="section-title">Resolvidas (${handled.length})</h2>
      <div class="list">${handled.slice(0, 20).map((r) => reportCard(r, m.handled[r.id])).join('') || '<div class="card empty">Nada resolvido ainda.</div>'}</div>
      <p class="muted" style="margin-top:14px">Em modo de teste local, o painel só enxerga denúncias feitas neste navegador. Suspender impede o login da conta e a esconde de todos; remover post o apaga da timeline.</p>`;
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
    const old = dock.querySelector('#dock-send input[name=text]');
    const draft = old && !clearDraft ? old.value : '';
    const focused = !!old && document.activeElement === old;
    const open = dockChat && findCat(dockChat);
    const c = open && !isBlocked(dockChat) && !blockedMe(open) ? open : null;
    let win = '';
    if (c) {
      const p = chatParts(c.id, 'dock-send', 'dock-msgs');
      win = `<section class="dock-win" ${p.style} aria-label="Conversa com ${esc(c.catName)}">
        <header><a class="avatar" href="#/gato/${c.id}">${catPic(c)}</a>
          <div class="grow"><b>${esc(c.catName)}</b><small>${c.local ? 'conta real' : 'demonstração'}</small></div>${p.tools}
          <button class="dock-x" data-act="dock-close" aria-label="Fechar conversa">×</button></header>
        ${p.msgs}${p.panel}${p.form}</section>`;
    }
    const ids = chatIds();

    dock.innerHTML = `${win}<section class="dock-list">
        <button class="dock-bar" data-act="dock-toggle" aria-expanded="${dockOpen}"><span class="avatar">${userFace()}</span><b>C(h)ats</b><span class="dock-chev" aria-hidden="true">${dockOpen ? '▾' : '▴'}</span></button>
        ${dockOpen ? `<p class="muted">Meow-papo entre tutores e seus gatos</p><ul class="chat-list">${ids.map((id) => {
          const k = findCat(id), kc = getConvo(id), last = kc.msgs[kc.msgs.length - 1];
          return `<li><a href="#/chats/${id}" class="${id === dockChat ? 'on' : ''}"><span class="avatar">${catPic(k)}</span><span><b>${esc(k.catName)}</b><small>${esc(preview(last))}</small></span></a></li>`;
        }).join('')}</ul>` : ''}
      </section>`;
    const m = dock.querySelector('#dock-msgs');
    if (m) m.scrollTop = m.scrollHeight;
    hydrate(dock);
    const input = dock.querySelector('#dock-send input[name=text]');
    if (input) { input.value = draft; if (focused || clearDraft) input.focus(); }
  }
  function openDockChat(id) {
    const c = findCat(id);
    if (!c || isBlocked(id) || blockedMe(c)) return;
    dockChat = id; renderDock();
    dock.querySelector('#dock-send input[name=text]')?.focus();
  }
  // Atualiza a conversa onde ela estiver aberta (página no celular, doca no computador).
  function refreshChat(id, clearDraft = false) {
    const page = document.querySelector(`#send[data-id="${id}"]`);
    if (page) {
      const input = page.querySelector('input[name=text]'), draft = clearDraft ? '' : input.value, focused = document.activeElement === input;
      render();
      const i = document.querySelector('#send input[name=text]');
      if (i) { i.value = draft; if (focused || clearDraft) i.focus(); }
    } else renderDock(clearDraft && dockChat === id);
  }

  // ---------- Teste local: as outras contas deste navegador aparecem como gatinhos de verdade ----------
  // Sem servidor, "outros usuários" são as demais contas criadas neste mesmo navegador.
  function localCats() {
    const sus = getMod().suspended;
    return Object.keys(accounts).filter((name) => name !== session && !sus[name]).map((name) => {
      const st = readJSON(`${KEY}:${name}`, {}), u = st.user;
      if (!u) return null;
      const cfg = Object.assign(defaults().settings, st.settings);
      const twin = cfg.showInTwins && st.twin ? st.twin : null;
      return { id: 'u:' + name, local: true, username: name, catName: u.catName, owner: cfg.showOwner ? u.owner : '', breed: u.breed, gender: u.gender,
        birth: u.birth, hideBirth: !cfg.showBirth, coat: u.coat, bio: u.bio, cover: u.cover, theme: u.theme || null, photo: u.photo || (twin && twin.photo) || '', emb: twin && twin.emb, inTwins: !!twin };
    }).filter(Boolean);
  }
  const allCats = () => { const sus = getMod().suspended; return [...localCats(), ...COMMUNITY.filter((c) => !sus[c.id])]; };
  // Quantas contas deste navegador seguem o gatinho com esse id.
  const localFollowers = (id) => Object.keys(accounts).filter((name) => name !== session && (readJSON(`${KEY}:${name}`, {}).following || []).includes(id)).length;

  // "#Minha Tag!" -> "#MinhaTag": sem espaços nem símbolos, sempre com # na frente.
  const cleanTag = (t) => { const w = String(t).replace(/[^\p{L}\p{N}_]/gu, ''); return w ? '#' + w.slice(0, 28) : ''; };

  const applyPrefs = () => document.body.classList.toggle('no-motion', !!session && !S.settings.motion);

  function render() {
    applyPrefs();
    renderDock();
    if (!session || !S.user) { document.body.classList.remove('page-themed'); document.body.style.cssText = ''; app.innerHTML = viewAuth(); return; }
    const [route = '', arg] = location.hash.replace(/^#\/?/, '').split('/');
    const views = {
      '': viewHome, tikcats: viewTik, catbooks: () => (arg ? viewAlbum(arg) : viewBooks()), twincats: viewTwins,
      curiouscats: viewCurious, chats: () => (arg ? viewConvo(arg) : viewChats()), perfil: viewProfile, compras: viewShop, buscar: viewSearch, config: viewSettings, moderacao: viewMod, gato: () => viewCat(arg)
    };
    // Dentro de um perfil personalizado, as cores valem para o fundo da página inteira.
    const seen = route === 'gato' ? findCat(arg) : null;
    const pageTheme = route === 'perfil' ? S.user.theme : seen && !isBlocked(arg) && !blockedMe(seen) ? seen.theme : null;
    document.body.classList.toggle('page-themed', !!pageTheme);
    document.body.style.cssText = pageTheme ? themeStyle(pageTheme) : '';
    const view = (views[route] || viewHome)();
    app.innerHTML = `<div class="shell">
      <header class="topbar"><a href="#/">${LOGO}</a>
        <div class="topbar-actions only-mobile"><a class="icon-btn" href="#/buscar" aria-label="Buscar gatinhos">${I.search}</a><a class="icon-btn" href="#/chats" aria-label="C(h)ats">${I.chat}</a>
        ${route === 'perfil' || route === 'config' ? `<a class="icon-btn ${route === 'config' ? 'on' : ''}" href="#/config" aria-label="Configurações">${I.gear}</a>` : `<a class="avatar" href="#/perfil" aria-label="Meu PerfilCat">${userFace()}</a>`}</div></header>
      <nav class="nav" aria-label="Principal">${NAV.map(([r, t, ic]) => `<a href="#/${r}" class="${r === route ? 'on' : ''}" ${r === route ? 'aria-current="page"' : ''}>${ic}<span>${t}</span></a>`).join('')}
        <a href="#/compras" class="only-desktop ${route === 'compras' ? 'on' : ''}" ${route === 'compras' ? 'aria-current="page"' : ''}>${I.shop}<span>Compras</span></a>
        <a href="#/buscar" class="only-desktop ${route === 'buscar' ? 'on' : ''}" ${route === 'buscar' ? 'aria-current="page"' : ''}>${I.search}<span>Buscar</span></a>
        <a href="#/chats" class="only-desktop">${I.chat}<span>C(h)ats</span></a>
        ${isAdmin() ? `<a href="#/moderacao" class="only-desktop ${route === 'moderacao' ? 'on' : ''}" ${route === 'moderacao' ? 'aria-current="page"' : ''}>${I.shield}<span>Moderação${pendingReports().length ? ` <i class="badge-n">${pendingReports().length}</i>` : ''}</span></a>` : ''}
        <a href="#/config" class="nav-cfg only-desktop ${route === 'config' ? 'on' : ''}" ${route === 'config' ? 'aria-current="page"' : ''}>${I.gear}<span>Configurações</span></a>
        <a href="#/perfil" class="nav-me only-desktop ${route === 'perfil' ? 'on' : ''}" ${route === 'perfil' ? 'aria-current="page"' : ''}><span class="avatar">${userFace()}</span><span><b>${esc(S.user.catName)}</b><small>@${esc(S.user.username || 'perfil')}</small></span></a>
        ${isAdmin() ? `<a href="#/moderacao" class="only-mobile nav-mod ${route === 'moderacao' ? 'on' : ''}" ${route === 'moderacao' ? 'aria-current="page"' : ''}>${I.shield}<span>Moderar</span>${pendingReports().length ? `<i class="badge-n" aria-label="${pendingReports().length} pendentes">${pendingReports().length}</i>` : ''}</a>` : ''}</nav>
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
    const th = { ...PF_DEFAULT, ...(u.theme || {}) };
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
      <fieldset class="theme-edit"><legend>Aparência do perfil</legend>
        <p class="muted">Deixe o perfil com a cara do seu gatinho. Quem visitar vê do mesmo jeito.</p>
        <div class="chips theme-presets"><button type="button" class="chip ${u.theme ? '' : 'on'}" data-act="theme-preset" data-id="default">Padrão</button>${Object.keys(PF_PRESETS).map((n) => `<button type="button" class="chip" data-act="theme-preset" data-id="${n}">${n}</button>`).join('')}</div>
        <label class="field"><span>Fonte do nome</span><span class="plain"><select name="t_font">${Object.keys(PF_FONTS).map((n) => `<option ${n === th.font ? 'selected' : ''}>${n}</option>`).join('')}</select></span></label>
        <div class="color-grid">
          <label>Cor do nome<input type="color" name="t_name" value="${th.name}"></label>
          <label>Destaque<input type="color" name="t_accent" value="${th.accent}"></label>
          <label>Cartões<input type="color" name="t_card" value="${th.card}"></label>
          <label>Fundo 1<input type="color" name="t_bg" value="${th.bg}"></label>
          <label>Fundo 2<input type="color" name="t_bg2" value="${th.bg2}"></label>
        </div>
        <div class="pf-page themed theme-preview" id="theme-preview" style="${themeStyle(th)}"><div class="card"><b class="tp-name">${esc(u.catName)}</b><span class="btn small">Seguir</span></div></div>
      </fieldset>
      <p class="error" role="alert"></p>
      <div class="actions"><button type="button" class="btn ghost" data-close>Cancelar</button><button class="btn">Salvar</button></div></form>`);
  }
  // O que foi digitado vai para o rascunho, para não se perder ao abrir o ajuste de imagem.
  document.addEventListener('input', (e) => {
    if (!(draft && e.target.form && e.target.form.id === 'profile-form' && e.target.name)) return;
    if (e.target.name.startsWith('t_')) {
      draft.theme = { ...PF_DEFAULT, ...(draft.theme || {}), [e.target.name.slice(2)]: e.target.value };
      const pv = document.getElementById('theme-preview');
      if (pv) pv.style.cssText = themeStyle(draft.theme);
    } else draft[e.target.name] = e.target.value;
  });

  async function startCrop(kind) {
    const [file] = await pickFile('image/*');
    if (!file) return;
    const img = new Image();
    img.onerror = () => alert(`Não consegui abrir essa imagem (${file.name}, ${file.type || 'tipo desconhecido'}). Use JPG, PNG ou WEBP.`);
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

  function richNewRow() {
    const row = document.createElement('div');
    row.className = 'rich-imgs'; row.contentEditable = 'false';
    row.innerHTML = '<span class="rich-ctl row-ctl"><button type="button" data-act="rich-row" data-id="up" aria-label="Mover linha para cima">↑</button><button type="button" data-act="rich-row" data-id="down" aria-label="Mover linha para baixo">↓</button><button type="button" data-act="rich-row" data-id="layout" aria-pressed="false" aria-label="Alternar entre lado a lado e empilhadas">▤</button><button type="button" data-act="rich-row" data-id="del" aria-label="Remover linha de fotos">×</button></span>';
    return row;
  }
  // Ajusta o número de colunas da linha; linha sem foto some.
  function richFixRow(row) {
    const n = row.querySelectorAll('figure').length;
    if (!n) { row.remove(); return; }
    row.classList.remove('n1', 'n2', 'n3'); row.classList.add('n' + n);
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
      <label class="field"><span>Tag</span><span class="plain"><input name="trend" list="trends" maxlength="30" placeholder="#SuaTag ou escolha uma trend" autocomplete="off" autocapitalize="none" spellcheck="false"></span>
        <small class="hint">Opcional. Crie a sua ou use uma das trends.</small></label>
      <datalist id="trends">${TRENDS.map((t) => `<option value="${t}">`).join('')}</datalist>
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
    'crop-apply': () => {
      try { draft[crop.kind] = cropResult(); showEdit(); }
      catch (e) { console.error('MEOWorld: recorte', e); alert('Não consegui usar essa imagem: ' + ((e && e.message) || e)); }
    },
    'go-login': () => { authView = 'login'; render(); },
    'go-account': () => { authView = 'account'; render(); },
    'toggle-pw': (_, el) => el.form.querySelectorAll('[name=password], [name=confirm]').forEach((i) => { i.type = el.checked ? 'text' : 'password'; }),
    set: (id, el) => { S.settings[id] = el.checked; save(); applyPrefs(); },
    'dock-toggle': () => { dockOpen = !dockOpen; renderDock(); },
    'dock-close': () => { dockChat = null; renderDock(); },
    follow: (id) => { S.following = isFollowing(id) ? S.following.filter((x) => x !== id) : [...S.following, id]; save(); render(); },
    'shop-jump': (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    'twin-photo': async () => {
      const [f] = await pickFile('image/*');
      if (!f) return;
      if (twinPending) URL.revokeObjectURL(twinPending.url);
      twinPending = { file: f, url: URL.createObjectURL(f), post: S.settings.showInTwins };
      twinMsg = ''; render();
    },
    'twin-post-toggle': (_, el) => { twinPending.post = el.checked; },
    'twin-cancel': () => { URL.revokeObjectURL(twinPending.url); twinPending = null; render(); },
    'twin-compare': async () => {
      const p = twinPending;
      await analyzeTwinPhoto(p.file, p.post);
      if (S.twin && !/^Não consegui/.test(twinMsg)) { URL.revokeObjectURL(p.url); twinPending = null; if (p.post) twinMsg = (twinMsg ? twinMsg + ' ' : '') + 'Foto publicada na timeline.'; }
      if (location.hash.startsWith('#/twincats')) render();
    },
    'twin-clear': async () => {
      const old = S.posts.filter((p) => p.twin);
      S.twin = null; S.posts = S.posts.filter((p) => !p.twin); twinMsg = ''; save(); render();
      for (const p of old) { try { await delMedia(p.mediaId); } catch { /* já removida */ } }
    },
    'feed-tab': (id) => { feedTab = id; render(); window.scrollTo(0, 0); },
    'like-post': (id) => { S.likedPosts = S.likedPosts.includes(id) ? S.likedPosts.filter((x) => x !== id) : [...S.likedPosts, id]; save(); render(); },
    'new-post': () => openModal(`<form id="post-form"><h2>Novo post</h2>
      <label class="field"><span>Foto</span><span class="plain"><input type="file" name="file" accept="image/*" required style="padding-top:14px"></span></label>
      <label class="field"><span>Legenda</span><span class="plain"><textarea name="caption" maxlength="200" rows="3" placeholder="O que o seu gatinho aprontou hoje?"></textarea></span></label>
      <p class="error" role="alert"></p>
      <div class="actions"><button type="button" class="btn ghost" data-close>Cancelar</button><button class="btn">Publicar</button></div></form>`),
    'del-post': async (id) => {
      if (!confirm('Excluir este post?')) return;
      const p = S.posts.find((x) => x.id === id);
      S.posts = S.posts.filter((x) => x.id !== id);
      save(); render();
      for (const mid of postMedia(p)) { try { await delMedia(mid); } catch { /* já removida */ } }
    },
    // ----- chat -----
    'chat-panel': (id, el) => { const name = el.dataset.m; chatUI = { id, panel: chatUI.id === id && chatUI.panel === name ? null : name }; refreshChat(id); },
    'chat-emoji': (id, el) => {
      const input = document.querySelector(`form.chat-form[data-id="${id}"] input[name=text]`);
      if (input) { input.value += el.dataset.m; input.focus(); }
    },
    'chat-color': (id, el) => { const cv = getConvo(id); cv.color = el.dataset.m === 'default' ? '' : el.dataset.m; putConvo(id, cv); chatUI.panel = null; refreshChat(id); },
    'chat-sticker': (id, el) => {
      const key = el.dataset.m;
      if (key.startsWith('e:')) return sendMsg(id, { kind: 'sticker', text: key.slice(2) });
      const s = S.stickers.find((x) => x.id === key);
      if (s) sendMsg(id, { kind: 'sticker', src: s.src });
    },
    'sticker-new': async (id) => {
      if (S.stickers.length >= 12) { alert('Você já tem 12 stickers. Exclua um para criar outro.'); return; }
      const [f] = await pickFile('image/*');
      if (!f) return;
      try {
        const big = await shrink(f, 600), side = Math.min(big.width, big.height);
        const cv = document.createElement('canvas');
        cv.width = cv.height = 160;
        cv.getContext('2d').drawImage(big, (big.width - side) / 2, (big.height - side) / 2, side, side, 0, 0, 160, 160);
        let src = cv.toDataURL('image/webp', 0.85);
        if (!src.startsWith('data:image/webp')) src = cv.toDataURL('image/png');
        S.stickers.push({ id: uid(), src }); save();
        chatUI = { id, panel: 'sticker' }; refreshChat(id);
      } catch { alert('Não consegui criar o sticker com essa imagem.'); }
    },
    'sticker-del': (id, el) => { S.stickers = S.stickers.filter((x) => x.id !== el.dataset.m); save(); refreshChat(id); },
    'chat-attach': async (id) => {
      const [f] = await pickFile('image/*,video/*');
      if (!f) return;
      try {
        if (f.type.startsWith('video/')) {
          if (f.size > 40 * 1024 * 1024) { alert('Vídeo muito grande (máximo 40 MB).'); return; }
          sendMsg(id, { kind: 'video', mediaId: await putMedia(f) });
        } else if (f.type === 'image/gif') {
          if (f.size > 8 * 1024 * 1024) { alert('GIF muito grande (máximo 8 MB).'); return; }
          sendMsg(id, { kind: 'gif', mediaId: await putMedia(f) });
        } else {
          const cv = await shrink(f, 1280);
          const blob = await new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.85));
          sendMsg(id, { kind: 'image', mediaId: await putMedia(blob) });
        }
      } catch { alert('Não consegui enviar esse arquivo.'); }
    },
    'msg-del': async (id, el) => {
      if (!confirm(isDM(id) ? 'Apagar esta mensagem para todos?' : 'Apagar esta mensagem?')) return;
      const cv = getConvo(id), m = cv.msgs.find((x) => x.id === el.dataset.m);
      if (!m) return;
      const media = m.mediaId;
      m.deleted = true; delete m.text; delete m.mediaId; delete m.src; delete m.kind;
      putConvo(id, cv); refreshChat(id);
      if (media) { try { await delMedia(media); } catch { /* já removida */ } }
    },
    // ----- bloquear e denunciar -----
    more: (id, el) => {
      const c = findCat(id), post = el.dataset.m || '';
      openModal(`<h2>${esc(c.catName)} <small class="muted">@${esc(c.username)}</small></h2>
        <div class="menu">
          <button class="btn ghost" data-act="report-open" data-id="${id}" data-m="${post}">${post ? 'Denunciar este post' : 'Denunciar'}</button>
          ${isBlocked(id) ? `<button class="btn ghost" data-act="unblock" data-id="${id}">Desbloquear</button>` : `<button class="btn danger" data-act="block" data-id="${id}">Bloquear</button>`}
          <button class="btn ghost" data-close>Cancelar</button>
        </div>
        <p class="muted" style="margin-top:12px">Ao bloquear, vocês deixam de ver o perfil, os posts e as mensagens um do outro.</p>`);
    },
    block: (id) => {
      const c = findCat(id);
      if (!confirm(`Bloquear ${c.catName} (@${c.username})?`)) return;
      doBlock(id);
      modal.open && modal.close();
      if (location.hash === `#/chats/${id}`) location.hash = '#/chats';
      render();
    },
    unblock: (id) => { S.blocked = S.blocked.filter((x) => x !== id); save(); modal.open && modal.close(); render(); },
    'report-open': (id, el) => {
      const c = findCat(id), post = el.dataset.m || '';
      openModal(`<form id="report-form" data-id="${id}" data-post="${post}"><h2>Denunciar ${post ? 'post de ' : ''}${esc(c.catName)}</h2>
        <fieldset class="reasons"><legend>O que está acontecendo?</legend>${REPORT_REASONS.map((r, i) => `<label class="check"><input type="radio" name="reason" value="${r}" ${i === 0 ? 'checked' : ''}> ${r}</label>`).join('')}</fieldset>
        <label class="field"><span>Detalhes (opcional)</span><span class="plain"><textarea name="details" maxlength="300" rows="2"></textarea></span></label>
        <label class="check"><input type="checkbox" name="alsoBlock" checked> Bloquear também</label>
        <div class="actions" style="margin-top:14px"><button type="button" class="btn ghost" data-close>Cancelar</button><button class="btn danger">Enviar denúncia</button></div></form>`);
    },
    // ----- aparência do perfil -----
    'theme-preset': (id) => { draft.theme = id === 'default' ? null : { ...PF_PRESETS[id] }; showEdit(); },
    // ----- editor de posts -----
    'new-rich': () => openRich(),
    'rich-cmd': (id) => { richFocus(); document.execCommand(id, false, null); },
    'rich-color': (id) => { richFocus(); document.execCommand('foreColor', false, id === 'default' ? '#2b3f4c' : id); },
    'rich-link': () => {
      const url = (prompt('Endereço do link (começando com https://):') || '').trim();
      if (!url) return;
      if (!/^https?:\/\//i.test(url)) { alert('O link precisa começar com http:// ou https://'); return; }
      richFocus(); document.execCommand('createLink', false, url);
    },
    'rich-menu': () => { const m = document.getElementById('rich-styles'); m.hidden = !m.hidden; },
    'rich-style': (id) => {
      const ed = richFocus(), sel = window.getSelection();
      let a = richBlock(ed, sel.anchorNode), b = richBlock(ed, sel.focusNode);
      if (!a) { a = b = ed.appendChild(Object.assign(document.createElement('p'), { innerHTML: '<br>' })); }
      if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING) [a, b] = [b, a];
      for (let n = a; n; n = n.nextElementSibling) { if (!n.classList.contains('rich-imgs')) n.className = 'rs-' + id; if (n === b) break; }
      document.getElementById('rich-styles').hidden = true;
    },
    'rich-img': async () => {
      const files = (await pickFile('image/*', true)).slice(0, 9);
      if (!files.length) return;
      const ed = document.getElementById('rich-editor');
      let after = richSel ? richBlock(ed, richSel.endContainer) : null;
      for (let i = 0; i < files.length; i += 3) {
        const row = richNewRow();
        for (const f of files.slice(i, i + 3)) {
          try {
            let blob = f;
            if (f.type !== 'image/gif') { const cv = await shrink(f, 1280); blob = await new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.85)); }
            const id = await putMedia(blob);
            richMedia.push(id);
            const fig = document.createElement('figure');
            fig.dataset.mid = id;
            fig.innerHTML = `<img alt="" src="${await mediaURL(id)}"><span class="rich-ctl fig-ctl"><button type="button" data-act="rich-pic" data-id="left" aria-label="Mover para a esquerda">←</button><button type="button" data-act="rich-pic" data-id="right" aria-label="Mover para a direita">→</button><button type="button" data-act="rich-pic" data-id="down" aria-label="Colocar em uma linha própria, abaixo">↓</button><button type="button" data-act="rich-pic" data-id="del" aria-label="Remover foto">×</button></span>`;
            row.insertBefore(fig, row.querySelector('.row-ctl'));
          } catch { alert(`Não consegui adicionar “${f.name}”.`); }
        }
        if (!row.querySelector('figure')) continue;
        if (after) after.after(row); else ed.appendChild(row);
        richFixRow(row);
        after = row;
      }
      // Sempre sobra um parágrafo depois das fotos, para continuar escrevendo.
      if (after && !after.nextElementSibling) after.after(Object.assign(document.createElement('p'), { className: 'rs-normal', innerHTML: '<br>' }));
    },
    // Uma foto: trocar de lugar na linha, passar para a linha vizinha, ganhar linha própria ou sair.
    'rich-pic': (id, el) => {
      const fig = el.closest('figure'), row = fig.parentNode;
      const isRow = (n) => !!n && n.classList.contains('rich-imgs');
      const room = (r) => isRow(r) && r.querySelectorAll('figure').length < 3;
      if (id === 'del') fig.remove();
      if (id === 'left') {
        const p = fig.previousElementSibling, pr = row.previousElementSibling;
        if (p && p.tagName === 'FIGURE') row.insertBefore(fig, p);
        else if (room(pr)) { pr.insertBefore(fig, pr.querySelector('.row-ctl')); richFixRow(pr); }
      }
      if (id === 'right') {
        const n = fig.nextElementSibling, nx = row.nextElementSibling;
        if (n && n.tagName === 'FIGURE') row.insertBefore(n, fig);
        else if (room(nx)) { nx.insertBefore(fig, nx.firstChild); richFixRow(nx); }
      }
      if (id === 'down' && row.querySelectorAll('figure').length > 1) {
        const nr = richNewRow();
        nr.insertBefore(fig, nr.firstChild);
        row.after(nr); richFixRow(nr);
      }
      richFixRow(row);
    },
    // A linha inteira: subir, descer, alternar entre lado a lado e empilhadas, ou remover.
    'rich-row': (id, el) => {
      const row = el.closest('.rich-imgs'), ed = row.parentNode;
      if (id === 'up' && row.previousElementSibling) ed.insertBefore(row, row.previousElementSibling);
      if (id === 'down' && row.nextElementSibling) ed.insertBefore(row.nextElementSibling, row);
      if (id === 'layout') { row.classList.toggle('stack'); el.textContent = row.classList.contains('stack') ? '▥' : '▤'; el.setAttribute('aria-pressed', row.classList.contains('stack')); }
      if (id === 'del') row.remove();
    },
    // ----- moderação -----
    'mod-dismiss': (id) => { const m = getMod(); m.handled[id] = { action: 'Arquivada', ts: Date.now() }; putMod(m); render(); },
    'mod-remove': async (id) => {
      const r = allReports().find((x) => x.id === id), found = r && findPost(r.post);
      if (!r || !confirm('Remover este post para todo mundo?')) return;
      const m = getMod();
      if (found && found.seed) m.removedPosts[r.post] = true;
      else if (found) {
        const st = accountState(found.owner);
        st.posts = (st.posts || []).filter((p) => p.id !== r.post);
        if (found.owner === session) save(); else localStorage.setItem(`${KEY}:${found.owner}`, JSON.stringify(st));
        for (const mid of postMedia(found.post)) { try { await delMedia(mid); } catch { /* já removida */ } }
      }
      // Todas as denúncias sobre o mesmo post ficam resolvidas juntas.
      allReports().filter((x) => x.post === r.post).forEach((x) => { m.handled[x.id] = { action: 'Post removido', ts: Date.now() }; });
      putMod(m); render();
    },
    'mod-suspend': (id) => {
      const r = allReports().find((x) => x.id === id), c = r && anyCat(r.target);
      if (!c || !confirm(`Suspender a conta de ${c.catName} (@${c.username})? Ela some para todos e não consegue mais entrar.`)) return;
      const m = getMod();
      m.suspended[isDM(r.target) ? r.target.slice(2) : r.target] = Date.now();
      allReports().filter((x) => x.target === r.target).forEach((x) => { m.handled[x.id] = { action: 'Conta suspensa', ts: Date.now() }; });
      putMod(m);
      if (dockChat === r.target) dockChat = null;
      render();
    },
    'mod-restore': (id) => { const m = getMod(); delete m.suspended[id]; putMod(m); render(); },
    'onboard-close': () => { S.onboard = false; save(); render(); },
    logout: () => { setSession(null); authView = 'login'; location.hash = ''; render(); },
    'delete-account': async () => {
      if (!confirm(`Excluir a conta @${session}? Isso apaga o perfil, álbuns, vídeos e conversas dela neste navegador.`)) return;
      const media = [...S.albums.flatMap((a) => a.items), ...S.tiks.map((t) => t.mediaId), ...S.posts.flatMap(postMedia)];
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
    if (el && actions[el.dataset.act]) { if (el.dataset.act === 'shop-jump') e.preventDefault(); actions[el.dataset.act](el.dataset.id, el); }
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
      for (const other of Object.keys(accounts)) {
        if (other === name) continue;
        const st = readJSON(`${KEY}:${other}`, null);
        if (st && (st.following || []).includes('u:' + old)) { st.following = st.following.map((x) => (x === 'u:' + old ? 'u:' + name : x)); localStorage.setItem(`${KEY}:${other}`, JSON.stringify(st)); }
      }
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
      if (getMod().suspended[name]) { err.textContent = 'Esta conta foi suspensa pela moderação.'; return; }
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
      S.user = Object.assign({ coat: COATS[0].color, bio: '', photo: '' }, S.user, u, f.id === 'profile-form' ? { coat: str('coat') || S.user.coat, bio: str('bio'), photo: (draft && draft.photo) || '', cover: (draft && draft.cover) || '', theme: (draft && draft.theme) || null } : {});
      draft = null;
      // Depois do cadastro, a pessoa cai no próprio perfil, com a lista de primeiros passos.
      if (f.id === 'signup') { S.onboard = true; location.hash = '#/perfil'; }
      save(); modal.open && modal.close(); render();
    }

    if (f.id === 'report-form') {
      const target = f.dataset.id;
      S.reports.push({ id: uid(), target, post: f.dataset.post || '', reason: str('reason'), details: str('details'), ts: Date.now() });
      if (d.alsoBlock) doBlock(target); else save();
      if (location.hash === `#/chats/${target}` && isBlocked(target)) location.hash = '#/chats';
      render();
      openModal(`<h2>Denúncia registrada</h2>
        <p>Obrigado por avisar.${d.alsoBlock ? ' A conta foi bloqueada e não aparece mais para você.' : ''}</p>
        <p class="muted" style="margin-top:10px">Em modo de teste local, a denúncia fica guardada neste navegador (em Configurações) e ainda não há uma equipe analisando.</p>
        <div class="actions" style="margin-top:14px"><button class="btn" data-close>Fechar</button></div>`);
      return;
    }

    if (f.id === 'rich-form') {
      const ed = f.querySelector('#rich-editor'), blocks = [], used = [];
      [...ed.childNodes].forEach((n) => {
        if (n.nodeType === 1 && n.classList.contains('rich-imgs')) {
          const ids = [...n.querySelectorAll('figure')].map((g) => g.dataset.mid).filter((x) => richMedia.includes(x));
          if (ids.length) { blocks.push({ t: 'img', ids, stack: n.classList.contains('stack') }); used.push(...ids); }
          return;
        }
        const h = n.nodeType === 3 ? esc(n.nodeValue) : n.nodeType === 1 ? cleanInline(n) : '';
        if (!h.replace(/<br>/g, '').trim()) return;
        const st = n.nodeType === 1 ? ([...n.classList].find((c) => c.startsWith('rs-')) || 'rs-normal').slice(3) : 'normal';
        blocks.push({ t: 'p', s: RICH_STYLES.some(([k]) => k === st) ? st : 'normal', h: h.slice(0, 4000) });
      });
      if (!blocks.length) { err.textContent = 'Escreva alguma coisa ou adicione uma foto.'; return; }
      const tags = [...new Set(str('tags').split(/[\s,]+/).map(cleanTag).filter(Boolean))].slice(0, 8);
      S.posts.push({ id: uid(), kind: 'rich', blocks: blocks.slice(0, 60), tags, ts: Date.now() });
      richDone = true;
      richMedia.filter((id) => !used.includes(id)).forEach((id) => { delMedia(id).catch(() => {}); });
      save(); modal.close(); feedTab = 'foryou'; location.hash = '#/'; render(); window.scrollTo(0, 0);
      return;
    }

    if (f.id === 'post-form') {
      const file = f.file.files[0];
      if (!file || !file.type.startsWith('image/')) { err.textContent = 'Escolha uma foto.'; return; }
      try {
        const cv = await shrink(file, 1080);
        const blob = await new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.85));
        S.posts.push({ id: uid(), mediaId: await putMedia(blob), caption: str('caption'), ts: Date.now() });
        save(); modal.close(); feedTab = 'foryou'; location.hash = '#/'; render(); window.scrollTo(0, 0);
      } catch { err.textContent = 'Não consegui publicar essa foto.'; }
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
        S.tiks.push({ id: uid(), mediaId, caption: str('caption'), trend: cleanTag(str('trend')), liked: false, ts: Date.now() });
        save(); modal.close(); render();
      } catch { err.textContent = 'Não foi possível salvar o vídeo neste navegador.'; }
    }

    if (f.id === 'send' || f.id === 'dock-send') {
      const text = str('text');
      if (text) sendMsg(f.dataset.id, { kind: 'text', text });
    }
  });

  // Se a conta foi suspensa enquanto estava logada, ela é desconectada ao abrir o app.
  if (session && getMod().suspended[session]) { setSession(null); authView = 'login'; }
  render();
})();
