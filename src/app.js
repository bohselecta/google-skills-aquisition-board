import {
  VERSION,
  RUBRIC,
  skills,
  sources,
  goals,
  perspectives,
  cohorts,
  skillById,
  initialState,
  isState,
  estimate,
  comparison,
  opportunities,
  createProject,
  adopt,
  replayAssessment,
  reviewEvidence,
  setSource,
  disclosure,
  projectBrief
} from './domain.js';

const $ = (s, root = document) => root.querySelector(s);
const esc = s =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEY = 'google-emergence-demo-v1';
let storageNotice = '',
  state = initialState();

try {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    if (isState(parsed)) state = parsed;
    else storageNotice = 'Saved demo state was incompatible with this version and has been refreshed.';
  }
} catch {
  storageNotice = 'Browser storage is unavailable. Your session is active in memory for this session.';
}

let filter = 'All',
  selectedSkill = 'systems',
  toastTimer;

const paths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  orbit: '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-35 12 12)"/><path d="M17 4a10 10 0 0 1-2 17"/>',
  folder: '<path d="M3 7V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  layers: '<path d="m12 3 10 5.5-10 5.5L2 8.5Zm-9 10 9 5 9-5M3 17.5l9 5 9-5"/>',
  chart: '<path d="M4 3v17h17M8 15v-4m5 4V7m5 8v-5"/>',
  check: '<path d="m8 12 3 3 6-7"/><circle cx="12" cy="12" r="9"/>',
  shield: '<path d="M12 2 4 5.5v6.5c0 5.5 3.5 10.5 8 12 4.5-1.5 8-6.5 8-12V5.5Z"/><path d="m9 12 2 2 4-4"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  up: '<path d="M7 17 17 7M7 7h10v10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4.5 4.5"/>',
  voice: '<path d="M4 10v4m4-8v12m4-15v18m4-11v4m4-7v10"/>',
  box: '<path d="m12 2 9 5v10l-9 5-9-5V7Zm0 10 9-5M12 12 3 7m9 5v10M7 4.5l10 5.5"/>',
  people: '<circle cx="9" cy="7" r="3.5"/><path d="M3 20v-2a5 5 0 0 1 10 0v2M16 4a3.5 3.5 0 0 1 0 7m2 4a4.5 4.5 0 0 1 3 4v1"/>',
  code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3.5l-4 17"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6.5v5.5l4 2.5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11.5v5m0-8.5v1"/>',
  download: '<path d="M12 3.5v11m-4.5-4.5 4.5 4.5 4.5-4.5M4 17.5v3a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-3"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 4 13C4 7 11 3 20 3c0 9-4 16-11 17Z"/><path d="M8 16c3-4 6-6 10-8"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/>',
  spark: '<path d="m12 2 2.8 6.2L21 11l-6.2 2.8L12 20l-2.8-6.2L3 11l6.2-2.8Z"/>'
};

const icon = (name, cls = '') =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${
    paths[name] || paths.spark
  }</svg>`;

const scoreText = stat => (stat.score === null ? 'Unmapped' : `${stat.score.toFixed(1)} / 4.0`);
const tag = (text, color = '') => `<span class="tag ${color}">${text}</span>`;
const button = (text, action, cls = 'btn', extra = '') =>
  `<button class="${cls}" data-action="${action}" ${extra}>${text}</button>`;

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    toast('Local browser storage is full. Changes are retained for this session.');
  }
}

function toast(message) {
  clearTimeout(toastTimer);
  $('#live').textContent = message;
  $('#live').classList.add('show');
  toastTimer = setTimeout(() => $('#live').classList.remove('show'), 5200);
}

const pages = [
  ['board', 'grid', 'Emergence Board'],
  ['projects', 'folder', 'Growth Projects'],
  ['perspectives', 'layers', 'Perspectives'],
  ['benchmarks', 'chart', 'Shared Horizons'],
  ['evidence', 'check', 'Evidence Library'],
  ['consent', 'shield', 'Data & Privacy']
];

function route() {
  const path = location.hash.slice(1);
  return [...pages.map(p => p[0]), 'proposal'].includes(path) ? path : 'board';
}

function navigate(page) {
  if (route() === page) render();
  else location.hash = page;
}

function shell(content) {
  const current = route(),
    pending = state.evidence.filter(e => e.status === 'pending').length,
    active = state.projects.filter(p => p.status !== 'complete').length;

  return `<aside class="sidebar">
    <a href="#board" class="brand" aria-label="Google Emergence Home">
      <img src="./public/mark.svg" alt="" width="36" height="36">
      <div class="brand-text">
        <div class="brand-title">
          <span class="g-blue">G</span><span class="g-red">o</span><span class="g-yellow">o</span><span class="g-blue">g</span><span class="g-green">l</span><span class="g-red">e</span>
          <span class="emergence">Emergence</span>
        </div>
        <span class="brand-sub">Enterprise Capability Board</span>
      </div>
    </a>
    <div class="workspace-label">ENTERPRISE TALENT ARCHITECTURE</div>
    <nav aria-label="Main navigation">
      ${pages
        .map(
          ([id, i, name]) =>
            `<a href="#${id}" class="nav-item ${current === id ? 'active' : ''}" ${
              current === id ? 'aria-current="page"' : ''
            }>${icon(i)}<span>${name}</span>${
              id === 'projects' && active
                ? `<span class="count">${active}</span>`
                : id === 'evidence' && pending
                ? `<span class="count accent">${pending}</span>`
                : ''
            }</a>`
        )
        .join('')}
    </nav>
    <div class="sidebar-bottom">
      <a class="proposal-link" href="#proposal">${icon('spark')}<span style="font-weight:600">Google Enterprise AI Vision</span>${icon('up')}</a>
      <div class="side-badge">
        <span class="gemini-sparkle">${icon('spark')}</span>
        <span>Powered by Gemini Enterprise & Google Cloud VPC-SC</span>
      </div>
      <div class="profile">
        <span class="avatar">A</span>
        <div>
          <strong>Alex Rivera</strong>
          <small>Enterprise AI Strategist (Demo)</small>
        </div>
        <span class="online-dot" title="Local Enterprise Session Active"></span>
      </div>
    </div>
  </aside>
  <div class="workspace">
    <header class="topbar">
      <div class="breadcrumb">
        <span>Google Cloud & Workspace</span>
        <span>/</span>
        <strong>${pages.find(p => p[0] === current)?.[2] || 'Enterprise AI Architecture'}</strong>
      </div>
      <div class="top-actions">
        <span class="enterprise-domain-pill"><span class="pulse-dot"></span> Acme Global · Gemini Enterprise</span>
        ${button(icon('info'), 'tour', 'icon-button', 'aria-label="How Google Emergence works"')}
        ${button(`${icon('plus')} New Growth Project`, 'new', 'btn small google-blue')}
      </div>
    </header>
    <main id="main" tabindex="-1">
      ${content}
      <footer class="page-footer">
        <span>Google Emergence · Enterprise AI Skills & Capability Acquisition Platform</span>
        <span>Synthetic Demonstration · Zero Unconsented Telemetry · <a href="#proposal">Read System Proposal ${icon(
          'up'
        )}</a></span>
      </footer>
    </main>
  </div>`;
}

function pageHead(eyebrow, title, description, actions = '') {
  return `<section class="page-heading">
    <div>
      <div class="eyebrow">${eyebrow}</div>
      <h1>${title}</h1>
      <p>${description}</p>
    </div>
    ${actions}
  </section>`;
}

function modeToggle() {
  return `<div class="segmented" role="group" aria-label="Capability demonstration mode">
    ${['independent', 'assisted']
      .map(mode =>
        button(
          mode === 'independent' ? 'Independent Human' : 'With Gemini Enterprise',
          `mode:${mode}`,
          state.mode === mode ? 'selected' : '',
          'aria-pressed="' + (state.mode === mode) + '"'
        )
      )
      .join('')}
  </div>`;
}

function goalSelect() {
  return `<label class="goal-control">Strategic Focus
    <select id="goal" aria-label="Enterprise Strategic Focus">
      ${goals.map(g => `<option value="${g.id}" ${state.goal === g.id ? 'selected' : ''}>${g.name}</option>`).join('')}
    </select>
  </label>`;
}

function mapView() {
  return `<div class="constellation" aria-label="Enterprise capabilities mapped around your Living Actor.">
    <svg class="map-lines" viewBox="0 0 1000 550" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <radialGradient id="google-glow" cx="50%" cy="50%" r="50%">
          <stop stop-color="#e8f0fe" stop-opacity="0.85"/>
          <stop offset="60%" stop-color="#f1f3f4" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="500" cy="270" rx="380" ry="260" fill="url(#google-glow)"/>
      <g fill="none" stroke="#dadce0" stroke-width="1.4">
        <ellipse cx="500" cy="265" rx="300" ry="195" stroke-dasharray="4 6"/>
        <path d="M500 250 Q510 190 510 120 M500 250 Q310 230 210 250 M500 250 Q660 200 760 260 M500 250 Q480 320 480 430 M500 250 Q230 330 140 420 M500 250 Q740 310 860 430"/>
        <path d="M210 250 Q280 65 510 120 M510 120 Q820 90 760 260 M760 260 Q780 350 860 430 M140 420 Q280 470 480 430 M480 430 Q700 480 860 430" stroke-dasharray="3 5"/>
      </g>
      <g fill="#1a73e8" opacity="0.35">
        <circle cx="340" cy="240" r="3.5"/>
        <circle cx="640" cy="230" r="3.5"/>
        <circle cx="485" cy="320" r="3.5"/>
      </g>
    </svg>
    <div class="actor-node">
      <span>G</span>
      <small>Living Actor</small>
    </div>
    ${skills
      .map(s => {
        const stat = estimate(state, s.id);
        return `<button class="skill-node ${s.color} ${
          stat.score === null ? 'unmapped' : ''
        }" style="left:${s.x}%;top:${s.y}%" data-action="skill:${s.id}" aria-label="${s.name}, ${scoreText(
          stat
        )}; inspect enterprise rubric">
        <span class="node-orb">${icon(s.icon)}</span>
        <strong>${s.name}</strong>
        <small>${scoreText(stat)}</small>
      </button>`;
      })
      .join('')}
    <span class="map-watermark">GOOGLE ENTERPRISE CAPABILITY PLANE</span>
  </div>`;
}

function board() {
  const next = opportunities(state)[0],
    accepted = state.evidence.filter(e => e.status === 'accepted' && state.sources[e.source]).length;

  return `${pageHead(
    'ENTERPRISE TALENT IN MOTION',
    'Continuous Human Capability Emergence',
    'A living, inspectable map connecting everyday enterprise work in Google Workspace to strategic capability development, verified evidence, and Gemini-powered learning.',
    goalSelect()
  )}
  <div class="board-grid">
    <section class="card map-card">
      <div class="card-head">
        <div>
          <h2>Enterprise Capability Constellation</h2>
          <p>Verified competencies and emerging trajectories across your organization.</p>
        </div>
        ${modeToggle()}
      </div>
      ${mapView()}
      <div class="map-bottom">
        <span><i class="legend-dot"></i> ${accepted} verified demonstration artifacts</span>
        <span>${icon('info')} Click any capability node to inspect rubrics and evidence trail</span>
      </div>
    </section>

    <section class="card next-card">
      <div>
        <div class="eyebrow">${icon('spark')} RECOMMENDED GROWTH EXPERIMENT</div>
        <div class="orbit-art" aria-hidden="true">${icon(next.icon)}</div>
        <span class="micro">HIGH LEVERAGE INITIATIVE</span>
        <h2>${next.practice}</h2>
        <p>${next.reason}</p>
      </div>
      <div class="next-meta">
        ${icon('clock')} 30-minute structured sprint <span>·</span> ${next.category}
      </div>
      ${button(`Start Growth Project ${icon('arrow')}`, `new:${next.id}`, 'btn google-blue full')}
      <div class="fine-print">
        Synthesized from your strategic focus and verified demonstrations. No opaque algorithms or workplace surveillance.
      </div>
    </section>
  </div>

  <section class="section">
    <div class="section-heading">
      <div>
        <h2>High-Priority Enterprise Horizons</h2>
        <p>Strategic competencies aligned with your current organizational focus.</p>
      </div>
      <a class="text-link" href="#benchmarks">Explore enterprise benchmark distribution ${icon('arrow')}</a>
    </div>
    <div class="growth-grid">
      ${opportunities(state)
        .slice(0, 3)
        .map(
          (s, i) => `<article class="card growth-card">
        <div class="growth-top">
          <span class="icon-tile ${s.color}">${icon(s.icon)}</span>
          <span class="micro">0${i + 1} / STRATEGIC LEVER</span>
        </div>
        <h3>${s.name}</h3>
        <p>${s.summary}</p>
        <div class="growth-bottom">
          <span>${s.score === null ? 'Baseline required' : `${s.score.toFixed(1)} → ${s.target.toFixed(1)}`} <small>${
            s.score === null ? '' : 'rubric benchmark / 4.0'
          }</small></span>
          ${button(icon('arrow'), `new:${s.id}`, 'round-button', `aria-label="Start a ${s.name} project"`)}
        </div>
      </article>`
        )
        .join('')}
    </div>
  </section>

  <section class="perspective-banner">
    <div>
      <span class="eyebrow">ENTERPRISE CULTURE & METHODOLOGY</span>
      <h2>Borrow a proven way of working.<br>Accelerate your team’s emergence.</h2>
      <p>Adopt tested engineering and communication frameworks from industry leaders—transforming abstract principles into executable Google Workspace projects.</p>
    </div>
    <a href="#perspectives" class="btn outline">Explore perspectives ${icon('arrow')}</a>
  </section>

  <div class="data-note">
    ${icon('shield')} <strong>Enterprise Security Guarantee:</strong> All demonstrations stay client-side in this browser session. Compliant with Google Cloud VPC-SC perimeters and Customer-Managed Encryption Keys (CMEK). Zero unconsented telemetry.
  </div>`;
}

function projectCard(p) {
  const s = skillById(p.skill),
    completed = p.steps.filter(Boolean).length;
  return `<article class="card project-card">
    <div class="growth-top">
      <span class="icon-tile ${s.color}">${icon(s.icon)}</span>
      ${tag(
        p.status === 'complete' ? 'Evidence Verified' : p.status === 'review' ? 'Ready for Review' : 'In Progress',
        p.status === 'complete' ? 'mint' : ''
      )}
    </div>
    <h3>${esc(p.title)}</h3>
    <p>${s.name}${p.origin ? ' · Perspective Practice' : ''}</p>
    <div class="step-track" aria-label="${completed} of 3 practice steps completed">
      ${p.steps.map(v => `<span class="${v ? 'done' : ''}"></span>`).join('')}
    </div>
    <div class="project-meta">
      <span>${icon('clock')} ${p.minutes} min sprint</span>
      <span>${completed}/3 verification steps</span>
    </div>
    ${button(`Open Project Workspace ${icon('arrow')}`, `project:${p.id}`, 'btn outline full')}
  </article>`;
}

function projectsView() {
  const list = state.projects.filter(p =>
    filter === 'All' ? true : filter === 'Complete' ? p.status === 'complete' : p.status !== 'complete'
  );
  return `${pageHead(
    'STRATEGIC EXECUTION',
    'Growth Projects & Deliberate Practice',
    'Every capability develops through inspectable action: an explicit hypothesis, a testable artifact produced in Google Workspace, and verified demonstration evidence.'
  )}
  <div class="toolbar">
    <div class="segmented" role="group" aria-label="Filter enterprise projects">
      ${['All', 'In progress', 'Complete']
        .map(f =>
          button(f, `filter:${f}`, filter === f ? 'selected' : '', `aria-pressed="${filter === f}"`)
        )
        .join('')}
    </div>
    ${button(`${icon('plus')} New Growth Project`, 'new', 'btn google-blue')}
  </div>
  <div class="projects-grid">
    ${
      list.length
        ? list.map(projectCard).join('')
        : `<div class="empty-state">
      ${icon('leaf')}
      <h2>${filter === 'Complete' ? 'No completed projects yet.' : 'Ready for your next enterprise project.'}</h2>
      <p>${
        filter === 'Complete'
          ? 'Complete structured practice steps and review evidence to record achievements.'
          : 'Create a focused project to develop high-value capabilities.'
      }</p>
      ${button('Create Project', 'new', 'btn google-blue')}
    </div>`
    }
  </div>
  <section class="explain-strip">
    <div>
      ${icon('folder')}
      <h3>Workspace-Native Projects</h3>
      <p>Ground projects directly in Google Docs, Sheets, and Slides. Work products become inspectable evidence.</p>
    </div>
    <div>
      ${icon('check')}
      <h3>Separation of Human & AI Output</h3>
      <p>Clearly document human reasoning versus Gemini Enterprise generation to verify genuine understanding.</p>
    </div>
    <div>
      ${icon('download')}
      <h3>Export as Gemini Playbook</h3>
      <p>Download project briefs compatible with Gemini Gems, Vertex AI Agent Builder, and Google Docs.</p>
    </div>
  </section>`;
}

function perspectivesView() {
  return `${pageHead(
    'ENTERPRISE METHODOLOGY',
    'Working Perspectives & Practice Frameworks',
    'Explore curated bundles of systems thinking, storytelling, and facilitation from Google Cloud and enterprise engineering leaders. Adopt the practices that serve your mission.'
  )}
  <div class="notice">
    ${icon('info')} Synthetic demonstration bundles illustrating Google Cloud Site Reliability Engineering, Google Workspace narrative frameworks, and enterprise facilitation.
  </div>
  <div class="perspectives-grid">
    ${perspectives
      .map(
        (p, idx) => `<article class="card perspective-card">
      <div class="perspective-art ${p.color}" aria-hidden="true">
        ${icon(p.id === 'builder' ? 'orbit' : p.id === 'storyteller' ? 'voice' : 'people')}
      </div>
      <div class="perspective-body">
        <div class="creator">
          <span>${icon('spark')}</span>
          ${p.author}
        </div>
        <h2>${p.title}</h2>
        <p>${p.subtitle}</p>
        <div class="tags">${p.tags.map(t => tag(t)).join('')}</div>
        ${button(
          `${state.adopted.some(a => a.id === p.id) ? 'Review Adopted Practices' : 'Explore Perspective'} ${icon(
            'arrow'
          )}`,
          `perspective:${p.id}`,
          'btn outline full'
        )}
      </div>
    </article>`
      )
      .join('')}
  </div>
  <section class="principle-card">
    <span class="icon-tile green">${icon('shield')}</span>
    <div>
      <h2>Preserving Individual Agency & Diverse Thinking</h2>
      <p>A perspective is an analytical lens, not an automated template. Adopting practices initiates an active learning project—it never artificially transfers someone else's credentials, identity, or score.</p>
    </div>
  </section>`;
}

function benchmarkView() {
  const s = skillById(selectedSkill),
    stat = estimate(state, s.id),
    c = comparison(state, s.id),
    cohort = cohorts.find(x => x.id === state.cohort);
  const bins = Array.from({ length: 9 }, (_, i) => c.values.filter(v => Math.round(v * 2) === i).length),
    max = Math.max(...bins, 1);

  return `${pageHead(
    'SHARED ENTERPRISE HORIZONS',
    'Contextual Capability Distribution',
    'Calibrate capabilities against standardized task rubrics under identical assistance conditions. Discover actionable growth pathways—never a reductive human leaderboard.'
  )}
  <div class="toolbar wrap">
    <label class="field inline">
      <span>Enterprise Benchmark Cohort:</span>
      <select id="cohort">
        ${cohorts
          .map(x => `<option value="${x.id}" ${state.cohort === x.id ? 'selected' : ''}>${x.name}</option>`)
          .join('')}
      </select>
    </label>
    ${modeToggle()}
  </div>
  <div class="notice">
    ${icon('info')} Synthetic demonstration data (${cohort.n} benchmark fixtures) · Versioned rubric: ${RUBRIC}. Percentiles illustrate relative positioning within synthetic enterprise cohorts.
  </div>
  <div class="benchmark-grid">
    <section class="card skill-list">
      <div class="card-head">
        <h2>Enterprise Skill Catalog</h2>
      </div>
      ${skills
        .map(x => {
          const st = estimate(state, x.id);
          return `<button data-action="select:${x.id}" class="skill-row ${
            selectedSkill === x.id ? 'selected' : ''
          }" aria-pressed="${selectedSkill === x.id}">
          <span class="icon-tile ${x.color}">${icon(x.icon)}</span>
          <span>
            <strong>${x.name}</strong>
            <small>${st.n} accepted demonstrations</small>
          </span>
          <b>${scoreText(st)}</b>
        </button>`;
        })
        .join('')}
    </section>

    <section class="card distribution">
      <div class="card-head">
        <div>
          <span class="eyebrow">${
            state.mode === 'independent' ? 'INDEPENDENT HUMAN MASTERY' : 'GEMINI ENTERPRISE ASSISTED DEMONSTRATION'
          }</span>
          <h2>${s.name}</h2>
        </div>
        ${tag('Enterprise Aggregate', 'sand')}
      </div>
      ${
        c.available
          ? `<div class="distribution-summary">
        <div>
          <strong>${stat.score.toFixed(1)}<small> / 4.0</small></strong>
          <span>Your rubric mean</span>
        </div>
        <div>
          <strong>P${c.percentile}</strong>
          <span>Benchmark cohort percentile</span>
        </div>
      </div>
      <div class="histogram" role="img" aria-label="Synthetic cohort distribution">
        <div class="histogram-bars">
          ${bins
            .map(
              (n, i) =>
                `<div class="hist-column"><span class="bar" style="height:${Math.max(
                  4,
                  (n / max) * 125
                )}px" title="${i / 2} rubric points: ${n} records"></span><small>${i / 2}</small></div>`
            )
            .join('')}
        </div>
        <div class="histogram-label">RUBRIC LEVEL · 0 = UNTESTED · 2 = GUIDED · 4 = ADAPTIVE TRANSFER</div>
      </div>
      <div class="distribution-note">
        <span>Observed Range: ${stat.range[0]}–${stat.range[1]} / 4.0</span>
        <span>Cohort Mean: ${c.mean.toFixed(1)} / 4.0</span>
      </div>`
          : `<div class="withheld">
        ${icon('shield')}
        <h3>Contextual Comparison Withheld</h3>
        <p>${c.reason}</p>
      </div>`
      }
      <div class="criterion">
        <span class="eyebrow">ENTERPRISE SUCCESS CRITERION</span>
        <p>${s.criterion}</p>
      </div>
      ${button(`Initiate Growth Project for ${s.name} ${icon('arrow')}`, `new:${s.id}`, 'btn google-blue full')}
    </section>
  </div>
  <div class="data-note">
    ${icon('shield')} <strong>Google Responsible AI Assurance:</strong> Zero stack ranking. No automated employment decisions, performance ratings, or social scoring.
  </div>`;
}

function evidenceView() {
  const pending = state.evidence.filter(e => e.status === 'pending'),
    accepted = state.evidence.filter(e => e.status === 'accepted'),
    rejected = state.evidence.filter(e => e.status === 'rejected');

  return `${pageHead(
    'EVIDENCE & GOVERNANCE',
    'Demonstration Verification & Audit Trail',
    'Capabilities update exclusively when demonstrable evidence is verified and accepted—never via speculative AI inferences or passive workplace monitoring.'
  )}
  <div class="notice">
    ${icon('info')} Synthetic demonstration audit trail. Review actions simulate state transitions and verify CMEK-compliant provenance records.
  </div>
  <div class="section-heading">
    <h2>Pending Verification <span class="pill-count">${pending.length}</span></h2>
  </div>
  <div class="review-grid">
    ${
      pending.length
        ? pending
            .map(
              e => `<article class="card review-card">
        <div class="growth-top">
          ${tag('Proposed Demonstration', 'sand')}
          <span class="micro">${esc(e.date)}</span>
        </div>
        <h3>${esc(e.title)}</h3>
        <p>${skillById(e.skill).name} · ${e.mode === 'independent' ? 'Independent' : 'Gemini Assisted'} · ${
                e.mark
              }/4 proposed mark</p>
        <div class="criterion">
          <strong>Verification Requirement</strong>
          <p>Verify that work product demonstrates declared criteria and appropriately discloses any generative AI contributions before recording to your capability passport.</p>
        </div>
        <p class="small-copy">Rubric: ${RUBRIC} · Source: ${sources.find(s => s.id === e.source).name}${
                state.sources[e.source] ? '' : ' · [Source Disconnected]'
              }</p>
        <div class="button-row">
          ${button(
            `${icon('check')} Accept Demonstration`,
            `accept:${e.id}`,
            'btn google-blue',
            state.sources[e.source] ? '' : 'disabled'
          )}
          ${button('Reject / Revise', `reject:${e.id}`, 'btn outline')}
          ${button('Inspect Rubric', `skill:${e.skill}`, 'text-button')}
        </div>
      </article>`
            )
            .join('')
        : `<div class="empty-inline">${icon('check')} All pending demonstrations verified. Practice in a growth project to create new evidence.</div>`
    }
  </div>

  <div class="section-heading section">
    <div>
      <h2>Enterprise Verification Ledger</h2>
      <p>${accepted.length} verified · ${rejected.length} rejected · Source revocation automatically excludes affected records.</p>
    </div>
  </div>
  <div class="card evidence-table">
    <table>
      <caption class="sr-only">Demonstration evidence ledger</caption>
      <thead>
        <tr>
          <th>Demonstration Record</th>
          <th>Capability</th>
          <th>Assistance Mode</th>
          <th>Rubric Mark</th>
          <th>Verification Status</th>
        </tr>
      </thead>
      <tbody>
        ${[...rejected, ...accepted]
          .map(
            e => `<tr>
          <td>
            <strong>${esc(e.title)}</strong>
            <small>${esc(e.date)} · ${sources.find(s => s.id === e.source).name}</small>
          </td>
          <td>${skillById(e.skill).name}</td>
          <td>${e.mode === 'independent' ? 'Independent' : 'Gemini Assisted'}</td>
          <td>${e.mark} / 4.0</td>
          <td>${tag(
            !state.sources[e.source] ? 'Source Excluded' : e.status === 'rejected' ? 'Rejected' : 'Verified',
            !state.sources[e.source] ? 'sand' : e.status === 'accepted' ? 'mint' : ''
          )}</td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>
  </div>`;
}

function consentView() {
  return `${pageHead(
    'DATA CONTROL & SOVEREIGNTY',
    'Enterprise Governance & Granular Permissions',
    'Contextual learning requires explicit trust. Control which Google Workspace sources inform your capability board and revoke permissions at any time with immediate exclusion propagation.'
  )}
  <div class="consent-grid">
    <section class="card settings-card">
      <div class="card-head">
        <div>
          <h2>Connected Enterprise Sources</h2>
          <p>Manage data access grants across Google Workspace and cloud repositories.</p>
        </div>
        ${icon('shield')}
      </div>
      ${sources
        .map(
          s => `<div class="setting-row">
        <span class="icon-tile neutral">${icon(s.icon)}</span>
        <div>
          <h3>${s.name}</h3>
          <p>${s.detail}</p>
          <small>${
            state.sources[s.id]
              ? 'Active grant · Voluntary learning only'
              : 'Disconnected · Dependent evidence immediately excluded'
          }</small>
        </div>
        <button role="switch" aria-checked="${state.sources[s.id]}" aria-label="${s.name}" data-action="source:${
            s.id
          }" class="switch ${state.sources[s.id] ? 'on' : ''}">
          <span></span>
        </button>
      </div>`
        )
        .join('')}
      <div class="setting-row">
        <span class="icon-tile neutral">${icon('chart')}</span>
        <div>
          <h3>Enterprise Benchmark Context</h3>
          <p>Display contextual benchmark distributions.</p>
          <small>Does not publish individual records to cohort aggregates.</small>
        </div>
        <button role="switch" aria-checked="${
          state.benchmarkVisible
        }" aria-label="Show contextual benchmarks" data-action="bench-toggle" class="switch ${
    state.benchmarkVisible ? 'on' : ''
  }">
          <span></span>
        </button>
      </div>
    </section>

    <section class="privacy-card">
      <span class="icon-tile blue">${icon('shield')}</span>
      <h2>Google Cloud BeyondCorp & VPC-SC Protection</h2>
      <p>Google Emergence operates under zero-trust enterprise security boundaries. No background keystroke monitoring, emotion recognition, or social scoring.</p>
      <hr>
      <p>Production environments integrate with Google Cloud IAM, Customer Managed Encryption Keys (CMEK), and Cloud Audit Logs for complete organizational compliance.</p>
      <a href="./docs/ARCHITECTURE.md" class="text-link" target="_blank" rel="noopener">Read Enterprise Architecture ${icon(
        'up'
      )}</a>
    </section>
  </div>

  <section class="section card settings-card">
    <div class="card-head">
      <div>
        <h2>Capability Passport Portability</h2>
        <p>Export cryptographic capability claims for talent mobility and personal verification.</p>
      </div>
    </div>
    <div class="export-row">
      <div>
        <h3>Download Selective Capability Passport</h3>
        <p>Export authenticated capability summaries and sample counts. Excludes private project notes, chat logs, and raw work products.</p>
      </div>
      ${button(`${icon('download')} Export Capability Passport`, 'export', 'btn outline')}
    </div>
    <div class="export-row">
      <div>
        <h3>Reset Local Demonstration State</h3>
        <p>Erase local browser state and restore default enterprise baseline.</p>
      </div>
      ${button('Reset Demo State', 'reset', 'btn outline danger')}
    </div>
  </section>

  <section class="section">
    <div class="section-heading">
      <h2>Recent Security & Audit Events</h2>
    </div>
    <div class="card audit-list">
      ${
        state.audit.length
          ? state.audit
              .slice(0, 8)
              .map(
                a => `<div>
            <span class="event-dot"></span>
            <strong>${esc(a.type)}</strong>
            <span>${esc(a.detail)}</span>
            <small>${esc(a.date.slice(0, 10))}</small>
          </div>`
              )
              .join('')
          : '<p class="small-copy muted">No events recorded. Grant changes and verification decisions will appear here.</p>'
      }
    </div>
  </section>`;
}

function proposalView() {
  return `${pageHead(
    'GOOGLE ENTERPRISE AI PRODUCT VISION',
    'Google Emergence Architecture & Offering',
    'An independent enterprise AI architecture proposal for Google Cloud, Google Workspace, and DeepMind by Hayden Lindley, September 30, 2026.'
  )}
  <section class="proposal-hero">
    <div class="eyebrow">${icon('spark')} THE ENTERPRISE THESIS</div>
    <h2>Transform enterprise AI from task autocomplete<br>into continuous human capability acceleration.</h2>
    <p>In the generative AI era, enterprise value does not come merely from generating text faster. It comes from empowering human talent to master complex systems, communicate strategic vision, and innovate with confidence. Google Emergence integrates Google Workspace, Gemini Enterprise, and Vertex AI into an ethical, inspectable human capability network.</p>
  </section>

  <div class="explain-strip">
    <div>
      <span class="step-number">01</span>
      <h3>The Living Actor</h3>
      <p>Talent profiles remain private, human-owned, and grounded in authentic work. Gemini serves as a mentor, not an automated evaluator.</p>
    </div>
    <div>
      <span class="step-number">02</span>
      <h3>Standardized Capability Language</h3>
      <p>Standardized rubrics and differential benchmarks create clear organizational mobility pathways across global enterprises.</p>
    </div>
    <div>
      <span class="step-number">03</span>
      <h3>Deliberate Growth Projects</h3>
      <p>Turn business objectives into scoped learning sprints in Google Workspace with verified human and AI assistance separation.</p>
    </div>
  </div>

  <section class="card proposal-docs">
    <h2>Enterprise Architecture Documentation</h2>
    ${[
      ['PROPOSAL', 'Google Emergence Strategic Product Proposal', 'Enterprise vision, Google Workspace synergy, and pilot roadmap.'],
      ['ARCHITECTURE', 'Google Cloud & Vertex AI Architecture Specification', 'VPC-SC data planes, IAM integration, CMEK encryption, and schemas.'],
      ['EVALUATION', 'Responsible AI & Psychometric Evaluation Framework', 'Google AI Principles alignment, fairness guarantees, and launch gates.'],
      ['PROVENANCE', 'Lineage & Engineering Provenance', 'Evolution from the Living Actor framework into Google Enterprise AI.'],
      ['PERMISSION', 'Grant of Permission & Rights to Google LLC', 'Full license grant for Google LLC to use, adapt, and integrate.'],
      ['ACCEPTANCE', 'Handoff & Verification Record', 'Deterministic test suite, browser smoke verification, and production build.']
    ]
      .map(
        ([file, title, desc]) => `<a href="./docs/${file}.md" target="_blank" rel="noopener">
      <span>
        ${icon('book')}
        <span>
          <strong>${title}</strong>
          <small>${desc}</small>
        </span>
      </span>
      ${icon('up')}
    </a>`
      )
      .join('')}
  </section>

  <section class="principle-card">
    <span class="icon-tile green">${icon('shield')}</span>
    <div>
      <h2>Offered with Broad Permissions for Google LLC</h2>
      <p>Original source code, architecture, and demonstration assets are offered under Apache License 2.0 with explicit, irrevocable permission for Google LLC to adapt, commercialize, and integrate into Google Workspace and Google Cloud products. See <a href="./docs/PERMISSION.md" class="text-link">PERMISSION.md</a>.</p>
    </div>
  </section>`;
}

function render() {
  const current = route();
  $('#app').innerHTML = shell(
    {
      board,
      projects: projectsView,
      perspectives: perspectivesView,
      benchmarks: benchmarkView,
      evidence: evidenceView,
      consent: consentView,
      proposal: proposalView
    }[current]()
  );
  document.title = `${pages.find(p => p[0] === current)?.[2] || 'Vision'} · Google Emergence`;
}

function modal(title, body, wide = false) {
  const d = $('#dialog');
  if (d.open) d.close();
  d.className = wide ? 'wide' : '';
  d.innerHTML = `<div class="dialog-head">
    <h2 id="dialog-title">${title}</h2>
    ${button(icon('close'), 'close', 'icon-button', 'aria-label="Close dialog"')}
  </div>
  <div class="dialog-body">${body}</div>`;
  d.showModal();
}

function close() {
  const d = $('#dialog');
  if (d.open) d.close();
}

function newProjectDialog(skillId) {
  const s = skillById(skillId) || opportunities(state)[0];
  modal(
    'Initiate Growth Project',
    `<p class="dialog-intro">Define an enterprise capability challenge and structure deliberate practice in Google Workspace.</p>
    <form id="project-form">
      <label class="field">
        <span>Capability Domain</span>
        <select name="skill" id="project-skill">
          ${skills.map(x => `<option value="${x.id}" ${x.id === s.id ? 'selected' : ''}>${x.name}</option>`).join('')}
        </select>
      </label>
      <label class="field">
        <span>Project Title</span>
        <input name="title" id="project-title" required maxlength="120" value="${esc(s.practice)}">
      </label>
      <label class="field">
        <span>Sprint Duration</span>
        <select name="minutes">
          <option value="15">15 minutes · Quick Demonstration Sprint</option>
          <option value="30" selected>30 minutes · Standard Practice Session</option>
          <option value="60">60 minutes · Deep Architecture Exploration</option>
        </select>
      </label>
      <div class="criterion">
        <span class="eyebrow">THE DELIBERATE PRACTICE LOOP</span>
        <p>Frame the problem in Google Docs → create testable artifact → verify human vs Gemini contribution → submit demonstration for review.</p>
      </div>
      <button type="submit" class="btn google-blue full">Create Growth Project ${icon('arrow')}</button>
    </form>
    <p class="fine-print">Creates a local project brief. You can export directly as a Google Docs template or Gemini Gem playbook.</p>`
  );
}

function skillDialog(id) {
  const s = skillById(id);
  if (!s) return;
  const st = estimate(state, id);
  modal(
    s.name,
    `<div class="dialog-skill-head">
      <span class="icon-tile large ${s.color}">${icon(s.icon)}</span>
      <div>
        <p>${s.summary}</p>
        <h3>${scoreText(st)} <span class="muted">${
      state.mode === 'independent' ? 'Independent Human Mastery' : 'Gemini Enterprise Assisted'
    }</span></h3>
      </div>
    </div>
    <div class="criterion">
      <span class="eyebrow">ENTERPRISE SUCCESS CRITERION</span>
      <p>${s.criterion}</p>
    </div>
    <div class="rubric-list">
      ${[
        'Not yet demonstrated in this enterprise task context',
        'Demonstrates partial execution requiring significant assistance',
        'Executes standard workflows with routine guidance',
        'Independently demonstrates and defends decisions under declared constraints',
        'Adapts principles to novel enterprise constraints and mentors others'
      ]
        .map((x, i) => `<div><b>${i}</b><span>${x}</span></div>`)
        .join('')}
    </div>
    <p class="small-copy muted">Standardized rubric: ${RUBRIC}. Distinct isolation between unassisted human execution and Gemini Enterprise collaboration. Minimum 3 verified demonstrations required to compute a statistical mean.</p>
    <div class="mini-evidence" style="margin-top:16px;">
      ${
        st.evidence.map(e => `<div><span>${esc(e.title)}</span><b>${e.mark} / 4.0</b></div>`).join('') ||
        '<p class="small-copy muted">No active demonstrations in this mode.</p>'
      }
    </div>
    <div class="button-row" style="margin-top:20px;">
      ${button('Start Practice Project', `new:${id}`, 'btn google-blue')}
      ${button('Compare Against Cohort', `compare:${id}`, 'btn outline')}
    </div>`,
    true
  );
}

function projectDialog(id) {
  const p = state.projects.find(p => p.id === id);
  if (!p) return;
  const s = skillById(p.skill);
  modal(
    esc(p.title),
    `<div class="dialog-subline" style="display:flex;gap:8px;align-items:center;margin-bottom:16px;">
      ${tag(s.name, s.color)}
      ${tag(
        p.status === 'complete' ? 'Evidence Verified' : p.status === 'review' ? 'Ready for Review' : 'In Progress',
        p.status === 'complete' ? 'mint' : ''
      )}
      <span class="small-copy muted">${p.minutes} min sprint</span>
    </div>
    <div class="criterion">
      <span class="eyebrow">SUCCESS CRITERION</span>
      <p>${s.criterion}</p>
    </div>
    ${
      p.origin
        ? `<div class="adopted-practices" style="margin-bottom:16px;background:var(--surface-variant);padding:12px;border-radius:var(--radius-md);">
        <strong>Adopted Working Framework</strong>
        ${p.origin.practices
          .map(i => `<p style="font-size:12.5px;margin-top:4px;">• ${esc(perspectives.find(x => x.id === p.origin.bundle)?.practices[i] || '')}</p>`)
          .join('')}
      </div>`
        : ''
    }
    <div class="project-steps">
      ${[
        ['Frame', 'Define the operational challenge, stakeholder constraints, and success metric.'],
        ['Make', 'Produce an inspectable demonstration artifact in Google Docs or Cloud prototype.'],
        ['Reflect', 'Articulate trade-offs, human reasoning, and where Gemini Enterprise provided leverage.']
      ]
        .map(
          ([title, desc], i) => `<label class="project-step">
        <input type="checkbox" data-step="${i}" data-project="${esc(p.id)}" ${p.steps[i] ? 'checked' : ''} ${
            p.status !== 'active' ? 'disabled' : ''
          }>
        <span>
          <strong>${i + 1}. ${title}</strong>
          <small>${desc}</small>
        </span>
      </label>`
        )
        .join('')}
    </div>
    <label class="field">
      <span>Professional Reflection <span class="muted">· Browser-local · Never automatically scored</span></span>
      <textarea maxlength="4000" rows="3" id="reflection" data-project="${esc(p.id)}" placeholder="Document your architectural choices, what Gemini assisted with, and how you verified correctness...">${esc(
      p.reflection
    )}</textarea>
    </label>
    <div class="button-row">
      ${button(`${icon('download')} Download Gemini Brief`, `brief:${p.id}`, 'btn outline')}
      ${
        p.status === 'active'
          ? button(
              'Simulate Demonstration Review',
              `replay:${p.id}`,
              'btn google-blue',
              p.steps.every(Boolean) ? '' : 'disabled'
            )
          : p.status === 'review'
          ? button('Go to Evidence Review', 'go-evidence', 'btn google-blue')
          : tag('Project Complete · Verified in Capability Ledger', 'mint')
      }
    </div>
    <p class="fine-print">Simulation records a 3.0/4.0 demonstration benchmark for verification. Human review is always required before updating your capability board.</p>`,
    true
  );
}

function perspectiveDialog(id) {
  const p = perspectives.find(x => x.id === id);
  if (!p) return;
  const a = state.adopted.find(x => x.id === id);
  modal(
    p.title,
    `<div class="perspective-art ${p.color}" style="height:80px;border-radius:var(--radius-md);margin-bottom:16px;">
      ${icon(p.id === 'builder' ? 'orbit' : p.id === 'storyteller' ? 'voice' : 'people')}
    </div>
    <p class="dialog-intro">${p.subtitle}</p>
    <p class="small-copy muted">${p.author} · Enterprise Framework v1.0 · Open Apache 2.0 practices.</p>
    <h3>Select Practices to Incorporate</h3>
    <form id="perspective-form" data-perspective="${p.id}">
      <div class="project-steps">
        ${p.practices
          .map(
            (practice, i) => `<label class="project-step">
          <input type="checkbox" name="practice" value="${i}" ${
              (a ? a.practices.includes(i) : true) ? 'checked' : ''
            } ${a ? 'disabled' : ''}>
          <span><strong>${practice}</strong></span>
        </label>`
          )
          .join('')}
      </div>
      <div class="criterion">
        <span class="eyebrow">PHILOSOPHY & OPERATIONAL TENSION</span>
        <p>${p.tastes.join(' · ')}</p>
        <small>${p.tension}</small>
      </div>
      ${
        a
          ? button('Remove From Active Library', `unadopt:${p.id}`, 'btn outline full')
          : `<button class="btn google-blue full" type="submit">Adopt Practices & Launch Project ${icon('arrow')}</button>`
      }
    </form>
    <p class="fine-print">Adopting a methodology initiates a practice project. It does not artificially alter your capability scores.</p>`
  );
}

function download(name, text, type = 'application/json') {
  const blob = new Blob([text], { type }),
    url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function tour() {
  modal(
    'Welcome to Google Emergence',
    `<p class="dialog-intro">The Enterprise Skills & Capability Acquisition Platform for Google Workspace and Gemini Enterprise.</p>
    <div class="tour-steps">
      ${[
        ['01', 'Living Capability Constellation', 'Inspect demonstrated capabilities across systems architecture, storytelling, and generative AI. Separate human mastery from AI-assisted outputs.'],
        ['02', 'Methodology & Perspectives', 'Adopt tested engineering and organizational practices from Google SRE, Workspace Narrative Lab, and Enterprise Culture.'],
        ['03', 'Workspace Growth Projects', 'Execute 15, 30, or 60 minute sprints with explicit hypotheses and testable artifacts in Google Docs.'],
        ['04', 'Evidence Verification', 'Review demonstrations before they update your capability passport. No automated black-box scoring.'],
        ['05', 'Zero-Trust Enterprise Privacy', 'Operates within Google Cloud VPC-SC perimeters. Disconnect sources at will with immediate exclusion propagation.']
      ]
        .map(
          ([n, t, d]) => `<div>
          <span class="step-number">${n}</span>
          <div>
            <h3>${t}</h3>
            <p>${d}</p>
          </div>
        </div>`
        )
        .join('')}
    </div>
    <div class="notice">
      ${icon('shield')} Interactive enterprise demonstration. 100% synthetic data, zero external network calls.
    </div>
    ${button('Explore Google Emergence', 'close', 'btn google-blue full')}`,
    true
  );
}

document.addEventListener('click', event => {
  const docLink = event.target.closest('a[href^="./docs/"]');
  if (docLink && window.EMERGENCE_DOCS) {
    event.preventDefault();
    const name = docLink.getAttribute('href').split('/').pop();
    const text = window.EMERGENCE_DOCS[name];
    if (text) {
      download(name, text, 'text/markdown');
      toast('Document downloaded from offline package.');
    }
    return;
  }

  const el = event.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const [action, ...parts] = el.dataset.action.split(':'),
    id = parts.join(':');

  try {
    switch (action) {
      case 'close':
        close();
        break;
      case 'tour':
        tour();
        break;
      case 'new':
        newProjectDialog(id);
        break;
      case 'skill':
        skillDialog(id);
        break;
      case 'mode':
        state.mode = id;
        save();
        render();
        toast(
          id === 'independent'
            ? 'Viewing Independent Human Mastery demonstrations.'
            : 'Viewing Gemini Enterprise Assisted demonstrations.'
        );
        break;
      case 'select':
        selectedSkill = id;
        render();
        break;
      case 'compare':
        selectedSkill = id;
        close();
        navigate('benchmarks');
        break;
      case 'filter':
        filter = id;
        render();
        break;
      case 'project':
        projectDialog(id);
        break;
      case 'perspective':
        perspectiveDialog(id);
        break;
      case 'unadopt':
        state.adopted = state.adopted.filter(a => a.id !== id);
        save();
        close();
        render();
        toast('Perspective removed. Completed projects and verified evidence remain intact.');
        break;
      case 'replay':
        replayAssessment(state, id, state.mode);
        save();
        close();
        navigate('evidence');
        toast('Demonstration proposed for verification. Review in Evidence Library.');
        break;
      case 'accept':
      case 'reject':
        reviewEvidence(state, id, action === 'accept' ? 'accepted' : 'rejected');
        save();
        render();
        toast(
          action === 'accept'
            ? 'Demonstration accepted and capability score recomputed.'
            : 'Demonstration rejected. Excluded from capability board.'
        );
        break;
      case 'go-evidence':
        close();
        navigate('evidence');
        break;
      case 'brief': {
        const p = state.projects.find(x => x.id === id);
        download('google-emergence-project-brief.md', projectBrief(p), 'text/markdown');
        toast('Gemini Enterprise project brief downloaded.');
        break;
      }
      case 'source':
        setSource(state, id, !state.sources[id]);
        save();
        render();
        toast(
          state.sources[id]
            ? 'Enterprise source grant re-enabled. Evidence restored.'
            : 'Source disconnected. Dependent evidence excluded immediately.'
        );
        break;
      case 'bench-toggle':
        state.benchmarkVisible = !state.benchmarkVisible;
        save();
        render();
        toast(
          state.benchmarkVisible
            ? 'Contextual benchmarks enabled.'
            : 'Benchmarks paused. Learning projects remain fully active.'
        );
        break;
      case 'export':
        download('google-emergence-capability-passport.json', JSON.stringify(disclosure(state), null, 2));
        toast('Selective Capability Passport exported.');
        break;
      case 'reset':
        modal(
          'Reset Demonstration State?',
          `<p>This operation erases local browser state and restores default synthetic profiles. Downloaded files are unaffected.</p>
          <div class="button-row" style="margin-top:20px;">
            ${button('Cancel', 'close', 'btn outline')}
            ${button('Erase & Reset Demo', 'confirm-reset', 'btn danger')}
          </div>`
        );
        break;
      case 'confirm-reset':
        try {
          localStorage.removeItem(KEY);
        } catch {}
        state = initialState();
        filter = 'All';
        selectedSkill = 'systems';
        close();
        render();
        toast('Local demo state reset to enterprise baseline.');
        break;
    }
  } catch (error) {
    toast(error.message);
  }
});

document.addEventListener('change', event => {
  const el = event.target;
  if (el.id === 'goal') {
    state.goal = el.value;
    save();
    render();
    toast('Enterprise focus updated. Recommendations re-aligned.');
  }
  if (el.id === 'cohort') {
    state.cohort = el.value;
    save();
    render();
  }
  if (el.id === 'project-skill') {
    $('#project-title').value = skillById(el.value).practice;
  }
  if (el.dataset.step !== undefined) {
    const p = state.projects.find(p => p.id === el.dataset.project);
    if (p?.status === 'active') {
      p.steps[Number(el.dataset.step)] = el.checked;
      save();
      const replay = $('[data-action="replay:' + p.id + '"]');
      if (replay) replay.disabled = !p.steps.every(Boolean);
      render();
    }
  }
});

document.addEventListener('input', event => {
  if (event.target.id === 'reflection') {
    const p = state.projects.find(p => p.id === event.target.dataset.project);
    if (p) {
      p.reflection = event.target.value.slice(0, 4000);
      save();
    }
  }
});

document.addEventListener('submit', event => {
  if (!['project-form', 'perspective-form'].includes(event.target.id)) return;
  event.preventDefault();
  try {
    const form = new FormData(event.target);
    if (event.target.id === 'project-form') {
      const p = createProject(state, {
        skill: form.get('skill'),
        title: form.get('title'),
        minutes: form.get('minutes')
      });
      save();
      close();
      filter = 'All';
      navigate('projects');
      toast('Growth project created. Begin your structured sprint.');
      projectDialog(p.id);
    } else {
      const p = adopt(state, event.target.dataset.perspective, form.getAll('practice').map(Number));
      save();
      close();
      filter = 'All';
      navigate('projects');
      toast('Practices adopted. Project initiated without unverified score inflation.');
      projectDialog(p.id);
    }
  } catch (error) {
    toast(error.message);
  }
});

$('#dialog').addEventListener('click', e => {
  if (e.target === $('#dialog')) {
    const r = e.target.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
  }
});

window.addEventListener('hashchange', () => {
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
  $('#main').focus({ preventScroll: true });
});

render();
if (storageNotice) toast(storageNotice);
