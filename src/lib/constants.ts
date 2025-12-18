export const LEVELS = {
  a1: "A1 - Foundation",
  a2: "A2 - Elementary",
  b1: "B1 - Intermediate",
  b2: "B2 - Upper-Intermediate",
  b2plus: "B2+ - Advanced",
} as const

export const LEVEL_DETAILS = {
  a1: {
    name: "A1 Foundation",
    subtitle: "Building blocks of professional English",
    classes: "1-30",
    totalClasses: 30,
  },
  a2: {
    name: "A2 Elementary",
    subtitle: "Expanding routine professional interactions",
    classes: "31-60",
    totalClasses: 30,
  },
  b1: {
    name: "B1 Intermediate",
    subtitle: "Independent professional communication",
    classes: "61-90",
    totalClasses: 30,
  },
  b2: {
    name: "B2 Upper-Intermediate",
    subtitle: "Complex professional discourse",
    classes: "91-120",
    totalClasses: 30,
  },
  b2plus: {
    name: "B2+ Advanced",
    subtitle: "Executive-level English mastery",
    classes: "121-150",
    totalClasses: 30,
  },
} as const

export const CLASS_TYPES = {
  individual: "Individual",
  grupal: "Grupal",
} as const

export const PAYMENT_STATUS = {
  paid: "Pagado",
  pending: "Pendiente",
} as const

export const SUBMISSION_STATUS = {
  pending: "Pendiente",
  submitted: "Entregada",
  graded: "Calificada",
} as const

export type Level = keyof typeof LEVELS
export type ClassType = keyof typeof CLASS_TYPES
export type PaymentStatus = keyof typeof PAYMENT_STATUS
export type SubmissionStatus = keyof typeof SUBMISSION_STATUS

// Curriculum data - 150 lessons
export const CURRICULUM: { lessonNumber: number; grammar: string; vocabulary: string; level: Level }[] = [
  // A1 Foundation (1-30)
  { lessonNumber: 1, grammar: "TO BE (am/is/are) - Affirmative", vocabulary: "Professional introductions", level: "a1" },
  { lessonNumber: 2, grammar: "TO BE - Negative & Questions", vocabulary: "Countries & Nationalities", level: "a1" },
  { lessonNumber: 3, grammar: "Subject Pronouns", vocabulary: "Contact information", level: "a1" },
  { lessonNumber: 4, grammar: "Possessive Adjectives", vocabulary: "Professional relationships", level: "a1" },
  { lessonNumber: 5, grammar: "Plural Nouns (regular)", vocabulary: "Office equipment", level: "a1" },
  { lessonNumber: 6, grammar: "Plural Nouns (irregular)", vocabulary: "Departments & teams", level: "a1" },
  { lessonNumber: 7, grammar: "Articles (a/an/the)", vocabulary: "Job titles", level: "a1" },
  { lessonNumber: 8, grammar: "Demonstratives (this/that/these/those)", vocabulary: "Office layout", level: "a1" },
  { lessonNumber: 9, grammar: "There is / There are - Affirmative", vocabulary: "Workplace amenities", level: "a1" },
  { lessonNumber: 10, grammar: "There is / There are - Questions", vocabulary: "City locations", level: "a1" },
  { lessonNumber: 11, grammar: "Review: TO BE & There is/are", vocabulary: "Consolidation", level: "a1" },
  { lessonNumber: 12, grammar: "Present Simple - Affirmative (I/you/we/they)", vocabulary: "Daily work routines", level: "a1" },
  { lessonNumber: 13, grammar: "Present Simple - Affirmative (he/she/it)", vocabulary: "Company operations", level: "a1" },
  { lessonNumber: 14, grammar: "Present Simple - Negative", vocabulary: "Company policies", level: "a1" },
  { lessonNumber: 15, grammar: "Present Simple - Yes/No Questions", vocabulary: "Work preferences", level: "a1" },
  { lessonNumber: 16, grammar: "Present Simple - Wh- Questions", vocabulary: "Meeting schedules", level: "a1" },
  { lessonNumber: 17, grammar: "Adverbs of Frequency", vocabulary: "Work habits", level: "a1" },
  { lessonNumber: 18, grammar: "Object Pronouns", vocabulary: "Professional communication", level: "a1" },
  { lessonNumber: 19, grammar: "Can/Can't - Ability", vocabulary: "Professional skills", level: "a1" },
  { lessonNumber: 20, grammar: "Can/Can't - Permission & Requests", vocabulary: "Workplace requests", level: "a1" },
  { lessonNumber: 21, grammar: "Review: Present Simple & Can", vocabulary: "Consolidation", level: "a1" },
  { lessonNumber: 22, grammar: "Imperatives (Affirmative & Negative)", vocabulary: "Instructions & procedures", level: "a1" },
  { lessonNumber: 23, grammar: "Countable vs Uncountable Nouns", vocabulary: "Office supplies & resources", level: "a1" },
  { lessonNumber: 24, grammar: "Some/Any", vocabulary: "Business resources", level: "a1" },
  { lessonNumber: 25, grammar: "How much/How many", vocabulary: "Budgets & quantities", level: "a1" },
  { lessonNumber: 26, grammar: "Would like (requests)", vocabulary: "Business hospitality", level: "a1" },
  { lessonNumber: 27, grammar: "Present Continuous - Affirmative", vocabulary: "Current projects", level: "a1" },
  { lessonNumber: 28, grammar: "Present Continuous - Negative & Questions", vocabulary: "Project status", level: "a1" },
  { lessonNumber: 29, grammar: "Present Simple vs Present Continuous", vocabulary: "Work patterns vs current tasks", level: "a1" },
  { lessonNumber: 30, grammar: "A1 LEVEL ASSESSMENT", vocabulary: "Comprehensive evaluation", level: "a1" },

  // A2 Elementary (31-60)
  { lessonNumber: 31, grammar: "Past Simple TO BE (was/were)", vocabulary: "Work history", level: "a2" },
  { lessonNumber: 32, grammar: "Past Simple - Regular Verbs", vocabulary: "Completed tasks", level: "a2" },
  { lessonNumber: 33, grammar: "Past Simple - Irregular Verbs (1)", vocabulary: "Business activities", level: "a2" },
  { lessonNumber: 34, grammar: "Past Simple - Irregular Verbs (2)", vocabulary: "Travel experiences", level: "a2" },
  { lessonNumber: 35, grammar: "Past Simple - Negative", vocabulary: "Problem-solving", level: "a2" },
  { lessonNumber: 36, grammar: "Past Simple - Questions", vocabulary: "Project history", level: "a2" },
  { lessonNumber: 37, grammar: "Past Simple - Wh- Questions", vocabulary: "Career milestones", level: "a2" },
  { lessonNumber: 38, grammar: "There was / There were", vocabulary: "Historical context", level: "a2" },
  { lessonNumber: 39, grammar: "Past Continuous - Affirmative", vocabulary: "Ongoing past activities", level: "a2" },
  { lessonNumber: 40, grammar: "Past Continuous - Questions", vocabulary: "Event circumstances", level: "a2" },
  { lessonNumber: 41, grammar: "Past Simple vs Past Continuous", vocabulary: "Event sequences", level: "a2" },
  { lessonNumber: 42, grammar: "Review: Past Tenses", vocabulary: "Consolidation", level: "a2" },
  { lessonNumber: 43, grammar: "Comparatives (short adjectives)", vocabulary: "Product comparisons", level: "a2" },
  { lessonNumber: 44, grammar: "Comparatives (long adjectives)", vocabulary: "Service evaluations", level: "a2" },
  { lessonNumber: 45, grammar: "Superlatives (short adjectives)", vocabulary: "Market leaders", level: "a2" },
  { lessonNumber: 46, grammar: "Superlatives (long adjectives)", vocabulary: "Industry rankings", level: "a2" },
  { lessonNumber: 47, grammar: "(not) as...as", vocabulary: "Balanced comparisons", level: "a2" },
  { lessonNumber: 48, grammar: "Going to - Future Plans", vocabulary: "Project planning", level: "a2" },
  { lessonNumber: 49, grammar: "Going to - Predictions", vocabulary: "Market trends", level: "a2" },
  { lessonNumber: 50, grammar: "Will - Spontaneous Decisions", vocabulary: "Quick responses", level: "a2" },
  { lessonNumber: 51, grammar: "Will - Predictions & Promises", vocabulary: "Commitments", level: "a2" },
  { lessonNumber: 52, grammar: "Will vs Going to", vocabulary: "Future planning", level: "a2" },
  { lessonNumber: 53, grammar: "Review: Future Forms", vocabulary: "Consolidation", level: "a2" },
  { lessonNumber: 54, grammar: "Have to / Don't have to", vocabulary: "Requirements", level: "a2" },
  { lessonNumber: 55, grammar: "Must / Mustn't", vocabulary: "Rules & safety", level: "a2" },
  { lessonNumber: 56, grammar: "Should / Shouldn't", vocabulary: "Best practices", level: "a2" },
  { lessonNumber: 57, grammar: "Might / May (possibility)", vocabulary: "Uncertainties", level: "a2" },
  { lessonNumber: 58, grammar: "Present Perfect - Introduction", vocabulary: "Achievements", level: "a2" },
  { lessonNumber: 59, grammar: "Present Perfect - just/already/yet", vocabulary: "Recent updates", level: "a2" },
  { lessonNumber: 60, grammar: "A2 LEVEL ASSESSMENT", vocabulary: "Comprehensive evaluation", level: "a2" },

  // B1 Intermediate (61-90)
  { lessonNumber: 61, grammar: "Present Perfect vs Past Simple", vocabulary: "Career achievements", level: "b1" },
  { lessonNumber: 62, grammar: "Present Perfect - for / since", vocabulary: "Duration expressions", level: "b1" },
  { lessonNumber: 63, grammar: "Present Perfect Continuous", vocabulary: "Ongoing projects", level: "b1" },
  { lessonNumber: 64, grammar: "Present Perfect Simple vs Continuous", vocabulary: "Results vs processes", level: "b1" },
  { lessonNumber: 65, grammar: "Used to (past habits)", vocabulary: "Previous practices", level: "b1" },
  { lessonNumber: 66, grammar: "Would (past habits)", vocabulary: "Former routines", level: "b1" },
  { lessonNumber: 67, grammar: "Review: Perfect & Past Habits", vocabulary: "Consolidation", level: "b1" },
  { lessonNumber: 68, grammar: "First Conditional", vocabulary: "Consequences", level: "b1" },
  { lessonNumber: 69, grammar: "First Conditional - variations", vocabulary: "Timing conditions", level: "b1" },
  { lessonNumber: 70, grammar: "Second Conditional", vocabulary: "Hypothetical scenarios", level: "b1" },
  { lessonNumber: 71, grammar: "Second Conditional - I wish", vocabulary: "Desired changes", level: "b1" },
  { lessonNumber: 72, grammar: "Zero Conditional", vocabulary: "Facts & processes", level: "b1" },
  { lessonNumber: 73, grammar: "Conditionals Practice", vocabulary: "Mixed contexts", level: "b1" },
  { lessonNumber: 74, grammar: "Review: Conditionals", vocabulary: "Consolidation", level: "b1" },
  { lessonNumber: 75, grammar: "Passive Voice - Present Simple", vocabulary: "Processes", level: "b1" },
  { lessonNumber: 76, grammar: "Passive Voice - Past Simple", vocabulary: "Historical events", level: "b1" },
  { lessonNumber: 77, grammar: "Passive Voice - Present Perfect", vocabulary: "Completed actions", level: "b1" },
  { lessonNumber: 78, grammar: "Passive Voice - With modals", vocabulary: "Requirements", level: "b1" },
  { lessonNumber: 79, grammar: "Have something done (causative)", vocabulary: "Services", level: "b1" },
  { lessonNumber: 80, grammar: "Relative Clauses - Defining", vocabulary: "Specifications", level: "b1" },
  { lessonNumber: 81, grammar: "Relative Clauses - Non-defining", vocabulary: "Additional context", level: "b1" },
  { lessonNumber: 82, grammar: "Review: Passive & Relatives", vocabulary: "Consolidation", level: "b1" },
  { lessonNumber: 83, grammar: "Reported Speech - Statements", vocabulary: "Meetings", level: "b1" },
  { lessonNumber: 84, grammar: "Reported Speech - Questions", vocabulary: "Interviews", level: "b1" },
  { lessonNumber: 85, grammar: "Reported Speech - Commands", vocabulary: "Instructions", level: "b1" },
  { lessonNumber: 86, grammar: "Reporting Verbs", vocabulary: "Communication verbs", level: "b1" },
  { lessonNumber: 87, grammar: "Gerunds vs Infinitives (basic)", vocabulary: "Verb patterns", level: "b1" },
  { lessonNumber: 88, grammar: "Gerunds vs Infinitives (meaning change)", vocabulary: "Precise intentions", level: "b1" },
  { lessonNumber: 89, grammar: "Review: Reported Speech & Gerunds", vocabulary: "Consolidation", level: "b1" },
  { lessonNumber: 90, grammar: "B1 LEVEL ASSESSMENT", vocabulary: "Comprehensive evaluation", level: "b1" },

  // B2 Upper-Intermediate (91-120)
  { lessonNumber: 91, grammar: "Third Conditional", vocabulary: "Past hypotheticals", level: "b2" },
  { lessonNumber: 92, grammar: "Mixed Conditionals", vocabulary: "Complex scenarios", level: "b2" },
  { lessonNumber: 93, grammar: "I wish / If only + past perfect", vocabulary: "Regrets & lessons", level: "b2" },
  { lessonNumber: 94, grammar: "Future Continuous", vocabulary: "Scheduled activities", level: "b2" },
  { lessonNumber: 95, grammar: "Future Perfect", vocabulary: "Completion deadlines", level: "b2" },
  { lessonNumber: 96, grammar: "Future Perfect Continuous", vocabulary: "Duration achievements", level: "b2" },
  { lessonNumber: 97, grammar: "Review: Advanced Conditionals & Future", vocabulary: "Consolidation", level: "b2" },
  { lessonNumber: 98, grammar: "Modals of Deduction - Present", vocabulary: "Analysis", level: "b2" },
  { lessonNumber: 99, grammar: "Modals of Deduction - Past", vocabulary: "Investigation", level: "b2" },
  { lessonNumber: 100, grammar: "Modal Perfect (should have, etc.)", vocabulary: "Criticism & advice", level: "b2" },
  { lessonNumber: 101, grammar: "Need (all forms)", vocabulary: "Necessity levels", level: "b2" },
  { lessonNumber: 102, grammar: "Advanced Passive (It is said...)", vocabulary: "Formal reporting", level: "b2" },
  { lessonNumber: 103, grammar: "Passive with reporting verbs", vocabulary: "Academic language", level: "b2" },
  { lessonNumber: 104, grammar: "Review: Advanced Modals & Passive", vocabulary: "Consolidation", level: "b2" },
  { lessonNumber: 105, grammar: "Reduced Relative Clauses", vocabulary: "Concise expression", level: "b2" },
  { lessonNumber: 106, grammar: "Participle Clauses", vocabulary: "Descriptive efficiency", level: "b2" },
  { lessonNumber: 107, grammar: "Cleft Sentences", vocabulary: "Emphasis techniques", level: "b2" },
  { lessonNumber: 108, grammar: "Inversion (Not only...)", vocabulary: "Formal emphasis", level: "b2" },
  { lessonNumber: 109, grammar: "Inversion in conditionals", vocabulary: "Formal hypotheticals", level: "b2" },
  { lessonNumber: 110, grammar: "Fronting for emphasis", vocabulary: "Dramatic effect", level: "b2" },
  { lessonNumber: 111, grammar: "Review: Advanced Structures", vocabulary: "Consolidation", level: "b2" },
  { lessonNumber: 112, grammar: "Advanced Reported Speech", vocabulary: "Nuanced reporting", level: "b2" },
  { lessonNumber: 113, grammar: "Subjunctive", vocabulary: "Formal recommendations", level: "b2" },
  { lessonNumber: 114, grammar: "Noun Clauses", vocabulary: "Abstract concepts", level: "b2" },
  { lessonNumber: 115, grammar: "Adverbial Clauses", vocabulary: "Contrast & concession", level: "b2" },
  { lessonNumber: 116, grammar: "Discourse Markers", vocabulary: "Academic transitions", level: "b2" },
  { lessonNumber: 117, grammar: "Ellipsis and Substitution", vocabulary: "Efficient communication", level: "b2" },
  { lessonNumber: 118, grammar: "Review: Complex Clauses", vocabulary: "Consolidation", level: "b2" },
  { lessonNumber: 119, grammar: "B2 Comprehensive Review", vocabulary: "Integration", level: "b2" },
  { lessonNumber: 120, grammar: "B2 LEVEL ASSESSMENT", vocabulary: "Comprehensive evaluation", level: "b2" },

  // B2+ Advanced (121-150)
  { lessonNumber: 121, grammar: "Business Idioms", vocabulary: "Corporate expressions", level: "b2plus" },
  { lessonNumber: 122, grammar: "Social Idioms", vocabulary: "Informal expressions", level: "b2plus" },
  { lessonNumber: 123, grammar: "Advanced Collocations - Verbs", vocabulary: "Verb combinations", level: "b2plus" },
  { lessonNumber: 124, grammar: "Advanced Collocations - Adjectives", vocabulary: "Descriptive precision", level: "b2plus" },
  { lessonNumber: 125, grammar: "Multi-word Phrasal Verbs", vocabulary: "Complex phrasal verbs", level: "b2plus" },
  { lessonNumber: 126, grammar: "Phrasal Verbs - Formal Equivalents", vocabulary: "Register awareness", level: "b2plus" },
  { lessonNumber: 127, grammar: "Review: Idiomatic Language", vocabulary: "Consolidation", level: "b2plus" },
  { lessonNumber: 128, grammar: "Narrative Tenses - Advanced", vocabulary: "Storytelling", level: "b2plus" },
  { lessonNumber: 129, grammar: "Future Forms - Advanced", vocabulary: "Nuanced future", level: "b2plus" },
  { lessonNumber: 130, grammar: "Perfect Aspects - Advanced", vocabulary: "Temporal precision", level: "b2plus" },
  { lessonNumber: 131, grammar: "Hedging Language", vocabulary: "Academic caution", level: "b2plus" },
  { lessonNumber: 132, grammar: "Vague Language", vocabulary: "Informal precision", level: "b2plus" },
  { lessonNumber: 133, grammar: "Binomials and Trinomials", vocabulary: "Fixed expressions", level: "b2plus" },
  { lessonNumber: 134, grammar: "Review: Advanced Tenses & Style", vocabulary: "Consolidation", level: "b2plus" },
  { lessonNumber: 135, grammar: "Formal vs Informal Register", vocabulary: "Register vocabulary", level: "b2plus" },
  { lessonNumber: 136, grammar: "Academic Writing Style", vocabulary: "Academic conventions", level: "b2plus" },
  { lessonNumber: 137, grammar: "Business English Register", vocabulary: "Corporate language", level: "b2plus" },
  { lessonNumber: 138, grammar: "Email Communication Mastery", vocabulary: "Email conventions", level: "b2plus" },
  { lessonNumber: 139, grammar: "Presentation Structure", vocabulary: "Presentation language", level: "b2plus" },
  { lessonNumber: 140, grammar: "Presentation Delivery", vocabulary: "Signposting language", level: "b2plus" },
  { lessonNumber: 141, grammar: "Review: Professional Communication", vocabulary: "Consolidation", level: "b2plus" },
  { lessonNumber: 142, grammar: "Debate and Discussion", vocabulary: "Argumentation", level: "b2plus" },
  { lessonNumber: 143, grammar: "Negotiation Language", vocabulary: "Negotiation phrases", level: "b2plus" },
  { lessonNumber: 144, grammar: "Diplomatic Language", vocabulary: "Softening phrases", level: "b2plus" },
  { lessonNumber: 145, grammar: "Cross-Cultural Communication", vocabulary: "Cultural terms", level: "b2plus" },
  { lessonNumber: 146, grammar: "Error Analysis & Self-Correction", vocabulary: "Metalanguage", level: "b2plus" },
  { lessonNumber: 147, grammar: "Exam Strategies (Cambridge/TOEFL)", vocabulary: "Exam vocabulary", level: "b2plus" },
  { lessonNumber: 148, grammar: "Program Review - Communication", vocabulary: "Integration", level: "b2plus" },
  { lessonNumber: 149, grammar: "Program Review - Professional Skills", vocabulary: "Final preparation", level: "b2plus" },
  { lessonNumber: 150, grammar: "PROGRAM FINAL ASSESSMENT", vocabulary: "Graduation", level: "b2plus" },
]

// Helper function to get level from lesson number
export function getLevelFromLesson(lessonNumber: number): Level {
  if (lessonNumber <= 30) return "a1"
  if (lessonNumber <= 60) return "a2"
  if (lessonNumber <= 90) return "b1"
  if (lessonNumber <= 120) return "b2"
  return "b2plus"
}

// Helper to get lesson data
export function getLesson(lessonNumber: number) {
  return CURRICULUM.find(l => l.lessonNumber === lessonNumber)
}

// Helper to get lessons by level
export function getLessonsByLevel(level: Level) {
  return CURRICULUM.filter(l => l.level === level)
}
