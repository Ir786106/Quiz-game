const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const startButton = document.getElementById("start-btn");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answer-container");
const currentQuestionSpan = document.getElementById("current-question");
const totalQuestionSpan = document.getElementById("total-questions");
const scoreSpan = document.getElementById("score");
const finalScoreSpan = document.getElementById("final-score");
const maxScoreSpan = document.getElementById("max-score");
const resultMessage = document.getElementById("result-message");
const restartButton = document.getElementById("restart-btn");
const progressBar = document.getElementById("progress");

const quizQuestions = [
  {
    question: "What does CPU stand for?",
    answers: [
      { text: "Central Processing Unit", correct: true },
      { text: "Computer Personal Unit", correct: false },
      { text: "Central Print Unit", correct: false },
      { text: "Control Processing Utility", correct: false },
    ],
  },
  {
    question: "Which of the following is an input device?",
    answers: [
      { text: "Monitor", correct: false },
      { text: "Keyboard", correct: true },
      { text: "Printer", correct: false },
      { text: "Speaker", correct: false },
    ],
  },
  {
    question: "Which number system does a computer use internally?",
    answers: [
      { text: "Decimal", correct: false },
      { text: "Binary", correct: true },
      { text: "Hexadecimal", correct: false },
      { text: "Octal", correct: false },
    ],
  },
  {
    question: "Which of these is NOT a programming language?",
    answers: [
      { text: "Python", correct: false },
      { text: "C++", correct: false },
      { text: "HTML", correct: true },
      { text: "Java", correct: false },
    ],
  },
  {
    question: "What does RAM stand for?",
    answers: [
      { text: "Read Access Memory", correct: false },
      { text: "Random Access Memory", correct: true },
      { text: "Run Access Machine", correct: false },
      { text: "Rapid Action Memory", correct: false },
    ],
  },
  {
    question: "Which data structure uses LIFO (Last In, First Out)?",
    answers: [
      { text: "Queue", correct: false },
      { text: "Stack", correct: true },
      { text: "Array", correct: false },
      { text: "Tree", correct: false },
    ],
  },
  {
    question: "Which company developed the C programming language?",
    answers: [
      { text: "Apple", correct: false },
      { text: "Microsoft", correct: false },
      { text: "Bell Labs", correct: true },
      { text: "Google", correct: false },
    ],
  },
  {
    question: "Which algorithm is used to find the shortest path in a graph?",
    answers: [
      { text: "Bubble Sort", correct: false },
      { text: "Dijkstra's Algorithm", correct: true },
      { text: "Quick Sort", correct: false },
      { text: "Merge Sort", correct: false },
    ],
  },
  {
    question: "Which one is a NoSQL database?",
    answers: [
      { text: "MySQL", correct: false },
      { text: "PostgreSQL", correct: false },
      { text: "MongoDB", correct: true },
      { text: "Oracle", correct: false },
    ],
  },
  {
    question: "Which encryption technique is theoretically unbreakable if the key is random and used only once?",
    answers: [
      { text: "AES", correct: false },
      { text: "RSA", correct: false },
      { text: "One-Time Pad", correct: true },
      { text: "Caesar Cipher", correct: false },
    ],
  },
];

// QUIZ STATE VARS
let currentQuestionIndex = 0;
let score = 0;
let answersDisabled = false;

totalQuestionSpan.textContent = quizQuestions.length;
maxScoreSpan.textContent = quizQuestions.length;

// event listeners
startButton.addEventListener("click", startQuiz);
restartButton.addEventListener("click", restartQuiz);

function startQuiz() {
  // reset vars
  currentQuestionIndex = 0;
  score = 0;
  scoreSpan.textContent = 0;

  startScreen.classList.remove("active");
  quizScreen.classList.add("active");

  showQuestion();
}

function showQuestion() {
  // reset state
  answersDisabled = false;

  const currentQuestion = quizQuestions[currentQuestionIndex];

  currentQuestionSpan.textContent = currentQuestionIndex + 1;

  const progressPercent = (currentQuestionIndex / quizQuestions.length) * 100;
  progressBar.style.width = progressPercent + "%";

  questionText.textContent = currentQuestion.question;

  answersContainer.innerHTML = "";

  currentQuestion.answers.forEach((answer) => {
    const button = document.createElement("button");
    button.textContent = answer.text;
    button.classList.add("answer-btn");

    button.dataset.correct = answer.correct;
    button.addEventListener("click", selectAnswer);

    answersContainer.appendChild(button);
  });
}

function selectAnswer(event) {
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
    score++;
    scoreSpan.textContent = score;
  }

  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
      showQuestion();
    } else {
      showResults();
    }
  }, 1000);
}

function showResults() {
  quizScreen.classList.remove("active");
  resultScreen.classList.add("active");

  finalScoreSpan.textContent = score;

  const percentage = (score / quizQuestions.length) * 100;

  if (percentage === 100) {
    resultMessage.textContent = "Perfect! You're a genius!";
  } else if (percentage >= 80) {
    resultMessage.textContent = "Great job! You know your stuff!";
  } else if (percentage >= 60) {
    resultMessage.textContent = "Good effort! Keep learning!";
  } else if (percentage >= 40) {
    resultMessage.textContent = "Not bad! Try again to improve!";
  } else {
    resultMessage.textContent = "Keep studying! You'll get better!";
  }
}

function restartQuiz() {
  resultScreen.classList.remove("active");
  startQuiz();
}
