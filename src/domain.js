/**
 * Google Emergence: Pure Domain Model.
 * All individuals, assessment scores, and cohort records are synthetic.
 * A score represents an arithmetic mean of accepted rubric marks, NOT a validated psychological measure.
 * Designed for Google Enterprise AI systems, Google Workspace, and Vertex AI.
 */

export const VERSION = 1;
export const RUBRIC = 'google-emergence-enterprise/1';
export const MIN_EVIDENCE = 3;
export const MIN_COHORT = 30;

export const skills = [
  {
    id: 'systems',
    name: 'Systems architecture',
    category: 'Engineering & Strategy',
    icon: 'orbit',
    color: 'blue',
    x: 51,
    y: 22,
    target: 3.5,
    summary: 'See relationships across distributed services. Find the leverage point.',
    criterion: 'Map dependencies, identify failure domains, and test a change against a stated reliability objective.',
    practice: 'Map a system architecture before changing it',
    marks: [3, 3, 4],
    source: 'projects'
  },
  {
    id: 'research',
    name: 'Research judgment',
    category: 'Strategy & Analysis',
    icon: 'search',
    color: 'red',
    x: 21,
    y: 46,
    target: 3.0,
    summary: 'Turn ambiguous information into a defensible enterprise decision.',
    criterion: 'Triangulate a claim with independent sources, disclose uncertainty, and explain what would change the decision.',
    practice: 'Make a decision from conflicting evidence',
    marks: [2, 2, 3],
    source: 'projects'
  },
  {
    id: 'story',
    name: 'Executive storytelling',
    category: 'Communication',
    icon: 'voice',
    color: 'yellow',
    x: 76,
    y: 48,
    target: 3.5,
    summary: 'Make complex technical and product tradeoffs understood.',
    criterion: 'Explain a complex initiative to executive stakeholders, retain the key tradeoff, and verify cross-functional alignment.',
    practice: 'Explain one complex technical tradeoff in 90 seconds',
    marks: [2, 3, 3],
    source: 'portfolio'
  },
  {
    id: 'prototype',
    name: 'Rapid prototyping',
    category: 'Execution & AI',
    icon: 'box',
    color: 'green',
    x: 48,
    y: 79,
    target: 3.5,
    summary: 'Make an idea tangible enough to test with real enterprise users.',
    criterion: 'Build a testable interactive artifact with explicit assumptions, evaluate with Gemini Enterprise, and revise one core assumption.',
    practice: 'Build the smallest testable prototype with Gemini',
    marks: [3, 3, 3],
    source: 'portfolio'
  },
  {
    id: 'facilitation',
    name: 'Inclusive facilitation',
    category: 'Collaboration',
    icon: 'people',
    color: 'blue',
    x: 14,
    y: 77,
    target: 3.0,
    summary: 'Help cross-functional teams build shared conviction.',
    criterion: 'Design an inclusive collaborative agenda, preserve productive dissent, and produce a clear next action with owners. No psychological or emotion inference.',
    practice: 'Design a cross-functional alignment session',
    marks: [1, 2, 2],
    source: 'practice'
  },
  {
    id: 'creative',
    name: 'Applied generative AI',
    category: 'Execution & AI',
    icon: 'code',
    color: 'green',
    x: 86,
    y: 79,
    target: 3.0,
    summary: 'Harness enterprise generative models for workflow transformation.',
    criterion: 'Build a functioning prompt chain or agent playbook with evaluation criteria, and adapt it to edge constraints.',
    practice: 'Build a Gemini Enterprise agent playbook',
    marks: [1, 1, 2],
    source: 'practice'
  }
];

export const sources = [
  {
    id: 'projects',
    name: 'Google Workspace & Drive',
    detail: 'Selected Docs, Sheets, Slides, and architectural decision records',
    icon: 'folder'
  },
  {
    id: 'portfolio',
    name: 'Enterprise Portfolio & Code',
    detail: 'Architecture blueprints, Google Cloud prototypes, and technical artifacts',
    icon: 'box'
  },
  {
    id: 'practice',
    name: 'Gemini Practice Check-ins',
    detail: 'Task-specific demonstrations of problem solving and socratic practice',
    icon: 'check'
  }
];

export const goals = [
  {
    id: 'product',
    name: 'Build transformative products',
    weights: { systems: 1.0, research: 1.0, story: 0.7, prototype: 1.0, facilitation: 0.5, creative: 0.8 }
  },
  {
    id: 'clarity',
    name: 'Communicate with executive clarity',
    weights: { systems: 0.6, research: 0.8, story: 1.0, prototype: 0.3, facilitation: 1.0, creative: 0.2 }
  },
  {
    id: 'create',
    name: 'Accelerate enterprise AI innovation',
    weights: { systems: 0.5, research: 0.4, story: 0.8, prototype: 1.0, facilitation: 0.3, creative: 1.0 }
  }
];

export const perspectives = [
  {
    id: 'builder',
    title: 'The Systems Architect',
    subtitle: 'Design for resilience. Find the critical leverage point.',
    color: 'blue',
    shape: 'rings',
    skill: 'systems',
    tags: ['Systems architecture', 'Rapid prototyping'],
    author: 'Google Cloud & SRE Practice',
    practices: [
      'Draw service dependencies and single points of failure before designing solutions.',
      'Ask what production metrics or edge cases would disprove your favorite design.',
      'Test the smallest reversible canary deployment against explicit SLOs.'
    ],
    tastes: ['Clean architectural boundaries', 'Visible telemetry and SLIs'],
    tension: 'This lens prioritizes resilience and simplicity. Preserve necessary distributed complexity when scale demands it.'
  },
  {
    id: 'storyteller',
    title: 'The Clear Storyteller',
    subtitle: 'Lead with the user. Frame the trade-off with clarity.',
    color: 'yellow',
    shape: 'stairs',
    skill: 'story',
    tags: ['Executive storytelling', 'Research judgment'],
    author: 'Google Workspace Narrative Lab',
    practices: [
      'Start with the core user friction and question, not feature mechanics.',
      'Make one idea concrete before adding another layer of abstraction.',
      'Keep the operational trade-offs and uncertainty in the narrative.'
    ],
    tastes: ['Clear plain language', 'Concrete user demonstrations'],
    tension: 'Executive clarity is not certainty. Do not strip out caveats simply to craft a smoother narrative.'
  },
  {
    id: 'facilitator',
    title: 'The Inclusive Facilitator',
    subtitle: 'Foster psychological safety and high-velocity alignment.',
    color: 'green',
    shape: 'petals',
    skill: 'facilitation',
    tags: ['Inclusive facilitation', 'Systems architecture'],
    author: 'Google Enterprise Culture Practice',
    practices: [
      'Invite counter-arguments and dissenting perspectives before reaching consensus.',
      'Make quiet, asynchronous contribution channels available in Workspace Docs.',
      'Conclude with explicit decision records, accountable owners, and timeline milestones.'
    ],
    tastes: ['Structured socratic synthesis', 'Participatory alignment'],
    tension: 'Participation is not a personality contest. Never infer engagement or capability from speech patterns, camera presence, or silence.'
  }
];

export const cohorts = [
  { id: 'global', name: 'Global Enterprise Cohort', n: 120, label: 'Global Enterprise', offset: 0 },
  { id: 'national', name: 'Google Cloud Partner Cohort', n: 80, label: 'Cloud Partners', offset: 7 },
  { id: 'circle', name: 'Small Project Pod (Withheld)', n: 12, label: 'Project Pod', offset: 11 }
];

export const skillById = id => skills.find(s => s.id === id);

export function initialState() {
  const evidence = skills.flatMap((s, si) =>
    ['independent', 'assisted'].flatMap(mode =>
      s.marks.map((mark, i) => ({
        id: `seed-${s.id}-${mode}-${i}`,
        skill: s.id,
        source: s.source,
        mode,
        mark: mode === 'assisted' ? Math.min(4, mark + 1) : mark,
        rubric: RUBRIC,
        status: 'accepted',
        title: [s.practice, `Analyze trade-offs: ${s.name}`, `Enterprise transfer: ${s.name}`][i],
        date: `2026-09-${String(12 + si + i).padStart(2, '0')}`,
        synthetic: true
      }))
    )
  );

  evidence.push({
    id: 'candidate-story',
    skill: 'story',
    source: 'practice',
    mode: 'independent',
    mark: 3,
    rubric: RUBRIC,
    status: 'pending',
    title: 'A 90-second executive walkthrough of a complex system',
    date: '2026-09-30',
    synthetic: true
  });

  return {
    version: VERSION,
    goal: 'product',
    mode: 'independent',
    cohort: 'global',
    benchmarkVisible: true,
    sources: { projects: true, portfolio: true, practice: true },
    evidence,
    adopted: [],
    projects: [
      {
        id: 'project-research',
        skill: 'research',
        title: 'Make a decision from conflicting evidence',
        minutes: 30,
        steps: [true, false, false],
        status: 'active',
        reflection: '',
        origin: null
      }
    ],
    audit: []
  };
}

export function isState(value) {
  return (
    !!value &&
    value.version === VERSION &&
    goals.some(g => g.id === value.goal) &&
    ['independent', 'assisted'].includes(value.mode) &&
    cohorts.some(c => c.id === value.cohort) &&
    typeof value.benchmarkVisible === 'boolean' &&
    sources.every(s => typeof value.sources?.[s.id] === 'boolean') &&
    Array.isArray(value.evidence) &&
    value.evidence.length < 1000 &&
    value.evidence.every(
      e =>
        skillById(e.skill) &&
        sources.some(s => s.id === e.source) &&
        ['pending', 'accepted', 'rejected'].includes(e.status) &&
        ['independent', 'assisted'].includes(e.mode) &&
        Number.isInteger(e.mark) &&
        e.mark >= 0 &&
        e.mark <= 4 &&
        e.rubric === RUBRIC &&
        e.synthetic === true &&
        typeof e.id === 'string' &&
        typeof e.title === 'string'
    ) &&
    Array.isArray(value.projects) &&
    value.projects.length < 100 &&
    value.projects.every(
      p =>
        skillById(p.skill) &&
        typeof p.id === 'string' &&
        typeof p.title === 'string' &&
        p.title.length <= 120 &&
        [15, 30, 60].includes(p.minutes) &&
        ['active', 'review', 'complete'].includes(p.status) &&
        Array.isArray(p.steps) &&
        p.steps.length === 3 &&
        p.steps.every(v => typeof v === 'boolean') &&
        typeof p.reflection === 'string' &&
        p.reflection.length <= 4000
    ) &&
    value.projects.every(
      p =>
        p.origin === null ||
        (p.origin &&
          perspectives.some(x => x.id === p.origin.bundle) &&
          p.origin.version === '1.0' &&
          Array.isArray(p.origin.practices) &&
          p.origin.practices.every(i => Number.isInteger(i) && i >= 0 && i < 3))
    ) &&
    new Set(value.evidence.map(e => e.id)).size === value.evidence.length &&
    new Set(value.projects.map(p => p.id)).size === value.projects.length &&
    value.evidence.every(
      e => typeof e.date === 'string' && e.date.length <= 32 && (e.project === undefined || typeof e.project === 'string')
    ) &&
    Array.isArray(value.adopted) &&
    value.adopted.every(
      a =>
        perspectives.some(p => p.id === a.id) &&
        Array.isArray(a.practices) &&
        a.practices.every(i => Number.isInteger(i) && i >= 0 && i < 3)
    ) &&
    Array.isArray(value.audit) &&
    value.audit.length <= 100 &&
    value.audit.every(
      a => typeof a.type === 'string' && typeof a.detail === 'string' && typeof a.date === 'string'
    )
  );
}

export function estimate(state, skill, mode = state.mode) {
  const eligible = state.evidence.filter(
    e => e.skill === skill && e.mode === mode && e.rubric === RUBRIC && e.status === 'accepted' && state.sources[e.source]
  );
  return {
    n: eligible.length,
    score: eligible.length >= MIN_EVIDENCE ? eligible.reduce((n, e) => n + e.mark, 0) / eligible.length : null,
    range: eligible.length ? [Math.min(...eligible.map(e => e.mark)), Math.max(...eligible.map(e => e.mark))] : null,
    evidence: eligible
  };
}

export function cohortValues(skill, mode, cohortId) {
  const cohort = cohorts.find(c => c.id === cohortId);
  const index = skills.findIndex(s => s.id === skill);
  if (!cohort || index < 0 || !['independent', 'assisted'].includes(mode)) return [];
  return Array.from({ length: cohort.n }, (_, i) =>
    Math.min(
      4,
      Math.max(
        0,
        Math.round((1 + ((i * 17 + index * 13 + cohort.offset) % 31) / 10 + (mode === 'assisted' ? 0.3 : 0)) * 10) / 10
      )
    )
  );
}

export function percentile(score, values) {
  if (!Number.isFinite(score) || !values.length || values.some(v => !Number.isFinite(v))) return null;
  const below = values.filter(v => v < score).length;
  const equal = values.filter(v => v === score).length;
  return Math.round((100 * (below + 0.5 * equal)) / values.length);
}

export function comparison(state, skill) {
  const stat = estimate(state, skill);
  const values = cohortValues(skill, state.mode, state.cohort);
  if (!state.benchmarkVisible) return { available: false, reason: 'Comparisons are paused in Data & consent.', values };
  if (values.length < MIN_COHORT)
    return { available: false, reason: `Withheld: fewer than ${MIN_COHORT} comparable records. Small groups are not ranked.`, values };
  if (stat.score === null)
    return {
      available: false,
      reason: `Not enough evidence: ${stat.n}/${MIN_EVIDENCE} accepted examples in this mode. Unknown is not zero.`,
      values
    };
  return {
    available: true,
    percentile: percentile(stat.score, values),
    values,
    mean: values.reduce((a, b) => a + b, 0) / values.length
  };
}

export function opportunities(state) {
  const goal = goals.find(g => g.id === state.goal);
  return skills
    .map(s => {
      const score = estimate(state, s.id).score;
      return {
        ...s,
        score,
        priority: goal.weights[s.id] * (score === null ? 0.75 : Math.max(0, s.target - score)),
        reason:
          score === null
            ? 'Establish a baseline demonstration in this domain.'
            : `A high-leverage growth area for “${goal.name.toLowerCase()}”.`
      };
    })
    .sort((a, b) => b.priority - a.priority);
}

const uid = prefix =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

function log(state, type, detail) {
  state.audit.unshift({ type, detail, date: new Date().toISOString() });
  state.audit = state.audit.slice(0, 100);
}

export function createProject(state, { skill, title, minutes = 30, origin = null }) {
  if (
    !skillById(skill) ||
    typeof title !== 'string' ||
    !title.trim() ||
    title.length > 120 ||
    ![15, 30, 60].includes(Number(minutes))
  )
    throw new Error('Choose an enterprise skill, a title of 1–120 characters, and a 15, 30, or 60 minute session.');
  if (state.projects.length >= 99)
    throw new Error('The demo supports up to 99 projects. Reset the demo to start over.');
  const project = {
    id: uid('project'),
    skill,
    title: title.trim(),
    minutes: Number(minutes),
    steps: [false, false, false],
    status: 'active',
    reflection: '',
    origin
  };
  state.projects.unshift(project);
  log(state, 'project.created', project.title);
  return project;
}

export function adopt(state, id, indices) {
  const p = perspectives.find(p => p.id === id);
  if (!p || !indices.length || indices.some(i => !Number.isInteger(i) || i < 0 || i > 2))
    throw new Error('Choose at least one practice to try.');
  if (state.adopted.some(a => a.id === id))
    throw new Error('This perspective is already in your enterprise practice library.');
  const project = createProject(state, {
    skill: p.skill,
    title: `Practice: ${p.title}`,
    origin: { bundle: id, version: '1.0', practices: [...new Set(indices)] }
  });
  state.adopted.push({ id, version: '1.0', practices: [...new Set(indices)] });
  log(state, 'perspective.adopted', p.title);
  return project;
}

export function replayAssessment(state, projectId, mode) {
  const p = state.projects.find(p => p.id === projectId);
  if (!p || !p.steps.every(Boolean) || p.status !== 'active' || !['independent', 'assisted'].includes(mode))
    throw new Error('Finish the three practice steps before replaying the enterprise demonstration assessment.');
  if (!state.sources.practice)
    throw new Error('Practice check-ins are disconnected. Reconnect the enterprise demo source before adding evidence.');
  const e = {
    id: uid('evidence'),
    skill: p.skill,
    source: 'practice',
    mode,
    mark: 3,
    rubric: RUBRIC,
    status: 'pending',
    title: p.title,
    date: new Date().toISOString().slice(0, 10),
    synthetic: true,
    project: p.id
  };
  state.evidence.unshift(e);
  p.status = 'review';
  log(state, 'evidence.proposed', p.title);
  return e;
}

export function reviewEvidence(state, id, decision) {
  const e = state.evidence.find(e => e.id === id);
  if (!e || e.status !== 'pending' || !['accepted', 'rejected'].includes(decision))
    throw new Error('Only a pending item can be reviewed once.');
  if (decision === 'accepted' && !state.sources[e.source])
    throw new Error('This source is disconnected; its evidence cannot be accepted.');
  e.status = decision;
  const p = state.projects.find(p => p.id === e.project);
  if (p) p.status = decision === 'accepted' ? 'complete' : 'active';
  log(state, `evidence.${decision}`, e.title);
}

export function setSource(state, id, enabled) {
  if (!sources.some(s => s.id === id) || typeof enabled !== 'boolean')
    throw new Error('Unknown source.');
  state.sources[id] = enabled;
  log(state, enabled ? 'source.reconnected' : 'source.revoked', sources.find(s => s.id === id).name);
}

export function disclosure(state) {
  return {
    schema: 'google-emergence-disclosure/1',
    synthetic: true,
    purpose: 'enterprise-voluntary-learning',
    rubric: RUBRIC,
    claims: skills.flatMap(s =>
      ['independent', 'assisted'].map(mode => ({
        skill: s.id,
        mode,
        n: estimate(state, s.id, mode).n,
        score: estimate(state, s.id, mode).score
      }))
    ),
    notice:
      'Fictional enterprise demonstration; not a credential, performance review, or employment ranking instrument. No raw source telemetry, reflections, or personal data are included.'
  };
}

export function projectBrief(p) {
  const s = skillById(p.skill);
  const origin = perspectives.find(x => x.id === p.origin?.bundle);
  return `# Google Emergence Growth Project: ${p.title}

**Enterprise Skill:** ${s.name}  
**Session Duration:** ${p.minutes} minutes  
**Enterprise System:** Google Workspace & Gemini Enterprise  

## Intent
${s.summary}

## Success Criterion
${s.criterion}

## Structured Practice Loop
1. **Frame:** Define the enterprise challenge, key stakeholders, and operational boundaries in Google Docs.
2. **Make:** Produce one testable demonstration artifact, clearly disclosing where Gemini Enterprise was leveraged.
3. **Reflect:** Articulate technical trade-offs, human verification performed, and what you would iterate next.

${
  origin
    ? `## Adopted Perspective
${origin.title}, v1.0 (${origin.author}).
${p.origin.practices.map(i => `- ${origin.practices[i]}`).join('\n')}

`
    : ''
}## Evidence Verification Protocol
Human mastery and Gemini Enterprise assisted output are recorded in distinct, isolated modes. Step completion is an opportunity to generate evidence, not an automated credential.

## Professional Reflection
${p.reflection || '(Not yet recorded.)'}

---
Google Emergence Enterprise AI Concept. Import into Google Docs or Gemini Gems manually; this brief does not automatically modify Google Cloud resources. No unconsented background surveillance is supported.
`;
}

export function policyGate(purpose) {
  return [
    'personal-learning',
    'consented-practice',
    'aggregate-research',
    'enterprise-learning',
    'voluntary-learning'
  ].includes(purpose);
}
