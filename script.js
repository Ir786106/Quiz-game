// const startScreen = document.getElementById("start-screen");
// const quizScreen = document.getElementById("quiz-screen");
// const resultScreen = document.getElementById("result-screen");
// const startButton = document.getElementById("start-btn");
// const questionText = document.getElementById("question-text");
// const answersContainer = document.getElementById("answer-container");
// const currentQuestionSpan = document.getElementById("current-question");
// const totalQuestionSpan = document.getElementById("total-questions");
// const scoreSpan = document.getElementById("score");
// const finalScoreSpan = document.getElementById("final-score");
// const maxScoreSpan = document.getElementById("max-score");
// const resultMessage = document.getElementById("result-message");
// const restartButton = document.getElementById("restart-btn");
// const progressBar = document.getElementById("progress");

// const quizQuestions = [
//   {
//     question: "What does CPU stand for?",
//     answers: [
//       { text: "Central Processing Unit", correct: true },
//       { text: "Computer Personal Unit", correct: false },
//       { text: "Central Print Unit", correct: false },
//       { text: "Control Processing Utility", correct: false },
//     ],
//   },
//   {
//     question: "Which of the following is an input device?",
//     answers: [
//       { text: "Monitor", correct: false },
//       { text: "Keyboard", correct: true },
//       { text: "Printer", correct: false },
//       { text: "Speaker", correct: false },
//     ],
//   },
//   {
//     question: "Which number system does a computer use internally?",
//     answers: [
//       { text: "Decimal", correct: false },
//       { text: "Binary", correct: true },
//       { text: "Hexadecimal", correct: false },
//       { text: "Octal", correct: false },
//     ],
//   },
//   {
//     question: "Which of these is NOT a programming language?",
//     answers: [
//       { text: "Python", correct: false },
//       { text: "C++", correct: false },
//       { text: "HTML", correct: true },
//       { text: "Java", correct: false },
//     ],
//   },
//   {
//     question: "What does RAM stand for?",
//     answers: [
//       { text: "Read Access Memory", correct: false },
//       { text: "Random Access Memory", correct: true },
//       { text: "Run Access Machine", correct: false },
//       { text: "Rapid Action Memory", correct: false },
//     ],
//   },
//   {
//     question: "Which data structure uses LIFO (Last In, First Out)?",
//     answers: [
//       { text: "Queue", correct: false },
//       { text: "Stack", correct: true },
//       { text: "Array", correct: false },
//       { text: "Tree", correct: false },
//     ],
//   },
//   {
//     question: "Which company developed the C programming language?",
//     answers: [
//       { text: "Apple", correct: false },
//       { text: "Microsoft", correct: false },
//       { text: "Bell Labs", correct: true },
//       { text: "Google", correct: false },
//     ],
//   },
//   {
//     question: "Which algorithm is used to find the shortest path in a graph?",
//     answers: [
//       { text: "Bubble Sort", correct: false },
//       { text: "Dijkstra's Algorithm", correct: true },
//       { text: "Quick Sort", correct: false },
//       { text: "Merge Sort", correct: false },
//     ],
//   },
//   {
//     question: "Which one is a NoSQL database?",
//     answers: [
//       { text: "MySQL", correct: false },
//       { text: "PostgreSQL", correct: false },
//       { text: "MongoDB", correct: true },
//       { text: "Oracle", correct: false },
//     ],
//   },
//   {
//     question: "Which encryption technique is theoretically unbreakable if the key is random and used only once?",
//     answers: [
//       { text: "AES", correct: false },
//       { text: "RSA", correct: false },
//       { text: "One-Time Pad", correct: true },
//       { text: "Caesar Cipher", correct: false },
//     ],
//   },
// ];

// // QUIZ STATE VARS
// let currentQuestionIndex = 0;
// let score = 0;
// let answersDisabled = false;

// totalQuestionSpan.textContent = quizQuestions.length;
// maxScoreSpan.textContent = quizQuestions.length;

// // event listeners
// startButton.addEventListener("click", startQuiz);
// restartButton.addEventListener("click", restartQuiz);

// function startQuiz() {
//   // reset vars
//   currentQuestionIndex = 0;
//   score = 0;
//   scoreSpan.textContent = 0;

//   startScreen.classList.remove("active");
//   quizScreen.classList.add("active");

//   showQuestion();
// }

// function showQuestion() {
//   // reset state
//   answersDisabled = false;

//   const currentQuestion = quizQuestions[currentQuestionIndex];

//   currentQuestionSpan.textContent = currentQuestionIndex + 1;

//   const progressPercent = (currentQuestionIndex / quizQuestions.length) * 100;
//   progressBar.style.width = progressPercent + "%";

//   questionText.textContent = currentQuestion.question;

//   answersContainer.innerHTML = "";

//   currentQuestion.answers.forEach((answer) => {
//     const button = document.createElement("button");
//     button.textContent = answer.text;
//     button.classList.add("answer-btn");

//     button.dataset.correct = answer.correct;
//     button.addEventListener("click", selectAnswer);

//     answersContainer.appendChild(button);
//   });
// }

// function selectAnswer(event) {
//   if (answersDisabled) return;
//   answersDisabled = true;

//   const selectedButton = event.target;
//   const isCorrect = selectedButton.dataset.correct === "true";

//   Array.from(answersContainer.children).forEach((button) => {
//     if (button.dataset.correct === "true") {
//       button.classList.add("correct");
//     } else if (button === selectedButton) {
//       button.classList.add("incorrect");
//     }
//   });

//   if (isCorrect) {
//     score++;
//     scoreSpan.textContent = score;
//   }

//   setTimeout(() => {
//     currentQuestionIndex++;
//     if (currentQuestionIndex < quizQuestions.length) {
//       showQuestion();
//     } else {
//       showResults();
//     }
//   }, 1000);
// }

// function showResults() {
//   quizScreen.classList.remove("active");
//   resultScreen.classList.add("active");

//   finalScoreSpan.textContent = score;

//   const percentage = (score / quizQuestions.length) * 100;

//   if (percentage === 100) {
//     resultMessage.textContent = "Perfect! You're a genius!";
//   } else if (percentage >= 80) {
//     resultMessage.textContent = "Great job! You know your stuff!";
//   } else if (percentage >= 60) {
//     resultMessage.textContent = "Good effort! Keep learning!";
//   } else if (percentage >= 40) {
//     resultMessage.textContent = "Not bad! Try again to improve!";
//   } else {
//     resultMessage.textContent = "Keep studying! You'll get better!";
//   }
// }

// function restartQuiz() {
//   resultScreen.classList.remove("active");
//   startQuiz();
// }

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const startButton = document.getElementById("start-btn");
const gameSelect = document.getElementById("game-select");
const difficultySelect = document.getElementById("difficulty-select");
const modePreview = document.getElementById("mode-preview");
const sessionBadge = document.getElementById("session-badge");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answer-container");
const currentQuestionSpan = document.getElementById("current-question");
const totalQuestionSpan = document.getElementById("total-questions");
const scoreSpan = document.getElementById("score");
const finalScoreSpan = document.getElementById("final-score");
const maxScoreSpan = document.getElementById("max-score");
const resultMessage = document.getElementById("result-message");
const resultSummary = document.getElementById("result-summary");
const restartButton = document.getElementById("restart-btn");
const progressBar = document.getElementById("progress");

const gameLibrary = {
  "Quick Quiz": {
    mode: "multiple-choice",
    description: "Classic multiple-choice checks for fast concept review.",
    difficulties: {
      Easy: [
        {
          prompt: "What does CPU stand for?",
          choices: [
            { text: "Central Processing Unit", correct: true },
            { text: "Central Program Utility", correct: false },
            { text: "Computer Processing User", correct: false },
            { text: "Core Protocol Unit", correct: false },
          ],
        },
        {
          prompt: "Which one is an output device?",
          choices: [
            { text: "Mouse", correct: false },
            { text: "Keyboard", correct: false },
            { text: "Monitor", correct: true },
            { text: "Scanner", correct: false },
          ],
        },
        {
          prompt: "Binary digits are made from:",
          choices: [
            { text: "0 and 1", correct: true },
            { text: "1 and 2", correct: false },
            { text: "A and B", correct: false },
            { text: "8 and 16", correct: false },
          ],
        },
      ],
      Medium: [
        {
          prompt: "Which data structure uses FIFO behavior?",
          choices: [
            { text: "Queue", correct: true },
            { text: "Stack", correct: false },
            { text: "Tree", correct: false },
            { text: "Graph", correct: false },
          ],
        },
        {
          prompt: "Which layer handles IP addressing in TCP/IP?",
          choices: [
            { text: "Transport", correct: false },
            { text: "Application", correct: false },
            { text: "Internet", correct: true },
            { text: "Physical", correct: false },
          ],
        },
        {
          prompt: "Big-O of binary search on sorted data is:",
          choices: [
            { text: "O(n)", correct: false },
            { text: "O(log n)", correct: true },
            { text: "O(n log n)", correct: false },
            { text: "O(1)", correct: false },
          ],
        },
      ],
      Hard: [
        {
          prompt: "Which concept helps prevent deadlock by acquiring locks in order?",
          choices: [
            { text: "Lock ordering", correct: true },
            { text: "Lazy loading", correct: false },
            { text: "Memoization", correct: false },
            { text: "Round-robin", correct: false },
          ],
        },
        {
          prompt: "Which traversal visits root, then left, then right?",
          choices: [
            { text: "Postorder", correct: false },
            { text: "Inorder", correct: false },
            { text: "Preorder", correct: true },
            { text: "Level-order", correct: false },
          ],
        },
        {
          prompt: "Which protocol secures web traffic?",
          choices: [
            { text: "FTP", correct: false },
            { text: "HTTP", correct: false },
            { text: "TLS", correct: true },
            { text: "SMTP", correct: false },
          ],
        },
      ],
    },
  },
  "True/False Sprint": {
    mode: "true-false",
    description: "Short statements to build confidence through rapid decisions.",
    difficulties: {
      Easy: [
        {
          prompt: "RAM is temporary memory.",
          choices: [
            { text: "True", correct: true },
            { text: "False", correct: false },
          ],
        },
        {
          prompt: "A browser is an operating system.",
          choices: [
            { text: "True", correct: false },
            { text: "False", correct: true },
          ],
        },
        {
          prompt: "HTML is used to structure web pages.",
          choices: [
            { text: "True", correct: true },
            { text: "False", correct: false },
          ],
        },
      ],
      Medium: [
        {
          prompt: "JSON supports comments by default.",
          choices: [
            { text: "True", correct: false },
            { text: "False", correct: true },
          ],
        },
        {
          prompt: "A stack typically supports push and pop operations.",
          choices: [
            { text: "True", correct: true },
            { text: "False", correct: false },
          ],
        },
        {
          prompt: "DNS translates domain names to IP addresses.",
          choices: [
            { text: "True", correct: true },
            { text: "False", correct: false },
          ],
        },
      ],
      Hard: [
        {
          prompt: "HTTPS guarantees a website is trustworthy.",
          choices: [
            { text: "True", correct: false },
            { text: "False", correct: true },
          ],
        },
        {
          prompt: "Depth-first search uses a queue by default.",
          choices: [
            { text: "True", correct: false },
            { text: "False", correct: true },
          ],
        },
        {
          prompt: "Symmetric encryption uses the same key for encryption and decryption.",
          choices: [
            { text: "True", correct: true },
            { text: "False", correct: false },
          ],
        },
      ],
    },
  },
  "Flashcard Coach": {
    mode: "flashcard",
    description: "Reveal concept cards, then self-assess retention for active recall.",
    difficulties: {
      Easy: [
        { prompt: "Term: Variable", answer: "A named storage location that can hold changing values." },
        { prompt: "Term: Function", answer: "A reusable block of code that performs a specific task." },
        { prompt: "Term: Loop", answer: "A control structure used to repeat a set of instructions." },
      ],
      Medium: [
        { prompt: "Concept: API", answer: "A set of rules that lets software systems communicate." },
        { prompt: "Concept: Recursion", answer: "A function calling itself to solve smaller versions of a problem." },
        { prompt: "Concept: Hashing", answer: "Converting data into a fixed-size value for quick lookup or integrity checks." },
      ],
      Hard: [
        { prompt: "Concept: Normalization", answer: "Database design process that reduces redundancy and improves integrity." },
        { prompt: "Concept: Race Condition", answer: "A bug where outcome depends on timing of concurrent execution." },
        { prompt: "Concept: Asymptotic Analysis", answer: "Estimating algorithm growth rates as input size becomes very large." },
      ],
    },
  },
};

let selectedGameName = "Quick Quiz";
let selectedDifficulty = "Easy";
let activeItems = [];
let currentQuestionIndex = 0;
let score = 0;
let answersDisabled = false;

startButton.addEventListener("click", startSession);
restartButton.addEventListener("click", goToStart);
gameSelect.addEventListener("change", handleGameChange);
difficultySelect.addEventListener("change", handleDifficultyChange);

initializeSelections();

function initializeSelections() {
  Object.keys(gameLibrary).forEach((gameName) => {
    const option = document.createElement("option");
    option.value = gameName;
    option.textContent = gameName;
    gameSelect.appendChild(option);
  });

  updateDifficultyOptions();
  updatePreview();
}

function handleGameChange() {
  selectedGameName = gameSelect.value;
  updateDifficultyOptions();
  updatePreview();
}

function handleDifficultyChange() {
  selectedDifficulty = difficultySelect.value;
  updatePreview();
}

function updateDifficultyOptions() {
  const game = gameLibrary[selectedGameName] || gameLibrary[Object.keys(gameLibrary)[0]];
  selectedGameName = gameSelect.value || Object.keys(gameLibrary)[0];

  difficultySelect.innerHTML = "";
  Object.keys(game.difficulties).forEach((level) => {
    const option = document.createElement("option");
    option.value = level;
    option.textContent = level;
    difficultySelect.appendChild(option);
  });

  selectedDifficulty = difficultySelect.value || "Easy";
}

function updatePreview() {
  const game = gameLibrary[selectedGameName];
  const itemCount = game.difficulties[selectedDifficulty].length;
  modePreview.textContent = `${game.description} • ${selectedDifficulty} • ${itemCount} items`;
}

function startSession() {
  selectedGameName = gameSelect.value;
  selectedDifficulty = difficultySelect.value;

  const game = gameLibrary[selectedGameName];
  activeItems = [...game.difficulties[selectedDifficulty]];
  currentQuestionIndex = 0;
  score = 0;
  answersDisabled = false;
  scoreSpan.textContent = 0;
  totalQuestionSpan.textContent = activeItems.length;
  maxScoreSpan.textContent = activeItems.length;
  sessionBadge.textContent = `${selectedGameName} · ${selectedDifficulty}`;

  startScreen.classList.remove("active");
  resultScreen.classList.remove("active");
  quizScreen.classList.add("active");

  showItem();
}

function showItem() {
  answersDisabled = false;

  const game = gameLibrary[selectedGameName];
  const item = activeItems[currentQuestionIndex];

  currentQuestionSpan.textContent = currentQuestionIndex + 1;
  progressBar.style.width = `${(currentQuestionIndex / activeItems.length) * 100}%`;
  questionText.textContent = item.prompt;
  answersContainer.innerHTML = "";

  if (game.mode === "flashcard") {
    renderFlashcard(item);
    return;
  }

  renderChoiceButtons(item.choices);
}

function renderChoiceButtons(choices) {
  choices.forEach((choice) => {
    const button = document.createElement("button");
    button.textContent = choice.text;
    button.classList.add("answer-btn");
    button.dataset.correct = choice.correct;
    button.addEventListener("click", selectChoice);
    answersContainer.appendChild(button);
  });
}

function renderFlashcard(item) {
  const revealButton = document.createElement("button");
  revealButton.textContent = "Reveal Answer";
  revealButton.classList.add("secondary-btn");

  const answerBlock = document.createElement("p");
  answerBlock.classList.add("flashcard-answer");
  answerBlock.textContent = item.answer;
  answerBlock.hidden = true;

  const knewButton = document.createElement("button");
  knewButton.textContent = "I knew this";
  knewButton.classList.add("answer-btn");
  knewButton.disabled = true;

  const practiceButton = document.createElement("button");
  practiceButton.textContent = "Need practice";
  practiceButton.classList.add("answer-btn");
  practiceButton.disabled = true;

  revealButton.addEventListener("click", () => {
    answerBlock.hidden = false;
    knewButton.disabled = false;
    practiceButton.disabled = false;
    revealButton.disabled = true;
  });

  knewButton.addEventListener("click", () => scoreFlashcard(true, knewButton, practiceButton));
  practiceButton.addEventListener("click", () => scoreFlashcard(false, knewButton, practiceButton));

  answersContainer.append(revealButton, answerBlock, knewButton, practiceButton);
}

function scoreFlashcard(knewIt, knewButton, practiceButton) {
  if (answersDisabled) return;
  answersDisabled = true;

  if (knewIt) {
    score += 1;
    scoreSpan.textContent = score;
    knewButton.classList.add("correct");
  } else {
    practiceButton.classList.add("incorrect");
  }

  setTimeout(nextItem, 800);
}

function selectChoice(event) {
  if (answersDisabled) return;
  answersDisabled = true;

  const selectedButton = event.target;
  const isCorrect = selectedButton.dataset.correct === "true";

  Array.from(answersContainer.children).forEach((button) => {
    if (button.dataset.correct === "true") {
      button.classList.add("correct");
    } else if (button === selectedButton) {
      button.classList.add("incorrect");
    }
  });

  if (isCorrect) {
    score += 1;
    scoreSpan.textContent = score;
  }

  setTimeout(nextItem, 800);
}

function nextItem() {
  currentQuestionIndex += 1;

  if (currentQuestionIndex < activeItems.length) {
    showItem();
    return;
  }

  showResults();
}

function showResults() {
  quizScreen.classList.remove("active");
  resultScreen.classList.add("active");
  progressBar.style.width = "100%";

  finalScoreSpan.textContent = score;
  resultSummary.textContent = `${selectedGameName} (${selectedDifficulty}) completed.`;

  const percentage = (score / activeItems.length) * 100;
  if (percentage === 100) {
    resultMessage.textContent = "Perfect run. Excellent mastery!";
  } else if (percentage >= 70) {
    resultMessage.textContent = "Strong work! Move up a difficulty when ready.";
  } else if (percentage >= 40) {
    resultMessage.textContent = "Good attempt. Review and try another mode.";
  } else {
    resultMessage.textContent = "Keep practicing—you'll improve quickly.";
  }
}

function goToStart() {
  resultScreen.classList.remove("active");
  quizScreen.classList.remove("active");
  startScreen.classList.add("active");
  updatePreview();
}
