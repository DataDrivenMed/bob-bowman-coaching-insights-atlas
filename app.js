// Notes on Bob Bowman's coaching. Plain ES module, no dependencies, no build step.
// Data contract: threads.json (frozen archive) + weekly-updates.json (agent-written) + guide.json (reader overlay).

const SITE = "Notes on Bob Bowman's coaching";
const SUBSTACK = 'https://swimed.substack.com/subscribe';
const HOME_BRAND = 'https://datadrivenmed.github.io/';
const AUD = {coach: 'Coaches', swimmer: 'Swimmers', parent: 'Parents'};
const PRINCIPLE_COLORS = {vision: '#1C66B0', practice: '#0B3A53', prepared: '#0E7C6B', confidence: '#B23A1E', ownership: '#8A5A00', people: '#6A4C9C'};
const SYNONYMS = {
  taper: 'big-meet', championship: 'big-meet', champs: 'big-meet', meet: 'big-meet', race: 'big-meet',
  plateau: 'setbacks', slump: 'setbacks', stuck: 'setbacks', injury: 'setbacks', setback: 'setbacks', quit: 'setbacks',
  nerves: 'confidence-mental', anxiety: 'confidence-mental', pressure: 'confidence-mental', visualization: 'confidence-mental', visualize: 'confidence-mental', focus: 'confidence-mental', confidence: 'confidence-mental',
  parent: 'young-swimmers', parents: 'young-swimmers', kids: 'young-swimmers', children: 'young-swimmers', youth: 'young-swimmers', 'age-group': 'young-swimmers', specialization: 'young-swimmers',
  yardage: 'training-design', volume: 'training-design', intensity: 'training-design', drills: 'training-design', drill: 'training-design', suits: 'training-design', suit: 'training-design', technique: 'training-design',
  goals: 'planning-the-season', goal: 'planning-the-season', plan: 'planning-the-season', season: 'planning-the-season',
  motivation: 'motivation', lazy: 'motivation', commitment: 'motivation', consistency: 'motivation',
  team: 'team-culture', culture: 'team-culture', values: 'team-culture', group: 'team-culture',
  coach: 'growing-as-a-coach', mentor: 'growing-as-a-coach', burnout: 'growing-as-a-coach', career: 'growing-as-a-coach',
  review: 'after-the-result', records: 'after-the-result', win: 'after-the-result', success: 'after-the-result'
};

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const safeX = v => { try { const u = new URL(v); return u.protocol === 'https:' && ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'].includes(u.hostname) ? u.href : null; } catch { return null; } };
const safeHTTPS = v => { try { const u = new URL(v); return u.protocol === 'https:' ? u.href : null; } catch { return null; } };
const isDate = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
const fmtDate = (d, opts = {year: 'numeric', month: 'short', day: 'numeric'}) => isDate(d) ? new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', {...opts, timeZone: 'UTC'}) : 'Date unknown';
const fmtStamp = s => { const d = new Date(s); return isNaN(d) ? esc(s) : d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago'}); };
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked; preference lasts for this visit */ } }
};
const extIcon = '<svg class="ext" viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 2.5h5v5M9.5 2.5 3 9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const xLink = (url, label, cls = '') => { const u = safeX(url); return u ? `<a class="${cls}" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${label}${extIcon}<span class="sr"> (opens X)</span></a>` : ''; };

export function mountAtlas(root, raw, guide, opts = {}) {
  guide = guide && typeof guide === 'object' ? guide : {};
  const situations = Array.isArray(guide.situations) ? guide.situations : [];
  const sitById = new Map(situations.map((s, i) => [s.id, {...s, n: i + 1}]));
  const principles = Array.isArray(guide.principles) ? guide.principles : [];
  const aliases = guide.ideaAliases || {};
  const names = guide.ideaNames || {};
  const assignments = guide.assignments || {};
  const rules = guide.rules || {ideas: {}, keywords: []};
  const ideaPrinciple = new Map();
  principles.forEach(p => (p.ideas || []).forEach(i => ideaPrinciple.set(i, p.id)));
  const ideaName = i => names[i] || i;
  const ideaColor = i => PRINCIPLE_COLORS[ideaPrinciple.get(i)] || '#5B6B78';
  const weekly = raw.weeklyUpdate || null;
  const weeklyIds = new Set((weekly?.threads || []).map(t => t.id));
  // "New" means added by the weekly check and posted within 14 days of the last check.
  const checked = weekly && !isNaN(new Date(weekly.lastChecked)) ? new Date(weekly.lastChecked) : new Date();
  const newCutoff = new Date(checked.getTime() - 14 * 864e5).toISOString().slice(0, 10);

  // Prepare readable entries. Text-needed and fictional sample entries stay out of the reading views.
  const all = Array.isArray(raw.threads) ? raw.threads : [];
  const textNeeded = all.filter(t => !t.sample && t.status === 'text-needed');
  const list = all.filter(t => t && !t.sample && t.status === 'ready' && t.id && t.title).map(t => {
    const a = assignments[t.id] || {};
    const ownIdeas = Array.isArray(t.ideas) && t.ideas.length ? t.ideas : (a.ideas || []);
    const ideas = [...new Set(ownIdeas.map(i => aliases[i] || i))];
    const text = [t.title, t.summary, ...(t.posts || []).map(p => p.summary)].join(' ').toLowerCase();
    let sits = (Array.isArray(t.situations) ? t.situations : a.situations || []).filter(s => sitById.has(s));
    if (!sits.length) {
      const found = new Set();
      ideas.forEach(i => (rules.ideas?.[i] || []).forEach(s => found.add(s)));
      (rules.keywords || []).forEach(k => { try { if (new RegExp(k.pattern, 'i').test(text)) found.add(k.situation); } catch { /* bad pattern in guide.json; ignore */ } });
      sits = [...found].filter(s => sitById.has(s)).slice(0, 3);
    }
    let aud = (Array.isArray(t.audience) ? t.audience : a.audience || []).filter(x => AUD[x]);
    if (!aud.length) aud = [...new Set(sits.flatMap(s => sitById.get(s).audience || []))];
    if (!aud.includes('coach')) aud.unshift('coach');
    const posts = Array.isArray(t.posts) ? [...t.posts].sort((x, y) => x.order - y.order) : [];
    const quotes = (Array.isArray(t.quotes) ? t.quotes : []).filter(q => q && q.text && safeX(q.url));
    return {...t, ideas, sits, aud, posts, quotes, isWeekly: weeklyIds.has(t.id), isNew: weeklyIds.has(t.id) && isDate(t.date) && t.date >= newCutoff,
      hay: [text, ideas.map(ideaName).join(' ').toLowerCase(), ideas.join(' ').toLowerCase(), sits.map(s => sitById.get(s).title).join(' ').toLowerCase()].join(' ')};
  }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const byId = new Map(list.map(t => [t.id, t]));

  // Idea co-occurrence for the connections explorer.
  const ideaThreads = new Map();
  const pairCount = new Map();
  list.forEach(t => {
    t.ideas.forEach(i => { if (!ideaThreads.has(i)) ideaThreads.set(i, []); ideaThreads.get(i).push(t); });
    t.ideas.forEach(a => t.ideas.forEach(b => { if (a < b) { const k = a + '\u0000' + b; pairCount.set(k, (pairCount.get(k) || 0) + 1); } }));
  });
  const ideaBySlug = new Map([...ideaThreads.keys()].map(i => [slug(i), i]));
  const neighbors = idea => [...ideaThreads.keys()].filter(o => o !== idea).map(o => ({idea: o, n: pairCount.get(idea < o ? idea + '\u0000' + o : o + '\u0000' + idea) || 0})).filter(x => x.n > 0).sort((a, b) => b.n - a.n || a.idea.localeCompare(b.idea));
  const topIdea = [...ideaThreads.entries()].sort((a, b) => b[1].length - a[1].length)[0]?.[0];

  let aud = AUD[store.get('bb-notes.audience')] ? store.get('bb-notes.audience') : '';
  let firstRender = true;
  let lastList = {href: '#/', label: 'All situations'};

  const forAud = items => aud ? items.filter(t => t.aud.includes(aud)) : items;
  const inSit = id => list.filter(t => t.sits.includes(id));

  function search(q, items = list) {
    const words = q.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9-]/g, '')).filter(w => w.length > 1);
    if (!words.length) return items;
    return items.map(t => {
      let score = 0;
      for (const w of words) {
        const syn = SYNONYMS[w] || SYNONYMS[w.replace(/s$/, '')];
        const hit = t.hay.includes(w);
        const synHit = syn && t.sits.includes(syn);
        if (!hit && !synHit) return null;
        if (t.title.toLowerCase().includes(w)) score += 4;
        if (t.ideas.some(i => i.toLowerCase().includes(w) || ideaName(i).toLowerCase().includes(w))) score += 2;
        if (hit) score += 1;
        if (synHit) score += 1.5;
      }
      return {t, score};
    }).filter(Boolean).sort((a, b) => b.score - a.score || (b.t.date || '').localeCompare(a.t.date || '')).map(x => x.t);
  }

  // ---------- Shell ----------
  const navItems = [['/', 'Find help', 'M3 12h4l2-5 4 10 2-5h6'], ['/connections', 'Connections', 'M6 6m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M18 6m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M12 18m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M8 7.5l3 8.5M16 7.5l-3 8.5M8.5 6h7'], ['/library', 'All threads', 'M4 6h16M4 12h16M4 18h10'], ['/new', "What's new", 'M12 4v16M4 12h16']];
  root.className = 'app';
  root.innerHTML = `
  <a class="skip" href="#main-content" data-skip>Skip to content</a>
  <header class="top">
    <div class="wrap top-inner">
      <a class="wordmark" href="#/"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="2" width="28" height="28" rx="5" fill="#D9EEF4"/><path d="M16 6v17M10 23h12" stroke="#0F2230" stroke-width="3.2" stroke-linecap="round"/></svg><span>Notes on Bob Bowman's coaching</span></a>
      <nav class="nav-desk" aria-label="Main">${navItems.map(([h, l]) => `<a href="#${h}" data-nav="${h}">${l}</a>`).join('')}<a href="#/about" data-nav="/about">About</a></nav>
      <a class="about-mobile" href="#/about" data-nav="/about">About</a>
    </div>
    <p class="disclaimer wrap">Independent notes, not affiliated with or endorsed by Bob Bowman. Summaries are paraphrased with AI help, and each one links to his original post on X.</p>
  </header>
  ${opts.weeklyFailed ? '<p class="warn wrap" role="status">This week\'s additions could not load, so you are seeing the original archive only. That does not mean there are no new posts.</p>' : ''}
  <main id="main-content" tabindex="-1"></main>
  <footer class="foot">
    <div class="wrap foot-inner">
      <p>Independent notes. Not affiliated with or endorsed by Bob Bowman. Every summary links to its original post, and the ideas and situations are our reading of his threads, not his own labels.</p>
      <p class="foot-links"><a href="#/about">How these notes are made</a><button type="button" class="linklike" data-download>Download the thread data</button><a href="${HOME_BRAND}">A DataDrivenMed project</a></p>
    </div>
  </footer>
  <nav class="nav-mobile" aria-label="Main">${navItems.map(([h, l, d]) => `<a href="#${h}" data-nav="${h}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${l}</span></a>`).join('')}</nav>`;
  const main = root.querySelector('main');
  root.querySelector('[data-skip]').addEventListener('click', e => { e.preventDefault(); main.focus(); });
  root.querySelector('[data-download]').addEventListener('click', downloadData);

  function downloadData() {
    const {weeklyUpdate, archiveThreadIds, ...out} = raw;
    const blob = new Blob([JSON.stringify(out, null, 2) + '\n'], {type: 'application/json'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'bowman-threads.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---------- Shared pieces ----------
  const audSwitch = (label = 'Show threads for') => `<div class="aud" role="group" aria-label="${esc(label)}"><span class="aud-label">${esc(label)}</span>${[['', 'All'], ...Object.entries(AUD)].map(([k, l]) => `<button type="button" class="chip" data-aud="${k}" aria-pressed="${aud === k}">${l}</button>`).join('')}</div>`;
  function bindAud(rerender) { main.querySelectorAll('[data-aud]').forEach(b => b.addEventListener('click', () => { aud = b.dataset.aud; store.set('bb-notes.audience', aud); rerender(); })); }
  const sitLinks = t => t.sits.map(s => `<a href="#/s/${esc(s)}">${esc(sitById.get(s).title)}</a>`).join(', ');
  const ideaPill = (i, extra = '') => `<a class="pill" style="--c:${ideaColor(i)}" href="#/connections/${esc(slug(i))}">${esc(ideaName(i))}${extra}</a>`;
  const threadRow = (t, {showSits = false, start = false} = {}) => `
    <li class="row${start ? ' row-start' : ''}">
      ${start ? '<p class="start">Start here</p>' : ''}
      <h3><a href="#/t/${esc(t.id)}">${esc(t.title)}</a></h3>
      <p class="row-sum">${esc(t.summary)}</p>
      <p class="row-meta"><time datetime="${esc(t.date || '')}">${esc(fmtDate(t.date))}</time>${t.posts.length > 1 ? `<span>${t.posts.length}-part thread</span>` : ''}${t.isNew ? '<span class="new-tag">New</span>' : ''}${showSits && t.sits.length ? `<span class="row-sits">${t.sits.map(s => esc(sitById.get(s).title)).join(', ')}</span>` : ''}</p>
    </li>`;
  const cta = () => `<aside class="cta"><div><h2>Want the science behind the sets?</h2><p>The Chlorinated Chronicles is a free newsletter on swim science and training from the maker of these notes. No paywall.</p></div><a class="btn btn-primary" href="${SUBSTACK}" target="_blank" rel="noopener noreferrer">Subscribe free on Substack${extIcon}<span class="sr"> (opens Substack)</span></a></aside>`;
  const empty = (msg, href = '#/', label = 'Back to all situations') => `<div class="empty"><p>${msg}</p><a class="btn" href="${href}">${label}</a></div>`;

  // ---------- Views ----------
  function viewHome() {
    const counts = situations.map(s => forAud(inSit(s.id)).length);
    const max = Math.max(1, ...counts);
    const latest = list.filter(t => t.isWeekly).slice(0, 4);
    const latestList = latest.length ? latest : list.slice(0, 4);
    main.innerHTML = `
    <section class="intro wrap">
      <h1 tabindex="-1">What are you working on?</h1>
      <p class="lede">${list.length} of Bob Bowman's coaching threads, sorted by the problems coaches bring to the pool. Pick a lane, or search for what you're dealing with.</p>
      <form class="search" role="search" data-search>
        <label for="q" class="sr">Search the threads</label>
        <input id="q" type="search" name="q" placeholder="Try taper, plateau, confidence, parents" autocomplete="off" enterkeyhint="search">
        <button class="btn btn-primary" type="submit">Search</button>
      </form>
      <div class="quick" id="quick" aria-live="polite"></div>
      ${audSwitch()}
    </section>
    <section class="pool-wrap wrap" aria-labelledby="pool-h">
      <h2 id="pool-h" class="sr">Coaching situations</h2>
      <ol class="pool">${situations.map((s, i) => `
        <li class="lane${counts[i] ? '' : ' lane-empty'}"><a href="#/s/${esc(s.id)}">
          <span class="block" aria-hidden="true">${i + 1}</span>
          <span class="lane-body"><span class="lane-title">${esc(s.title)}</span><span class="lane-q">${esc(s.question)}</span>
            <span class="tline" style="--w:${counts[i] ? Math.max(.12, counts[i] / max) : 0}" aria-hidden="true"></span></span>
          <span class="lane-n"><b>${counts[i]}</b> ${counts[i] === 1 ? 'thread' : 'threads'}</span>
        </a></li>`).join('')}
      </ol>
      <p class="pool-note">The black line in each lane shows how many threads it holds${aud ? ` for ${AUD[aud].toLowerCase()}` : ''}.</p>
    </section>
    <section class="split wrap">
      <div>
        <h2>New from Bowman</h2>
        <p class="muted">${weekly ? `His account is checked every Monday. Last checked ${fmtStamp(weekly.lastChecked)}.` : 'The most recent threads in the archive.'}</p>
        <ul class="rows">${latestList.map(t => threadRow(t, {showSits: true})).join('')}</ul>
        <a class="more" href="#/new">Everything new</a>
      </div>
      <div>
        <h2>Study the system</h2>
        <p class="muted">Six ideas run through almost everything he writes. See how they connect, then read the threads where they meet.</p>
        <ul class="principles">${principles.map(p => `<li><a href="#/connections?p=${esc(p.id)}" style="--c:${PRINCIPLE_COLORS[p.id]}"><strong>${esc(p.title)}</strong><span>${esc(p.blurb)}</span></a></li>`).join('')}</ul>
      </div>
    </section>
    <div class="wrap">${cta()}</div>`;
    bindAud(viewHome);
    const form = main.querySelector('[data-search]'), input = form.q, quick = main.querySelector('#quick');
    form.addEventListener('submit', e => { e.preventDefault(); const q = input.value.trim(); location.hash = '#/library' + (q ? '?q=' + encodeURIComponent(q) : ''); });
    input.addEventListener('input', () => {
      const q = input.value.trim();
      if (q.length < 2) { quick.innerHTML = ''; return; }
      const found = forAud(search(q));
      const syn = q.toLowerCase().split(/\s+/).map(w => SYNONYMS[w] || SYNONYMS[w.replace(/s$/, '')]).find(Boolean);
      quick.innerHTML = `${syn ? `<p class="quick-sit">Best lane for this: <a href="#/s/${esc(syn)}">${esc(sitById.get(syn)?.title || '')}</a></p>` : ''}
        ${found.length ? `<ul>${found.slice(0, 5).map(t => `<li><a href="#/t/${esc(t.id)}">${esc(t.title)}</a></li>`).join('')}</ul><a class="more" href="#/library?q=${encodeURIComponent(q)}">See all ${plural(found.length, 'match', 'matches')}</a>` : `<p>No threads match "${esc(q)}". Try a broader word, or pick a lane below.</p>`}`;
    });
    return 'Find help';
  }

  function viewSituation(id, q) {
    const s = sitById.get(id);
    if (!s) { main.innerHTML = `<div class="wrap page">${empty('That situation does not exist. It may have been renamed.')}</div>`; return 'Not found'; }
    const sort = ['fullest', 'newest', 'oldest'].includes(q.get('sort')) ? q.get('sort') : 'fullest';
    let items = forAud(inSit(id));
    items = [...items].sort(sort === 'newest' ? (a, b) => (b.date || '').localeCompare(a.date || '') : sort === 'oldest' ? (a, b) => (a.date || '9').localeCompare(b.date || '9') : (a, b) => b.posts.length - a.posts.length || (b.date || '').localeCompare(a.date || ''));
    lastList = {href: `#/s/${id}`, label: s.title};
    const others = situations.filter(o => o.id !== id);
    main.innerHTML = `
    <div class="wrap page">
      <p class="crumb"><a href="#/">All situations</a></p>
      <header class="sit-head">
        <span class="block block-lg" aria-hidden="true">${s.n}</span>
        <div><h1 tabindex="-1">${esc(s.title)}</h1><p class="question">${esc(s.question)}</p><p class="muted">${esc(s.blurb)}</p></div>
      </header>
      ${audSwitch()}
      <div class="list-bar">
        <p class="count" role="status">${plural(items.length, 'thread')}${aud ? ` for ${AUD[aud].toLowerCase()}` : ''}</p>
        <label class="sort">Order <select data-sort>${[['fullest', 'Fullest first'], ['newest', 'Newest first'], ['oldest', 'Oldest first']].map(([v, l]) => `<option value="${v}"${v === sort ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
      </div>
      ${items.length ? `<ol class="rows">${items.map((t, i) => threadRow(t, {start: i === 0 && sort === 'fullest'})).join('')}</ol>` : empty(`No threads in this situation are tagged for ${AUD[aud]?.toLowerCase()}. Switch to everyone to see all of them.`, `#/s/${id}`, 'Stay here')}
      <section class="other"><h2>Other situations</h2><ul>${others.map(o => `<li><a href="#/s/${esc(o.id)}"><span class="block block-sm" aria-hidden="true">${sitById.get(o.id).n}</span>${esc(o.title)}</a></li>`).join('')}</ul></section>
    </div>`;
    bindAud(() => viewSituation(id, q));
    main.querySelector('[data-sort]').addEventListener('change', e => { history.replaceState(null, '', `#/s/${id}?sort=${e.target.value}`); viewSituation(id, new URLSearchParams('sort=' + e.target.value)); });
    return s.title;
  }

  function viewThread(id) {
    const t = byId.get(id);
    if (!t) { main.innerHTML = `<div class="wrap page">${empty('That thread is not in the collection. It may have been removed or its link mistyped.', '#/library', 'Browse all threads')}</div>`; return 'Not found'; }
    const related = list.filter(o => o.id !== t.id).map(o => ({o, s: o.ideas.filter(i => t.ideas.includes(i)).length * 2 + o.sits.filter(s => t.sits.includes(s)).length})).filter(x => x.s > 1).sort((a, b) => b.s - a.s || (b.o.date || '').localeCompare(a.o.date || '')).slice(0, 4).map(x => x.o);
    main.innerHTML = `
    <div class="wrap page">
      <p class="crumb"><a href="${esc(lastList.href)}">${esc(lastList.label)}</a></p>
      <article class="reader">
        ${t.sits.length ? `<p class="filed">Filed under ${sitLinks(t)}</p>` : ''}
        <h1 tabindex="-1">${esc(t.title)}</h1>
        <div class="reader-meta"><time datetime="${esc(t.date || '')}">${esc(fmtDate(t.date))}</time>${t.posts.length > 1 ? `<span>${t.posts.length} posts</span>` : ''}${t.isNew ? '<span class="new-tag">New</span>' : ''}</div>
        <p class="summary">${esc(t.summary)}</p>
        ${xLink(t.url, t.posts.length > 1 ? 'Read the full thread on X' : 'Read the post on X', 'btn btn-primary')}
        ${t.quotes.length ? `<section><h2>In his words</h2>${t.quotes.slice(0, 2).map(qt => `<blockquote><p>${esc(qt.text)}</p>${xLink(qt.url, 'Source post', 'cite')}</blockquote>`).join('')}</section>` : ''}
        ${t.posts.length > 1 ? `<section><h2>How the thread unfolds</h2><ol class="steps">${t.posts.map(p => `<li><p>${esc(p.summary)}</p>${xLink(p.url, `Post ${esc(p.order)}`, 'step-link')}</li>`).join('')}</ol></section>` : ''}
        ${t.ideas.length ? `<section><h2>Ideas in this thread</h2><p class="muted small">Tap one to see what else he connects it to.</p><div class="pills">${t.ideas.map(i => ideaPill(i)).join('')}</div></section>` : ''}
        <details class="notes"><summary>Source notes</summary>
          <p>This summary is a paraphrase written with AI assistance from the readable text of the original posts. It is not Bowman's wording. Read the original before quoting him.</p>
          ${t.dateProvenance ? `<p><strong>Date:</strong> ${esc(t.dateProvenance)}</p>` : ''}
          ${t.provenance ? `<p><strong>Source:</strong> ${esc(t.provenance)}</p>` : ''}
          <p><a href="#/about">How these notes are made</a></p>
        </details>
      </article>
      ${related.length ? `<section class="related"><h2>Keep reading</h2><ul class="rows">${related.map(o => threadRow(o, {showSits: true})).join('')}</ul></section>` : ''}
      ${cta()}
    </div>`;
    return t.title;
  }

  function viewLibrary(q) {
    const query = q.get('q') || '';
    const sit = sitById.has(q.get('s')) ? q.get('s') : '';
    const order = q.get('sort') === 'oldest' ? 'oldest' : 'newest';
    let items = forAud(search(query));
    if (sit) items = items.filter(t => t.sits.includes(sit));
    if (!query) items = [...items].sort((a, b) => order === 'oldest' ? (a.date || '9').localeCompare(b.date || '9') : (b.date || '').localeCompare(a.date || ''));
    lastList = {href: location.hash || '#/library', label: 'All threads'};
    const groups = [];
    if (query) groups.push(['Best matches', items]);
    else items.forEach(t => { const y = t.date ? t.date.slice(0, 4) : 'Undated'; const g = groups.find(x => x[0] === y); g ? g[1].push(t) : groups.push([y, [t]]); });
    main.innerHTML = `
    <div class="wrap page">
      <h1 tabindex="-1">All threads</h1>
      <p class="lede">Every summarized thread, from his earliest posts in ${esc(list.filter(t => t.date).map(t => t.date.slice(0, 4)).sort()[0] || '')} to this week.</p>
      <form class="filters" data-filters>
        <div class="field grow"><label for="lq">Search</label><input id="lq" type="search" name="q" value="${esc(query)}" placeholder="A word, idea or problem" autocomplete="off"></div>
        <div class="field"><label for="ls">Situation</label><select id="ls" name="s"><option value="">All situations</option>${situations.map(s => `<option value="${esc(s.id)}"${s.id === sit ? ' selected' : ''}>${esc(s.title)}</option>`).join('')}</select></div>
        <div class="field"><label for="lo">Order</label><select id="lo" name="sort"${query ? ' disabled' : ''}><option value="newest">Newest first</option><option value="oldest"${order === 'oldest' ? ' selected' : ''}>Oldest first</option></select></div>
      </form>
      ${audSwitch()}
      <p class="count" role="status">${plural(items.length, 'thread')}${query ? ` matching "${esc(query)}"` : ''}${sit ? ` in ${esc(sitById.get(sit).title)}` : ''}${aud ? ` for ${AUD[aud].toLowerCase()}` : ''}${query || sit ? ' <a href="#/library">Clear</a>' : ''}</p>
      ${items.length ? groups.map(([g, ts]) => `<section class="year"><h2>${esc(g)}</h2><ul class="rows">${ts.map(t => threadRow(t, {showSits: true})).join('')}</ul></section>`).join('') : empty(`Nothing matches${query ? ` "${esc(query)}"` : ''}. Try a broader word, clear the situation, or switch to everyone.`, '#/library', 'Clear the filters')}
    </div>`;
    bindAud(() => viewLibrary(q));
    const f = main.querySelector('[data-filters]');
    const go = () => { const p = new URLSearchParams(); if (f.q.value.trim()) p.set('q', f.q.value.trim()); if (f.s.value) p.set('s', f.s.value); if (f.sort.value === 'oldest' && !f.q.value.trim()) p.set('sort', 'oldest'); const h = '#/library' + (p.toString() ? '?' + p : ''); history.replaceState(null, '', h); viewLibrary(p); const i = main.querySelector('#lq'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); };
    let timer; f.q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(go, 250); });
    f.s.addEventListener('change', go); f.sort.addEventListener('change', go);
    f.addEventListener('submit', e => { e.preventDefault(); go(); });
    return 'All threads';
  }

  function viewNew() {
    const items = list.filter(t => t.isWeekly);
    lastList = {href: '#/new', label: "What's new"};
    const groups = [];
    items.forEach(t => { const d = t.date || ''; const g = groups.find(x => x[0] === d); g ? g[1].push(t) : groups.push([d, [t]]); });
    main.innerHTML = `
    <div class="wrap page">
      <h1 tabindex="-1">What's new</h1>
      ${weekly ? `<p class="lede">His account is checked every Monday morning, Central time. Last checked ${fmtStamp(weekly.lastChecked)}. ${plural(items.length, 'thread')} added since the original archive.</p>` : '<p class="lede">The weekly additions could not load, so there is nothing to show here right now. That does not mean there are no new posts.</p>'}
      <p class="muted small">A weekly check can miss posts, so treat this as a running list rather than a complete feed. <a href="#/about">How the check works</a></p>
      ${groups.map(([d, ts]) => `<section class="year"><h2>${esc(fmtDate(d, {weekday: 'long', month: 'long', day: 'numeric'}))}</h2><ul class="rows">${ts.map(t => threadRow(t, {showSits: true})).join('')}</ul></section>`).join('')}
      ${cta()}
    </div>`;
    return "What's new";
  }

  function viewConnections(ideaSlug, q) {
    const pId = principles.some(p => p.id === q.get('p')) ? q.get('p') : '';
    let center = ideaBySlug.get(ideaSlug || '');
    if (!center && pId) center = principles.find(p => p.id === pId).ideas.filter(i => ideaThreads.has(i)).sort((a, b) => ideaThreads.get(b).length - ideaThreads.get(a).length)[0];
    center = center || topIdea;
    if (!center) { main.innerHTML = `<div class="wrap page">${empty('There are no idea labels to connect yet.')}</div>`; return 'Connections'; }
    const nb = neighbors(center).slice(0, 10);
    const pair = ideaBySlug.get(q.get('with') || '');
    const pairOk = pair && nb.some(x => x.idea === pair);
    const centerThreads = ideaThreads.get(center);
    const shown = pairOk ? centerThreads.filter(t => t.ideas.includes(pair)) : centerThreads;
    const prin = principles.find(p => p.id === ideaPrinciple.get(center));
    const maxN = Math.max(1, ...nb.map(x => x.n));
    main.innerHTML = `
    <div class="wrap page">
      <h1 tabindex="-1">How his ideas connect</h1>
      <p class="lede">Pick an idea to see what Bowman pairs it with most often, then read the threads where the two meet. A thicker line means more shared threads.</p>
      <div class="legend" role="group" aria-label="Start from one of six core ideas">
        ${principles.map(p => `<a href="#/connections?p=${esc(p.id)}" style="--c:${PRINCIPLE_COLORS[p.id]}" ${prin && prin.id === p.id ? 'aria-current="true"' : ''}>${esc(p.title)}</a>`).join('')}
      </div>
      <div class="explorer">
        <div class="graph-panel">
          <div class="graph-head"><h2>${esc(ideaName(center))}</h2><p class="muted small">${plural(centerThreads.length, 'thread')}${prin ? `, part of "${esc(prin.title)}"` : ''}</p></div>
          <div class="graph" id="graph" role="img" aria-label="${esc(ideaName(center))} connects most often with ${esc(nb.slice(0, 4).map(x => ideaName(x.idea) + ' (' + x.n + ')').join(', '))}"></div>
          ${prin ? `<p class="prin-blurb" style="--c:${PRINCIPLE_COLORS[prin.id]}">${esc(prin.blurb)}</p>` : ''}
        </div>
        <div class="pair-panel">
          <h2>He pairs it most with</h2>
          <ol class="bars">${nb.map(x => `<li><a href="#/connections/${esc(slug(center))}?with=${esc(slug(x.idea))}" ${pairOk && x.idea === pair ? 'aria-current="true"' : ''}><span class="bar-label">${esc(ideaName(x.idea))}</span><span class="bar" style="--w:${x.n / maxN};--c:${ideaColor(x.idea)}"></span><span class="bar-n">${x.n}</span></a></li>`).join('') || '<li class="muted">No other idea shares a thread with this one yet.</li>'}</ol>
        </div>
      </div>
      <section class="meet" aria-live="polite">
        ${pairOk ? `<h2>Where ${esc(ideaName(center))} meets ${esc(ideaName(pair))}</h2><p class="muted">${plural(shown.length, 'thread')}. <a href="#/connections/${esc(slug(pair))}">Put ${esc(ideaName(pair))} at the center</a> or <a href="#/connections/${esc(slug(center))}">show all ${esc(ideaName(center))} threads</a>.</p>` : `<h2>All threads on ${esc(ideaName(center))}</h2><p class="muted">Tap a connected idea above to narrow this list to the threads where both appear.</p>`}
        <ul class="rows">${shown.map(t => threadRow(t, {showSits: true})).join('')}</ul>
      </section>
      <section class="index">
        <h2>Every idea, grouped</h2>
        ${principles.map(p => `<div class="index-group" style="--c:${PRINCIPLE_COLORS[p.id]}"><h3>${esc(p.title)}</h3><div class="pills">${p.ideas.filter(i => ideaThreads.has(i)).map(i => ideaPill(i, ` <span class="pill-n">${ideaThreads.get(i).length}</span>`)).join('')}</div></div>`).join('')}
      </section>
    </div>`;
    lastList = {href: location.hash, label: 'Connections'};
    drawGraph(main.querySelector('#graph'), center, nb, pairOk ? pair : null);
    return `Connections: ${ideaName(center)}`;
  }

  function drawGraph(el, center, nb, pair) {
    const draw = () => {
      const W = Math.max(300, Math.min(760, el.clientWidth || 600));
      const narrow = W < 560;
      const rowsN = Math.ceil(nb.length / 2);
      const H = narrow ? 150 + rowsN * 66 : 470;
      const cx = W / 2, cy = narrow ? 46 : H / 2;
      const fs = 14, lh = 16;
      const lines = s => { const n = ideaName(s); if (n.length <= (narrow ? 12 : 18)) return [n]; const words = n.split(' '); let best = [n]; let bestDiff = 1e9; for (let k = 1; k < words.length; k++) { const a = words.slice(0, k).join(' '), b = words.slice(k).join(' '); const d = Math.abs(a.length - b.length); if (d < bestDiff) { bestDiff = d; best = [a, b]; } } return best; };
      const pillW = ls => Math.max(...ls.map(l => l.length)) * fs * .5 + 26;
      const nodes = nb.map((x, k) => { const ls = lines(x.idea); return {...x, ls, w: pillW(ls), h: ls.length * lh + 16}; });
      const maxW = Math.max(90, ...nodes.map(n => n.w));
      const rx = Math.max(60, W / 2 - maxW / 2 - 6), ry = H / 2 - 34;
      const maxN = Math.max(1, ...nb.map(x => x.n));
      if (narrow) {
        // Top-down fan for phones: strongest pairs nearest the top, alternating columns.
        const colW = W / 2 - 10;
        nodes.forEach((n, k) => { n.w = Math.min(n.w, colW - 8); n.x = k % 2 ? W * .75 : W * .25; n.y = 150 + Math.floor(k / 2) * 66; });
      } else {
        nodes.forEach((n, k) => { const a = -Math.PI / 2 + (k + .5) * 2 * Math.PI / Math.max(nodes.length, 1); n.x = cx + rx * Math.cos(a); n.y = cy + ry * Math.sin(a); });
      }
      const cLines = lines(center), cW = pillW(cLines) + 24, cH = cLines.length * 18 + 34;
      const badge = n => narrow ? {x: n.x + n.w / 2 - 4, y: n.y - n.h / 2 - 2} : {x: cx + (n.x - cx) * .52, y: cy + (n.y - cy) * .52};
      const link = n => `#/connections/${encodeURIComponent(slug(center))}?with=${encodeURIComponent(slug(n.idea))}`;
      let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="false">`;
      nodes.forEach(n => { const on = !pair || pair === n.idea; const y1 = narrow ? cy + cH / 2 : cy, y2 = narrow ? n.y - n.h / 2 : n.y; svg += `<line x1="${cx}" y1="${y1}" x2="${n.x.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${ideaColor(n.idea)}" stroke-opacity="${on ? .55 : .15}" stroke-width="${(1.5 + 7 * n.n / maxN).toFixed(1)}" stroke-linecap="round"/>`; });
      const badges = n => { const on = !pair || pair === n.idea; const {x: mx, y: my} = badge(n); return `<g opacity="${on ? 1 : .35}" aria-hidden="true"><circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="11" fill="#fff" stroke="${ideaColor(n.idea)}" stroke-width="1.5"/><text x="${mx.toFixed(1)}" y="${(my + 4.5).toFixed(1)}" text-anchor="middle" class="g-n">${n.n}</text></g>`; };
      if (!narrow) nodes.forEach(n => { svg += badges(n); });
      nodes.forEach(n => { const on = pair === n.idea; const c = ideaColor(n.idea); svg += `<a href="${link(n)}" class="g-node" aria-label="${esc(ideaName(n.idea))}: ${n.n} shared ${n.n === 1 ? 'thread' : 'threads'}"><rect x="${(n.x - n.w / 2).toFixed(1)}" y="${(n.y - n.h / 2).toFixed(1)}" width="${n.w.toFixed(1)}" height="${n.h}" rx="${n.h / 2 > 18 ? 12 : n.h / 2}" fill="${on ? c : '#fff'}" stroke="${c}" stroke-width="2"/>${n.ls.map((l, j) => `<text x="${n.x.toFixed(1)}" y="${(n.y - (n.ls.length - 1) * lh / 2 + j * lh + 5).toFixed(1)}" text-anchor="middle" class="g-label" fill="${on ? '#fff' : '#0F2230'}">${esc(l)}</text>`).join('')}</a>`; });
      if (narrow) nodes.forEach(n => { svg += badges(n); });
      const cc = ideaColor(center);
      svg += `<g class="g-center"><rect x="${cx - cW / 2}" y="${cy - cH / 2}" width="${cW}" height="${cH}" rx="14" fill="${cc}"/>${cLines.map((l, j) => `<text x="${cx}" y="${cy - (cLines.length - 1) * 9 + j * 18 - 3}" text-anchor="middle" class="g-center-label">${esc(l)}</text>`).join('')}<text x="${cx}" y="${cy + cH / 2 - 10}" text-anchor="middle" class="g-center-n">${ideaThreads.get(center).length} threads</text></g>`;
      svg += '</svg>';
      el.innerHTML = svg;
    };
    draw();
    let w = el.clientWidth;
    const ro = new ResizeObserver(() => { if (Math.abs(el.clientWidth - w) > 20) { w = el.clientWidth; draw(); } });
    ro.observe(el);
    cleanups.push(() => ro.disconnect());
  }

  function viewAbout() {
    const cov = raw.coverage || {};
    const ledger = Array.isArray(raw.archiveLedger) ? raw.archiveLedger : [];
    const gaps = [...new Set([...(cov.gaps || []), ...(weekly?.gaps || [])])];
    main.innerHTML = `
    <div class="wrap page prose">
      <h1 tabindex="-1">About these notes</h1>
      <p class="lede">An independent reading guide to Bob Bowman's public coaching threads on X, built for swim coaches first, then swimmers and parents. It is not an official Bob Bowman site, and he has not reviewed or endorsed it.</p>
      <h2>How the summaries are made</h2>
      <p>Each thread is read from its public posts and summarized in plain language with AI assistance. The summaries are paraphrases, not his wording, and every one links to the original so you can read it in full before quoting him. Full post text is not republished here.</p>
      <p>The situations, audiences and idea labels are our reading of the threads. They help you find things. They are not claims about what he intended, and a connection between two ideas only means both appear in the same thread.</p>
      <h2>How dates work</h2>
      <p>Most dates are worked out from the post's X ID, and some come from the date a mirror page displayed. Either can be off by a day around midnight UTC. Each thread's source notes say which method was used.</p>
      <h2>How the weekly check works</h2>
      ${weekly ? `<p>An automated agent checks the account every Monday morning, Central time, and adds summaries only for posts it could read in full. Last checked ${fmtStamp(weekly.lastChecked)}. Content last added ${esc(fmtDate(weekly.contentUpdated))}.</p>${weekly.checkNote ? `<p class="muted">${esc(weekly.checkNote)}</p>` : ''}${weekly.checkpoint?.note ? `<p class="muted">${esc(weekly.checkpoint.note)}</p>` : ''}` : '<p>The weekly additions file could not load on this visit, so only the original archive is showing.</p>'}
      <p>A failed check is recorded as a gap, never as "no new posts."</p>
      <h2>What the collection covers</h2>
      <p>${list.length} summarized threads${textNeeded.length ? `, plus ${plural(textNeeded.length, 'link')} waiting for readable text` : ''}. ${esc(cov.note || '')}</p>
      ${Array.isArray(cov.facts) && cov.facts.length ? `<ul>${cov.facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
      ${gaps.length ? `<h3>Known gaps</h3><ul>${gaps.map(g => `<li>${esc(g)}</li>`).join('')}</ul>` : ''}
      ${Array.isArray(cov.sources) && cov.sources.length ? `<h3>Research sources</h3><ul>${cov.sources.map(s => `<li>${esc(s.label || 'Source')}${safeHTTPS(s.url) ? `: <a href="${esc(safeHTTPS(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.url)}</a>` : ''}${s.note ? `. ${esc(s.note)}` : ''}</li>`).join('')}</ul>` : ''}
      <h2>Source records</h2>
      <p>${ledger.length.toLocaleString('en-US')} recovered account items (metadata and links only). These are what the summaries were built from. Most are single posts or replies, not coaching threads.</p>
      <div class="field"><label for="ledger-q">Search source records</label><input id="ledger-q" type="search" placeholder="A date like 2024-02, or a word" autocomplete="off"></div>
      <p class="count" id="ledger-count" role="status"></p>
      <ul class="ledger" id="ledger"></ul>
      <h2>Take the data with you</h2>
      <p>The complete collection, including every source record, is free to download as JSON.</p>
      <button type="button" class="btn" data-download2>Download the thread data</button>
    </div>`;
    const li = main.querySelector('#ledger-q'), out = main.querySelector('#ledger'), cnt = main.querySelector('#ledger-count');
    const drawLedger = () => { const term = li.value.trim().toLowerCase(); if (!term) { out.innerHTML = ''; cnt.textContent = 'Type to search. Up to 50 results show at once.'; return; } const found = ledger.filter(r => [r.title, r.date, r.kind, r.note, r.url].join(' ').toLowerCase().includes(term)); cnt.textContent = `${found.length.toLocaleString('en-US')} matching ${found.length === 1 ? 'record' : 'records'}${found.length > 50 ? ', showing the first 50' : ''}.`; out.innerHTML = found.slice(0, 50).map(r => `<li><span>${esc(r.date || 'Undated')}</span> ${esc(r.kind || 'Record')} ${xLink(r.url, 'Open on X')}</li>`).join(''); };
    let timer; li.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(drawLedger, 200); }); drawLedger();
    main.querySelector('[data-download2]').addEventListener('click', downloadData);
    return 'About';
  }

  // ---------- Router ----------
  const legacy = {network: '/connections', timeline: '/library', threads: '/library', themes: '/', sources: '/about'};
  let cleanups = [];
  function route() {
    cleanups.forEach(f => f()); cleanups = [];
    let h = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (legacy[h]) { history.replaceState(null, '', '#' + legacy[h]); h = legacy[h]; }
    if (h === 'main-content') return;
    if (!h.startsWith('/')) h = '/' + h;
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    const q = new URLSearchParams(qs || '');
    let title;
    if (!parts.length) title = viewHome();
    else if (parts[0] === 's') title = viewSituation(parts[1], q);
    else if (parts[0] === 't') title = viewThread(parts[1]);
    else if (parts[0] === 'library') title = viewLibrary(q);
    else if (parts[0] === 'new') title = viewNew();
    else if (parts[0] === 'connections') title = viewConnections(parts[1], q);
    else if (parts[0] === 'about') title = viewAbout();
    else { main.innerHTML = `<div class="wrap page"><h1 tabindex="-1">Page not found</h1>${empty('That link does not match any page in these notes.')}</div>`; title = 'Not found'; }
    document.title = parts.length ? `${title} | ${SITE}` : SITE;
    const top = '/' + (parts[0] || '');
    const section = {'/s': '/', '/t': null}[top] !== undefined ? {'/s': '/', '/t': null}[top] : top;
    root.querySelectorAll('[data-nav]').forEach(a => { a.dataset.nav === section ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
    if (!firstRender) { window.scrollTo(0, 0); main.querySelector('h1')?.focus({preventScroll: true}); }
    firstRender = false;
  }
  window.addEventListener('hashchange', route);
  route();
  return () => { window.removeEventListener('hashchange', route); cleanups.forEach(f => f()); root.replaceChildren(); };
}
