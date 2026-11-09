/* ============================================================
   Sujitha & Sidharth — interactions
   ============================================================ */

// ---------- Config (edit these) ----------
const CONFIG = {
  // Where the RSVP form posts. Leave '' to keep it client-side (shows thank-you only).
  // e.g. a Google Apps Script web-app URL, Formspree, or your own endpoint.
  RSVP_ENDPOINT: '',
  // WhatsApp number in international format without '+', e.g. '919876543210'. '' hides the link.
  WHATSAPP: '',
  MUSIC_VOLUME: 0.45,
  // Dress-code dots per event: hex colours. Empty = "to be announced".
  DRESS: { sangeet: [], reception: [], muhurtham: [] },
  // Calendar events (IST). Edit Sangeet time when known.
  EVENTS: {
    sangeet:   { title: 'Sangeet — Sujitha & Sidharth', start: '20261210T180000', end: '20261210T230000', loc: 'MGM Beach Resorts, East Coast Road, Muttukadu, Chennai', tba: true },
    reception: { title: 'Wedding Reception — Sujitha & Sidharth', start: '20261213T183000', end: '20261213T220000', loc: 'Grand Empire Convention Hall, Thanjavur Road, Thiruverumbur, Trichy 620013' },
    muhurtham: { title: 'Muhurtham — Sujitha weds Sidharth', start: '20261214T053000', end: '20261214T070000', loc: 'Grand Empire Convention Hall, Thanjavur Road, Thiruverumbur, Trichy 620013' }
  },
  MUHURTHAM_ISO: '2026-12-14T05:30:00+05:30'
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---------- Language ----------
let lang = localStorage.getItem('lang') || 'en';
function applyLang(l) {
  lang = l;
  const dict = window.I18N[l] || window.I18N.en;
  $$('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if (dict[k] != null) el.innerHTML = dict[k]; });
  document.documentElement.lang = l;
  document.body.classList.toggle('lang-ta', l === 'ta');
  $('#langBtn').textContent = dict['lang.btn'];
  syncAudioBtn();
  try { localStorage.setItem('lang', l); } catch {}
}

// ---------- Opener: tap → lamp lights → curtains part → music ----------
const opener = $('#opener');
const page = $('#page');
const music = $('#bgMusic');
const audioBtn = $('#audioBtn');
const audioLabel = $('#audioLabel');
let opened = false, musicCtx = null;

function setUpMusicVolume() {
  if (musicCtx) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    musicCtx = new Ctx();
    const gain = musicCtx.createGain();
    gain.gain.value = CONFIG.MUSIC_VOLUME;
    musicCtx.createMediaElementSource(music).connect(gain).connect(musicCtx.destination);
  } catch { music.volume = CONFIG.MUSIC_VOLUME; }
}
function resumeCtx() { if (musicCtx && musicCtx.state === 'suspended') musicCtx.resume().catch(() => {}); }
document.addEventListener('click', resumeCtx);
document.addEventListener('touchend', resumeCtx, { passive: true });

function openInvitation() {
  if (opened) return; opened = true;
  opener.classList.add('is-lit');
  // music must start inside the tap gesture
  if (music.querySelector('source')?.getAttribute('src')) {
    setUpMusicVolume(); resumeCtx();
    music.play().then(showAudioBtn).catch(() => {});
    music.addEventListener('loadedmetadata', showAudioBtn, { once: true });
  }
  setTimeout(() => opener.classList.add('is-open'), 1100);
  setTimeout(() => {
    document.body.classList.remove('is-sealed');
    page.removeAttribute('aria-hidden');
    opener.classList.add('is-gone');
    startPetals(); queueReveal(); initScroll();
  }, 1500);
  setTimeout(() => { opener.style.display = 'none'; }, 2400);
}
opener.addEventListener('click', openInvitation);
opener.addEventListener('touchstart', openInvitation, { passive: true });

function showAudioBtn() {
  if (!music.duration && music.readyState === 0) return;
  audioBtn.hidden = false;
  requestAnimationFrame(() => audioBtn.classList.add('show'));
  clearTimeout(showAudioBtn.t); showAudioBtn.t = setTimeout(() => audioBtn.classList.add('compact'), 4000);
}
function syncAudioBtn() {
  const d = window.I18N[lang];
  audioBtn.setAttribute('aria-pressed', String(!music.paused));
  audioLabel.textContent = music.paused ? d['audio.play'] : d['audio.pause'];
}
audioBtn.addEventListener('click', () => {
  if (music.paused) { resumeCtx(); music.play().catch(() => {}); } else music.pause();
  audioBtn.classList.remove('compact'); clearTimeout(showAudioBtn.t); showAudioBtn.t = setTimeout(() => audioBtn.classList.add('compact'), 2500);
});
music.addEventListener('play', syncAudioBtn); music.addEventListener('pause', syncAudioBtn);
$('#langBtn').addEventListener('click', () => applyLang(lang === 'en' ? 'ta' : 'en'));
applyLang(lang);

// ---------- Scroll reveal (rect-based, robust) ----------
let pending = $$('.rv'), raf = false;
function revealInView() {
  raf = false; const vh = innerHeight;
  pending = pending.filter(el => { const r = el.getBoundingClientRect(); if (r.top < vh * 0.9 && r.bottom > 0) { el.classList.add('in'); return false; } return true; });
}
function queueReveal() { if (raf || !pending.length) return; raf = true; requestAnimationFrame(revealInView); }
addEventListener('scroll', queueReveal, { passive: true }); addEventListener('resize', queueReveal);

// ---------- GSAP parallax & dock highlighting ----------
function initScroll() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.to('.hero__art', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.kolam', { rotate: 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  $$('.event__pic img').forEach(img => gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } }));
  $$('.count__cell').forEach((c, i) => gsap.from(c, { y: 40, opacity: 0, duration: .8, delay: i * .1, scrollTrigger: { trigger: '.count__row', start: 'top 85%' } }));
  const links = $$('.dock a');
  links.forEach(a => {
    const sec = $(a.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: s => a.classList.toggle('active', s.isActive) });
  });
}

// ---------- Petals ----------
function startPetals() {
  const box = $('#petals'); if (!box || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const n = innerWidth < 600 ? 16 : 26;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i'); p.className = 'petal' + (i % 4 === 0 ? ' gold' : '');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.setProperty('--dur', 10 + Math.random() * 10 + 's');
    p.style.setProperty('--delay', -Math.random() * 18 + 's');
    p.style.setProperty('--drift', (Math.random() * 160 - 80) + 'px');
    p.style.setProperty('--spin', (Math.random() * 720 - 360) + 'deg');
    p.style.transform = `scale(${.6 + Math.random() * .8})`;
    box.appendChild(p);
  }
}

// ---------- Scratch-to-reveal date ----------
(function scratch() {
  const wrap = $('#scratch'); if (!wrap) return;
  const cv = wrap.querySelector('canvas'); const ctx = cv.getContext('2d');
  function paint() {
    const r = wrap.getBoundingClientRect(); cv.width = Math.max(1, r.width * devicePixelRatio); cv.height = Math.max(1, r.height * devicePixelRatio);
    const g = ctx.createLinearGradient(0, 0, cv.width, cv.height);
    g.addColorStop(0, '#8a5a12'); g.addColorStop(.25, '#e2bf63'); g.addColorStop(.5, '#c9962b'); g.addColorStop(.75, '#f3d27a'); g.addColorStop(1, '#8a5a12');
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
    // zari texture
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1 * devicePixelRatio;
    for (let x = -cv.height; x < cv.width; x += 14 * devicePixelRatio) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + cv.height, cv.height); ctx.stroke(); }
    ctx.fillStyle = 'rgba(90,15,22,.85)'; ctx.font = `${13 * devicePixelRatio}px Marcellus, serif`; ctx.textAlign = 'center';
    ctx.fillText('✦  14 · 12 · 2026  ✦', cv.width / 2, cv.height / 2 - 6 * devicePixelRatio);
  }
  paint(); addEventListener('resize', () => { if (!wrap.classList.contains('is-done')) paint(); });
  let down = false, cleared = 0, lastCheck = 0;
  const pt = e => { const r = cv.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return [(t.clientX - r.left) * devicePixelRatio, (t.clientY - r.top) * devicePixelRatio]; };
  function rub(e) {
    if (!down) return; e.preventDefault(); wrap.classList.add('is-touched');
    const [x, y] = pt(e); ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(x, y, 22 * devicePixelRatio, 0, Math.PI * 2); ctx.fill();
    const now = performance.now(); if (now - lastCheck > 250) { lastCheck = now; check(); }
  }
  function check() {
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data; let n = 0;
    for (let i = 3; i < d.length; i += 4 * 16) if (d[i] === 0) n++;
    cleared = n / (d.length / (4 * 16));
    if (cleared > .45) { wrap.classList.add('is-done'); down = false; }
  }
  cv.addEventListener('pointerdown', e => { down = true; cv.setPointerCapture(e.pointerId); rub(e); });
  cv.addEventListener('pointermove', rub);
  cv.addEventListener('pointerup', () => { down = false; check(); });
  cv.addEventListener('pointercancel', () => { down = false; });
})();

// ---------- Dress-code dots ----------
$$('.event').forEach(ev => {
  const dots = CONFIG.DRESS[ev.dataset.ics] || []; const box = ev.querySelector('.dress__dots');
  box.innerHTML = dots.map(c => `<span style="background:${c}"></span>`).join('');
});

// ---------- Add to calendar (.ics) ----------
function ics(key) {
  const e = CONFIG.EVENTS[key]; if (!e) return;
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sujitha & Sidharth//Wedding//EN', 'BEGIN:VEVENT',
    `UID:${key}-sujitha-sidharth-2026@invite`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')}`,
    `DTSTART;TZID=Asia/Kolkata:${e.start}`, `DTEND;TZID=Asia/Kolkata:${e.end}`,
    `SUMMARY:${e.title}`, `LOCATION:${e.loc.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${e.tba ? 'Time to be confirmed. ' : ''}Wedding of Sujitha & Sidharth.`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); a.download = `${key}-sujitha-sidharth.ics`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
$$('.js-ics').forEach(b => b.addEventListener('click', () => ics(b.closest('.event').dataset.ics)));

// ---------- Countdown ----------
(function countdown() {
  const t = new Date(CONFIG.MUHURTHAM_ISO).getTime(); const cells = { d: $('[data-u=d]'), h: $('[data-u=h]'), m: $('[data-u=m]'), s: $('[data-u=s]') };
  const pad = n => String(n).padStart(2, '0');
  function tick() {
    let diff = Math.max(0, t - Date.now()); const d = Math.floor(diff / 864e5); diff -= d * 864e5; const h = Math.floor(diff / 36e5); diff -= h * 36e5; const m = Math.floor(diff / 6e4); const s = Math.floor((diff - m * 6e4) / 1e3);
    cells.d.textContent = d; cells.h.textContent = pad(h); cells.m.textContent = pad(m); cells.s.textContent = pad(s);
  }
  tick(); setInterval(tick, 1000);
})();

// ---------- RSVP ----------
(function rsvp() {
  const form = $('#rsvpForm'), done = $('#rsvpDone'), wa = $('#waLink');
  if (CONFIG.WHATSAPP) wa.href = `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent("Yes, we'll be there for Sujitha & Sidharth's wedding!")}`; else wa.parentElement.hidden = true;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form); const entry = { name: fd.get('name')?.trim(), guests: fd.get('guests'), events: fd.getAll('ev'), message: fd.get('message')?.trim(), lang, at: new Date().toISOString() };
    if (!entry.name) { form.name.focus(); return; }
    const btn = form.querySelector('button[type=submit]'); btn.disabled = true;
    try { if (CONFIG.RSVP_ENDPOINT) await fetch(CONFIG.RSVP_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(entry) }); } catch {}
    $$('label, fieldset, button', form).forEach(el => el.hidden = true); done.hidden = false;
  });
})();

// first paint of reveals (in case the opener is skipped, e.g. by a hash link)
if (location.hash && location.hash !== '#top') openInvitation();
