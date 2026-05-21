// ─── ACADEMIC CONFIG ──────────────────────────────────────────────────────────
export const ACADEMIC = {
  currentWeek: 9,
  totalWeeks: 15,
  semester: 2,
  level: '100L',
  programme: 'Cybersecurity Engineering',
  examStartDate: '2024-07-08', // Update this to your actual exam date
  firstExam: 'MTH 102',
}

// ─── COURSES ──────────────────────────────────────────────────────────────────
export const COURSES = [
  {
    code: 'MTH 102', title: 'General Mathematics II', units: 3,
    color: 'var(--purple)', light: 'var(--purple-light)',
    icon: 'ti-math-function', progress: 60,
    topics: ['Calculus', 'Differential Eq.', 'Series', 'Vectors'],
  },
  {
    code: 'CSC 106', title: 'Introduction to Programming', units: 3,
    color: 'var(--teal)', light: 'var(--teal-light)',
    icon: 'ti-code', progress: 55,
    topics: ['C Language', 'Functions', 'Arrays', 'Pointers'],
  },
  {
    code: 'PHY 102', title: 'General Physics II', units: 3,
    color: 'var(--amber)', light: 'var(--amber-light)',
    icon: 'ti-atom', progress: 40,
    topics: ['Electromagnetism', 'Waves', 'Optics'],
  },
  {
    code: 'COS 102', title: 'Computer Organisation', units: 2,
    color: 'var(--blue)', light: 'var(--blue-light)',
    icon: 'ti-cpu', progress: 65,
    topics: ['Memory', 'CPU Architecture', 'I/O Systems'],
  },
  {
    code: 'GST 112', title: 'Communication Skills', units: 2,
    color: 'var(--pink)', light: 'var(--pink-light)',
    icon: 'ti-message-2', progress: 75,
    topics: ['Academic Writing', 'Oral Skills', 'Reports'],
  },
  {
    code: 'PHY 108', title: 'Physics Practical II', units: 1,
    color: 'var(--green)', light: 'var(--green-light)',
    icon: 'ti-flask', progress: 80,
    topics: ['Lab Reports', 'Experiments', 'Graphs'],
  },
]

// ─── WEEKLY SUMMARIES ─────────────────────────────────────────────────────────
export const SUMMARIES = {
  'MTH 102': {
    week: 9, title: 'Differential Equations',
    color: 'var(--purple)', light: 'var(--purple-light)',
    body: `This week covers first-order ordinary differential equations. You'll work through separable variable techniques, the integrating factor method for linear equations, and exact differential equations. Key skill: recognising which method applies given a particular form.`,
    topics: ['Separable variables', 'Integrating factor', 'Exact equations'],
    quizReady: true,
  },
  'CSC 106': {
    week: 9, title: 'Functions in C',
    color: 'var(--teal)', light: 'var(--teal-light)',
    body: `Functions are the backbone of structured programming. This week covers function declaration vs definition, parameter passing (by value), recursive functions with base cases, scope rules (local vs global), and how the call stack works under the hood.`,
    topics: ['Declaration', 'Recursion', 'Scope', 'Call stack'],
    quizReady: true,
  },
  'PHY 102': {
    week: 9, title: 'Electromagnetic Induction',
    color: 'var(--amber)', light: 'var(--amber-light)',
    body: `Faraday's law states that a changing magnetic flux induces an EMF. Lenz's law tells us its direction always opposes the change. This week also covers self-inductance, mutual inductance between coils, and real-world applications in transformers and generators.`,
    topics: ["Faraday's law", "Lenz's law", 'Inductance'],
    quizReady: false,
    quizUnlocks: 'Wednesday',
  },
  'COS 102': {
    week: 9, title: 'Memory Hierarchy',
    color: 'var(--blue)', light: 'var(--blue-light)',
    body: `Modern computers use a hierarchy of memory to balance speed and cost. This week: cache memory (L1/L2/L3), virtual memory concepts, paging and page tables, segmentation, and how the TLB speeds up address translation.`,
    topics: ['Cache', 'Virtual memory', 'Paging', 'TLB'],
    quizReady: true,
  },
}

// ─── QUIZ QUESTIONS ───────────────────────────────────────────────────────────
export const QUIZ_DATA = {
  'MTH 102': [
    { q: 'Which method is best for solving dy/dx = xy?', opts: ['Integrating factor', 'Separation of variables', 'Exact equation', 'Undetermined coefficients'], ans: 1 },
    { q: 'The integrating factor for dy/dx + Py = Q is:', opts: ['e^∫P dx', 'e^∫Q dx', '∫P dx', '1/P'], ans: 0 },
    { q: 'A differential equation dy/dx = f(x)·g(y) is called:', opts: ['Linear', 'Exact', 'Separable', 'Homogeneous'], ans: 2 },
    { q: 'The order of d²y/dx² + 3(dy/dx) + 2y = 0 is:', opts: ['1', '2', '3', '0'], ans: 1 },
    { q: 'What is the general solution of dy/dx = 2x?', opts: ['y = x² + C', 'y = 2x + C', 'y = x + C', 'y = 2 + C'], ans: 0 },
  ],
  'CSC 106': [
    { q: 'In C, a function that calls itself is called:', opts: ['Iterative', 'Recursive', 'Static', 'Inline'], ans: 1 },
    { q: 'What is the return type of a function that returns nothing?', opts: ['null', 'void', 'int', 'empty'], ans: 1 },
    { q: 'Where is a local variable stored at runtime?', opts: ['Heap', 'Data segment', 'Stack', 'Register file'], ans: 2 },
    { q: 'Which is the correct function declaration in C?', opts: ['function add(int a, int b)', 'int add(int a, int b);', 'add(int, int) -> int;', 'def add(a,b):'], ans: 1 },
    { q: 'What happens if a recursive function has no base case?', opts: ['Returns 0', 'Infinite loop / stack overflow', 'Compiles fine', 'Returns null'], ans: 1 },
  ],
  'PHY 102': [
    { q: "Faraday's law states that induced EMF is proportional to:", opts: ['Current', 'Rate of change of magnetic flux', 'Resistance', 'Voltage'], ans: 1 },
    { q: "Lenz's law is a consequence of conservation of:", opts: ['Charge', 'Mass', 'Energy', 'Momentum'], ans: 2 },
    { q: 'The SI unit of inductance is:', opts: ['Tesla', 'Weber', 'Henry', 'Farad'], ans: 2 },
    { q: 'Mutual inductance involves how many coils?', opts: ['1', '2', '3', '4'], ans: 1 },
    { q: 'A transformer works on the principle of:', opts: ['Self-inductance', 'Mutual inductance', 'Capacitance', 'Resistance'], ans: 1 },
  ],
  'COS 102': [
    { q: 'Which cache level is closest to the CPU core?', opts: ['L3', 'L2', 'L1', 'RAM'], ans: 2 },
    { q: 'Virtual memory allows a process to use more memory than:', opts: ['Cache size', 'Physical RAM', 'CPU registers', 'ROM'], ans: 1 },
    { q: 'A TLB is used to speed up:', opts: ['Disk access', 'Virtual-to-physical address translation', 'Cache writes', 'Interrupt handling'], ans: 2 },
    { q: "In paging, what is a 'page fault'?", opts: ['CPU crash', 'Requested page not in RAM', 'Full cache', 'Disk error'], ans: 1 },
    { q: 'Segmentation divides memory into:', opts: ['Fixed equal blocks', 'Variable-size logical segments', 'Bytes', 'Registers'], ans: 1 },
  ],
  'GST 112': [
    { q: "An essay's thesis statement typically appears:", opts: ['In the conclusion', 'At the end of the introduction', 'In the body paragraphs', 'In the abstract'], ans: 1 },
    { q: 'Which is NOT a feature of formal academic writing?', opts: ['Objectivity', 'Slang and contractions', 'Hedging language', 'Passive voice'], ans: 1 },
    { q: 'APA referencing style is most common in:', opts: ['Humanities', 'Social sciences', 'Engineering', 'Law'], ans: 1 },
    { q: 'The purpose of a topic sentence is to:', opts: ['End a paragraph', 'Introduce the main idea of a paragraph', 'Provide evidence', 'Summarise the essay'], ans: 1 },
    { q: 'Which transition word shows contrast?', opts: ['Furthermore', 'However', 'Therefore', 'Similarly'], ans: 1 },
  ],
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
export const LEADERBOARD = [
  { initials: 'AO', name: 'Adewale Ogun.', score: 98, streak: 7, quizzes: '9/9', color: 'var(--amber-light)', textColor: 'var(--amber)' },
  { initials: 'BA', name: 'Brainy Adeyinka', score: 91, streak: 5, quizzes: '9/9', color: 'var(--purple-light)', textColor: 'var(--purple)', isMe: true },
  { initials: 'FI', name: 'Fatima Ibrahim', score: 87, streak: 4, quizzes: '8/9', color: 'var(--teal-light)', textColor: 'var(--teal)' },
  { initials: 'KA', name: 'Kelechi Amos', score: 83, streak: 3, quizzes: '7/9', color: '#F4F3EE', textColor: 'var(--muted)' },
  { initials: 'EM', name: 'Emeka Musa', score: 79, streak: 2, quizzes: '7/9', color: '#F4F3EE', textColor: 'var(--muted)' },
  { initials: 'TC', name: 'Temi Coker', score: 74, streak: 1, quizzes: '6/9', color: '#F4F3EE', textColor: 'var(--muted)' },
]
