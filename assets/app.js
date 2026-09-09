/* ==========================================================================
   Aces & Babes — shared client
   Loaded by every page after the supabase-js UMD bundle.
   Exposes window.AB with the Supabase client and small helpers.
   ========================================================================== */
(function () {
  'use strict';

  // Public (anon) key: safe to ship in the browser. Row Level Security in
  // supabase/schema.sql is what protects the data.
  var SUPABASE_URL = 'https://xtjlgzpnkcsuiqinzxvk.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_WcvK0hilPOQ9_ThWxXuyi-A_8zt3h5XD';

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    // The CDN script failed to load. Pages check for window.AB and degrade.
    console.error('Aces & Babes: supabase-js did not load; the app is offline.');
    return;
  }
  var db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  var GAMES = [
    { name: 'Tennis Doubles', icon: '🎾', blurb: 'Serve & volley together' },
    { name: 'Bowling',        icon: '🎳', blurb: 'Strike as one' },
    { name: 'Chess',          icon: '♟️', blurb: 'Think two moves ahead' },
    { name: 'Ping Pong',      icon: '🏓', blurb: 'Rally your way up' },
    { name: 'Card Games',     icon: '🃏', blurb: 'Bluff, bid & win' },
    { name: 'Darts',          icon: '🎯', blurb: 'Bullseye together' },
    { name: 'Golf',           icon: '⛳', blurb: 'Play the long game' },
    { name: 'Board Games',    icon: '🧩', blurb: 'Strategy + chemistry' },
    { name: 'Pickleball',     icon: '🏐', blurb: 'The fastest growing rivalry' },
    { name: 'Video Games',    icon: '🎮', blurb: 'Co-op or 1v1' }
  ];

  var ELO_K = 32;

  /* ---------- tiny utilities ---------- */

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function $(id) { return document.getElementById(id); }

  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function fmtNum(n) { return Number(n || 0).toLocaleString(); }

  function gameIcon(name) {
    for (var i = 0; i < GAMES.length; i++) if (GAMES[i].name === name) return GAMES[i].icon;
    return '🏆';
  }

  /* Expected ELO change if `winnerElo` beats `loserElo`. Mirrors confirm_match() in schema.sql. */
  function eloDelta(winnerElo, loserElo) {
    var expected = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    return Math.max(1, Math.round(ELO_K * (1 - expected)));
  }

  /* ---------- messages ---------- */

  var msgTimers = {};
  function showMsg(id, text, type, sticky) {
    var el = typeof id === 'string' ? $(id) : id;
    if (!el) return;
    el.className = 'msg msg-' + (type || 'info');
    el.textContent = text;
    el.classList.remove('hidden');
    clearTimeout(msgTimers[el.id]);
    if (!sticky) msgTimers[el.id] = setTimeout(function () { el.classList.add('hidden'); }, 6000);
  }
  function hideMsg(id) {
    var el = typeof id === 'string' ? $(id) : id;
    if (el) el.classList.add('hidden');
  }

  /* Turn Supabase / PostgREST errors into something a player can act on. */
  function friendlyError(error) {
    if (!error) return 'Something went wrong. Please try again.';
    var m = String(error.message || error);
    var code = error.code || '';
    if (/could not find the function|schema cache|does not exist|relation .* does not exist/i.test(m)
        || code === 'PGRST202' || code === '42P01' || code === '42703' || code === '42883') {
      return 'The database is not set up yet. Run supabase/schema.sql in the Supabase SQL editor, then reload.';
    }
    if (/invalid login credentials/i.test(m)) return 'Wrong email or password.';
    if (/email not confirmed/i.test(m)) return 'Confirm your email first. Check your inbox for the link we sent.';
    if (/user already registered|already been registered/i.test(m)) return 'An account with this email already exists. Log in instead.';
    if (/password should be at least/i.test(m)) return 'Password must be at least 6 characters.';
    if (/rate limit|too many requests/i.test(m)) return 'Too many attempts. Wait a minute and try again.';
    if (/failed to fetch|networkerror|load failed/i.test(m)) return 'Could not reach the server. Check your connection and try again.';
    if (/jwt|not authenticated|not signed in|invalid claim/i.test(m)) return 'Your session has expired. Please log in again.';
    if (/duplicate key|unique/i.test(m)) return 'That name is already taken.';
    return m;
  }

  /* ---------- auth ---------- */

  async function getSession() {
    var res = await db.auth.getSession();
    return res.data ? res.data.session : null;
  }

  /* On protected pages: bounce to login if there is no session. */
  async function requireAuth() {
    var session = await getSession();
    if (!session) {
      window.location.replace('login.html');
      return null;
    }
    db.auth.onAuthStateChange(function (event) {
      // Signed out elsewhere (another tab, session revoked): leave the page.
      if (event === 'SIGNED_OUT' && !signingOut) window.location.replace('login.html');
    });
    return session;
  }

  var signingOut = false;

  /* On auth pages: skip straight to the dashboard if already signed in. */
  async function redirectIfAuthed() {
    var session = await getSession();
    if (session) window.location.replace('dashboard.html');
    return !!session;
  }

  async function signOut() {
    signingOut = true;
    await db.auth.signOut();
    window.location.replace('index.html');
  }

  /* Swap nav links depending on auth state. Elements are optional. */
  async function paintNavAuth() {
    var session = await getSession();
    var authed = document.querySelectorAll('[data-authed]');
    var anon = document.querySelectorAll('[data-anon]');
    authed.forEach(function (el) { el.classList.toggle('hidden', !session); });
    anon.forEach(function (el) { el.classList.toggle('hidden', !!session); });
    return session;
  }

  /* ---------- data ---------- */

  /* Active couples ordered by ELO, with partner usernames attached. */
  async function loadLeaderboard(limit) {
    var q = db.from('couples')
      .select('id, couple_name, elo, wins, losses, player1_id, player2_id, created_at')
      .eq('status', 'active')
      .order('elo', { ascending: false })
      .order('created_at', { ascending: true });
    if (limit) q = q.limit(limit);
    var res = await q;
    if (res.error) throw res.error;
    return res.data || [];
  }

  async function loadProfiles(ids) {
    ids = ids.filter(function (v, i, a) { return v && a.indexOf(v) === i; });
    if (!ids.length) return {};
    var res = await db.from('profiles').select('id, username, full_name').in('id', ids);
    if (res.error) throw res.error;
    var map = {};
    (res.data || []).forEach(function (p) { map[p.id] = p; });
    return map;
  }

  async function loadCouplesById(ids) {
    ids = ids.filter(function (v, i, a) { return v && a.indexOf(v) === i; });
    if (!ids.length) return {};
    var res = await db.from('couples').select('id, couple_name, elo, wins, losses, status').in('id', ids);
    if (res.error) throw res.error;
    var map = {};
    (res.data || []).forEach(function (c) { map[c.id] = c; });
    return map;
  }

  function renderLeaderboardRows(rows, myCoupleId) {
    if (!rows.length) {
      return '<div class="lb-empty">No couples ranked yet. Link up with your partner and log a match to claim #1.</div>';
    }
    return rows.map(function (c, i) {
      var me = c.id === myCoupleId ? ' is-me' : '';
      return '<div class="lb-row' + me + '">' +
        '<span class="lb-rank">' + (i + 1) + '</span>' +
        '<span class="lb-name">' + esc(c.couple_name) + '</span>' +
        '<span class="lb-elo">' + fmtNum(c.elo) + '</span>' +
        '<span class="lb-record">' + fmtNum(c.wins) + 'W · ' + fmtNum(c.losses) + 'L</span>' +
      '</div>';
    }).join('');
  }

  window.AB = {
    db: db,
    GAMES: GAMES,
    ELO_K: ELO_K,
    esc: esc,
    $: $,
    fmtDate: fmtDate,
    fmtNum: fmtNum,
    gameIcon: gameIcon,
    eloDelta: eloDelta,
    showMsg: showMsg,
    hideMsg: hideMsg,
    friendlyError: friendlyError,
    getSession: getSession,
    requireAuth: requireAuth,
    redirectIfAuthed: redirectIfAuthed,
    signOut: signOut,
    paintNavAuth: paintNavAuth,
    loadLeaderboard: loadLeaderboard,
    loadProfiles: loadProfiles,
    loadCouplesById: loadCouplesById,
    renderLeaderboardRows: renderLeaderboardRows
  };
})();
