import './style.css';

/** ===== BRAND CONFIG ===== */
const brand = {
  poweredByLabel: 'Powered by Nostrich',
  shareUrl: "https://es.benosyquiz.com",
};

/** ===== QUIZ LENGTH ===== */
const QUIZ_LEN = 15; // 14 random + fixed last question

/** ===== STORAGE ===== */
const STORAGE_KEY_PAST_SCORES = 'beNosy_pastScores';
let resultsSavedThisRun = false;

/** ===== GA HELPERS (safe if GA not loaded yet) ===== */
function gaEvent(name, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

function trackShareClick(location) {
  gaEvent('share_click', { location });
}

async function shareQuiz(location = 'unknown') {
  const shareTitle = 'Be Nosy Quiz (Español)';
  const shareText = `Oye — tengo un reto rápido para ti.
  La gente respira todo el día, todos los días… pero casi nadie aprende cómo hacerlo correctamente.
  Acabo de hacer este quiz de 3 minutos y aprendí cosas sorprendentemente útiles sobre cómo respiramos.
  ¿Te da curiosidad saber cómo te irá?
  
  ${brand.shareUrl}
  
  Inténtalo un par de veces — la mayoría no lo logra en el primer intento.
  `;

  trackShareClick(location);

  if (navigator.share) {
    try {
      await navigator.share({
        title: shareTitle,
        text: 'Oye — tengo un reto rápido para ti.\n\nLa gente respira todo el día, todos los días… pero casi nadie aprende cómo hacerlo correctamente.\n\nAcabo de hacer este quiz de 3 minutos y aprendí cosas útiles sobre cómo respiramos.\n\n¿Te da curiosidad saber cómo te irá?',
        url: brand.shareUrl,
      });
      return;
    } catch (err) {
      // User may cancel share; fall through to clipboard.
    }
  }

  try {
    await navigator.clipboard.writeText(shareText);
    showToast('Challenge copied! Paste it to a friend.');
  } catch (err) {
    fallbackCopyText(shareText);
  }
}

function fallbackCopyText(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);

    if (ok) {
      showToast('Challenge copied! Paste it to a friend.');
    } else {
      showToast('Copy failed. Please try again.');
    }
  } catch (err) {
    showToast('Copy failed. Please try again.');
  }
}

function showToast(message) {
  let toast = document.getElementById('share-toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'share-toast';
    toast.style.position = 'fixed';
    toast.style.left = '50%';
    toast.style.bottom = '24px';
    toast.style.transform = 'translateX(-50%)';
    toast.style.padding = '12px 18px';
    toast.style.borderRadius = '999px';
    toast.style.background = 'rgba(0,0,0,0.85)';
    toast.style.color = '#fff';
    toast.style.fontSize = '14px';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 8px 20px rgba(0,0,0,0.25)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.2s ease';
    toast.style.pointerEvents = 'none';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.style.opacity = '0';
  }, 2200);
}

/** ===== QUIZ DATA (MASTER POOL) ===== */
const questions = [
  {
    text: '¿Cuál es el propósito biológico principal de respirar por la nariz en lugar de la boca?',
    options: [
      'Calentar el aire',
      'Disminuir la velocidad de la respiración',
      'Filtrar, humidificar y optimizar la absorción de oxígeno',
      'Reducir los ronquidos',
      'Todas las anteriores',
    ],
    correctIndex: 4,
    why: 'La respiración nasal calienta, filtra y humidifica el aire, apoya la producción de óxido nítrico y puede reducir efectos como la boca seca y los ronquidos.',
  },
  {
    text: '¿Qué gas producido en las vías nasales juega un papel clave en la entrega de oxígeno al cuerpo?',
    options: [
      'Dióxido de carbono',
      'Óxido nítrico',
      'Oxígeno',
      'Hidrógeno',
      'Ozono',
    ],
    correctIndex: 1,
    why: 'El óxido nítrico ayuda a regular el flujo sanguíneo y mejora la entrega de oxígeno.',
  },
  {
    text: 'Respirar por la boca durante el sueño está MÁS asociado con:',
    options: [
      'Ciclos de sueño más profundos',
      'Mayor eficiencia de oxígeno',
      'Ronquidos, boca seca y sueño fragmentado',
      'Mejor recuperación y resistencia',
    ],
    correctIndex: 2,
    why: 'Puede resecar las vías respiratorias y afectar la calidad del sueño.',
  },
  {
    text: '¿Cuál es la razón principal por la que la respiración nasal mejora la entrega de oxígeno?',
    options: [
      'Aumenta el nivel de oxígeno en sangre',
      'Permite que entre más aire a los pulmones',
      'Acelera la respiración',
      'Aumenta el tamaño pulmonar',
      'Ninguna de las anteriores',
    ],
    correctIndex: 4,
    why: 'No se trata solo de más oxígeno; la respiración nasal mejora la eficiencia del intercambio de gases.',
  },
  {
    text: 'Respirar MÁS oxígeno siempre significa que el cuerpo recibe MÁS oxígeno.',
    options: ['Verdadero', 'Falso'],
    correctIndex: 1,
    why: 'La utilización del oxígeno depende de varios factores, incluyendo el CO2 y la circulación.',
  },
  {
    text: '¿Cuál es el verdadero papel del dióxido de carbono en la respiración?',
    options: [
      'Un gas de desecho',
      'Un disparador para contener la respiración',
      'Un regulador clave que ayuda a liberar oxígeno de la hemoglobina',
      'Una causa de fatiga',
    ],
    correctIndex: 2,
    why: 'El CO2 regula el pH y facilita la liberación de oxígeno (efecto Bohr).',
  },
  {
    text: '¿Cuál es una señal común de respiración bucal crónica?',
    options: [
      'Mandíbula estrecha y dientes apiñados',
      'Mala calidad de sueño',
      'Fatiga frecuente',
      'Boca seca al despertar',
      'Todas las anteriores',
    ],
    correctIndex: 4,
    why: 'La respiración bucal está asociada con múltiples efectos negativos.',
  },
  {
    text: 'La respiración nasal promueve qué tipo de respiración:',
    options: [
      'Respiración torácica',
      'Respiración superficial',
      'Respiración diafragmática (abdominal)',
      'Respiración rápida',
    ],
    correctIndex: 2,
    why: 'Fomenta una respiración más profunda y eficiente.',
  },
  {
    text: '¿Qué factor es MÁS responsable del impulso de respirar?',
    options: [
      'Bajo nivel de oxígeno',
      'Expansión pulmonar',
      'Sensación de falta de aire en la garganta',
      'Frecuencia cardíaca',
      'Ninguna de las anteriores',
    ],
    correctIndex: 4,
    why: 'El aumento de CO2 es el principal impulsor.',
  },
  {
    text: '¿Qué ocurre con la resistencia del aire al respirar por la nariz?',
    options: [
      'Disminuye y empeora la absorción de oxígeno',
      'Aumenta ligeramente y mejora la eficiencia respiratoria',
      'No tiene efecto',
      'Restringe peligrosamente el flujo de aire',
    ],
    correctIndex: 1,
    why: 'La resistencia ayuda a controlar la respiración.',
  },
  {
    text: '¿Qué es el ciclo nasal?',
    options: [
      'Una técnica de respiración',
      'Congestión alternante entre fosas nasales',
      'Una fase del sueño',
      'Un mito',
    ],
    correctIndex: 1,
    why: 'Es un fenómeno normal del cuerpo.',
  },
  {
    text: '¿Qué grupos mejoran al cambiar a respiración nasal?',
    options: [
      'Atletas',
      'Personas que roncan',
      'Personas con fatiga',
      'Niños',
      'Todos los anteriores',
    ],
    correctIndex: 4,
    why: 'Muchos grupos pueden beneficiarse.',
  },
  {
    text: 'Comparado con la respiración bucal, la nasal resulta en:',
    options: [
      'Respiración más rápida',
      'Menor tolerancia al CO2',
      'Mejor uso del oxígeno',
      'Mayor estrés',
    ],
    correctIndex: 2,
    why: 'Promueve eficiencia y calma fisiológica.',
  },
  {
    text: '¿Por qué la respiración nasal se siente más difícil al principio?',
    options: [
      'Menos oxígeno',
      'Hábito y tolerancia al CO2',
      'Pulmones débiles',
      'Restricción peligrosa',
      'Ninguna de las anteriores',
    ],
    correctIndex: 4,
    why: 'Es una cuestión de adaptación, no de peligro.',
  },
  {
    text: '¿Qué ayuda a entrenar la respiración nasal por la noche?',
    options: [
      'Mejorar la higiene nasal',
      'Reducir la respiración bucal',
      'Aumentar la tolerancia al CO2',
      'Mayor conciencia del flujo nasal',
      'Todas las anteriores',
    ],
    correctIndex: 4,
    why: 'Es una combinación de factores.',
  },
];

/** ===== STATE ===== */
let quizQuestions = [];
let answers = [];
let currentQuestion = 0;
let openWhy = [];
let resultsScoreRevealed = false;
let resultsScoreTimer = null;

/** ===== HELPERS ===== */
function savePastScore(rawCorrect, total, tierName) {
  const date = new Date().toLocaleDateString();
  const entry = { date, tier: tierName, raw: rawCorrect, total };

  const arr = loadPastScores();
  arr.unshift(entry);
  const trimmed = arr.slice(0, 5);
  localStorage.setItem(STORAGE_KEY_PAST_SCORES, JSON.stringify(trimmed));
}

function loadPastScores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAST_SCORES);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.log('Past scores could not be loaded.');
    return [];
  }
}

function showPastScoresModal() {
  const existing = document.getElementById('pastOverlay');
  if (existing) existing.remove();

  const scores = loadPastScores();

  const rows = scores.length
    ? scores
        .map(
          (s, i) => `
            <div class="pastScoreRow">
              <div><strong>${i + 1}.</strong> ${s.raw}/${s.total} — <strong>${
            s.tier
          }</strong></div>
              <div class="pastScoreDate">${s.date}</div>
            </div>
          `
        )
        .join('')
    : `<p>No past scores saved yet. Finalizar the quiz once and check Atrás here.</p>`;

  const html = `
    <div class="modalOverlay" id="pastOverlay">
      <div class="modalCard" role="dialog" aria-modal="true" aria-labelledby="pastTitle">
        <div class="modalHeader">
          <div class="modalTitle" id="pastTitle">Past 5 Scores</div>
          <button class="modalClose" id="pastClose" type="button">&times;</button>
        </div>

        <div class="modalBody">
          <div class="pastScoresList">
            ${rows}
          </div>
        </div>

        <div class="modalFooter">
          <button class="secondary" id="pastClose2" type="button">Close</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);

  const overlay = document.getElementById('pastOverlay');
  const close1 = document.getElementById('pastClose');
  const close2 = document.getElementById('pastClose2');

  function closePastScores() {
    const modal = document.getElementById('pastOverlay');
    if (modal) modal.remove();
  }

  if (close1) close1.onclick = closePastScores;
  if (close2) close2.onclick = closePastScores;

  if (overlay) {
    overlay.onclick = (e) => {
      if (e.target === overlay) closePastScores();
    };
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildQuizQuestions() {
  const fixedLast = questions[questions.length - 1];
  const pool = questions.slice(0, questions.length - 1);
  shuffleArray(pool);
  const pickCount = Math.max(0, QUIZ_LEN - 1);
  const picked = pool.slice(0, pickCount);
  return [...picked, fixedLast];
}

function getScoreRaw() {
  let correct = 0;
  for (let i = 0; i < quizQuestions.length; i++) {
    const selected = answers[i];
    if (selected === quizQuestions[i].correctIndex) correct++;
  }
  return correct;
}

function getTierFromRawCorrect(raw) {
  if (raw <= 4) return 0;
  if (raw <= 8) return 1;
  if (raw <= 12) return 2;
  return 3;
}

const TIERS = [
  {
    name: 'Principiante en respiración bucal',
    range: '0–4 correctas',
    note: 'Sin pena—la mayoría empieza aquí. Inténtalo de nuevo y verás cómo sube tu puntuación.',
  },
  {
    name: 'Curioso nasal',
    range: '5–8 correctas',
    note: 'Ya estás empezando a entender el poder de la respiración nasal.',
  },
  {
    name: 'Experto en respiración nasal',
    range: '9–12 correctas',
    note: 'Fuerte. Entiendes lo que mejora el sueño, la recuperación y la eficiencia respiratoria.',
  },
  {
    name: 'Respirador nasal élite (Certificado Nostrich)',
    range: '13–15 correctas',
    note: 'Nivel top. Estás listo para enseñarle a alguien más."',
  },
];

function showNnbdModal() {
  const html = `
    <div class="modalOverlay" id="nnbdOverlay">
      <div class="modalCard" role="dialog" aria-modal="true" aria-labelledby="nnbdTitle">
        <div class="modalHeader">
          <div class="modalTitle" id="nnbdTitle">Día Nacional de la Respiración Nasal – Acceso anticipado</div>
          <button class="modalClose" id="nnbdClose" type="button">&times;</button>
        </div>

        <div class="modalBody">
          <p style="color:#d62828; font-weight:800; font-size:1.1rem; text-align:center; margin:0 0 12px 0;">
          ¡1 de noviembre de 2026!
          </p>
          <p>Obtén <strong>13 o más</strong> para <strong>ser parte de la historia</strong> como uno de los primeros en apoyar el Día Nacional de la Respiración Nasal.</p>
<p>La gente respira todo el día, todos los días — pero casi nadie aprende a hacerlo de forma óptima. La respiración nasal frente a la bucal tiene más beneficios de los que imaginas.</p>
<p><strong>Este descanso de 3 minutos puede mejorar tu sueño, recuperación y enfoque — o ayudar a alguien que quieres.</strong></p>
<p><strong>Importante:</strong> probablemente no obtendrás una puntuación perfecta en tu primer intento.</p>
        </div>

        <div class="modalFooter">
          <button class="secondary" id="nnbdClose2" type="button">Cerrar</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);

  const overlay = document.getElementById('nnbdOverlay');
  const close1 = document.getElementById('nnbdClose');
  const close2 = document.getElementById('nnbdClose2');

  const close = () => overlay && overlay.remove();

  if (close1) close1.onclick = close;
  if (close2) close2.onclick = close;

  if (overlay) {
    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };
  }
}

/** ===== RENDER ===== */
function renderIntro() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="card">
      <div class="brandTop">
        <div class="brandMark">Be Nosy</div>
        <div class="brandSub">${brand.poweredByLabel}</div>
      </div>

      <h1 class="headline">How Nosy Is Your Breathing?</h1>

      <div class="ostrichWrap">
        <img src="/ostrich.png" alt="Be Nosy Ostrich" class="ostrichHero">
      </div>

      <p><strong>${QUIZ_LEN} preguntas.</strong> Mira cómo te va y reta a un amigo.</p>

      <div class="introActions">
        <button class="primary" id="start" type="button">Comenzar Prueba</button>
        <button class="secondary shareBtn" id="share-intro" type="button">Compartir este Prueba</button>
      </div>

      <div class="nnbdBanner">
        <strong>1 de noviembre de 2026 — DÍA NACIONAL DE LA RESPIRACIÓN NASAL.</strong>
        <button class="learnMoreBtn" id="learn-more" type="button">Más información</button>
      </div>
    </div>
  `;

  document.getElementById('start').onclick = () => {
    gaEvent('quiz_start');

    resultsScoreRevealed = false;
    resultsSavedThisRun = false;
    if (resultsScoreTimer) {
      clearTimeout(resultsScoreTimer);
      resultsScoreTimer = null;
    }

    quizQuestions = buildQuizQuestions();
    answers = new Array(quizQuestions.length).fill(null);
    openWhy = new Array(quizQuestions.length).fill(false);
    currentQuestion = 0;
    renderQuestion();
  };

  document.getElementById('share-intro').onclick = () => {
    shareQuiz('cover');
  };

  document.getElementById('learn-more').onclick = () => {
    showNnbdModal();
  };
}

function renderQuestion() {
  const app = document.getElementById('app');
  if (!app) return;

  const q = quizQuestions[currentQuestion];
  const selectedIndex = answers[currentQuestion];
  const pct = Math.round(((currentQuestion + 1) / quizQuestions.length) * 100);

  app.innerHTML = `
    <div class="card">
      <div class="topRow">
        <div class="powered">${brand.poweredByLabel}</div>
        <button class="ghost" id="quit" type="button">Salir</button>
      </div>

      <div class="progressWrap">
        <div class="progressText">Question ${currentQuestion + 1} of ${
    quizQuestions.length
  }</div>
        <div class="progressBar" aria-label="progress">
          <div class="progressFill" style="width:${pct}%"></div>
        </div>
      </div>

      <h2 class="questionText">${q.text}</h2>

      <div class="options">
        ${q.options
          .map((o, i) => {
            const isActive = i === selectedIndex;
            const activeClass = isActive ? ' optionActive' : '';
            const check = isActive
              ? `<span class="optCheck" aria-hidden="true">✓</span>`
              : '';
            return `<button class="option${activeClass}" data-i="${i}" type="button">
                      <span class="optText">${o}</span>
                      ${check}
                    </button>`;
          })
          .join('')}
      </div>

      <div class="navRow">
        <button class="secondary" id="back" type="button" ${
          currentQuestion === 0 ? 'disabled' : ''
        }>← Atrás</button>
        <button class="primary" id="next" type="button" ${
          selectedIndex === null ? 'disabled' : ''
        }>
          ${
            currentQuestion === quizQuestions.length - 1
              ? 'Finish'
              : 'Siguiente →'
          }
        </button>
      </div>
    </div>
  `;

  document.querySelectorAll('.option').forEach((btn) => {
    btn.onclick = () => {
      answers[currentQuestion] = Number(btn.dataset.i);
      renderQuestion();

      setTimeout(() => {
        document.getElementById('next')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 50);
    };
  });

  document.getElementById('back').onclick = () => {
    if (currentQuestion > 0) {
      currentQuestion--;
      renderQuestion();
    }
  };

  document.getElementById('next').onclick = () => {
    if (answers[currentQuestion] === null) return;

    if (currentQuestion < quizQuestions.length - 1) {
      currentQuestion++;
      renderQuestion();
    } else {
      renderResults();
    }
  };

  document.getElementById('quit').onclick = () => {
    quizQuestions = [];
    answers = [];
    openWhy = [];
    currentQuestion = 0;
    renderIntro();
  };
}

function renderResults() {
  const app = document.getElementById('app');
  if (!app) return;

  const rawCorrect = getScoreRaw();
  const total = quizQuestions.length;
  const tierIdx = getTierFromRawCorrect(rawCorrect);
  const title = TIERS[tierIdx].name;

  gaEvent('quiz_complete', { score: rawCorrect, total, tier: title });

  if (rawCorrect >= 13) {
    gaEvent('nostrich_certified', {
      score: rawCorrect,
      tier: title,
    });
  }

  app.innerHTML = `
    <div class="card">
      <div class="brandTop">
        <div class="brandMark">Be Nosy</div>
        <div class="brandSub">${brand.poweredByLabel}</div>
      </div>

      <h1 class="headline">Quiz completado</h1>

      <div class="resultsBox">
        <div class="scoreLine">
          <div class="scoreLabel">Tu puntuación:</div>
          <div class="scoreValue" id="scoreValue">
            ${
              resultsScoreRevealed
                ? `<strong>${rawCorrect} / ${total}</strong>`
                : `<span class="scoreCalc" aria-label="Calculating score">
                     <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                   </span>`
            }
          </div>
        </div>
        <p class="titleLine">Título obtenido: <strong>${title}</strong></p>
      </div>

      <div class="tierGrid">
        ${TIERS.map((t, i) => {
          const active = i === tierIdx ? ' tierActive' : '';
          const badge =
            i === tierIdx
              ? `<span class="earnedBadge">Título obtenido</span>`
              : '';
          const earnedTitle =
            i === tierIdx
              ? `<div class="earnedTitle flashSlow">${t.name}</div>`
              : '';
          return `
            <div class="tierCard${active}">
              <div class="tierTop">
                <div>
                  <div class="tierName">${t.name}</div>
                  <div class="tierRange">${t.range}</div>
                </div>
                ${badge}
              </div>
              <div class="tierNote">${t.note}</div>
              ${earnedTitle}
            </div>
          `;
        }).join('')}
      </div>

      <div class="resultsActions">
        <button class="secondary shareBtn" id="share" type="button">Reta a un amigo</button>
        <button class="secondary" id="restart" type="button">Reiniciar Prueba</button>
        <hr />
      </div>

      <h2 class="answerKeyTitle">Respuestas</h2>
      <div class="answerKey">
        ${quizQuestions
          .map((q, idx) => {
            const userIdx = answers[idx];
            const userAnswer =
              userIdx === null ? '(no answer)' : q.options[userIdx];
            const bestAnswer = q.options[q.correctIndex];
            const isCorrect = userIdx === q.correctIndex;
            const cls = isCorrect ? 'akCorrect' : 'akWrong';
            const whyOpen = openWhy[idx] ? ' whyBtnOpen' : '';
            const whyText = q.why || 'Explanation coming soon.';

            return `
              <div class="akItem ${cls}">
                <div class="akQRow">
                  <div class="akQ"><strong>${idx + 1}.</strong> ${q.text}</div>
                  <button
                    class="whyBtn${whyOpen}"
                    data-why="${idx}"
                    type="button"
                    title="Click for explanation"
                    aria-label="Explanation"
                  >?</button>
                </div>

                <div class="akA"><span class="label">Your answer:</span> ${userAnswer}</div>
                <div class="akBest"><span class="label">Best answer:</span> ${bestAnswer}</div>

                ${
                  openWhy[idx]
                    ? `<div class="explainWrap"><div class="explainBox">${whyText}</div></div>`
                    : ''
                }
              </div>
            `;
          })
          .join('')}
      </div>

      <button class="tryAgainBtn" id="try-again" type="button">
      Inténtalo de nuevo — ¡Mejora tu puntuación!
      </button>

      <button class="secondary" id="pastScores" type="button">
      Ver puntuaciones anteriores
      </button>
    </div>
  `;

  if (!resultsScoreRevealed && !resultsScoreTimer) {
    resultsScoreTimer = setTimeout(() => {
      resultsScoreRevealed = true;
      resultsScoreTimer = null;

      if (!resultsSavedThisRun) {
        savePastScore(rawCorrect, total, title);
        resultsSavedThisRun = true;
      }

      renderResults();
    }, 3000);
  }

  const shareBtn = document.getElementById("share");
if (shareBtn) {
  shareBtn.onclick = () => {
    shareQuiz("results");
  };
}

  document.getElementById('restart').onclick = () => {
    gaEvent('retry_quiz', { source: 'restart' });

    resultsScoreRevealed = false;
    resultsSavedThisRun = false;
    if (resultsScoreTimer) {
      clearTimeout(resultsScoreTimer);
      resultsScoreTimer = null;
    }

    quizQuestions = buildQuizQuestions();
    answers = new Array(quizQuestions.length).fill(null);
    openWhy = new Array(quizQuestions.length).fill(false);
    currentQuestion = 0;
    renderQuestion();
  };

  document.getElementById('try-again').onclick = () => {
    gaEvent('retry_quiz', { source: 'try_again' });

    resultsScoreRevealed = false;
    resultsSavedThisRun = false;
    if (resultsScoreTimer) {
      clearTimeout(resultsScoreTimer);
      resultsScoreTimer = null;
    }

    quizQuestions = buildQuizQuestions();
    answers = new Array(quizQuestions.length).fill(null);
    openWhy = new Array(quizQuestions.length).fill(false);
    currentQuestion = 0;
    renderQuestion();
  };

  document.getElementById('pastScores').onclick = () => {
    gaEvent('view_past_scores');
    showPastScoresModal();
  };

  document.querySelectorAll('[data-why]').forEach((btn) => {
    btn.onclick = () => {
      const i = Number(btn.getAttribute('data-why'));
      openWhy[i] = !openWhy[i];
      renderResults();
    };
  });
}

// Start
renderIntro();
