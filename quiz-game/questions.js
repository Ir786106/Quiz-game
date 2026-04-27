const SUBJECTS = [
  {
    name: "Computer Science",
    icon: "CS",
    color: "#4F46E5",
    description: "Hardware, data, algorithms, and computing concepts."
  },
  {
    name: "Mathematics",
    icon: "MATH",
    color: "#06B6D4",
    description: "Numbers, patterns, formulas, and problem solving."
  },
  {
    name: "English",
    icon: "Aa",
    color: "#F59E0B",
    description: "Grammar, vocabulary, writing, and literature skills."
  },
  {
    name: "Programming",
    icon: "{}",
    color: "#22C55E",
    description: "Code logic, structures, debugging, and software ideas."
  },
  {
    name: "Web Development",
    icon: "<>",
    color: "#EF4444",
    description: "HTML, CSS, JavaScript, layout, and web standards."
  },
  {
    name: "General Knowledge",
    icon: "GK",
    color: "#8B5CF6",
    description: "Science, society, geography, history, and everyday facts."
  },
  {
    name: "Cybersecurity",
    icon: "SEC",
    color: "#0F766E",
    description: "Safety, privacy, threats, and defensive thinking."
  }
];

const GAME_MODES = [
  {
    id: "mcq",
    title: "Classic MCQ Quiz",
    icon: "ABCD",
    description: "Choose the correct option and learn from explanations."
  },
  {
    id: "trueFalse",
    title: "True / False Game",
    icon: "T/F",
    description: "Decide whether each statement is true or false."
  },
  {
    id: "fillBlank",
    title: "Fill in the Blank",
    icon: "___",
    description: "Type the missing term and check your understanding."
  },
  {
    id: "matching",
    title: "Matching Game",
    icon: "<->",
    description: "Pair each term with the correct meaning."
  },
  {
    id: "flashcard",
    title: "Flashcard Learning",
    icon: "CARD",
    description: "Flip cards, self-check, and build recall."
  },
  {
    id: "scramble",
    title: "Word Scramble",
    icon: "MIX",
    description: "Unscramble key vocabulary with optional hints."
  },
  {
    id: "timed",
    title: "Timed Challenge",
    icon: "TIME",
    description: "Answer quickly to earn a timed bonus."
  },
  {
    id: "level",
    title: "Level-Based Quiz",
    icon: "LVL",
    description: "Beat levels to unlock harder challenges."
  },
  {
    id: "memory",
    title: "Memory Match",
    icon: "MEM",
    description: "Flip cards and remember matching term-definition pairs."
  },
  {
    id: "wordHunt",
    title: "Boggle Word Hunt",
    icon: "GRID",
    description: "Find hidden subject words inside a letter grid."
  },
  {
    id: "wordBuilder",
    title: "Scrabble Word Builder",
    icon: "TILE",
    description: "Build the answer from letter tiles like a word table game."
  },
  {
    id: "zingo",
    title: "Zingo Bingo",
    icon: "BINGO",
    description: "Listen to a clue and mark the correct board tile."
  },
  {
    id: "charades",
    title: "Charades Prompt",
    icon: "ACT",
    description: "Reveal a concept, act it out, and self-check recall."
  },
  {
    id: "drawGuess",
    title: "Pictionary Draw",
    icon: "DRAW",
    description: "Draw a concept clue, reveal the answer, and self-score."
  }
];

const DIFFICULTIES = [
  {
    id: "beginner",
    title: "Beginner",
    level: 1,
    description: "Core ideas and friendly practice."
  },
  {
    id: "intermediate",
    title: "Intermediate",
    level: 2,
    description: "Deeper concepts with more careful thinking."
  },
  {
    id: "advanced",
    title: "Advanced",
    level: 3,
    description: "Challenge questions for confident learners."
  }
];

const BADGE_DEFINITIONS = [
  {
    id: "quiz-starter",
    name: "Quiz Starter",
    description: "Complete your first learning game."
  },
  {
    id: "fast-learner",
    name: "Fast Learner",
    description: "Score at least 70% in Timed Challenge."
  },
  {
    id: "perfect-score",
    name: "Perfect Score",
    description: "Finish any game with 100%."
  },
  {
    id: "computer-genius",
    name: "Computer Genius",
    description: "Score at least 80% in Computer Science."
  },
  {
    id: "math-master",
    name: "Math Master",
    description: "Score at least 80% in Mathematics."
  },
  {
    id: "english-expert",
    name: "English Expert",
    description: "Score at least 80% in English."
  },
  {
    id: "programming-beginner",
    name: "Programming Beginner",
    description: "Complete a beginner Programming game."
  },
  {
    id: "advanced-thinker",
    name: "Advanced Thinker",
    description: "Score at least 70% on advanced content."
  },
  {
    id: "streak-master",
    name: "Streak Master",
    description: "Build a learning streak of 3 days."
  },
  {
    id: "creative-player",
    name: "Creative Player",
    description: "Complete a drawing or charades game."
  },
  {
    id: "word-hunter",
    name: "Word Hunter",
    description: "Score at least 70% in a word game."
  },
  {
    id: "memory-champion",
    name: "Memory Champion",
    description: "Score at least 80% in Memory Match or Zingo Bingo."
  },
  {
    id: "quiz-master",
    name: "Quiz Master",
    description: "Complete 10 learning games."
  },
  {
    id: "course-master",
    name: "Course Master",
    description: "Complete 5 lessons from the learning library."
  },
  {
    id: "top-scorer",
    name: "Top Scorer",
    description: "Reach a score of 100 points or more in one session."
  },
  {
    id: "learning-enthusiast",
    name: "Learning Enthusiast",
    description: "Build a learning streak of 5 days."
  },
  {
    id: "level-up",
    name: "Level Up",
    description: "Unlock or complete a level challenge."
  }
];

const COURSE_DATA = {
  "Computer Science": {
    beginner: [
      {
        term: "CPU",
        definition: "the main processing component that carries out computer instructions",
        falseDefinition: "permanent storage used to keep files after shutdown"
      },
      {
        term: "RAM",
        definition: "temporary memory that stores data while a computer is running",
        falseDefinition: "a printed circuit used only to display images"
      },
      {
        term: "Binary",
        definition: "a number system that uses only 0 and 1",
        falseDefinition: "a file format used only for photographs"
      }
    ],
    intermediate: [
      {
        term: "Stack",
        definition: "a data structure where the last item added is removed first",
        falseDefinition: "a network cable that connects two routers"
      },
      {
        term: "Cache",
        definition: "fast storage that keeps frequently used data ready",
        falseDefinition: "a program that permanently deletes the operating system"
      },
      {
        term: "Compiler",
        definition: "software that translates source code into executable code",
        falseDefinition: "a device that cools computer hardware"
      }
    ],
    advanced: [
      {
        term: "Dijkstra's Algorithm",
        definition: "an algorithm for finding shortest paths in weighted graphs",
        falseDefinition: "a method for compressing images without using math"
      },
      {
        term: "Deadlock",
        definition: "a state where processes wait forever for resources held by each other",
        falseDefinition: "a feature that automatically speeds up every program"
      },
      {
        term: "Big O Notation",
        definition: "a way to describe how an algorithm scales as input grows",
        falseDefinition: "a password rule based only on uppercase letters"
      }
    ]
  },
  Mathematics: {
    beginner: [
      {
        term: "Addition",
        definition: "the operation of combining numbers to find a total",
        falseDefinition: "the operation of splitting a number into equal groups"
      },
      {
        term: "Fraction",
        definition: "a number that represents part of a whole",
        falseDefinition: "a shape with exactly five equal sides"
      },
      {
        term: "Right Angle",
        definition: "an angle that measures exactly 90 degrees",
        falseDefinition: "a line that never touches another line"
      }
    ],
    intermediate: [
      {
        term: "Linear Equation",
        definition: "an equation whose graph is a straight line",
        falseDefinition: "a number that cannot be divided by itself"
      },
      {
        term: "Mean",
        definition: "the average found by dividing the sum by the number of values",
        falseDefinition: "the largest value in a data set"
      },
      {
        term: "Pythagorean Theorem",
        definition: "the rule a squared plus b squared equals c squared in a right triangle",
        falseDefinition: "a formula for calculating the area of every circle"
      }
    ],
    advanced: [
      {
        term: "Derivative",
        definition: "a measure of how a function changes at a point",
        falseDefinition: "a table that lists only whole numbers"
      },
      {
        term: "Matrix",
        definition: "a rectangular arrangement of numbers or symbols",
        falseDefinition: "a single point on a number line"
      },
      {
        term: "Probability",
        definition: "a measure of how likely an event is to happen",
        falseDefinition: "the exact same thing as a physical distance"
      }
    ]
  },
  English: {
    beginner: [
      {
        term: "Noun",
        definition: "a word that names a person, place, thing, or idea",
        falseDefinition: "a word that only describes how loudly someone speaks"
      },
      {
        term: "Verb",
        definition: "a word that shows an action or state of being",
        falseDefinition: "a punctuation mark placed at the end of a sentence"
      },
      {
        term: "Adjective",
        definition: "a word that describes or modifies a noun",
        falseDefinition: "a word that joins two complete sentences by itself"
      }
    ],
    intermediate: [
      {
        term: "Synonym",
        definition: "a word with a similar meaning to another word",
        falseDefinition: "a sentence that asks a question"
      },
      {
        term: "Passive Voice",
        definition: "a sentence form where the subject receives the action",
        falseDefinition: "a paragraph with no verbs at all"
      },
      {
        term: "Past Tense",
        definition: "a verb form used for actions that already happened",
        falseDefinition: "a noun used only for future events"
      }
    ],
    advanced: [
      {
        term: "Metaphor",
        definition: "a figure of speech that directly compares unlike things",
        falseDefinition: "a list of sources at the end of an essay"
      },
      {
        term: "Clause",
        definition: "a group of words with a subject and a verb",
        falseDefinition: "a single letter used as a complete paragraph"
      },
      {
        term: "Semicolon",
        definition: "a punctuation mark that can link closely related independent clauses",
        falseDefinition: "a mark used only to start a question"
      }
    ]
  },
  Programming: {
    beginner: [
      {
        term: "Variable",
        definition: "a named storage location used to hold data",
        falseDefinition: "a rule that prevents a program from using memory"
      },
      {
        term: "Loop",
        definition: "a structure that repeats code while a condition is met",
        falseDefinition: "a comment that explains code without running"
      },
      {
        term: "Function",
        definition: "a reusable block of code that performs a task",
        falseDefinition: "a file that stores images for a website"
      }
    ],
    intermediate: [
      {
        term: "Array",
        definition: "an ordered collection of values stored under one name",
        falseDefinition: "a tool used only to style text colors"
      },
      {
        term: "Object",
        definition: "a data structure that stores related key-value pairs",
        falseDefinition: "a command that always stops a computer"
      },
      {
        term: "Debugging",
        definition: "the process of finding and fixing problems in code",
        falseDefinition: "the process of deleting all comments from code"
      }
    ],
    advanced: [
      {
        term: "Recursion",
        definition: "a technique where a function calls itself to solve smaller cases",
        falseDefinition: "a rule that forbids functions from using parameters"
      },
      {
        term: "Closure",
        definition: "a function bundled with access to variables from its outer scope",
        falseDefinition: "a file type that stores only compiled images"
      },
      {
        term: "Polymorphism",
        definition: "the ability for different types to respond to the same interface",
        falseDefinition: "a syntax error caused by a missing comma"
      }
    ]
  },
  "Web Development": {
    beginner: [
      {
        term: "HTML",
        definition: "a markup language used to structure web page content",
        falseDefinition: "a database that stores passwords online"
      },
      {
        term: "CSS",
        definition: "a style language used to control web page appearance",
        falseDefinition: "a protocol used only for sending email"
      },
      {
        term: "JavaScript",
        definition: "a programming language that adds interactivity to web pages",
        falseDefinition: "a tool used only to resize printed paper"
      }
    ],
    intermediate: [
      {
        term: "DOM",
        definition: "a tree-like representation of a web page that scripts can change",
        falseDefinition: "a network rule for encrypting bank cards"
      },
      {
        term: "Responsive Design",
        definition: "an approach that makes layouts work across screen sizes",
        falseDefinition: "a technique that removes all images from a site"
      },
      {
        term: "Flexbox",
        definition: "a CSS layout system for arranging items in rows or columns",
        falseDefinition: "a JavaScript feature used only for alerts"
      }
    ],
    advanced: [
      {
        term: "Accessibility",
        definition: "designing interfaces so people with different needs can use them",
        falseDefinition: "making a site visible only to administrators"
      },
      {
        term: "REST",
        definition: "an architectural style for designing networked resources",
        falseDefinition: "a CSS property that centers every element automatically"
      },
      {
        term: "Service Worker",
        definition: "a browser script that can support caching and offline behavior",
        falseDefinition: "an HTML tag used only for headings"
      }
    ]
  },
  "General Knowledge": {
    beginner: [
      {
        term: "Continent",
        definition: "one of Earth's large landmasses",
        falseDefinition: "a tool used to measure temperature"
      },
      {
        term: "Planet",
        definition: "a large object that orbits a star",
        falseDefinition: "a small insect that makes honey"
      },
      {
        term: "Ocean",
        definition: "a very large body of salt water",
        falseDefinition: "a mountain formed only by snow"
      }
    ],
    intermediate: [
      {
        term: "Democracy",
        definition: "a system of government where citizens have a role in decision making",
        falseDefinition: "a weather pattern that happens only in deserts"
      },
      {
        term: "Photosynthesis",
        definition: "the process plants use to make food from light, water, and carbon dioxide",
        falseDefinition: "the process of rocks turning into metal"
      },
      {
        term: "Currency",
        definition: "money used as a medium of exchange",
        falseDefinition: "a unit used only to measure loudness"
      }
    ],
    advanced: [
      {
        term: "Renaissance",
        definition: "a period of renewed interest in art, science, and learning in Europe",
        falseDefinition: "a method for predicting earthquakes exactly"
      },
      {
        term: "Ecosystem",
        definition: "a community of living things interacting with their environment",
        falseDefinition: "a single device used to store digital photos"
      },
      {
        term: "Inflation",
        definition: "a general rise in prices that reduces purchasing power",
        falseDefinition: "a rule that makes every product cheaper over time"
      }
    ]
  },
  Cybersecurity: {
    beginner: [
      {
        term: "Password",
        definition: "a secret string used to prove identity",
        falseDefinition: "a public slogan written on every web page"
      },
      {
        term: "Phishing",
        definition: "a scam that tricks people into revealing private information",
        falseDefinition: "a safe method for backing up photos"
      },
      {
        term: "Antivirus",
        definition: "software that helps detect and block malicious programs",
        falseDefinition: "a cable used to connect a keyboard"
      }
    ],
    intermediate: [
      {
        term: "Encryption",
        definition: "the process of turning readable data into protected coded data",
        falseDefinition: "a way to make passwords visible to everyone"
      },
      {
        term: "Firewall",
        definition: "a security system that filters network traffic",
        falseDefinition: "a screen setting that changes brightness"
      },
      {
        term: "Two-Factor Authentication",
        definition: "a login method that requires two forms of proof",
        falseDefinition: "a keyboard shortcut that closes every browser tab"
      }
    ],
    advanced: [
      {
        term: "SQL Injection",
        definition: "an attack that inserts malicious database queries through input",
        falseDefinition: "a safe way to improve font size on a page"
      },
      {
        term: "Zero-Day Vulnerability",
        definition: "a security flaw unknown to those responsible for fixing it",
        falseDefinition: "a backup that is created every zero minutes"
      },
      {
        term: "Principle of Least Privilege",
        definition: "giving users or systems only the access they need",
        falseDefinition: "giving every user administrator access by default"
      }
    ]
  }
};

const QUESTION_BANK = buildQuestionBank();

function buildQuestionBank() {
  let id = 1;
  const questions = [];

  SUBJECTS.forEach((subject) => {
    DIFFICULTIES.forEach((difficulty) => {
      const concepts = COURSE_DATA[subject.name][difficulty.id];
      const definitions = concepts.map((concept) => concept.definition);
      const subjectTerms = Object.values(COURSE_DATA[subject.name])
        .flat()
        .map((concept) => concept.term);

      concepts.forEach((concept, index) => {
        const options = createOptions(concept.definition, definitions, concept.falseDefinition);
        const explanation = `${concept.term}: ${concept.definition}.`;

        questions.push({
          id: id++,
          subject: subject.name,
          gameType: "mcq",
          difficulty: difficulty.id,
          level: difficulty.level,
          question: `Which answer best describes ${concept.term}?`,
          options,
          correctAnswer: concept.definition,
          explanation
        });

        const trueStatement = index % 2 === 0;
        questions.push({
          id: id++,
          subject: subject.name,
          gameType: "trueFalse",
          difficulty: difficulty.id,
          level: difficulty.level,
          question: trueStatement
            ? `${concept.term} means ${concept.definition}.`
            : `${concept.term} means ${concept.falseDefinition}.`,
          correctAnswer: trueStatement,
          explanation
        });

        questions.push({
          id: id++,
          subject: subject.name,
          gameType: "fillBlank",
          difficulty: difficulty.id,
          level: difficulty.level,
          question: `The term for "${concept.definition}" is ______.`,
          correctAnswer: concept.term,
          explanation
        });

        questions.push({
          id: id++,
          subject: subject.name,
          gameType: "flashcard",
          difficulty: difficulty.id,
          level: difficulty.level,
          front: `What is ${concept.term}?`,
          back: concept.definition
        });

        questions.push({
          id: id++,
          subject: subject.name,
          gameType: "scramble",
          difficulty: difficulty.id,
          level: difficulty.level,
          scrambledWord: scrambleTerm(concept.term),
          correctAnswer: concept.term,
          hint: concept.definition,
          explanation
        });

        questions.push({
          id: id++,
          subject: subject.name,
          gameType: "timed",
          difficulty: difficulty.id,
          level: difficulty.level,
          question: `Quick check: what does ${concept.term} mean?`,
          options,
          correctAnswer: concept.definition,
          explanation,
          timeLimit: 15
        });

        questions.push({
          id: id++,
          subject: subject.name,
          gameType: "level",
          difficulty: difficulty.id,
          level: difficulty.level,
          question: `Level ${difficulty.level}: choose the accurate statement about ${concept.term}.`,
          options,
          correctAnswer: concept.definition,
          explanation
        });

        questions.push({
          id: id++,
          subject: subject.name,
          gameType: "wordHunt",
          difficulty: difficulty.id,
          level: difficulty.level,
          targetWord: normalizeTerm(concept.term).slice(0, 8),
          letters: makeLetterGrid(concept.term),
          hint: concept.definition,
          explanation
        });

        questions.push({
          id: id++,
          subject: subject.name,
          gameType: "wordBuilder",
          difficulty: difficulty.id,
          level: difficulty.level,
          letters: shuffleLetters(normalizeTerm(concept.term)),
          correctAnswer: concept.term,
          hint: concept.definition,
          explanation
        });

        questions.push({
          id: id++,
          subject: subject.name,
          gameType: "charades",
          difficulty: difficulty.id,
          level: difficulty.level,
          prompt: `Act out or describe "${concept.term}" without saying the word.`,
          correctAnswer: concept.term,
          hint: concept.definition,
          explanation
        });

        questions.push({
          id: id++,
          subject: subject.name,
          gameType: "drawGuess",
          difficulty: difficulty.id,
          level: difficulty.level,
          prompt: `Draw a clue for "${concept.term}".`,
          correctAnswer: concept.term,
          hint: concept.definition,
          explanation
        });
      });

      questions.push({
        id: id++,
        subject: subject.name,
        gameType: "matching",
        difficulty: difficulty.id,
        level: difficulty.level,
        pairs: concepts.map((concept) => ({
          term: concept.term,
          match: concept.definition
        })),
        explanation: `These ${difficulty.title.toLowerCase()} ${subject.name} terms are core vocabulary for this level.`
      });

      questions.push({
        id: id++,
        subject: subject.name,
        gameType: "memory",
        difficulty: difficulty.id,
        level: difficulty.level,
        pairs: concepts.map((concept) => ({
          term: concept.term,
          match: concept.definition
        })),
        explanation: `Memory Match trains recall for ${difficulty.title.toLowerCase()} ${subject.name} vocabulary.`
      });

      questions.push({
        id: id++,
        subject: subject.name,
        gameType: "zingo",
        difficulty: difficulty.id,
        level: difficulty.level,
        calls: concepts.map((concept) => ({
          term: concept.term,
          clue: concept.definition
        })),
        tiles: createZingoTiles(concepts, subjectTerms),
        explanation: `Zingo Bingo helps connect clues to key ${subject.name} terms.`
      });
    });
  });

  return questions;
}

function createOptions(correctAnswer, relatedDefinitions, falseDefinition) {
  const generalDistractors = [
    falseDefinition,
    "a decorative label with no learning purpose",
    "a random value that never affects a system",
    "a rule used only for printed books"
  ];
  const options = [correctAnswer, ...relatedDefinitions, ...generalDistractors]
    .filter((option, index, array) => option && array.indexOf(option) === index && option !== correctAnswer);

  return [correctAnswer, ...options].slice(0, 4);
}

function scrambleTerm(term) {
  const clean = normalizeTerm(term);

  if (clean.length <= 3) {
    return clean.split("").reverse().join("");
  }

  const midpoint = Math.ceil(clean.length / 2);
  const scrambled = `${clean.slice(midpoint)}${clean.slice(0, midpoint)}`.split("").reverse().join("");
  return scrambled === clean ? clean.split("").reverse().join("") : scrambled;
}

function normalizeTerm(term) {
  return term.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

function shuffleLetters(word) {
  const letters = word.split("");

  for (let index = letters.length - 1; index > 0; index -= 1) {
    const randomIndex = (index * 3 + word.length) % (index + 1);
    [letters[index], letters[randomIndex]] = [letters[randomIndex], letters[index]];
  }

  return letters.join("") === word ? letters.reverse() : letters;
}

function makeLetterGrid(term) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const target = normalizeTerm(term).slice(0, 12);
  const size = 4;
  const cells = Array.from({ length: size * size }, (_, index) => alphabet[(index * 7 + target.length) % alphabet.length]);
  const row = target.length > size ? 1 : 2;
  const start = row * size;

  target.slice(0, size).split("").forEach((letter, index) => {
    cells[start + index] = letter;
  });

  if (target.length > size) {
    target.slice(size, size * 2).split("").forEach((letter, index) => {
      cells[start + size + index] = letter;
    });
  }

  return cells;
}

function createZingoTiles(concepts, subjectTerms) {
  const conceptTerms = concepts.map((concept) => concept.term);
  const fillers = subjectTerms
    .filter((term) => !conceptTerms.includes(term))
    .concat(["Review", "Practice", "Focus", "Skill", "Quest", "Brain"])
    .filter((term, index, array) => array.indexOf(term) === index);

  return [...conceptTerms, ...fillers].slice(0, 9);
}

window.SUBJECTS = SUBJECTS;
window.GAME_MODES = GAME_MODES;
window.DIFFICULTIES = DIFFICULTIES;
window.BADGE_DEFINITIONS = BADGE_DEFINITIONS;
window.COURSE_DATA = COURSE_DATA;
window.QUESTION_BANK = QUESTION_BANK;
