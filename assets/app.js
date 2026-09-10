/* ==========================================================================
   V Kedar's Command Center — app logic
   Data comes from videos/videos.js (window.COMMAND_CENTER). No backend.
   ========================================================================== */
(function () {
  'use strict';

  var cfg = window.COMMAND_CENTER || {};
  var $ = function (id) { return document.getElementById(id); };
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var PLAY_SVG = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M4 2.5v15l13-7.5z"/></svg>';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function save(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* private mode */ } }

  /* ---------- parsing ---------- */

  function youtubeId(v) {
    if (!v) return null;
    v = String(v).trim();
    if (/^[\w-]{11}$/.test(v)) return v;
    var m = v.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/))([\w-]{11})/);
    return m ? m[1] : null;
  }
  function driveId(v) {
    if (!v) return null;
    v = String(v).trim();
    var m = v.match(/\/d\/([\w-]+)/) || v.match(/[?&]id=([\w-]+)/);
    if (m) return m[1];
    return /^[\w-]{10,}$/.test(v) ? v : null;
  }
  function parseDate(s) {
    if (!s) return null;
    s = String(s).trim();
    var d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? s + 'T12:00:00' : s);
    return isNaN(d.getTime()) ? null : d;
  }
  function fmtDate(d) { return d ? MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate() + ', ' + d.getFullYear() : 'Undated'; }
  function fmtShort(d) { return d ? MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate() : 'Undated'; }
  function monthKey(d) { return d ? d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') : '0000-00'; }
  function monthLabel(d) { return d ? MONTHS[d.getMonth()] + ' ' + d.getFullYear() : 'Undated'; }

  function normalize(raw, i) {
    raw = raw || {};
    var yt = youtubeId(raw.youtube);
    var dr = !yt && raw.drive ? driveId(raw.drive) : null;
    var file = !yt && !dr && raw.file ? String(raw.file) : null;
    var kind = yt ? 'youtube' : dr ? 'drive' : file ? 'file' : null;
    var key = yt || dr || file || ('entry-' + (i + 1));
    var aspect = String(raw.aspect || cfg.defaultAspect || '16:9').replace(/\s/g, '');
    return {
      id: key.replace(/[^\w-]/g, '_'),
      title: String(raw.title || 'Untitled'),
      kind: kind, yt: yt, dr: dr, file: file,
      date: parseDate(raw.date),
      project: String(raw.project || '').trim(),
      tags: Array.isArray(raw.tags) ? raw.tags.map(function (t) { return String(t).trim(); }).filter(Boolean) : [],
      notes: String(raw.notes || ''),
      vertical: aspect === '9:16',
      thumb: yt ? 'https://i.ytimg.com/vi/' + yt + '/hqdefault.jpg'
           : dr ? 'https://drive.google.com/thumbnail?id=' + dr + '&sz=w640' : null,
      link: yt ? 'https://www.youtube.com/watch?v=' + yt
          : dr ? 'https://drive.google.com/file/d/' + dr + '/view' : file,
      invalid: !kind
    };
  }

  /* ---------- data ---------- */

  var all = (Array.isArray(cfg.videos) ? cfg.videos : []).map(normalize);
  var invalid = all.filter(function (v) { return v.invalid; });
  var videos = all.filter(function (v) { return !v.invalid; });

  function byDateAsc(a, b) {
    var ta = a.date ? a.date.getTime() : Infinity, tb = b.date ? b.date.getTime() : Infinity;
    return ta - tb || a.title.localeCompare(b.title);
  }
  videos.slice().sort(byDateAsc).forEach(function (v, i) { v.num = i + 1; });

  var projects = {}, tags = {};
  videos.forEach(function (v) {
    if (v.project) projects[v.project] = (projects[v.project] || 0) + 1;
    v.tags.forEach(function (t) { tags[t] = (tags[t] || 0) + 1; });
  });

  var state = {
    q: '', project: '', tag: '',
    sort: load('cc-sort') === 'oldest' ? 'oldest' : 'newest',
    view: load('cc-view') === 'timeline' ? 'timeline' : 'grid'
  };

  function filtered() {
    var q = state.q.trim().toLowerCase();
    var list = videos.filter(function (v) {
      if (state.project && v.project !== state.project) return false;
      if (state.tag && v.tags.indexOf(state.tag) < 0) return false;
      if (!q) return true;
      var hay = (v.title + ' ' + v.notes + ' ' + v.project + ' ' + v.tags.join(' ')).toLowerCase();
      return hay.indexOf(q) >= 0;
    });
    list.sort(byDateAsc);
    if (state.sort === 'newest') list.reverse();
    return list;
  }

  /* ---------- rendering ---------- */

  function thumbHtml(v) {
    if (v.thumb) return '<img src="' + esc(v.thumb) + '" alt="" loading="lazy">';
    if (v.kind === 'file') return '<video src="' + esc(v.file) + '" preload="metadata" muted playsinline></video>';
    return '';
  }

  function cardHtml(v) {
    return '<article class="card" data-id="' + esc(v.id) + '" tabindex="0" role="button" aria-label="Play ' + esc(v.title) + '">' +
      '<div class="thumb' + (v.vertical ? ' v' : '') + '">' + thumbHtml(v) +
        '<span class="num">№ ' + v.num + '</span>' +
        '<div class="play"><span class="play-btn">' + PLAY_SVG + '</span></div>' +
      '</div>' +
      '<div class="card-body">' +
        '<div class="card-title">' + esc(v.title) + '</div>' +
        '<div class="card-meta">' + esc(fmtDate(v.date)) + (v.project ? ' · ' + esc(v.project) : '') + '</div>' +
        (v.tags.length ? '<div class="card-tags">' + v.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
      '</div>' +
    '</article>';
  }

  function timelineHtml(list) {
    var html = '', lastKey = null;
    list.forEach(function (v) {
      var key = monthKey(v.date);
      if (key !== lastKey) {
        var count = list.filter(function (x) { return monthKey(x.date) === key; }).length;
        html += '<div class="tl-month">' + esc(monthLabel(v.date)) + ' <small>' + count + ' video' + (count === 1 ? '' : 's') + '</small></div>';
        lastKey = key;
      }
      html += '<div class="tl-item" data-id="' + esc(v.id) + '" tabindex="0" role="button" aria-label="Play ' + esc(v.title) + '">' +
        '<div class="tl-thumb' + (v.vertical ? ' v' : '') + '">' + thumbHtml(v) + '</div>' +
        '<div class="tl-body">' +
          '<div class="tl-date">' + esc(fmtShort(v.date)) + '</div>' +
          '<div class="tl-title">' + esc(v.title) + '</div>' +
          (v.notes ? '<div class="tl-notes">' + esc(v.notes) + '</div>' : '') +
          '<div class="tl-meta"><span class="num-inline">№ ' + v.num + '</span>' +
            (v.project ? ' · ' + esc(v.project) : '') +
            (v.tags.length ? ' · ' + v.tags.map(esc).join(', ') : '') +
          '</div>' +
        '</div>' +
      '</div>';
    });
    return '<div class="tl">' + html + '</div>';
  }

  function chipHtml(label, value, count, on, kind) {
    return '<button class="chip' + (on ? ' on' : '') + '" data-' + kind + '="' + esc(value) + '" type="button">' +
      esc(label) + (count != null ? '<small>' + count + '</small>' : '') + '</button>';
  }

  function renderStats() {
    var sorted = videos.slice().sort(byDateAsc);
    var dated = sorted.filter(function (v) { return v.date; });
    var first = dated[0], last = dated[dated.length - 1];
    var n = videos.length;
    $('statCount').textContent = n ? String(n) : '0';
    $('statCountSub').textContent = n === 1 ? 'in the archive' : 'in the archive';
    $('statFirst').textContent = first ? fmtDate(first.date) : '—';
    $('statFirstSub').textContent = first ? first.title : 'Nothing dated yet';
    $('statLatest').textContent = last ? fmtDate(last.date) : '—';
    $('statLatestSub').textContent = last ? last.title : 'Nothing dated yet';
    var np = Object.keys(projects).length;
    $('statProjects').textContent = String(np);
    $('statProjectsSub').textContent = np === 1 ? 'project' : 'projects';
  }

  function renderChips() {
    var pKeys = Object.keys(projects).sort(function (a, b) { return projects[b] - projects[a] || a.localeCompare(b); });
    var tKeys = Object.keys(tags).sort(function (a, b) { return tags[b] - tags[a] || a.localeCompare(b); });
    var pRow = $('projectChips'), tRow = $('tagChips');

    if (pKeys.length >= 2) {
      pRow.innerHTML = '<span class="chips-label">Project</span>' +
        chipHtml('All', '', null, !state.project, 'project') +
        pKeys.map(function (p) { return chipHtml(p, p, projects[p], state.project === p, 'project'); }).join('');
      pRow.classList.remove('hidden');
    } else { pRow.innerHTML = ''; pRow.classList.add('hidden'); }

    if (tKeys.length) {
      tRow.innerHTML = '<span class="chips-label">Tags</span>' +
        chipHtml('All', '', null, !state.tag, 'tag') +
        tKeys.map(function (t) { return chipHtml(t, t, tags[t], state.tag === t, 'tag'); }).join('');
      tRow.classList.remove('hidden');
    } else { tRow.innerHTML = ''; tRow.classList.add('hidden'); }

    document.querySelectorAll('[data-view]').forEach(function (b) { b.classList.toggle('on', b.dataset.view === state.view); });
    document.querySelectorAll('[data-sort]').forEach(function (b) { b.classList.toggle('on', b.dataset.sort === state.sort); });
  }

  var currentList = [];

  function renderContent() {
    var el = $('content');
    var list = filtered();
    currentList = list;

    if (!videos.length) {
      $('controls').classList.add('hidden');
      $('resultCount').textContent = '';
      el.innerHTML =
        '<div class="empty">' +
          '<h3>No videos yet</h3>' +
          '<p>Open <code>videos/videos.js</code>, paste a YouTube link into the example entry, save, and reload. Each entry is a title, a link, a date, and the project it came from.</p>' +
          '<p>The full field list is at the top of that file.</p>' +
        '</div>';
      return;
    }
    $('controls').classList.remove('hidden');
    $('resultCount').textContent = list.length === videos.length
      ? list.length + ' video' + (list.length === 1 ? '' : 's')
      : list.length + ' of ' + videos.length;

    if (!list.length) {
      el.innerHTML = '<div class="empty"><h3>Nothing matches</h3><p>Try a different search or clear the filters.</p>' +
        '<button class="btn btn-ghost" type="button" id="clearFilters">Clear filters</button></div>';
      $('clearFilters').addEventListener('click', function () {
        state.q = ''; state.project = ''; state.tag = ''; $('q').value = '';
        renderChips(); renderContent();
      });
      return;
    }

    el.innerHTML = state.view === 'timeline'
      ? timelineHtml(list.slice().sort(byDateAsc))
      : '<div class="grid">' + list.map(cardHtml).join('') + '</div>';
  }

  function renderNotice() {
    var el = $('notice');
    if (!invalid.length) { el.classList.add('hidden'); return; }
    el.innerHTML = invalid.length + (invalid.length === 1 ? ' entry' : ' entries') + ' in <code>videos/videos.js</code> ' +
      (invalid.length === 1 ? 'has' : 'have') + ' no playable link and ' + (invalid.length === 1 ? 'is' : 'are') + ' hidden: ' +
      invalid.map(function (v) { return '“' + esc(v.title) + '”'; }).join(', ') +
      '. Each entry needs a <code>youtube</code>, <code>drive</code>, or <code>file</code> value.';
    el.classList.remove('hidden');
  }

  function renderAll() { renderStats(); renderChips(); renderContent(); renderNotice(); }

  /* ---------- player ---------- */

  var current = null;

  function stageHtml(v) {
    if (v.kind === 'youtube') {
      return '<iframe src="https://www.youtube-nocookie.com/embed/' + v.yt + '?autoplay=1&rel=0&modestbranding=1&playsinline=1" ' +
        'title="' + esc(v.title) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
        'allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
    }
    if (v.kind === 'drive') {
      return '<iframe src="https://drive.google.com/file/d/' + v.dr + '/preview" title="' + esc(v.title) + '" allow="autoplay" allowfullscreen></iframe>';
    }
    return '<video src="' + esc(v.file) + '" controls autoplay playsinline></video>';
  }

  function openVideo(id, fromHash) {
    var v = null;
    for (var i = 0; i < videos.length; i++) if (videos[i].id === id) { v = videos[i]; break; }
    if (!v) return false;
    current = v;

    var box = $('playerBox');
    box.className = 'player-box ' + (v.vertical ? 'v' : 'h');
    $('playerStage').innerHTML = stageHtml(v);
    $('playerMeta').textContent = '№ ' + v.num + ' · ' + fmtDate(v.date) + (v.project ? ' · ' + v.project : '');
    $('playerTitle').textContent = v.title;
    $('playerNotes').textContent = v.notes;
    $('playerNotes').classList.toggle('hidden', !v.notes);
    $('playerTags').innerHTML = v.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
    $('playerTags').classList.toggle('hidden', !v.tags.length);
    var link = $('playerLink');
    link.href = v.link;
    link.textContent = v.kind === 'youtube' ? 'Open on YouTube ↗' : v.kind === 'drive' ? 'Open in Drive ↗' : 'Open file ↗';

    var idx = indexInList(v);
    $('playerPrev').disabled = idx <= 0;
    $('playerNext').disabled = idx < 0 || idx >= currentList.length - 1;

    $('player').hidden = false;
    document.body.classList.add('modal-open');
    if (!fromHash) history.replaceState(null, '', '#v=' + encodeURIComponent(v.id));
    $('playerClose').focus();
    return true;
  }

  function indexInList(v) {
    for (var i = 0; i < currentList.length; i++) if (currentList[i].id === v.id) return i;
    return -1;
  }

  function closePlayer() {
    if ($('player').hidden) return;
    $('player').hidden = true;
    $('playerStage').innerHTML = '';
    document.body.classList.remove('modal-open');
    if (location.hash.indexOf('#v=') === 0) history.replaceState(null, '', location.pathname + location.search);
    var back = current && document.querySelector('[data-id="' + CSS.escape(current.id) + '"]');
    current = null;
    if (back) back.focus();
  }

  function step(delta) {
    if (!current) return;
    var idx = indexInList(current);
    var next = currentList[idx + delta];
    if (next) openVideo(next.id);
  }

  function openFromHash() {
    var m = location.hash.match(/^#v=([^&]+)/);
    if (m) openVideo(decodeURIComponent(m[1]), true);
  }

  /* ---------- wiring ---------- */

  function init() {
    if (cfg.tagline) $('tagline').textContent = cfg.tagline;
    if (cfg.owner) {
      document.title = cfg.owner + "'s Command Center";
      $('ownerLine').textContent = cfg.owner + "'s";
    }
    $('year').textContent = String(new Date().getFullYear());

    $('q').addEventListener('input', function () { state.q = this.value; renderContent(); });

    $('controls').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.project != null) { state.project = b.dataset.project; renderChips(); renderContent(); }
      else if (b.dataset.tag != null) { state.tag = b.dataset.tag; renderChips(); renderContent(); }
      else if (b.dataset.sort) { state.sort = b.dataset.sort; save('cc-sort', state.sort); renderChips(); renderContent(); }
    });
    document.querySelectorAll('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () { state.view = b.dataset.view; save('cc-view', state.view); renderChips(); renderContent(); });
    });

    $('content').addEventListener('click', function (e) {
      var item = e.target.closest('[data-id]');
      if (item) openVideo(item.dataset.id);
    });
    $('content').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var item = e.target.closest('[data-id]');
      if (item) { e.preventDefault(); openVideo(item.dataset.id); }
    });

    $('player').addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) closePlayer();
    });
    $('playerPrev').addEventListener('click', function () { step(-1); });
    $('playerNext').addEventListener('click', function () { step(1); });
    document.addEventListener('keydown', function (e) {
      if ($('player').hidden) return;
      if (e.key === 'Escape') closePlayer();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
    window.addEventListener('hashchange', function () {
      if (location.hash.indexOf('#v=') === 0) openFromHash(); else closePlayer();
    });

    renderAll();
    openFromHash();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.CC = { videos: videos, invalid: invalid, youtubeId: youtubeId, driveId: driveId, state: state };
})();
