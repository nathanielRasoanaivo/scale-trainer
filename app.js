(function() {
  'use strict';

  const ROOTS = ['Do','Sol','Re','La','Mi','Si','Fa#','Fa','Sib','Mib','Lab','Reb'];

  const ROOT_SHARPS = {
    'Do': 0, 'Sol': 1, 'Re': 2, 'La': 3, 'Mi': 4, 'Si': 5, 'Fa#': 6,
    'Fa': -1, 'Sib': -2, 'Mib': -3, 'Lab': -4, 'Reb': -5
  };

  const CHROMATIC_SHARPS = ['Do','Do#','Re','Re#','Mi','Fa','Fa#','Sol','Sol#','La','La#','Si'];
  const CHROMATIC_FLATS  = ['Do','Reb','Re','Mib','Mi','Fa','Solb','Sol','Lab','La','Sib','Si'];

  const FLAT_ROOTS = ['Fa','Sib','Mib','Lab','Reb','Solb'];

  const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11, 12];
  const MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10, 12];
  const DEGREES = ['I','II','III','IV','V','VI','VII','I'];

  const MAJOR_QUALITIES = ['Maj','min','min','Maj','Maj','min','dim'];
  const MINOR_QUALITIES = ['min','dim','Maj','min','min','Maj','Maj'];
  const MAJOR_TETRAD_QUALITIES = ['Maj7','m7','m7','Maj7','7','m7','m7b5'];
  const MINOR_TETRAD_QUALITIES = ['m7','m7b5','Maj7','m7','m7','Maj7','7'];
  const MAJOR_DEGREES_HARMONY = ['I','ii','iii','IV','V','vi','vii\u00B0'];
  const MINOR_DEGREES_HARMONY = ['i','ii\u00B0','III','iv','v','VI','VII'];

  const NATURAL_NOTES = ['Do','Re','Mi','Fa','Sol','La','Si'];
  const NATURAL_POSITIONS = { 'Do': 0, 'Re': 2, 'Mi': 4, 'Fa': 5, 'Sol': 7, 'La': 9, 'Si': 11 };

  const QUALITY_LABELS = {
    'Maj': 'Majeur', 'min': 'Mineur', 'dim': 'Diminue',
    'Maj7': 'Maj7', 'm7': 'Min7', '7': 'Dom7', 'm7b5': 'Min7b5'
  };

  const CHORD_SUFFIXES = {
    'Maj': '', 'min': 'm', 'dim': 'dim',
    'Maj7': 'Maj7', 'm7': 'm7', '7': '7', 'm7b5': 'm7b5'
  };

  const TUNING = [4, 9, 2, 7, 11, 4];
  const STRING_LABELS = ['Mi','La','Re','Sol','Si','Mi'];
  const FRET_COUNT = 18;
  const MARKER_FRETS = [3, 5, 7, 9, 15, 17];
  const DOUBLE_MARKER = [12];

  const SCALE_TYPES = [
    { name: 'Majeure',        intervals: [0,2,4,5,7,9,11],  degrees: ['I','II','III','IV','V','VI','VII'] },
    { name: 'Min. naturelle', intervals: [0,2,3,5,7,8,10],  degrees: ['I','II','bIII','IV','V','bVI','bVII'] },
    { name: 'Dorien',         intervals: [0,2,3,5,7,9,10],  degrees: ['I','II','bIII','IV','V','VI','bVII'] },
    { name: 'Phrygien',       intervals: [0,1,3,5,7,8,10],  degrees: ['I','bII','bIII','IV','V','bVI','bVII'] },
    { name: 'Lydien',         intervals: [0,2,4,6,7,9,11],  degrees: ['I','II','III','#IV','V','VI','VII'] },
    { name: 'Mixolydien',     intervals: [0,2,4,5,7,9,10],  degrees: ['I','II','III','IV','V','VI','bVII'] },
    { name: 'Locrien',        intervals: [0,1,3,5,6,8,10],  degrees: ['I','bII','bIII','IV','bV','bVI','bVII'] },
    { name: 'Min. harmonique',intervals: [0,2,3,5,7,8,11],  degrees: ['I','II','bIII','IV','V','bVI','VII'] },
    { name: 'Min. melodique', intervals: [0,2,3,5,7,9,11],  degrees: ['I','II','bIII','IV','V','VI','VII'] },
    { name: 'Penta. maj.',    intervals: [0,2,4,7,9],        degrees: ['1','2','3','5','6'] },
    { name: 'Penta. min.',    intervals: [0,3,5,7,10],       degrees: ['1','b3','4','5','b7'] },
    { name: 'Blues',           intervals: [0,3,5,6,7,10],     degrees: ['1','b3','4','b5','5','b7'] },
  ];

  // ---- Music theory helpers ----

  function getChromatic(root) {
    return FLAT_ROOTS.includes(root) ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
  }

  function getNaturalBase(note) {
    if (note.length > 2) return note.replace(/#|b$/, '');
    if (note.endsWith('#') || note.endsWith('b')) return note.slice(0, -1);
    return note;
  }

  function respell(chromaticIndex, targetNatural) {
    const natPos = NATURAL_POSITIONS[targetNatural];
    const diff = ((chromaticIndex - natPos) + 12) % 12;
    if (diff === 0) return targetNatural;
    if (diff === 1) return targetNatural + '#';
    if (diff === 11) return targetNatural + 'b';
    return targetNatural + (diff <= 6 ? '#' : 'b');
  }

  function buildScale(root, intervals) {
    let chromatic = getChromatic(root);
    let rootIndex = chromatic.indexOf(root);
    if (rootIndex === -1) {
      chromatic = CHROMATIC_SHARPS;
      rootIndex = chromatic.indexOf(root);
    }
    const rootNaturalIdx = NATURAL_NOTES.indexOf(getNaturalBase(root));
    const notes = [];
    for (let i = 0; i < 8; i++) {
      if (i === 7) { notes.push(notes[0]); continue; }
      const chrIdx = (rootIndex + intervals[i] % 12) % 12;
      let note = chromatic[chrIdx];
      const expectedNatural = NATURAL_NOTES[(rootNaturalIdx + i) % 7];
      if (getNaturalBase(note) !== expectedNatural) {
        note = respell(chrIdx, expectedNatural);
      }
      notes.push(note);
    }
    return notes;
  }

  function getScale(root) { return buildScale(root, MAJOR_INTERVALS); }

  function isAltered(note) { return note.includes('#') || note.includes('b'); }

  function altInfo(root) {
    const n = ROOT_SHARPS[root];
    if (n === 0) return { count: 0, type: '', label: 'Aucune alteration' };
    if (n > 0) return { count: n, type: 'dieses', label: n + ' diese' + (n > 1 ? 's' : '') };
    return { count: -n, type: 'bemols', label: (-n) + ' bemol' + (-n > 1 ? 's' : '') };
  }

  function getScaleNoteNames(root, intervals) {
    if (intervals.length === 7) {
      return buildScale(root, [...intervals, 12]).slice(0, 7);
    }
    const chromatic = getChromatic(root);
    let rootIdx = chromatic.indexOf(root);
    if (rootIdx === -1) rootIdx = CHROMATIC_SHARPS.indexOf(root);
    return intervals.map(i => chromatic[(rootIdx + i) % 12]);
  }

  function getScaleChromatics(root, intervals) {
    const chromatic = getChromatic(root);
    let rootIdx = chromatic.indexOf(root);
    if (rootIdx === -1) rootIdx = CHROMATIC_SHARPS.indexOf(root);
    return new Set(intervals.map(i => (rootIdx + i) % 12));
  }

  function getChordNotes(scale, degreeIdx, isTetrad) {
    const notes = [scale[degreeIdx], scale[(degreeIdx + 2) % 7], scale[(degreeIdx + 4) % 7]];
    if (isTetrad) notes.push(scale[(degreeIdx + 6) % 7]);
    return notes;
  }

  // ---- Tabs ----
  const tabBtns = document.querySelectorAll('.tabs button');
  const tabContents = document.querySelectorAll('.tab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // ---- Subtabs ----
  document.querySelectorAll('.subtabs').forEach(bar => {
    bar.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const parent = bar.parentElement;
        bar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        parent.querySelectorAll('.sub-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.sub).classList.add('active');
        if (btn.dataset.sub === 'tools-quiz' && quizTotal === 0) newQuestion();
        if (btn.dataset.sub === 'tools-quiz') fretRangeEl.style.display = 'none';
        else if (parent.id === 'tools') fretRangeEl.style.display = '';
      });
    });
  });

  // ---- Root selector (dropdown) ----
  let selectedRoot = null;
  const rootSelect = document.getElementById('rootSelect');

  const sharpRoots = ROOTS.filter(r => ROOT_SHARPS[r] >= 0);
  const flatRoots = ROOTS.filter(r => ROOT_SHARPS[r] < 0);

  const grpSharps = document.createElement('optgroup');
  grpSharps.label = 'Dieses';
  sharpRoots.forEach(root => {
    const opt = document.createElement('option');
    const info = altInfo(root);
    opt.value = root;
    opt.textContent = root + (info.count > 0 ? ' (' + info.count + '\u266F)' : '');
    grpSharps.appendChild(opt);
  });

  const grpFlats = document.createElement('optgroup');
  grpFlats.label = 'Bemols';
  flatRoots.forEach(root => {
    const opt = document.createElement('option');
    const info = altInfo(root);
    opt.value = root;
    opt.textContent = root + ' (' + info.count + '\u266D)';
    grpFlats.appendChild(opt);
  });

  rootSelect.appendChild(grpSharps);
  rootSelect.appendChild(grpFlats);

  function onRootChange() {
    if (!selectedRoot) return;
    showScale(selectedRoot);
    showChordFretboard(selectedRoot);
    showHarmony(selectedRoot);
    showQualities();
    renderTable();
  }

  rootSelect.addEventListener('change', () => {
    selectedRoot = rootSelect.value;
    onRootChange();
  });

  // ---- Utility ----
  function setupToggle(container, onSelect) {
    container.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        onSelect(btn);
      });
    });
  }

  // ---- Learn: Scale ----
  const scaleResult = document.getElementById('scaleResult');
  let scaleTypeIdx = 0;
  let overlayEnabled = false, overlayRootVal = null, overlayTypeIdx = 10;

  // Populate scale type select
  const scaleTypeSelect = document.getElementById('scaleTypeSelect');
  SCALE_TYPES.forEach((t, i) => {
    const opt = document.createElement('option');
    opt.value = i; opt.textContent = t.name;
    scaleTypeSelect.appendChild(opt);
  });
  scaleTypeSelect.addEventListener('change', () => {
    scaleTypeIdx = parseInt(scaleTypeSelect.value);
    if (selectedRoot) showScale(selectedRoot);
  });

  // Overlay toggle + controls
  const overlayBtn = document.getElementById('overlayBtn');
  const overlayControlsEl = document.getElementById('overlayControls');
  const overlayRootEl = document.getElementById('overlayRoot');
  const overlayTypeEl = document.getElementById('overlayType');

  overlayBtn.addEventListener('click', () => {
    overlayEnabled = !overlayEnabled;
    overlayBtn.classList.toggle('active', overlayEnabled);
    overlayBtn.textContent = overlayEnabled ? '\u2212 Comparer' : '+ Comparer';
    overlayControlsEl.style.display = overlayEnabled ? '' : 'none';
    if (selectedRoot) showScaleFretboard(selectedRoot);
  });

  // Populate overlay root
  const oPlaceholder = document.createElement('option');
  oPlaceholder.value = ''; oPlaceholder.textContent = 'Tonalite...'; oPlaceholder.disabled = true; oPlaceholder.selected = true;
  overlayRootEl.appendChild(oPlaceholder);
  const oGrpS = document.createElement('optgroup'); oGrpS.label = 'Dieses';
  const oGrpF = document.createElement('optgroup'); oGrpF.label = 'Bemols';
  ROOTS.forEach(r => {
    const opt = document.createElement('option');
    const info = altInfo(r);
    opt.value = r;
    opt.textContent = info.count === 0 ? r : r + ' (' + info.count + (info.type === 'dieses' ? '\u266F' : '\u266D') + ')';
    if (ROOT_SHARPS[r] >= 0) oGrpS.appendChild(opt); else oGrpF.appendChild(opt);
  });
  overlayRootEl.appendChild(oGrpS);
  overlayRootEl.appendChild(oGrpF);
  overlayRootEl.addEventListener('change', () => {
    overlayRootVal = overlayRootEl.value;
    if (selectedRoot) showScaleFretboard(selectedRoot);
  });

  // Populate overlay type
  SCALE_TYPES.forEach((t, i) => {
    const opt = document.createElement('option');
    opt.value = i; opt.textContent = t.name;
    if (i === overlayTypeIdx) opt.selected = true;
    overlayTypeEl.appendChild(opt);
  });
  overlayTypeEl.addEventListener('change', () => {
    overlayTypeIdx = parseInt(overlayTypeEl.value);
    if (selectedRoot) showScaleFretboard(selectedRoot);
  });

  function showScale(root) {
    const type = SCALE_TYPES[scaleTypeIdx];
    const notes = getScaleNoteNames(root, type.intervals);
    const degrees = type.degrees;

    let html = '<div class="scale-display">';
    for (let i = 0; i < notes.length; i++) {
      const alt = isAltered(notes[i]) ? ' altered' : '';
      html += `<div class="note-pill${alt}"><span class="note-name">${notes[i]}</span><span class="degree">${degrees[i]}</span></div>`;
    }
    // Octave pill
    const alt0 = isAltered(notes[0]) ? ' altered' : '';
    html += `<div class="note-pill${alt0}"><span class="note-name">${notes[0]}</span><span class="degree">${degrees[0]}</span></div>`;
    html += '</div>';

    html += '<div class="summary-card">';
    html += `<div><span class="label">Gamme : </span><span class="value">${root} ${type.name}</span></div>`;
    html += `<div><span class="label">Notes : </span><span class="value">${notes.join(' \u2014 ')}</span></div>`;
    const alteredNotes = notes.filter(isAltered);
    if (alteredNotes.length > 0) {
      html += `<div><span class="label">Alterees : </span><span class="value">${alteredNotes.join(', ')}</span></div>`;
    }
    html += '</div>';

    scaleResult.innerHTML = html;
    showScaleFretboard(root);
  }

  // ---- Shared fret range ----
  let fretFrom = 0, fretTo = 12;
  const fretRangeEl = document.getElementById('fretRange');
  const fretFromEl = document.getElementById('fretFrom');
  const fretToEl = document.getElementById('fretTo');
  const scaleFretResult = document.getElementById('scaleFretResult');

  for (let f = 0; f <= FRET_COUNT; f++) {
    const o1 = document.createElement('option');
    o1.value = f; o1.textContent = f; if (f === fretFrom) o1.selected = true;
    fretFromEl.appendChild(o1);
    const o2 = document.createElement('option');
    o2.value = f; o2.textContent = f; if (f === fretTo) o2.selected = true;
    fretToEl.appendChild(o2);
  }

  function onFretRangeChange() {
    if (!selectedRoot) return;
    showScaleFretboard(selectedRoot);
    showChordFretboard(selectedRoot);
  }

  fretFromEl.addEventListener('change', () => {
    fretFrom = parseInt(fretFromEl.value);
    if (fretFrom > fretTo) { fretTo = fretFrom; fretToEl.value = fretTo; }
    onFretRangeChange();
  });
  fretToEl.addEventListener('change', () => {
    fretTo = parseInt(fretToEl.value);
    if (fretTo < fretFrom) { fretFrom = fretTo; fretFromEl.value = fretFrom; }
    onFretRangeChange();
  });

  // Shared fretboard HTML builder
  function buildFretHtml(noteMap, dotClassFn, legendItems) {
    const span = fretTo - fretFrom;
    const colW = span <= 5 ? 72 : span <= 9 ? 60 : 52;
    const cols = fretFrom === 0 ? fretTo : span + 1;
    const gridStyle = `style="grid-template-columns:40px repeat(${cols},${colW}px)"`;

    let html = `<div class="fret-wrap"><div class="fretboard" ${gridStyle}>`;
    for (let s = 5; s >= 0; s--) {
      // Label column
      const openChr = (TUNING[s] + fretFrom) % 12;
      html += `<div class="fret-cell open-string" data-string="${s}">`;
      if (fretFrom === 0 && noteMap[openChr]) {
        html += `<span class="${dotClassFn(openChr)}">${noteMap[openChr]}</span>`;
      } else {
        html += STRING_LABELS[s];
      }
      html += '</div>';
      // Fret cells
      const start = fretFrom === 0 ? 1 : fretFrom;
      for (let f = start; f <= fretTo; f++) {
        const chr = (TUNING[s] + f) % 12;
        html += `<div class="fret-cell" data-string="${s}">`;
        if (noteMap[chr]) html += `<span class="${dotClassFn(chr)}">${noteMap[chr]}</span>`;
        html += '</div>';
      }
    }
    html += `</div><div class="fret-numbers" ${gridStyle}><div class="fret-num"></div>`;
    const start = fretFrom === 0 ? 1 : fretFrom;
    for (let f = start; f <= fretTo; f++) {
      let cls = 'fret-num';
      if (DOUBLE_MARKER.includes(f)) cls += ' double-marker';
      else if (MARKER_FRETS.includes(f)) cls += ' marker';
      html += `<div class="${cls}">${f}</div>`;
    }
    html += '</div></div><div class="fret-legend">';
    legendItems.forEach(l => { html += `<div class="fret-legend-item"><span class="fret-legend-dot ${l.cls}"></span>${l.label}</div>`; });
    html += '</div>';
    return html;
  }

  const overlayScaleResult = document.getElementById('overlayScaleResult');

  function showScaleFretboard(root) {
    if (!root) { scaleFretResult.innerHTML = ''; overlayScaleResult.innerHTML = ''; return; }

    const type = SCALE_TYPES[scaleTypeIdx];
    const primarySet = getScaleChromatics(root, type.intervals);
    const chromatic = getChromatic(root);
    let rootIdx = chromatic.indexOf(root);
    if (rootIdx === -1) rootIdx = CHROMATIC_SHARPS.indexOf(root);

    let overlaySet = null;
    if (overlayEnabled && overlayRootVal) {
      overlaySet = getScaleChromatics(overlayRootVal, SCALE_TYPES[overlayTypeIdx].intervals);
      const oType = SCALE_TYPES[overlayTypeIdx];
      const oNotes = getScaleNoteNames(overlayRootVal, oType.intervals);
      let oHtml = '<div class="scale-display">';
      for (let i = 0; i < oNotes.length; i++) {
        const alt = isAltered(oNotes[i]) ? ' altered' : '';
        oHtml += `<div class="note-pill${alt}"><span class="note-name">${oNotes[i]}</span><span class="degree">${oType.degrees[i]}</span></div>`;
      }
      oHtml += `<div class="note-pill${isAltered(oNotes[0]) ? ' altered' : ''}"><span class="note-name">${oNotes[0]}</span><span class="degree">${oType.degrees[0]}</span></div>`;
      oHtml += '</div>';
      oHtml += `<div class="summary-card"><div><span class="label">Gamme : </span><span class="value">${overlayRootVal} ${oType.name}</span></div>`;
      oHtml += `<div><span class="label">Notes : </span><span class="value">${oNotes.join(' \u2014 ')}</span></div></div>`;
      overlayScaleResult.innerHTML = oHtml;
    } else {
      overlayScaleResult.innerHTML = '';
    }

    // Build noteMap: all notes from either scale
    const noteMap = {};
    const membership = {}; // 'primary' | 'overlay' | 'both'
    for (let chr = 0; chr < 12; chr++) {
      const inP = primarySet.has(chr);
      const inO = overlaySet && overlaySet.has(chr);
      if (inP || inO) {
        noteMap[chr] = chromatic[chr];
        if (inP && inO) membership[chr] = 'both';
        else if (inP) membership[chr] = 'primary';
        else membership[chr] = 'overlay';
      }
    }

    const dotClass = chr => {
      let c = 'fret-dot';
      if (chr === rootIdx) c += ' root';
      else if (membership[chr] === 'both') c += ' both-scales';
      else if (membership[chr] === 'overlay') c += ' overlay-only';
      return c;
    };

    const legend = [{cls:'root',label:'Tonique'},{cls:'note',label: root + ' ' + type.name}];
    if (overlaySet) {
      legend.push({cls:'overlay',label: overlayRootVal + ' ' + SCALE_TYPES[overlayTypeIdx].name});
      legend.push({cls:'both',label:'Communes'});
    }
    scaleFretResult.innerHTML = buildFretHtml(noteMap, dotClass, legend);
  }

  // ---- Quiz ----
  let quizCorrect = 0, quizTotal = 0, currentAnswer = '', answered = false, quizFilterRoot = null;
  const quizScore = document.getElementById('quizScore');
  const quizPrompt = document.getElementById('quizPrompt');
  const quizChoices = document.getElementById('quizChoices');
  const quizNext = document.getElementById('quizNext');
  const quizFilter = document.getElementById('quizFilter');

  const allBtn = document.createElement('button');
  allBtn.textContent = 'Toutes';
  allBtn.classList.add('active');
  allBtn.addEventListener('click', () => {
    quizFilterRoot = null;
    quizFilter.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    allBtn.classList.add('active');
    resetQuiz();
  });
  quizFilter.appendChild(allBtn);

  ROOTS.forEach(root => {
    const btn = document.createElement('button');
    btn.textContent = root;
    btn.addEventListener('click', () => {
      quizFilterRoot = root;
      quizFilter.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      resetQuiz();
    });
    quizFilter.appendChild(btn);
  });

  function resetQuiz() {
    quizCorrect = 0; quizTotal = 0;
    quizScore.textContent = 'Score : 0 / 0';
    newQuestion();
  }

  quizNext.addEventListener('click', newQuestion);

  function newQuestion() {
    answered = false;
    const root = quizFilterRoot || ROOTS[Math.floor(Math.random() * ROOTS.length)];
    const degreeIdx = Math.floor(Math.random() * 7);
    const scale = getScale(root);
    currentAnswer = scale[degreeIdx];

    quizPrompt.innerHTML = `Quelle est la note au degre <span class="highlight">${DEGREES[degreeIdx]}</span> de la gamme de <span class="highlight">${root}</span> ?`;

    const allNotes = [];
    ROOTS.forEach(r => { const s = getScale(r); for (let i = 0; i < 7; i++) { if (!allNotes.includes(s[i])) allNotes.push(s[i]); } });

    const choices = [currentAnswer];
    while (choices.length < 4) { const pick = allNotes[Math.floor(Math.random() * allNotes.length)]; if (!choices.includes(pick)) choices.push(pick); }
    for (let i = choices.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [choices[i], choices[j]] = [choices[j], choices[i]]; }

    quizChoices.innerHTML = '';
    choices.forEach(c => {
      const btn = document.createElement('button');
      btn.textContent = c;
      btn.addEventListener('click', () => checkAnswer(btn, c));
      quizChoices.appendChild(btn);
    });
  }

  function checkAnswer(btn, chosen) {
    if (answered) return;
    answered = true; quizTotal++;
    quizChoices.querySelectorAll('button').forEach(b => { b.disabled = true; if (b.textContent === currentAnswer) b.classList.add('correct'); });
    if (chosen === currentAnswer) { quizCorrect++; } else { btn.classList.add('wrong'); }
    quizScore.textContent = `Score : ${quizCorrect} / ${quizTotal}`;
  }

  // ---- Harmony ----
  let harmonyMode = 'major', harmonyVoicing = 'triad';
  const harmonyResult = document.getElementById('harmonyResult');
  const modeToggle = document.getElementById('modeToggle');
  const voicingToggle = document.getElementById('voicingToggle');

  setupToggle(modeToggle, btn => { harmonyMode = btn.dataset.mode; if (selectedRoot) showHarmony(selectedRoot); });
  setupToggle(voicingToggle, btn => { harmonyVoicing = btn.dataset.voicing; if (selectedRoot) showHarmony(selectedRoot); });

  function showHarmony(root) {
    const isMajor = harmonyMode === 'major';
    const isTetrad = harmonyVoicing === 'tetrad';
    const scale = buildScale(root, isMajor ? MAJOR_INTERVALS : MINOR_INTERVALS);
    const qualities = isTetrad ? (isMajor ? MAJOR_TETRAD_QUALITIES : MINOR_TETRAD_QUALITIES) : (isMajor ? MAJOR_QUALITIES : MINOR_QUALITIES);
    const degreeLabels = isMajor ? MAJOR_DEGREES_HARMONY : MINOR_DEGREES_HARMONY;
    const modeLabel = isMajor ? 'majeur' : 'mineur';

    let html = '<div class="chord-grid">';
    for (let i = 0; i < 7; i++) {
      const notes = getChordNotes(scale, i, isTetrad);
      const q = qualities[i];
      let cardClass = 'chord-card';
      if (q === 'dim' || q === 'm7b5') cardClass += ' dim-chord';
      else if (q === 'min' || q === 'm7') cardClass += ' minor-chord';
      html += `<div class="${cardClass}"><span class="chord-degree">${degreeLabels[i]}</span><span class="chord-name">${scale[i]}${CHORD_SUFFIXES[q] || ''}</span><span class="chord-quality">${QUALITY_LABELS[q]}</span><span class="chord-notes">${notes.join(' - ')}</span></div>`;
    }
    html += '</div>';
    html += `<div class="summary-card"><div><span class="label">Tonalite : </span><span class="value">${root} ${modeLabel}</span></div><div><span class="label">Gamme : </span><span class="value">${scale.slice(0, 7).join(' \u2014 ')}</span></div></div>`;
    harmonyResult.innerHTML = html;
  }

  // ---- Qualities ----
  const MAJOR_DEGREE_QUALITIES = [
    { degree: 'I', common: ['Maj7','6','6/9','add9'], others: ['Maj9','Maj13','sus2','sus4'] },
    { degree: 'ii', common: ['m7','m9'], others: ['m11','m6'] },
    { degree: 'iii', common: ['m7'], others: ['m7sus4'] },
    { degree: 'IV', common: ['Maj7','6','6/9','add9'], others: ['Maj9','sus2'] },
    { degree: 'V', common: ['7','9','13'], others: ['7sus4','aug','7#11'] },
    { degree: 'vi', common: ['m7','m9'], others: ['m11'] },
    { degree: 'vii\u00B0', common: ['m7b5'], others: ['dim7'] }
  ];
  const MINOR_DEGREE_QUALITIES = [
    { degree: 'i', common: ['m7','mMaj7','m6'], others: ['m9','m11'] },
    { degree: 'ii\u00B0', common: ['m7b5'], others: ['dim7'] },
    { degree: 'III', common: ['Maj7'], others: ['aug','Maj9'] },
    { degree: 'iv', common: ['m7','m9'], others: ['m11','m6'] },
    { degree: 'V', common: ['7','7b9','7b13'], others: ['7#9','m7'] },
    { degree: 'VI', common: ['Maj7','6'], others: ['6/9'] },
    { degree: 'VII', common: ['7','9'], others: [] }
  ];

  let qualitiesModeCurrent = 'major';
  const qualitiesResult = document.getElementById('qualitiesResult');
  const qualitiesMode = document.getElementById('qualitiesMode');

  setupToggle(qualitiesMode, btn => { qualitiesModeCurrent = btn.dataset.mode; showQualities(); });

  function showQualities() {
    const isMajor = qualitiesModeCurrent === 'major';
    const data = isMajor ? MAJOR_DEGREE_QUALITIES : MINOR_DEGREE_QUALITIES;
    const scale = selectedRoot ? buildScale(selectedRoot, isMajor ? MAJOR_INTERVALS : MINOR_INTERVALS) : null;

    let html = '<div class="quality-legend"><span><span class="quality-legend-swatch common"></span>Courant</span><span><span class="quality-legend-swatch other"></span>Possible</span></div>';
    data.forEach((d, idx) => {
      const noteName = scale ? scale[idx] : '';
      html += '<div class="quality-degree">';
      html += `<div class="quality-degree-header"><span class="quality-degree-num">${d.degree}</span>${noteName ? `<span class="quality-degree-note">${noteName}</span>` : ''}</div>`;
      html += '<div class="quality-tags">';
      d.common.forEach(q => { html += `<span class="quality-tag common">${noteName}${q}</span>`; });
      d.others.forEach(q => { html += `<span class="quality-tag">${noteName}${q}</span>`; });
      html += '</div></div>';
    });
    qualitiesResult.innerHTML = html;
  }

  showQualities();

  // ---- Chord Fretboard ----
  let chordVoicing = 'triad', chordDisplay = 'notes', chordDegree = 0;
  const chordFretResult = document.getElementById('chordFretResult');
  const chordDegreePicker = document.getElementById('chordDegreePicker');
  const chordInfoEl = document.getElementById('chordInfo');
  const chordVoicingToggle = document.getElementById('chordVoicingToggle');
  const chordDisplayToggle = document.getElementById('chordDisplayToggle');

  setupToggle(chordVoicingToggle, btn => { chordVoicing = btn.dataset.voicing; if (selectedRoot) showChordFretboard(selectedRoot); });
  setupToggle(chordDisplayToggle, btn => { chordDisplay = btn.dataset.display; if (selectedRoot) showChordFretboard(selectedRoot); });

  function showChordFretboard(root) {
    if (!root) return;
    const isTetrad = chordVoicing === 'tetrad';
    const scale = buildScale(root, MAJOR_INTERVALS);
    const qualities = isTetrad ? MAJOR_TETRAD_QUALITIES : MAJOR_QUALITIES;
    const degreeLabels = MAJOR_DEGREES_HARMONY;

    let pickerHtml = '';
    for (let i = 0; i < 7; i++) {
      const q = qualities[i];
      const name = scale[i] + (CHORD_SUFFIXES[q] || '');
      const active = i === chordDegree ? ' active' : '';
      pickerHtml += `<button class="chord-degree-btn${active}" data-deg="${i}">${name}<span class="deg-label">${degreeLabels[i]}</span></button>`;
    }
    chordDegreePicker.innerHTML = pickerHtml;
    chordDegreePicker.querySelectorAll('.chord-degree-btn').forEach(btn => {
      btn.addEventListener('click', () => { chordDegree = parseInt(btn.dataset.deg); showChordFretboard(selectedRoot); });
    });

    const degIdx = chordDegree;
    const chordNotes = getChordNotes(scale, degIdx, isTetrad);
    const quality = qualities[degIdx];
    const chordName = scale[degIdx] + (CHORD_SUFFIXES[quality] || '');
    const intervalShort = isTetrad ? ['R','3','5','7'] : ['R','3','5'];

    chordInfoEl.style.display = '';
    chordInfoEl.innerHTML = `<span class="ci-name">${chordName}</span><span class="ci-quality">${QUALITY_LABELS[quality]}</span><span class="ci-notes">${chordNotes.map((n, i) => n + ' (' + intervalShort[i] + ')').join(' \u2014 ')}</span>`;

    const chromatic = getChromatic(root);
    const chordMap = {};
    chordNotes.forEach((note, i) => {
      let idx = chromatic.indexOf(note);
      if (idx === -1) idx = CHROMATIC_SHARPS.indexOf(note);
      if (idx === -1) idx = CHROMATIC_FLATS.indexOf(note);
      if (idx !== -1) chordMap[idx] = { note: note, interval: intervalShort[i], rank: i };
    });

    const chordNoteMap = {};
    Object.keys(chordMap).forEach(k => {
      const m = chordMap[k];
      chordNoteMap[k] = chordDisplay === 'intervals' ? m.interval : m.note;
    });

    const dotClass = chr => {
      const m = chordMap[chr];
      let c = 'fret-dot';
      if (m.rank === 0) c += ' root';
      else if (m.rank === 1) c += ' chord-third';
      else if (m.rank === 2) c += ' chord-fifth';
      else if (m.rank === 3) c += ' chord-seventh';
      return c;
    };

    const legend = [{cls:'root',label:'Fondamentale'},{cls:'third',label:'Tierce'},{cls:'fifth',label:'Quinte'}];
    if (isTetrad) legend.push({cls:'seventh',label:'Septieme'});
    chordFretResult.innerHTML = buildFretHtml(chordNoteMap, dotClass, legend);
  }

  // ---- Table ----
  let sortAsc = true;
  const sortBtn = document.getElementById('sortAlt');
  const tableBody = document.getElementById('tableBody');

  function renderTable() {
    const sourceRoots = selectedRoot ? [selectedRoot] : ROOTS;
    const rows = sourceRoots.map(root => ({ root, scale: getScale(root), info: altInfo(root), sharps: ROOT_SHARPS[root] }));
    if (!selectedRoot) rows.sort((a, b) => sortAsc ? a.sharps - b.sharps : b.sharps - a.sharps);
    sortBtn.innerHTML = `Alt. <span class="sort-arrow">${sortAsc ? '\u25B2' : '\u25BC'}</span>`;
    let html = '';
    rows.forEach(r => {
      html += `<tr><td class="root-cell">${r.root}</td>`;
      for (let i = 0; i < 7; i++) { const cls = isAltered(r.scale[i]) ? ' class="altered"' : ''; html += `<td${cls}>${r.scale[i]}</td>`; }
      const altLabel = r.info.count === 0 ? '\u2014' : (r.info.count + (r.info.type === 'dieses' ? '\u266F' : '\u266D'));
      html += `<td>${altLabel}</td></tr>`;
    });
    tableBody.innerHTML = html;
  }

  sortBtn.addEventListener('click', () => { sortAsc = !sortAsc; renderTable(); });
  renderTable();
})();
