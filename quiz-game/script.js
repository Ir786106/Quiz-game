import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-storage.js";
import { firebaseConfig, platformConfig, hasFirebaseConfig } from "./firebase-config.js";

const { SUBJECTS, GAME_MODES, DIFFICULTIES, BADGE_DEFINITIONS, QUESTION_BANK } = window;

const STORAGE_KEYS = {
  progress: "quiz_user_progress",
  highScores: "quiz_high_scores",
  badges: "quiz_badges",
  unlockedLevels: "quiz_unlocked_levels",
  recentGames: "quiz_recent_games",
  settings: "quiz_settings"
};

const POINTS = {
  correct: 10,
  timedBonus: 5,
  perfectBonus: 20,
  hintPenalty: 2
};

const DEFAULT_SETTINGS = {
  questionLimit: 5,
  timerSeconds: 15,
  animations: true,
  theme: "light"
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const elements = {
  headerXp: $("#header-xp"),
  headerCompleted: $("#header-completed"),
  headerBadges: $("#header-badges"),
  authStatusPill: $("#auth-status-pill"),
  logoutBtn: $("#logout-btn"),
  authPanel: $("#auth-panel"),
  firebaseStatusPanel: $("#firebase-status-panel"),
  dashboardRoleLabel: $("#dashboard-role-label"),
  dashboardContent: $("#dashboard-content"),
  leaderboardList: $("#leaderboard-list"),
  seedContentBtn: $("#seed-content-btn"),
  subjectGrid: $("#subject-grid"),
  modeGrid: $("#mode-grid"),
  difficultyGrid: $("#difficulty-grid"),
  modeSubjectLabel: $("#mode-subject-label"),
  difficultyPathLabel: $("#difficulty-path-label"),
  difficultyTitle: $("#difficulty-title"),
  unlockNote: $("#unlock-note"),
  gamePath: $("#game-path"),
  gameTitle: $("#game-title"),
  gameArea: $("#game-area"),
  feedbackBox: $("#feedback-box"),
  liveScore: $("#live-score"),
  liveCorrect: $("#live-correct"),
  liveProgressText: $("#live-progress-text"),
  gameProgressBar: $("#game-progress-bar"),
  timerPill: $("#timer-pill"),
  timerValue: $("#timer-value"),
  hintBtn: $("#hint-btn"),
  nextBtn: $("#next-btn"),
  gameBackBtn: $("#game-back-btn"),
  resultSummary: $("#result-summary"),
  newBadges: $("#new-badges"),
  progressStats: $("#progress-stats"),
  badgeGrid: $("#badge-grid"),
  historyList: $("#history-list"),
  homeRecentList: $("#home-recent-list"),
  highScoreList: $("#high-score-list"),
  questionLimit: $("#question-limit"),
  timerSeconds: $("#timer-seconds"),
  animationsToggle: $("#animations-toggle"),
  themeChoice: $("#theme-choice"),
  themeToggleBtn: $("#theme-toggle-btn")
};

let progress = loadProgress();
let highScores = loadArray(STORAGE_KEYS.highScores);
let earnedBadges = loadArray(STORAGE_KEYS.badges);
let unlockedLevels = loadUnlockedLevels();
let recentGames = loadArray(STORAGE_KEYS.recentGames);
let settings = loadSettings();
let activeScreen = "home-screen";
let firebaseApp = null;
let auth = null;
let db = null;
let storage = null;
let currentUser = null;
let currentProfile = null;
let cloudSubjects = [];
let cloudQuestions = [];
let cloudSubjectsUnsubscribe = null;
let cloudQuizzesUnsubscribe = null;
let unsubscribers = [];
let activeLeaderboardRange = "overall";

let state = createEmptyState();

document.addEventListener("DOMContentLoaded", init);

function init() {
  setupFirebase();
  $("#home-subject-count").textContent = getAllSubjects().length;
  $("#home-mode-count").textContent = GAME_MODES.length;

  $("#brand-home-btn").addEventListener("click", () => showScreen("home-screen"));
  $("#start-learning-btn").addEventListener("click", () => showScreen("subject-screen"));
  $("#result-progress-btn").addEventListener("click", () => showScreen("progress-screen"));
  $("#restart-game-btn").addEventListener("click", () => startGame());
  elements.gameBackBtn.addEventListener("click", () => showScreen("difficulty-screen"));
  elements.nextBtn.addEventListener("click", advanceQuestion);
  elements.hintBtn.addEventListener("click", useHint);
  $("#clear-progress-btn").addEventListener("click", clearProgress);
  elements.logoutBtn.addEventListener("click", logoutUser);
  elements.seedContentBtn.addEventListener("click", seedStarterContent);

  document.body.addEventListener("click", (event) => {
    const navButton = event.target.closest("[data-nav-screen]");
    if (navButton) {
      showScreen(navButton.dataset.navScreen);
    }

    const boardButton = event.target.closest("[data-board-range]");
    if (boardButton) {
      activeLeaderboardRange = boardButton.dataset.boardRange;
      renderLeaderboardButtons();
      listenLeaderboard(activeLeaderboardRange);
    }
  });

  elements.questionLimit.addEventListener("change", () => {
    settings.questionLimit = Number(elements.questionLimit.value);
    saveSettings();
  });

  elements.timerSeconds.addEventListener("change", () => {
    settings.timerSeconds = Number(elements.timerSeconds.value);
    saveSettings();
  });

  elements.animationsToggle.addEventListener("change", () => {
    settings.animations = elements.animationsToggle.checked;
    saveSettings();
    applySettings();
  });

  elements.themeChoice.addEventListener("change", () => {
    settings.theme = elements.themeChoice.value;
    saveSettings();
    applySettings();
  });

  elements.themeToggleBtn.addEventListener("click", () => {
    settings.theme = getEffectiveTheme() === "dark" ? "light" : "dark";
    saveSettings();
    applySettings();
  });

  if (window.matchMedia) {
    const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");
    if (themeMedia.addEventListener) {
      themeMedia.addEventListener("change", applySettings);
    } else if (themeMedia.addListener) {
      themeMedia.addListener(applySettings);
    }
  }

  applySettings();
  renderAllStaticScreens();
  showScreen("home-screen");
}

function createEmptyState() {
  return {
    selectedSubject: null,
    selectedMode: null,
    selectedDifficulty: null,
    selectedLevel: 1,
    activeQuestions: [],
    questionIndex: 0,
    score: 0,
    correctCount: 0,
    totalUnits: 0,
    answered: false,
    hintsUsed: 0,
    hintedQuestionIds: new Set(),
    selectedTerm: null,
    matchedPairs: new Set(),
    memoryFirstCard: null,
    memoryLock: false,
    wordPath: [],
    zingoCallIndex: 0,
    zingoCorrectTerms: new Set(),
    timerId: null,
    timeLeft: 0,
    startedAt: null,
    lastRecord: null
  };
}

function setupFirebase() {
  if (!hasFirebaseConfig()) {
    renderFirebaseStatus("setup", "Firebase config needed", "Open firebase-config.js and paste your Firebase web app config.");
    renderAuthPanel();
    return;
  }

  try {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
    renderFirebaseStatus("success", "Firebase connected", "Auth, Firestore, Storage, and Hosting-ready static files are wired.");
    listenCloudSubjects();
    listenCloudQuizzes();

    onAuthStateChanged(auth, async (user) => {
      currentUser = user;
      currentProfile = user ? await ensureUserProfile(user) : null;
      renderAuthPanel();
      updateHeaderStats();

      if (activeScreen === "dashboard-screen") {
        showScreen("dashboard-screen");
      }
    });
  } catch (error) {
    renderFirebaseStatus("error", "Firebase initialization failed", error.message);
    renderAuthPanel();
  }
}

function renderFirebaseStatus(type, title, message) {
  if (!elements.firebaseStatusPanel) {
    return;
  }

  elements.firebaseStatusPanel.innerHTML = `
    <span class="status-chip ${type}">${escapeHtml(type)}</span>
    <h2>${escapeHtml(title)}</h2>
    <p>${escapeHtml(message)}</p>
    <div class="platform-mini-list">
      <span>Authentication</span>
      <span>Firestore</span>
      <span>Storage</span>
      <span>Hosting</span>
    </div>
  `;
}

function renderAuthPanel() {
  if (!elements.authPanel) {
    return;
  }

  if (!auth) {
    elements.authPanel.innerHTML = `
      <span class="status-chip setup">setup</span>
      <h2>Firebase Authentication</h2>
      <p>Paste your Firebase config to enable sign up, login, Google auth, role dashboards, realtime progress, and leaderboards.</p>
    `;
    elements.logoutBtn.hidden = true;
    return;
  }

  if (currentUser && currentProfile) {
    elements.authPanel.innerHTML = `
      <span class="status-chip success">signed in</span>
      <h2>${escapeHtml(currentProfile.name || currentUser.displayName || "Learner")}</h2>
      <p>${escapeHtml(currentUser.email || "")}</p>
      <div class="profile-strip">
        <span>${escapeHtml(currentProfile.role)}</span>
        <span>${currentProfile.progress?.totalXP || 0} XP</span>
        <span>${currentProfile.progress?.quizzesCompleted || 0} Completed</span>
      </div>
      <button class="primary-btn" type="button" data-nav-screen="dashboard-screen">Open Dashboard</button>
    `;
    elements.logoutBtn.hidden = false;
    return;
  }

  elements.authPanel.innerHTML = `
    <span class="status-chip">auth</span>
    <h2>Sign in to sync progress</h2>
    <form class="auth-form" id="auth-form">
      <label>
        <span>Name</span>
        <input id="auth-name" type="text" autocomplete="name" placeholder="Your name">
      </label>
      <label>
        <span>Email</span>
        <input id="auth-email" type="email" autocomplete="email" placeholder="you@example.com" required>
      </label>
      <label>
        <span>Password</span>
        <input id="auth-password" type="password" autocomplete="current-password" placeholder="At least 6 characters" required>
      </label>
      <label>
        <span>Requested role</span>
        <select id="auth-role">
          <option value="student">Student</option>
          <option value="teacher">Teacher request</option>
        </select>
      </label>
      <div class="mini-actions">
        <button class="primary-btn" type="submit" data-auth-action="login">Log In</button>
        <button class="secondary-btn" type="submit" data-auth-action="signup">Sign Up</button>
        <button class="ghost-btn" id="google-login-btn" type="button">Google</button>
      </div>
      <p class="form-message" id="auth-message"></p>
    </form>
  `;

  $("#auth-form").addEventListener("submit", handleEmailAuth);
  $("#google-login-btn").addEventListener("click", handleGoogleAuth);
  elements.logoutBtn.hidden = true;
}

function listenCloudSubjects() {
  if (!db || cloudSubjectsUnsubscribe) {
    return;
  }

  const subjectsQuery = query(collection(db, "subjects"), orderBy("name", "asc"), limit(200));
  cloudSubjectsUnsubscribe = onSnapshot(subjectsQuery, (snapshot) => {
    cloudSubjects = snapshot.docs
      .map((item) => normalizeCloudSubject(item.id, item.data()))
      .filter(Boolean);

    $("#home-subject-count").textContent = getAllSubjects().length;

    if (activeScreen === "subject-screen") {
      renderSubjectCards();
    }
  });
}

function normalizeCloudSubject(id, data) {
  if (!data.name) {
    return null;
  }

  const fallbackIcon = String(data.name)
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 4)
    .toUpperCase();

  return {
    id,
    name: String(data.name),
    icon: data.icon || fallbackIcon || "SUB",
    color: data.color || "#4F46E5",
    description: data.description || "Teacher-created learning subject.",
    cloudId: id
  };
}

function listenCloudQuizzes() {
  if (!db || cloudQuizzesUnsubscribe) {
    return;
  }

  const quizzesQuery = query(collection(db, "quizzes"), orderBy("createdAt", "desc"), limit(200));
  cloudQuizzesUnsubscribe = onSnapshot(quizzesQuery, (snapshot) => {
    cloudQuestions = snapshot.docs
      .map((item) => normalizeCloudQuestion(item.id, item.data()))
      .filter(Boolean);

    if (activeScreen === "mode-screen") {
      renderModeCards();
    }

    if (activeScreen === "difficulty-screen") {
      renderDifficultyCards();
    }
  });
}

function normalizeCloudQuestion(id, data) {
  if (!data.published) {
    return null;
  }

  const gameType = ["mcq", "trueFalse", "fillBlank", "timed", "level"].includes(data.gameType)
    ? data.gameType
    : "mcq";
  const difficulty = DIFFICULTIES.some((item) => item.id === data.difficulty) ? data.difficulty : "beginner";
  const level = DIFFICULTIES.find((item) => item.id === difficulty)?.level || 1;
  const correctAnswer = gameType === "trueFalse"
    ? String(data.correctAnswer).toLowerCase() === "true"
    : String(data.correctAnswer || "");
  const options = Array.isArray(data.options)
    ? data.options.map(String).filter(Boolean)
    : [];

  if (
    !data.subject ||
    !data.question ||
    data.correctAnswer === undefined ||
    data.correctAnswer === null ||
    !String(data.correctAnswer).length
  ) {
    return null;
  }

  if (["mcq", "timed", "level"].includes(gameType) && !options.includes(String(correctAnswer))) {
    options.unshift(String(correctAnswer));
  }

  return {
    id: `cloud-${id}`,
    subject: data.subject,
    gameType,
    difficulty,
    level,
    question: data.question,
    options: options.slice(0, 4),
    correctAnswer,
    explanation: data.explanation || "Teacher-created question.",
    timeLimit: Number(data.timeLimit) || settings.timerSeconds,
    cloudId: id
  };
}

async function handleEmailAuth(event) {
  event.preventDefault();
  const action = event.submitter?.dataset.authAction || "login";
  const email = $("#auth-email").value.trim();
  const password = $("#auth-password").value;
  const name = $("#auth-name").value.trim();
  const requestedRole = $("#auth-role").value;
  const message = $("#auth-message");

  try {
    if (action === "signup") {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await ensureUserProfile(credential.user, name, requestedRole);
      message.textContent = "Account created.";
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      message.textContent = "Logged in.";
    }
  } catch (error) {
    message.textContent = error.message;
  }
}

async function handleGoogleAuth() {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    await signInWithPopup(auth, provider);
  } catch (error) {
    const message = $("#auth-message");
    if (message) {
      message.textContent = error.message;
    }
  }
}

async function logoutUser() {
  if (!auth) {
    return;
  }

  await signOut(auth);
  currentUser = null;
  currentProfile = null;
  clearRealtimeListeners();
  renderAuthPanel();
  showScreen("home-screen");
}

async function ensureUserProfile(user, name = "", requestedRole = "student") {
  const profileRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(profileRef);
  const bootstrapRole = platformConfig.bootstrapAdminEmails.includes(user.email) ? "admin" : platformConfig.defaultSignupRole;

  if (!snapshot.exists()) {
    const profile = {
      uid: user.uid,
      name: name || user.displayName || user.email?.split("@")[0] || "Learner",
      email: user.email || "",
      role: bootstrapRole,
      requestedRole,
      photoURL: user.photoURL || "",
      progress: {
        totalXP: 0,
        quizzesCompleted: 0,
        badges: [],
        certificates: []
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(profileRef, profile);
    return profile;
  }

  return {
    uid: user.uid,
    ...snapshot.data()
  };
}

function loadProgress() {
  const saved = loadObject(STORAGE_KEYS.progress);

  return {
    totalXP: saved.totalXP || 0,
    totalScore: saved.totalScore || 0,
    completedGames: saved.completedGames || 0,
    currentStreak: saved.currentStreak || 0,
    longestStreak: saved.longestStreak || 0,
    lastPlayedDate: saved.lastPlayedDate || null,
    unlockedLevels: saved.unlockedLevels || {},
    earnedBadges: saved.earnedBadges || [],
    gameHistory: saved.gameHistory || [],
    bestBySubject: saved.bestBySubject || {},
    bestByMode: saved.bestByMode || {}
  };
}

function loadUnlockedLevels() {
  const saved = loadObject(STORAGE_KEYS.unlockedLevels);
  const defaults = {};

  SUBJECTS.forEach((subject) => {
    defaults[subject.name] = Math.max(1, Number(saved[subject.name]) || 1);
  });

  return defaults;
}

function loadSettings() {
  return {
    ...DEFAULT_SETTINGS,
    ...loadObject(STORAGE_KEYS.settings)
  };
}

function loadObject(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch (error) {
    return {};
  }
}

function loadArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}

function saveProgress() {
  progress.earnedBadges = earnedBadges;
  progress.unlockedLevels = unlockedLevels;
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
  localStorage.setItem(STORAGE_KEYS.badges, JSON.stringify(earnedBadges));
  localStorage.setItem(STORAGE_KEYS.unlockedLevels, JSON.stringify(unlockedLevels));
}

function saveScores() {
  localStorage.setItem(STORAGE_KEYS.highScores, JSON.stringify(highScores));
}

function saveRecentGames() {
  localStorage.setItem(STORAGE_KEYS.recentGames, JSON.stringify(recentGames));
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

function applySettings() {
  document.body.classList.toggle("reduce-motion", !settings.animations);
  elements.questionLimit.value = String(settings.questionLimit);
  elements.timerSeconds.value = String(settings.timerSeconds);
  elements.animationsToggle.checked = settings.animations;
  elements.themeChoice.value = settings.theme;
  document.documentElement.dataset.theme = getEffectiveTheme();
  elements.themeToggleBtn.textContent = getEffectiveTheme() === "dark" ? "Light" : "Dark";
}

function renderAllStaticScreens() {
  renderSubjectCards();
  renderModeCards();
  updateHeaderStats();
}

function showScreen(screenId) {
  if (screenId !== "game-screen") {
    stopTimer();
  }

  if (activeScreen === "dashboard-screen" && screenId !== "dashboard-screen") {
    clearRealtimeListeners();
  }

  if (activeScreen === "leaderboard-screen" && screenId !== "leaderboard-screen") {
    clearRealtimeListeners("leaderboard");
  }

  if (screenId === "mode-screen" && !state.selectedSubject) {
    screenId = "subject-screen";
  }

  if (screenId === "difficulty-screen" && (!state.selectedSubject || !state.selectedMode)) {
    screenId = state.selectedSubject ? "mode-screen" : "subject-screen";
  }

  $$(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === screenId);
  });

  activeScreen = screenId;

  if (screenId === "home-screen") {
    renderHome();
  }

  if (screenId === "subject-screen") {
    renderSubjectCards();
  }

  if (screenId === "mode-screen") {
    renderModeCards();
  }

  if (screenId === "difficulty-screen") {
    renderDifficultyCards();
  }

  if (screenId === "progress-screen") {
    renderProgressDashboard();
  }

  if (screenId === "dashboard-screen") {
    renderRoleDashboard();
  }

  if (screenId === "leaderboard-screen") {
    renderLeaderboardButtons();
    listenLeaderboard(activeLeaderboardRange);
  }

  if (screenId === "scores-screen") {
    renderHighScores();
  }

  if (screenId === "settings-screen") {
    applySettings();
  }

  updateHeaderStats();
  window.scrollTo({ top: 0, behavior: settings.animations ? "smooth" : "auto" });
}

function renderHome() {
  renderRecentGames(elements.homeRecentList, 3);
  renderAuthPanel();
}

function renderRoleDashboard() {
  if (!elements.dashboardContent) {
    return;
  }

  clearRealtimeListeners();

  if (!auth || !currentUser || !currentProfile) {
    elements.dashboardRoleLabel.textContent = "Sign in required";
    elements.dashboardContent.innerHTML = `
      <div class="platform-card">
        <h2>Dashboard locked</h2>
        <p>Sign in with Firebase Authentication to access Admin, Teacher, or Student tools.</p>
        <button class="primary-btn" type="button" data-nav-screen="home-screen">Go to Sign In</button>
      </div>
    `;
    return;
  }

  const role = currentProfile.role || "student";
  elements.dashboardRoleLabel.textContent = `${role} workspace`;

  if (role === "admin") {
    renderAdminDashboard();
  } else if (role === "teacher") {
    renderTeacherDashboard();
  } else {
    renderStudentDashboard();
  }
}

function renderAdminDashboard() {
  elements.dashboardContent.innerHTML = `
    <div class="dashboard-grid admin-overview" id="admin-overview"></div>
    <div class="split-layout">
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Users and Roles</h2>
        </div>
        <div class="responsive-table" id="admin-users-table"></div>
      </section>
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Content Analytics</h2>
        </div>
        <div class="history-list" id="admin-analytics-list"></div>
      </section>
    </div>
    <div class="platform-management-grid">
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Create Subject</h2>
        </div>
        ${subjectFormMarkup()}
      </section>
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Create Lesson</h2>
        </div>
        ${lessonFormMarkup()}
      </section>
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Create Quiz Question</h2>
        </div>
        ${quizFormMarkup()}
      </section>
    </div>
    <div class="platform-management-grid">
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Subjects</h2>
        </div>
        <div class="history-list" id="admin-subjects-list"></div>
      </section>
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Lessons</h2>
        </div>
        <div class="history-list" id="admin-lessons-list"></div>
      </section>
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Quizzes</h2>
        </div>
        <div class="history-list" id="admin-quizzes-list"></div>
      </section>
    </div>
    <div class="split-layout">
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Badge Catalog</h2>
        </div>
        ${badgeFormMarkup()}
      </section>
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Published Badges</h2>
        </div>
        <div class="badge-grid" id="admin-badge-list"></div>
      </section>
    </div>
  `;
  $("#subject-form").addEventListener("submit", saveSubject);
  $("#lesson-form").addEventListener("submit", saveLesson);
  $("#quiz-form").addEventListener("submit", saveQuizQuestion);
  $("#badge-form").addEventListener("submit", saveBadge);
  listenUsersForAdmin();
  listenAttemptsForAnalytics();
  listenSubjectCatalog("admin-subjects-list", true);
  listenLessons("admin-lessons-list", true);
  listenQuizzes("admin-quizzes-list", true);
  listenBadgeCatalog("admin-badge-list", true);
}

function renderTeacherDashboard() {
  elements.dashboardContent.innerHTML = `
    <div class="split-layout">
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Create Lesson</h2>
        </div>
        ${lessonFormMarkup()}
      </section>
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Create Quiz Question</h2>
        </div>
        ${quizFormMarkup()}
      </section>
    </div>
    <div class="split-layout">
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Lessons</h2>
        </div>
        <div class="history-list" id="teacher-lessons-list"></div>
      </section>
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Student Performance</h2>
        </div>
        <div class="history-list" id="teacher-attempts-list"></div>
      </section>
    </div>
    <section class="panel-block teacher-content-panel">
      <div class="panel-heading">
        <h2>Quiz Bank</h2>
      </div>
      <div class="history-list" id="teacher-quizzes-list"></div>
    </section>
  `;
  $("#lesson-form").addEventListener("submit", saveLesson);
  $("#quiz-form").addEventListener("submit", saveQuizQuestion);
  listenLessons("teacher-lessons-list", true);
  listenQuizzes("teacher-quizzes-list", true);
  listenTeacherAttempts();
}

function renderStudentDashboard() {
  const progressData = currentProfile.progress || {};
  elements.dashboardContent.innerHTML = `
    <div class="student-hero-card">
      <div>
        <p class="eyebrow">Student profile</p>
        <h2>${escapeHtml(currentProfile.name || currentUser.email)}</h2>
        <p>${getLevelLabel(progressData.totalXP || 0)} / ${(progressData.totalXP || 0)} XP</p>
      </div>
      <div class="level-meter">
        <span>${getLevelProgress(progressData.totalXP || 0).current} XP</span>
        <div class="progress-track"><div class="progress-fill" style="width: ${getLevelProgress(progressData.totalXP || 0).percent}%"></div></div>
        <small>${getLevelProgress(progressData.totalXP || 0).remaining} XP to next level</small>
      </div>
    </div>
    <div class="dashboard-grid">
      <div class="stat-card">
        <span>Cloud XP</span>
        <strong>${progressData.totalXP || 0}</strong>
      </div>
      <div class="stat-card">
        <span>Cloud Games</span>
        <strong>${progressData.quizzesCompleted || 0}</strong>
      </div>
      <div class="stat-card">
        <span>Lessons Done</span>
        <strong>${progressData.lessonsCompleted || 0}</strong>
      </div>
      <div class="stat-card">
        <span>Badges</span>
        <strong>${(progressData.badges || []).length}</strong>
      </div>
      <div class="stat-card">
        <span>Certificates</span>
        <strong>${(progressData.certificates || []).length}</strong>
      </div>
    </div>
    <div class="split-layout">
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Lessons Library</h2>
        </div>
        <div class="history-list" id="student-lessons-list"></div>
      </section>
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Certificates</h2>
          <button class="secondary-btn" id="certificate-btn" type="button">Generate Certificate</button>
        </div>
        <div id="certificate-output"></div>
        <div class="history-list" id="student-certificate-list">
          ${certificateListMarkup(progressData.certificates || [])}
        </div>
      </section>
    </div>
    <div class="split-layout">
      <section class="panel-block">
        <div class="panel-heading">
          <h2>My Cloud Badges</h2>
        </div>
        <div class="badge-grid" id="student-cloud-badges"></div>
      </section>
      <section class="panel-block">
        <div class="panel-heading">
          <h2>Teacher Feedback</h2>
        </div>
        <div class="history-list" id="student-feedback-list"></div>
      </section>
    </div>
  `;
  $("#certificate-btn").addEventListener("click", generateCertificate);
  listenLessons("student-lessons-list", false);
  listenStudentBadges();
  listenStudentFeedback();
}

function subjectFormMarkup() {
  return `
    <form class="editor-form" id="subject-form">
      <label><span>Subject Name</span><input id="subject-name" type="text" required placeholder="Physics"></label>
      <label><span>Icon Label</span><input id="subject-icon" type="text" maxlength="6" placeholder="PHY"></label>
      <label><span>Accent Color</span><input id="subject-color" type="color" value="#4F46E5"></label>
      <label><span>Description</span><textarea id="subject-description" required placeholder="Motion, forces, energy, and scientific thinking"></textarea></label>
      <button class="primary-btn" type="submit">Save Subject</button>
      <p class="form-message" id="subject-message"></p>
    </form>
  `;
}

function lessonFormMarkup() {
  return `
    <form class="editor-form" id="lesson-form">
      <label><span>Subject</span>${subjectSelect("lesson-subject")}</label>
      <label><span>Title</span><input id="lesson-title" type="text" required placeholder="Intro to algorithms"></label>
      <label><span>Level</span>${difficultySelect("lesson-difficulty")}</label>
      <label><span>Lesson content</span><textarea id="lesson-content" required placeholder="Write lesson notes here"></textarea></label>
      <label><span>Media / PDF / Video</span><input id="lesson-media" type="file" accept="image/*,video/*,.pdf"></label>
      <button class="primary-btn" type="submit">Save Lesson</button>
      <p class="form-message" id="lesson-message"></p>
    </form>
  `;
}

function quizFormMarkup() {
  return `
    <form class="editor-form" id="quiz-form">
      <label><span>Subject</span>${subjectSelect("quiz-subject")}</label>
      <label><span>Game Type</span>${gameModeSelect("quiz-game-type")}</label>
      <label><span>Difficulty</span>${difficultySelect("quiz-difficulty")}</label>
      <label><span>Question</span><textarea id="quiz-question" required placeholder="Write the quiz prompt"></textarea></label>
      <label><span>Options, comma separated</span><input id="quiz-options" type="text" placeholder="A, B, C, D"></label>
      <label><span>Correct Answer</span><input id="quiz-answer" type="text" required></label>
      <label><span>Explanation</span><textarea id="quiz-explanation" placeholder="Why this answer is correct"></textarea></label>
      <button class="primary-btn" type="submit">Save Quiz</button>
      <p class="form-message" id="quiz-message"></p>
    </form>
  `;
}

function badgeFormMarkup() {
  return `
    <form class="editor-form" id="badge-form">
      <label><span>Badge Name</span><input id="badge-name" type="text" required placeholder="Quiz Master"></label>
      <label><span>Badge ID</span><input id="badge-id" type="text" required placeholder="quiz-master"></label>
      <label><span>Description</span><textarea id="badge-description" required placeholder="How students earn this badge"></textarea></label>
      <label><span>XP Bonus</span><input id="badge-xp" type="number" min="0" value="25"></label>
      <button class="primary-btn" type="submit">Save Badge</button>
      <p class="form-message" id="badge-message"></p>
    </form>
  `;
}

function subjectSelect(id) {
  return `
    <select id="${id}">
      ${getAllSubjects().map((subject) => `<option value="${escapeHtml(subject.name)}">${escapeHtml(subject.name)}</option>`).join("")}
    </select>
  `;
}

function difficultySelect(id) {
  return `
    <select id="${id}">
      ${DIFFICULTIES.map((difficulty) => `<option value="${difficulty.id}">${escapeHtml(difficulty.title)}</option>`).join("")}
    </select>
  `;
}

function gameModeSelect(id) {
  const teacherModes = GAME_MODES.filter((mode) => (
    ["mcq", "trueFalse", "fillBlank", "timed", "level"].includes(mode.id)
  ));

  return `
    <select id="${id}">
      ${teacherModes.map((mode) => `<option value="${mode.id}">${escapeHtml(mode.title)}</option>`).join("")}
    </select>
  `;
}

function renderSubjectCards() {
  elements.subjectGrid.innerHTML = getAllSubjects().map((subject) => {
    const best = progress.bestBySubject[subject.name];
    const unlocked = unlockedLevels[subject.name] || 1;

    return `
      <button class="selection-card subject-card" type="button" data-subject="${escapeHtml(subject.name)}">
        <span class="card-icon" style="--accent: ${subject.color}">${escapeHtml(subject.icon)}</span>
        <span class="card-title">${escapeHtml(subject.name)}</span>
        <span class="card-text">${escapeHtml(subject.description)}</span>
        <span class="card-meta">
          <span>Level ${unlocked}/3 unlocked</span>
          <span>${best ? `${best.percentage}% best` : "No score yet"}</span>
        </span>
      </button>
    `;
  }).join("");

  $$("#subject-grid .selection-card").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedSubject = getAllSubjects().find((subject) => subject.name === button.dataset.subject);
      state.selectedMode = null;
      state.selectedDifficulty = null;
      showScreen("mode-screen");
    });
  });
}

function renderModeCards() {
  const subjectName = state.selectedSubject ? state.selectedSubject.name : "Choose a subject";
  elements.modeSubjectLabel.textContent = subjectName;

  elements.modeGrid.innerHTML = GAME_MODES.map((mode) => {
    const best = progress.bestByMode[mode.id];

    return `
      <button class="selection-card mode-card" type="button" data-mode="${mode.id}">
        <span class="card-icon mode-icon">${escapeHtml(mode.icon)}</span>
        <span class="card-title">${escapeHtml(mode.title)}</span>
        <span class="card-text">${escapeHtml(mode.description)}</span>
        <span class="card-meta">
          <span>${best ? `${best.percentage}% best` : "Ready"}</span>
          <span>${availableCount(mode.id)} items</span>
        </span>
      </button>
    `;
  }).join("");

  $$("#mode-grid .selection-card").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMode = GAME_MODES.find((mode) => mode.id === button.dataset.mode);
      state.selectedDifficulty = null;
      showScreen("difficulty-screen");
    });
  });
}

function renderDifficultyCards() {
  const isLevelMode = state.selectedMode.id === "level";
  elements.difficultyTitle.textContent = isLevelMode ? "Choose an unlocked level" : "Choose a difficulty";
  elements.difficultyPathLabel.textContent = `${state.selectedSubject.name} / ${state.selectedMode.title}`;

  const unlockedLevel = unlockedLevels[state.selectedSubject.name] || 1;
  elements.unlockNote.textContent = isLevelMode
    ? "Score at least 70% in a level to unlock the next one."
    : "Beginner, intermediate, and advanced content is available for this mode.";

  elements.difficultyGrid.innerHTML = DIFFICULTIES.map((difficulty) => {
    const locked = isLevelMode && difficulty.level > unlockedLevel;
    const count = getQuestionsForSelection(difficulty.id).length;
    const title = isLevelMode ? `Level ${difficulty.level}: ${difficulty.title}` : difficulty.title;

    return `
      <button class="selection-card difficulty-card ${locked ? "locked" : ""}" type="button"
        data-difficulty="${difficulty.id}" ${locked ? "disabled" : ""}>
        <span class="difficulty-badge">${escapeHtml(isLevelMode ? `Level ${difficulty.level}` : difficulty.title)}</span>
        <span class="card-title">${escapeHtml(title)}</span>
        <span class="card-text">${escapeHtml(difficulty.description)}</span>
        <span class="card-meta">
          <span>${count} items</span>
          <span>${locked ? "Locked" : "Unlocked"}</span>
        </span>
      </button>
    `;
  }).join("");

  $$("#difficulty-grid .selection-card:not(:disabled)").forEach((button) => {
    button.addEventListener("click", () => {
      const difficulty = DIFFICULTIES.find((item) => item.id === button.dataset.difficulty);
      state.selectedDifficulty = difficulty;
      state.selectedLevel = difficulty.level;
      startGame();
    });
  });
}

async function saveSubject(event) {
  event.preventDefault();

  if (!canManageContent()) {
    $("#subject-message").textContent = "Only admins and teachers can create subjects.";
    return;
  }

  const name = $("#subject-name").value.trim();
  const icon = $("#subject-icon").value.trim().toUpperCase();
  const color = $("#subject-color").value || "#4F46E5";
  const description = $("#subject-description").value.trim();

  try {
    await setDoc(doc(db, "subjects", slugify(name)), {
      name,
      icon: icon || name.split(/\s+/).map((part) => part.charAt(0)).join("").slice(0, 4).toUpperCase(),
      color,
      description,
      createdBy: currentUser.uid,
      updatedAt: serverTimestamp()
    }, { merge: true });

    $("#subject-form").reset();
    $("#subject-color").value = "#4F46E5";
    $("#subject-message").textContent = "Subject saved to Firestore.";
  } catch (error) {
    $("#subject-message").textContent = error.message;
  }
}

async function saveLesson(event) {
  event.preventDefault();

  if (!canManageContent()) {
    $("#lesson-message").textContent = "Only admins and teachers can create lessons.";
    return;
  }

  const mediaFile = $("#lesson-media").files[0];
  let mediaUrl = "";
  let mediaPath = "";

  try {
    if (mediaFile) {
      mediaPath = `lessons/${currentUser.uid}/${Date.now()}-${mediaFile.name}`;
      const mediaRef = ref(storage, mediaPath);
      await uploadBytes(mediaRef, mediaFile);
      mediaUrl = await getDownloadURL(mediaRef);
    }

    await addDoc(collection(db, "lessons"), {
      subject: $("#lesson-subject").value,
      title: $("#lesson-title").value.trim(),
      difficulty: $("#lesson-difficulty").value,
      content: $("#lesson-content").value.trim(),
      mediaUrl,
      mediaPath,
      teacherId: currentUser.uid,
      teacherName: currentProfile.name || currentUser.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      published: true
    });

    $("#lesson-form").reset();
    $("#lesson-message").textContent = "Lesson saved to Firestore.";
  } catch (error) {
    $("#lesson-message").textContent = error.message;
  }
}

async function saveQuizQuestion(event) {
  event.preventDefault();

  if (!canManageContent()) {
    $("#quiz-message").textContent = "Only admins and teachers can create quizzes.";
    return;
  }

  try {
    const gameType = $("#quiz-game-type").value;
    const options = $("#quiz-options").value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const rawAnswer = $("#quiz-answer").value.trim();

    await addDoc(collection(db, "quizzes"), {
      subject: $("#quiz-subject").value,
      gameType,
      difficulty: $("#quiz-difficulty").value,
      question: $("#quiz-question").value.trim(),
      options,
      correctAnswer: gameType === "trueFalse" ? String(rawAnswer).toLowerCase() === "true" : rawAnswer,
      explanation: $("#quiz-explanation").value.trim(),
      timeLimit: gameType === "timed" ? Number(settings.timerSeconds) : null,
      teacherId: currentUser.uid,
      teacherName: currentProfile.name || currentUser.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      published: true
    });

    $("#quiz-form").reset();
    $("#quiz-message").textContent = "Quiz question saved to Firestore.";
  } catch (error) {
    $("#quiz-message").textContent = error.message;
  }
}

async function saveBadge(event) {
  event.preventDefault();

  if (!currentProfile || currentProfile.role !== "admin") {
    $("#badge-message").textContent = "Only admins can manage badges.";
    return;
  }

  try {
    const badgeId = slugify($("#badge-id").value.trim() || $("#badge-name").value.trim());
    await setDoc(doc(db, "badges", badgeId), {
      id: badgeId,
      name: $("#badge-name").value.trim(),
      description: $("#badge-description").value.trim(),
      xpBonus: Number($("#badge-xp").value) || 0,
      active: true,
      createdBy: currentUser.uid,
      updatedAt: serverTimestamp()
    }, { merge: true });

    $("#badge-form").reset();
    $("#badge-message").textContent = "Badge saved to Firestore.";
  } catch (error) {
    $("#badge-message").textContent = error.message;
  }
}

function canManageContent() {
  return currentProfile && ["admin", "teacher"].includes(currentProfile.role);
}

function listenSubjectCatalog(containerId, editable) {
  const subjectsQuery = query(collection(db, "subjects"), orderBy("name", "asc"), limit(100));
  const unsubscribe = onSnapshot(subjectsQuery, (snapshot) => {
    const subjects = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    const container = $(`#${containerId}`);

    container.innerHTML = subjects.length
      ? subjects.map((subject) => `
        <article class="history-card">
          <div>
            <h3>${escapeHtml(subject.name || subject.id)}</h3>
            <p>${escapeHtml(subject.description || "No description yet.")}</p>
          </div>
          ${editable ? `<button class="danger-btn compact-btn" type="button" data-delete-subject="${subject.id}">Delete</button>` : ""}
        </article>
      `).join("")
      : emptyState("No cloud subjects yet. Seed starter content or create one.");

    $$("[data-delete-subject]").forEach((button) => {
      button.addEventListener("click", async () => {
        await deleteDoc(doc(db, "subjects", button.dataset.deleteSubject));
      });
    });
  });

  unsubscribers.push(unsubscribe);
}

function listenQuizzes(containerId, editable) {
  const quizzesQuery = query(collection(db, "quizzes"), orderBy("createdAt", "desc"), limit(50));
  const unsubscribe = onSnapshot(quizzesQuery, (snapshot) => {
    const quizzes = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    const container = $(`#${containerId}`);

    container.innerHTML = quizzes.length
      ? quizzes.map((quiz) => {
        const canEdit = editable && (currentProfile.role === "admin" || quiz.teacherId === currentUser.uid);

        return `
          <article class="lesson-card">
            <div>
              <span class="difficulty-badge">${escapeHtml(quiz.difficulty || "level")}</span>
              <h3>${escapeHtml(truncateText(quiz.question || "Untitled quiz", 80))}</h3>
              <p>${escapeHtml(quiz.subject || "")} / ${escapeHtml(quiz.gameType || "quiz")} / ${escapeHtml(quiz.teacherName || "Teacher")}</p>
              <small>${escapeHtml(truncateText(quiz.explanation || "No explanation yet.", 140))}</small>
            </div>
            ${canEdit ? `<button class="danger-btn compact-btn" type="button" data-delete-quiz="${quiz.id}">Delete</button>` : ""}
          </article>
        `;
      }).join("")
      : emptyState("No Firestore quiz questions yet.");

    $$("[data-delete-quiz]").forEach((button) => {
      button.addEventListener("click", async () => {
        await deleteDoc(doc(db, "quizzes", button.dataset.deleteQuiz));
      });
    });
  });

  unsubscribers.push(unsubscribe);
}

function listenBadgeCatalog(containerId, editable) {
  const badgesQuery = query(collection(db, "badges"), orderBy("name", "asc"), limit(100));
  const unsubscribe = onSnapshot(badgesQuery, (snapshot) => {
    const badges = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    const container = $(`#${containerId}`);

    container.innerHTML = badges.length
      ? badges.map((badge) => `
        <article class="badge-card earned">
          <span>${badge.active === false ? "Hidden" : "Active"}</span>
          <strong>${escapeHtml(badge.name || badge.id)}</strong>
          <small>${escapeHtml(badge.description || "")}</small>
          ${editable ? `<button class="danger-btn compact-btn" type="button" data-delete-badge="${badge.id}">Delete</button>` : ""}
        </article>
      `).join("")
      : emptyState("No cloud badges yet. Seed starter content or create a badge.");

    $$("[data-delete-badge]").forEach((button) => {
      button.addEventListener("click", async () => {
        await deleteDoc(doc(db, "badges", button.dataset.deleteBadge));
      });
    });
  });

  unsubscribers.push(unsubscribe);
}

function listenUsersForAdmin() {
  const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(50));
  const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
    const users = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    $("#admin-overview").innerHTML = `
      <div class="stat-card"><span>Total Users</span><strong>${users.length}</strong></div>
      <div class="stat-card"><span>Teachers</span><strong>${users.filter((user) => user.role === "teacher").length}</strong></div>
      <div class="stat-card"><span>Students</span><strong>${users.filter((user) => user.role === "student").length}</strong></div>
      <div class="stat-card"><span>Admins</span><strong>${users.filter((user) => user.role === "admin").length}</strong></div>
    `;

    $("#admin-users-table").innerHTML = `
      <table>
        <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Requested</th><th>Action</th></tr></thead>
        <tbody>
          ${users.map((user) => `
            <tr>
              <td>${escapeHtml(user.name || "User")}</td>
              <td>${escapeHtml(user.email || "")}</td>
              <td>
                <select data-role-user="${user.uid}">
                  ${["student", "teacher", "admin"].map((role) => `
                    <option value="${role}" ${user.role === role ? "selected" : ""}>${role}</option>
                  `).join("")}
                </select>
              </td>
              <td>${escapeHtml(user.requestedRole || "-")}</td>
              <td><button class="secondary-btn compact-btn" type="button" data-save-role="${user.uid}">Save</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    $$("[data-save-role]").forEach((button) => {
      button.addEventListener("click", async () => {
        const uid = button.dataset.saveRole;
        const role = $(`[data-role-user="${uid}"]`).value;
        await updateDoc(doc(db, "users", uid), {
          role,
          updatedAt: serverTimestamp()
        });
      });
    });
  });

  unsubscribers.push(unsubscribe);
}

function listenAttemptsForAnalytics() {
  const attemptsQuery = query(collection(db, "quizAttempts"), orderBy("createdAt", "desc"), limit(30));
  const unsubscribe = onSnapshot(attemptsQuery, (snapshot) => {
    const attempts = snapshot.docs.map((item) => item.data());
    const subjectCounts = attempts.reduce((totals, attempt) => {
      totals[attempt.subject] = (totals[attempt.subject] || 0) + 1;
      return totals;
    }, {});
    const topSubjects = Object.entries(subjectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    $("#admin-analytics-list").innerHTML = attempts.length
      ? `
        ${topSubjects.map(([subject, count]) => `
          <article class="history-card"><div><h3>${escapeHtml(subject)}</h3><p>Most attempted subject</p></div><strong>${count}</strong></article>
        `).join("")}
        <button class="secondary-btn" id="export-report-btn" type="button">Download Report</button>
      `
      : emptyState("No quiz attempts have synced yet.");

    const exportButton = $("#export-report-btn");
    if (exportButton) {
      exportButton.addEventListener("click", () => downloadReport(attempts));
    }
  });

  unsubscribers.push(unsubscribe);
}

function listenLessons(containerId, editable) {
  const lessonsQuery = query(collection(db, "lessons"), orderBy("createdAt", "desc"), limit(30));
  const unsubscribe = onSnapshot(lessonsQuery, (snapshot) => {
    const lessons = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    const container = $(`#${containerId}`);
    const completedLessons = new Set(currentProfile?.progress?.completedLessons || []);

    container.innerHTML = lessons.length
      ? lessons.map((lesson) => `
        <article class="lesson-card">
          <div>
            <span class="difficulty-badge">${escapeHtml(lesson.difficulty || "level")}</span>
            <h3>${escapeHtml(lesson.title || "Untitled lesson")}</h3>
            <p>${escapeHtml(lesson.subject || "")} / ${escapeHtml(lesson.teacherName || "Teacher")}</p>
            <small>${escapeHtml(truncateText(lesson.content || "", 160))}</small>
            ${lesson.mediaUrl ? `<a class="resource-link" href="${escapeHtml(lesson.mediaUrl)}" target="_blank" rel="noreferrer">Open resource</a>` : ""}
          </div>
          ${editable && (currentProfile.role === "admin" || lesson.teacherId === currentUser.uid) ? `
            <button class="danger-btn compact-btn" type="button" data-delete-lesson="${lesson.id}">Delete</button>
          ` : ""}
          ${!editable ? `
            <button class="${completedLessons.has(lesson.id) ? "ghost-btn" : "primary-btn"} compact-btn" type="button" data-complete-lesson="${lesson.id}" ${completedLessons.has(lesson.id) ? "disabled" : ""}>
              ${completedLessons.has(lesson.id) ? "Completed" : "Complete +25 XP"}
            </button>
          ` : ""}
        </article>
      `).join("")
      : emptyState("No lessons have been published yet.");

    $$("[data-delete-lesson]").forEach((button) => {
      button.addEventListener("click", async () => {
        await deleteDoc(doc(db, "lessons", button.dataset.deleteLesson));
      });
    });

    $$("[data-complete-lesson]").forEach((button) => {
      button.addEventListener("click", () => completeLesson(button.dataset.completeLesson, lessons.find((lesson) => lesson.id === button.dataset.completeLesson)));
    });
  });

  unsubscribers.push(unsubscribe);
}

function listenTeacherAttempts() {
  const attemptsQuery = query(collection(db, "quizAttempts"), orderBy("createdAt", "desc"), limit(25));
  const unsubscribe = onSnapshot(attemptsQuery, (snapshot) => {
    const attempts = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    $("#teacher-attempts-list").innerHTML = attempts.length
      ? attempts.map((attempt) => `
        <article class="teacher-attempt-card">
          <div>
            <h3>${escapeHtml(attempt.studentName || "Student")}</h3>
            <p>${escapeHtml(attempt.subject)} / ${escapeHtml(attempt.mode)}</p>
            <small>${attempt.percentage}% / ${attempt.score} pts</small>
          </div>
          <div class="feedback-compose">
            <textarea data-feedback-text="${attempt.id}" placeholder="Write feedback for this student"></textarea>
            <button class="secondary-btn compact-btn" type="button" data-send-feedback="${attempt.id}">Send Feedback</button>
          </div>
        </article>
      `).join("")
      : emptyState("Student quiz attempts will appear here in real time.");

    $$("[data-send-feedback]").forEach((button) => {
      button.addEventListener("click", () => sendTeacherFeedback(button.dataset.sendFeedback, attempts.find((attempt) => attempt.id === button.dataset.sendFeedback)));
    });
  });

  unsubscribers.push(unsubscribe);
}

function listenLeaderboard(range = "overall") {
  if (!db) {
    elements.leaderboardList.innerHTML = emptyState("Connect Firebase to enable realtime leaderboards.");
    return;
  }

  clearRealtimeListeners("leaderboard");
  const boardQuery = query(collection(db, "leaderboards"), where("range", "==", range), orderBy("xp", "desc"), limit(20));
  const unsubscribe = onSnapshot(boardQuery, (snapshot) => {
    const rows = snapshot.docs
      .map((item) => item.data())
      .map((row, index) => ({ rank: index + 1, ...row }));
    elements.leaderboardList.innerHTML = rows.length
      ? rows.map((row) => `
        <article class="score-card">
          <span class="rank">#${row.rank}</span>
          <div>
            <h2>${escapeHtml(row.name || "Learner")}</h2>
            <p>${escapeHtml(row.role || "student")} / ${escapeHtml(row.lastSubject || "All subjects")}</p>
          </div>
          <div class="score-value">
            <strong>${row.xp || 0} XP</strong>
            <span>${row.bestPercentage || 0}% best</span>
          </div>
        </article>
      `).join("")
      : emptyState("No leaderboard entries yet.");
  });

  unsubscribe.scope = "leaderboard";
  unsubscribers.push(unsubscribe);
}

async function completeLesson(lessonId, lesson) {
  if (!db || !currentUser || !currentProfile || !lesson) {
    return;
  }

  const completedLessons = new Set(currentProfile.progress?.completedLessons || []);

  if (completedLessons.has(lessonId)) {
    return;
  }

  completedLessons.add(lessonId);

  try {
    await setDoc(doc(db, "lessonCompletions", `${currentUser.uid}_${lessonId}`), {
      uid: currentUser.uid,
      studentName: currentProfile.name || currentUser.email,
      lessonId,
      lessonTitle: lesson.title,
      subject: lesson.subject,
      teacherId: lesson.teacherId || "",
      xpEarned: 25,
      createdAt: serverTimestamp()
    }, { merge: true });

    await updateDoc(doc(db, "users", currentUser.uid), {
      "progress.totalXP": increment(25),
      "progress.lessonsCompleted": increment(1),
      "progress.completedLessons": [...completedLessons],
      updatedAt: serverTimestamp()
    });

    await setDoc(doc(db, "progress", currentUser.uid), {
      uid: currentUser.uid,
      totalXP: increment(25),
      lessonsCompleted: increment(1),
      completedLessons: [...completedLessons],
      lastLesson: {
        lessonId,
        title: lesson.title,
        subject: lesson.subject
      },
      updatedAt: serverTimestamp()
    }, { merge: true });

    currentProfile = await ensureUserProfile(currentUser);
    await awardCloudBadgeIfNeeded("course-master", Number(currentProfile.progress?.lessonsCompleted || 0) >= 5);
    await maybeIssueLessonCertificate(lesson);
    renderStudentDashboard();
    updateHeaderStats();
  } catch (error) {
    window.alert(error.message);
  }
}

async function awardCloudBadgeIfNeeded(badgeId, condition) {
  if (!condition || !db || !currentUser || !currentProfile) {
    return;
  }

  const badges = new Set(currentProfile.progress?.badges || []);

  if (badges.has(badgeId)) {
    return;
  }

  const badge = BADGE_DEFINITIONS.find((item) => item.id === badgeId) || {
    id: badgeId,
    name: badgeId,
    description: "Achievement unlocked."
  };
  badges.add(badgeId);

  await setDoc(doc(db, "users", currentUser.uid, "badges", badgeId), {
    id: badge.id,
    name: badge.name,
    description: badge.description,
    earnedAt: serverTimestamp(),
    source: "lesson-completion"
  }, { merge: true });

  await updateDoc(doc(db, "users", currentUser.uid), {
    "progress.badges": [...badges],
    updatedAt: serverTimestamp()
  });

  await setDoc(doc(db, "progress", currentUser.uid), {
    badges: [...badges],
    updatedAt: serverTimestamp()
  }, { merge: true });

  currentProfile.progress = {
    ...(currentProfile.progress || {}),
    badges: [...badges]
  };
}

async function sendTeacherFeedback(attemptId, attempt) {
  const input = $(`[data-feedback-text="${attemptId}"]`);
  const message = input?.value.trim();

  if (!message || !attempt) {
    return;
  }

  try {
    await addDoc(collection(db, "feedback"), {
      attemptId,
      studentId: attempt.studentId,
      studentName: attempt.studentName || "Student",
      teacherId: currentUser.uid,
      teacherName: currentProfile.name || currentUser.email,
      message,
      subject: attempt.subject,
      mode: attempt.mode,
      createdAt: serverTimestamp()
    });

    input.value = "";
  } catch (error) {
    window.alert(error.message);
  }
}

function listenStudentFeedback() {
  const feedbackQuery = query(collection(db, "feedback"), orderBy("createdAt", "desc"), limit(50));
  const unsubscribe = onSnapshot(feedbackQuery, (snapshot) => {
    const feedback = snapshot.docs
      .map((item) => item.data())
      .filter((item) => item.studentId === currentUser.uid)
      .slice(0, 10);

    $("#student-feedback-list").innerHTML = feedback.length
      ? feedback.map((item) => `
        <article class="history-card">
          <div>
            <h3>${escapeHtml(item.teacherName || "Teacher")}</h3>
            <p>${escapeHtml(item.subject || "")} / ${escapeHtml(item.mode || "")}</p>
            <small>${escapeHtml(item.message || "")}</small>
          </div>
        </article>
      `).join("")
      : emptyState("Teacher feedback will appear here after quiz reviews.");
  });

  unsubscribers.push(unsubscribe);
}

function listenStudentBadges() {
  const badgesQuery = query(collection(db, "badges"), orderBy("name", "asc"), limit(100));
  const unsubscribe = onSnapshot(badgesQuery, (snapshot) => {
    const cloudBadgeIds = new Set(currentProfile?.progress?.badges || []);
    const badges = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    $("#student-cloud-badges").innerHTML = badges.length
      ? badges.map((badge) => badgeMarkup({
        id: badge.id,
        name: badge.name,
        description: badge.description
      }, cloudBadgeIds.has(badge.id))).join("")
      : emptyState("Cloud badge catalog is empty. Ask an admin to seed starter content.");
  });

  unsubscribers.push(unsubscribe);
}

function renderLeaderboardButtons() {
  $$("[data-board-range]").forEach((button) => {
    const active = button.dataset.boardRange === activeLeaderboardRange;
    button.className = active ? "secondary-btn" : "ghost-btn";
  });
}

function clearRealtimeListeners(scope) {
  unsubscribers = unsubscribers.filter((unsubscribe) => {
    if (!scope || unsubscribe.scope === scope) {
      unsubscribe();
      return false;
    }

    return true;
  });
}

function availableCount(gameType) {
  if (!state.selectedSubject) {
    return 0;
  }

  return getAllQuestions().filter((question) => (
    question.subject === state.selectedSubject.name && question.gameType === gameType
  )).length;
}

function getQuestionsForSelection(difficultyId = state.selectedDifficulty?.id) {
  if (!state.selectedSubject || !state.selectedMode || !difficultyId) {
    return [];
  }

  return getAllQuestions().filter((question) => (
    question.subject === state.selectedSubject.name &&
    question.gameType === state.selectedMode.id &&
    question.difficulty === difficultyId
  ));
}

function getAllQuestions() {
  return [...QUESTION_BANK, ...cloudQuestions];
}

function getAllSubjects() {
  const merged = new Map();

  SUBJECTS.forEach((subject) => merged.set(subject.name, subject));
  cloudSubjects.forEach((subject) => merged.set(subject.name, {
    ...merged.get(subject.name),
    ...subject
  }));

  return Array.from(merged.values());
}

function startGame() {
  if (!state.selectedSubject || !state.selectedMode || !state.selectedDifficulty) {
    showScreen("subject-screen");
    return;
  }

  const questions = getQuestionsForSelection();
  const limit = ["matching", "memory", "zingo"].includes(state.selectedMode.id)
    ? questions.length
    : Math.min(settings.questionLimit, questions.length);

  state.activeQuestions = shuffle(questions).slice(0, limit);
  state.questionIndex = 0;
  state.score = 0;
  state.correctCount = 0;
  state.totalUnits = calculateTotalUnits(state.activeQuestions);
  state.answered = false;
  state.hintsUsed = 0;
  state.hintedQuestionIds = new Set();
  state.selectedTerm = null;
  state.matchedPairs = new Set();
  state.memoryFirstCard = null;
  state.memoryLock = false;
  state.wordPath = [];
  state.zingoCallIndex = 0;
  state.zingoCorrectTerms = new Set();
  state.startedAt = Date.now();

  if (!state.activeQuestions.length) {
    elements.gameArea.innerHTML = emptyState("No questions found for this selection.");
    return;
  }

  elements.gamePath.textContent = `${state.selectedSubject.name} / ${state.selectedMode.title} / ${state.selectedDifficulty.title}`;
  elements.gameTitle.textContent = state.selectedMode.title;
  showScreen("game-screen");
  renderCurrentQuestion();
}

function calculateTotalUnits(questions) {
  if (state.selectedMode?.id === "matching") {
    return questions.reduce((total, question) => total + question.pairs.length, 0);
  }

  if (state.selectedMode?.id === "memory") {
    return questions.reduce((total, question) => total + question.pairs.length, 0);
  }

  if (state.selectedMode?.id === "zingo") {
    return questions.reduce((total, question) => total + question.calls.length, 0);
  }

  return questions.length;
}

function renderCurrentQuestion() {
  stopTimer();
  state.answered = false;
  state.selectedTerm = null;
  state.memoryFirstCard = null;
  state.memoryLock = false;
  state.wordPath = [];
  elements.feedbackBox.innerHTML = "";
  elements.feedbackBox.className = "feedback-box";
  elements.nextBtn.disabled = true;
  elements.nextBtn.textContent = isLastQuestion() ? "Finish" : "Next";
  elements.hintBtn.hidden = state.selectedMode.id === "flashcard";
  elements.hintBtn.disabled = false;

  const question = state.activeQuestions[state.questionIndex];
  updateLiveStats();

  if (state.selectedMode.id === "mcq" || state.selectedMode.id === "timed" || state.selectedMode.id === "level") {
    renderChoiceQuestion(question);
  }

  if (state.selectedMode.id === "trueFalse") {
    renderTrueFalseQuestion(question);
  }

  if (state.selectedMode.id === "fillBlank") {
    renderInputQuestion(question, "fill");
  }

  if (state.selectedMode.id === "matching") {
    renderMatchingQuestion(question);
  }

  if (state.selectedMode.id === "flashcard") {
    renderFlashcard(question);
  }

  if (state.selectedMode.id === "scramble") {
    renderInputQuestion(question, "scramble");
  }

  if (state.selectedMode.id === "memory") {
    renderMemoryQuestion(question);
  }

  if (state.selectedMode.id === "wordHunt") {
    renderWordHuntQuestion(question);
  }

  if (state.selectedMode.id === "wordBuilder") {
    renderWordBuilderQuestion(question);
  }

  if (state.selectedMode.id === "zingo") {
    renderZingoQuestion(question);
  }

  if (state.selectedMode.id === "charades") {
    renderCreativePrompt(question, "charades");
  }

  if (state.selectedMode.id === "drawGuess") {
    renderCreativePrompt(question, "drawGuess");
  }
}

function renderChoiceQuestion(question) {
  elements.gameArea.innerHTML = `
    <div class="question-block">
      <span class="question-kicker">Question ${state.questionIndex + 1}</span>
      <h2>${escapeHtml(question.question)}</h2>
    </div>
    <div class="answer-grid">
      ${shuffle(question.options).map((option) => `
        <button class="answer-btn" type="button" data-answer="${escapeHtml(option)}">
          ${escapeHtml(option)}
        </button>
      `).join("")}
    </div>
  `;

  $$(".answer-btn").forEach((button) => {
    button.addEventListener("click", () => handleChoiceAnswer(button, question.correctAnswer));
  });

  if (state.selectedMode.id === "timed") {
    startTimer(Number(question.timeLimit) || settings.timerSeconds);
  } else {
    elements.timerPill.hidden = true;
  }
}

function renderTrueFalseQuestion(question) {
  elements.timerPill.hidden = true;
  elements.gameArea.innerHTML = `
    <div class="question-block">
      <span class="question-kicker">True or false</span>
      <h2>${escapeHtml(question.question)}</h2>
    </div>
    <div class="answer-grid two-options">
      <button class="answer-btn" type="button" data-answer="true">True</button>
      <button class="answer-btn" type="button" data-answer="false">False</button>
    </div>
  `;

  $$(".answer-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.dataset.answer === "true";
      handleBooleanAnswer(button, selected, question.correctAnswer);
    });
  });
}

function renderInputQuestion(question, kind) {
  elements.timerPill.hidden = true;
  const isScramble = kind === "scramble";
  const prompt = isScramble
    ? `Unscramble this word: ${question.scrambledWord}`
    : question.question;

  elements.gameArea.innerHTML = `
    <form class="input-challenge" id="input-form">
      <div class="question-block">
        <span class="question-kicker">${isScramble ? "Word scramble" : "Fill in the blank"}</span>
        <h2>${escapeHtml(prompt)}</h2>
      </div>
      <label class="sr-only" for="answer-input">Your answer</label>
      <input id="answer-input" type="text" autocomplete="off" placeholder="Type your answer" required>
      <button class="primary-btn" type="submit">Check Answer</button>
    </form>
  `;

  $("#answer-input").focus();
  $("#input-form").addEventListener("submit", (event) => {
    event.preventDefault();
    handleInputAnswer($("#answer-input").value, question.correctAnswer);
  });
}

function renderMatchingQuestion(question) {
  elements.timerPill.hidden = true;
  elements.hintBtn.disabled = false;
  state.matchedPairs = new Set();

  const terms = question.pairs.map((pair) => pair.term);
  const matches = shuffle(question.pairs.map((pair) => pair.match));

  elements.gameArea.innerHTML = `
    <div class="question-block">
      <span class="question-kicker">Match the pairs</span>
      <h2>Pair each term with its meaning.</h2>
    </div>
    <div class="matching-board">
      <div class="match-column" aria-label="Terms">
        ${terms.map((term) => `
          <button class="match-card term-card" type="button" data-term="${escapeHtml(term)}">
            ${escapeHtml(term)}
          </button>
        `).join("")}
      </div>
      <div class="match-column" aria-label="Definitions">
        ${matches.map((match) => `
          <button class="match-card match-answer" type="button" data-match="${escapeHtml(match)}">
            ${escapeHtml(match)}
          </button>
        `).join("")}
      </div>
    </div>
  `;

  $$(".term-card").forEach((button) => {
    button.addEventListener("click", () => selectTerm(button));
  });

  $$(".match-answer").forEach((button) => {
    button.addEventListener("click", () => selectMatch(button, question));
  });
}

function renderFlashcard(question) {
  elements.timerPill.hidden = true;
  elements.gameArea.innerHTML = `
    <div class="flashcard-wrap">
      <button class="flashcard" id="flashcard" type="button" aria-pressed="false">
        <span class="flashcard-face flashcard-front">
          <span class="question-kicker">Front</span>
          <strong>${escapeHtml(question.front)}</strong>
        </span>
        <span class="flashcard-face flashcard-back">
          <span class="question-kicker">Back</span>
          <strong>${escapeHtml(question.back)}</strong>
        </span>
      </button>
      <div class="flashcard-actions">
        <button class="secondary-btn" id="study-again-btn" type="button">Study Again</button>
        <button class="primary-btn" id="knew-it-btn" type="button">I Knew It</button>
      </div>
    </div>
  `;

  $("#flashcard").addEventListener("click", (event) => {
    const card = event.currentTarget;
    const flipped = card.classList.toggle("flipped");
    card.setAttribute("aria-pressed", String(flipped));
  });

  $("#study-again-btn").addEventListener("click", () => handleFlashcard(false, question));
  $("#knew-it-btn").addEventListener("click", () => handleFlashcard(true, question));
}

function renderMemoryQuestion(question) {
  elements.timerPill.hidden = true;
  state.matchedPairs = new Set();

  const cards = shuffle(question.pairs.flatMap((pair, index) => ([
    { pairIndex: index, text: pair.term, kind: "term" },
    { pairIndex: index, text: pair.match, kind: "match" }
  ])));

  elements.gameArea.innerHTML = `
    <div class="question-block">
      <span class="question-kicker">Memory match</span>
      <h2>Flip two cards and match each term to its meaning.</h2>
    </div>
    <div class="memory-board">
      ${cards.map((card, index) => `
        <button class="memory-card" type="button" data-card="${index}" data-pair="${card.pairIndex}" data-kind="${card.kind}">
          <span class="memory-back">?</span>
          <span class="memory-front">${escapeHtml(card.text)}</span>
        </button>
      `).join("")}
    </div>
  `;

  $$(".memory-card").forEach((button) => {
    button.addEventListener("click", () => handleMemoryCard(button, question));
  });
}

function renderWordHuntQuestion(question) {
  elements.timerPill.hidden = true;
  state.wordPath = [];

  elements.gameArea.innerHTML = `
    <div class="question-block">
      <span class="question-kicker">Boggle word hunt</span>
      <h2>Find the hidden ${question.targetWord.length}-letter term in the grid.</h2>
      <p class="hint-line">Use Hint for the clue, then tap letters in order.</p>
    </div>
    <div class="word-hunt-layout">
      <div class="letter-grid">
        ${question.letters.map((letter, index) => `
          <button class="letter-cell" type="button" data-index="${index}" data-letter="${letter}">${letter}</button>
        `).join("")}
      </div>
      <div class="word-panel">
        <span>Selected word</span>
        <strong id="selected-word">-</strong>
        <div class="mini-actions">
          <button class="secondary-btn" id="clear-word-btn" type="button">Clear</button>
          <button class="primary-btn" id="submit-word-btn" type="button">Submit</button>
        </div>
      </div>
    </div>
  `;

  $$(".letter-cell").forEach((button) => {
    button.addEventListener("click", () => selectWordHuntLetter(button));
  });
  $("#clear-word-btn").addEventListener("click", clearWordHuntSelection);
  $("#submit-word-btn").addEventListener("click", () => submitWordHunt(question));
}

function renderWordBuilderQuestion(question) {
  elements.timerPill.hidden = true;

  elements.gameArea.innerHTML = `
    <div class="question-block">
      <span class="question-kicker">Scrabble word builder</span>
      <h2>Build the subject term from these tiles.</h2>
      <p class="hint-line">${normalizeAnswer(question.correctAnswer).length} letters. Use Hint for the clue.</p>
    </div>
    <div class="builder-panel">
      <div class="built-word" id="built-word" aria-live="polite"></div>
      <div class="tile-rack">
        ${question.letters.map((letter, index) => `
          <button class="letter-tile" type="button" data-index="${index}" data-letter="${letter}">${letter}</button>
        `).join("")}
      </div>
      <div class="mini-actions">
        <button class="secondary-btn" id="backspace-tile-btn" type="button">Backspace</button>
        <button class="secondary-btn" id="clear-tiles-btn" type="button">Clear</button>
        <button class="primary-btn" id="check-tiles-btn" type="button">Check</button>
      </div>
    </div>
  `;

  const built = [];
  const updateBuiltWord = () => {
    $("#built-word").textContent = built.length ? built.map((item) => item.letter).join("") : "Tap tiles to build";
  };

  $$(".letter-tile").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.answered || button.disabled) {
        return;
      }

      built.push({ letter: button.dataset.letter, index: button.dataset.index });
      button.disabled = true;
      button.classList.add("used");
      updateBuiltWord();
    });
  });

  $("#backspace-tile-btn").addEventListener("click", () => {
    if (!built.length || state.answered) {
      return;
    }

    const last = built.pop();
    const tile = $(`.letter-tile[data-index="${last.index}"]`);
    tile.disabled = false;
    tile.classList.remove("used");
    updateBuiltWord();
  });

  $("#clear-tiles-btn").addEventListener("click", () => {
    if (state.answered) {
      return;
    }

    built.length = 0;
    $$(".letter-tile").forEach((tile) => {
      tile.disabled = false;
      tile.classList.remove("used");
    });
    updateBuiltWord();
  });

  $("#check-tiles-btn").addEventListener("click", () => {
    submitBuiltWord(built.map((item) => item.letter).join(""), question);
  });

  updateBuiltWord();
}

function renderZingoQuestion(question) {
  elements.timerPill.hidden = true;
  state.zingoCallIndex = 0;
  state.zingoCorrectTerms = new Set();

  elements.gameArea.innerHTML = `
    <div class="question-block">
      <span class="question-kicker">Zingo bingo</span>
      <h2>Read the clue, then mark the matching tile.</h2>
    </div>
    <div class="zingo-layout">
      <div class="zingo-callout">
        <span>Current clue</span>
        <strong id="zingo-clue"></strong>
      </div>
      <div class="zingo-board">
        ${question.tiles.map((tile) => `
          <button class="zingo-tile" type="button" data-term="${escapeHtml(tile)}">${escapeHtml(tile)}</button>
        `).join("")}
      </div>
    </div>
  `;

  updateZingoClue(question);
  $$(".zingo-tile").forEach((button) => {
    button.addEventListener("click", () => handleZingoTile(button, question));
  });
}

function renderCreativePrompt(question, kind) {
  elements.timerPill.hidden = true;
  const isDrawing = kind === "drawGuess";
  const title = isDrawing ? "Pictionary draw" : "Charades prompt";
  const helper = isDrawing
    ? "Sketch your clue, reveal the answer, then self-score honestly."
    : "Act it out or explain it aloud, reveal the answer, then self-score honestly.";

  elements.gameArea.innerHTML = `
    <div class="creative-game">
      <div class="question-block">
        <span class="question-kicker">${title}</span>
        <h2>${escapeHtml(question.prompt)}</h2>
        <p class="hint-line">${helper}</p>
      </div>
      ${isDrawing ? `
        <div class="canvas-tools">
          <canvas id="draw-canvas" width="760" height="360" aria-label="Drawing canvas"></canvas>
          <button class="secondary-btn" id="clear-canvas-btn" type="button">Clear Drawing</button>
        </div>
      ` : `
        <div class="stage-card">
          <strong>60-second classroom round</strong>
          <span>No speaking the answer word. Use gestures, examples, or a quick story clue.</span>
        </div>
      `}
      <div class="answer-reveal" id="creative-answer" hidden>
        <span>Answer</span>
        <strong>${escapeHtml(question.correctAnswer)}</strong>
        <small>${escapeHtml(question.explanation)}</small>
      </div>
      <div class="mini-actions">
        <button class="secondary-btn" id="reveal-creative-btn" type="button">Reveal Answer</button>
        <button class="primary-btn" id="creative-correct-btn" type="button">I Got It</button>
        <button class="ghost-btn" id="creative-practice-btn" type="button">Need Practice</button>
      </div>
    </div>
  `;

  if (isDrawing) {
    initDrawingCanvas();
    $("#clear-canvas-btn").addEventListener("click", clearDrawingCanvas);
  }

  $("#reveal-creative-btn").addEventListener("click", () => {
    $("#creative-answer").hidden = false;
  });
  $("#creative-correct-btn").addEventListener("click", () => handleCreativeScore(true, question));
  $("#creative-practice-btn").addEventListener("click", () => handleCreativeScore(false, question));
}

function handleChoiceAnswer(button, correctAnswer) {
  if (state.answered) {
    return;
  }

  stopTimer();
  const selected = button.dataset.answer;
  const isCorrect = selected === correctAnswer;
  state.answered = true;

  $$(".answer-btn").forEach((answerButton) => {
    answerButton.disabled = true;

    if (answerButton.dataset.answer === correctAnswer) {
      answerButton.classList.add("correct");
    } else if (answerButton === button) {
      answerButton.classList.add("incorrect");
    }
  });

  if (isCorrect) {
    awardCorrect(state.selectedMode.id === "timed");
  }

  completeQuestionFeedback(isCorrect, correctAnswer);
}

function handleBooleanAnswer(button, selected, correctAnswer) {
  if (state.answered) {
    return;
  }

  const isCorrect = selected === correctAnswer;
  state.answered = true;

  $$(".answer-btn").forEach((answerButton) => {
    answerButton.disabled = true;

    if ((answerButton.dataset.answer === "true") === correctAnswer) {
      answerButton.classList.add("correct");
    } else if (answerButton === button) {
      answerButton.classList.add("incorrect");
    }
  });

  if (isCorrect) {
    awardCorrect(false);
  }

  completeQuestionFeedback(isCorrect, correctAnswer ? "True" : "False");
}

function handleInputAnswer(value, correctAnswer) {
  if (state.answered) {
    return;
  }

  const isCorrect = normalizeAnswer(value) === normalizeAnswer(correctAnswer);
  state.answered = true;
  $("#answer-input").disabled = true;
  $("#input-form .primary-btn").disabled = true;

  if (isCorrect) {
    awardCorrect(false);
  }

  completeQuestionFeedback(isCorrect, correctAnswer);
}

function handleFlashcard(knewIt, question) {
  if (state.answered) {
    return;
  }

  state.answered = true;
  $("#study-again-btn").disabled = true;
  $("#knew-it-btn").disabled = true;

  if (knewIt) {
    awardCorrect(false);
  }

  showFeedback(
    knewIt ? "success" : "warning",
    knewIt ? "Nice recall. +10 points." : "Marked for practice. No points added.",
    question.back
  );
  enableNext();
}

function selectTerm(button) {
  if (button.classList.contains("matched")) {
    return;
  }

  $$(".term-card").forEach((termButton) => termButton.classList.remove("selected"));
  button.classList.add("selected");
  state.selectedTerm = button.dataset.term;
}

function selectMatch(button, question) {
  if (!state.selectedTerm || button.classList.contains("matched")) {
    return;
  }

  const pair = question.pairs.find((item) => item.term === state.selectedTerm);
  const termButton = $(`.term-card[data-term="${cssEscape(state.selectedTerm)}"]`);
  const isCorrect = pair && pair.match === button.dataset.match;

  if (isCorrect) {
    termButton.classList.add("matched");
    button.classList.add("matched");
    termButton.disabled = true;
    button.disabled = true;
    state.matchedPairs.add(pair.term);
    awardCorrect(false);
    showFeedback("success", "Correct match. +10 points.", `${pair.term}: ${pair.match}`);

    if (state.matchedPairs.size === question.pairs.length) {
      state.answered = true;
      enableNext();
    }
  } else {
    termButton.classList.add("incorrect");
    button.classList.add("incorrect");
    showFeedback("error", "Not a match. Try another pair.", "Wrong answers add 0 points.");
    setTimeout(() => {
      termButton.classList.remove("incorrect");
      button.classList.remove("incorrect");
    }, 700);
  }

  termButton.classList.remove("selected");
  state.selectedTerm = null;
  updateLiveStats();
}

function handleMemoryCard(button, question) {
  if (state.memoryLock || state.answered || button.classList.contains("revealed") || button.classList.contains("matched")) {
    return;
  }

  button.classList.add("revealed");

  if (!state.memoryFirstCard) {
    state.memoryFirstCard = button;
    return;
  }

  const first = state.memoryFirstCard;
  const isMatch = first.dataset.pair === button.dataset.pair && first.dataset.kind !== button.dataset.kind;
  state.memoryLock = true;

  if (isMatch) {
    first.classList.add("matched");
    button.classList.add("matched");
    first.disabled = true;
    button.disabled = true;
    state.matchedPairs.add(first.dataset.pair);
    awardCorrect(false);
    showFeedback("success", "Memory match. +10 points.", "Nice recall under pressure.");

    if (state.matchedPairs.size === question.pairs.length) {
      state.answered = true;
      enableNext();
    }

    state.memoryFirstCard = null;
    state.memoryLock = false;
    updateLiveStats();
    return;
  }

  showFeedback("error", "Not a pair. Try to remember those cards.", "Wrong flips add 0 points.");
  setTimeout(() => {
    first.classList.remove("revealed");
    button.classList.remove("revealed");
    state.memoryFirstCard = null;
    state.memoryLock = false;
  }, 850);
}

function selectWordHuntLetter(button) {
  if (state.answered || button.classList.contains("selected")) {
    return;
  }

  button.classList.add("selected");
  state.wordPath.push({
    letter: button.dataset.letter,
    index: button.dataset.index
  });
  updateSelectedWord();
}

function clearWordHuntSelection() {
  if (state.answered) {
    return;
  }

  state.wordPath = [];
  $$(".letter-cell").forEach((button) => button.classList.remove("selected"));
  updateSelectedWord();
}

function updateSelectedWord() {
  const word = state.wordPath.map((item) => item.letter).join("");
  $("#selected-word").textContent = word || "-";
}

function submitWordHunt(question) {
  if (state.answered) {
    return;
  }

  const selectedWord = state.wordPath.map((item) => item.letter).join("");
  const isCorrect = normalizeAnswer(selectedWord) === normalizeAnswer(question.targetWord);
  state.answered = true;
  $$(".letter-cell").forEach((button) => {
    button.disabled = true;
  });

  if (isCorrect) {
    awardCorrect(false);
  }

  showFeedback(
    isCorrect ? "success" : "error",
    isCorrect ? "Word found. +10 points." : `Word not found. Answer: ${question.targetWord}.`,
    question.explanation
  );
  enableNext();
  updateLiveStats();
}

function submitBuiltWord(word, question) {
  if (state.answered) {
    return;
  }

  const isCorrect = normalizeAnswer(word) === normalizeAnswer(question.correctAnswer);
  state.answered = true;
  $$(".letter-tile").forEach((button) => {
    button.disabled = true;
  });
  $("#check-tiles-btn").disabled = true;

  if (isCorrect) {
    awardCorrect(false);
  }

  showFeedback(
    isCorrect ? "success" : "error",
    isCorrect ? "Built correctly. +10 points." : `Not quite. Answer: ${question.correctAnswer}.`,
    question.explanation
  );
  enableNext();
  updateLiveStats();
}

function updateZingoClue(question) {
  const call = question.calls[state.zingoCallIndex];
  $("#zingo-clue").textContent = call ? call.clue : "Board complete";
}

function handleZingoTile(button, question) {
  if (state.answered || button.classList.contains("marked")) {
    return;
  }

  const call = question.calls[state.zingoCallIndex];
  const isCorrect = call && button.dataset.term === call.term;

  if (!isCorrect) {
    button.classList.add("incorrect");
    showFeedback("error", "Wrong tile. Try the clue again.", "No points lost.");
    setTimeout(() => button.classList.remove("incorrect"), 700);
    return;
  }

  button.classList.add("marked");
  button.disabled = true;
  state.zingoCorrectTerms.add(call.term);
  state.zingoCallIndex += 1;
  awardCorrect(false);

  if (state.zingoCallIndex >= question.calls.length) {
    state.answered = true;
    showFeedback("success", "Zingo board complete. +10 points per clue.", question.explanation);
    enableNext();
  } else {
    showFeedback("success", "Correct tile. Next clue ready.", `${call.term}: ${call.clue}`);
    updateZingoClue(question);
  }

  updateLiveStats();
}

function handleCreativeScore(knewIt, question) {
  if (state.answered) {
    return;
  }

  state.answered = true;
  $("#creative-answer").hidden = false;
  $("#creative-correct-btn").disabled = true;
  $("#creative-practice-btn").disabled = true;

  if (knewIt) {
    awardCorrect(false);
  }

  showFeedback(
    knewIt ? "success" : "warning",
    knewIt ? "Creative round complete. +10 points." : "Saved for practice. No points added.",
    question.explanation
  );
  enableNext();
  updateLiveStats();
}

function initDrawingCanvas() {
  const canvas = $("#draw-canvas");
  const context = canvas.getContext("2d");
  let drawing = false;

  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 5;
  context.strokeStyle = getEffectiveTheme() === "dark" ? "#E5E7EB" : "#111827";

  const getPoint = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  canvas.addEventListener("pointerdown", (event) => {
    drawing = true;
    canvas.setPointerCapture(event.pointerId);
    const point = getPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!drawing) {
      return;
    }

    const point = getPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  });

  canvas.addEventListener("pointerup", () => {
    drawing = false;
  });

  canvas.addEventListener("pointercancel", () => {
    drawing = false;
  });
}

function clearDrawingCanvas() {
  const canvas = $("#draw-canvas");
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function completeQuestionFeedback(isCorrect, correctAnswer) {
  const question = state.activeQuestions[state.questionIndex];
  const points = state.selectedMode.id === "timed" && isCorrect
    ? POINTS.correct + POINTS.timedBonus
    : POINTS.correct;

  showFeedback(
    isCorrect ? "success" : "error",
    isCorrect ? `Correct. +${points} points.` : `Incorrect. Correct answer: ${correctAnswer}.`,
    question.explanation || "Review the answer and keep going."
  );
  enableNext();
  updateLiveStats();
}

function awardCorrect(includeTimedBonus) {
  state.correctCount += 1;
  state.score += POINTS.correct;

  if (includeTimedBonus) {
    state.score += POINTS.timedBonus;
  }

  updateLiveStats();
}

function useHint() {
  const question = state.activeQuestions[state.questionIndex];

  if (!question || state.answered || state.selectedMode.id === "flashcard") {
    return;
  }

  if (!state.hintedQuestionIds.has(question.id)) {
    state.hintedQuestionIds.add(question.id);
    state.hintsUsed += 1;
    state.score = Math.max(0, state.score - POINTS.hintPenalty);
  }

  showFeedback("warning", `Hint used. -${POINTS.hintPenalty} points.`, getHintText(question));
  updateLiveStats();
}

function getHintText(question) {
  if (question.hint) {
    return question.hint;
  }

  if (question.pairs) {
    return "Select one term first, then choose its closest definition.";
  }

  if (typeof question.correctAnswer === "string") {
    return `The answer starts with "${question.correctAnswer.charAt(0)}".`;
  }

  return question.explanation || "Read the statement carefully before answering.";
}

function enableNext() {
  elements.nextBtn.disabled = false;
  elements.hintBtn.disabled = true;
}

function advanceQuestion() {
  if (!state.answered) {
    return;
  }

  state.questionIndex += 1;

  if (state.questionIndex >= state.activeQuestions.length) {
    finishGame();
    return;
  }

  renderCurrentQuestion();
}

function finishGame() {
  stopTimer();
  const percentage = state.totalUnits
    ? Math.round((state.correctCount / state.totalUnits) * 100)
    : 0;

  if (percentage === 100) {
    state.score += POINTS.perfectBonus;
  }

  const xpEarned = Math.max(0, state.score + Math.round(percentage / 5));
  const grade = getGrade(percentage);
  const durationSeconds = Math.max(1, Math.round((Date.now() - state.startedAt) / 1000));
  const unlockedMessage = updateUnlockedLevels(percentage);

  updateProgressStreak();

  const record = {
    id: cryptoSafeId(),
    date: new Date().toISOString(),
    subject: state.selectedSubject.name,
    mode: state.selectedMode.title,
    modeId: state.selectedMode.id,
    difficulty: state.selectedDifficulty.title,
    difficultyId: state.selectedDifficulty.id,
    level: state.selectedLevel,
    score: state.score,
    xp: xpEarned,
    correct: state.correctCount,
    total: state.totalUnits,
    percentage,
    grade,
    hintsUsed: state.hintsUsed,
    durationSeconds,
    unlockedMessage
  };

  const newBadges = evaluateBadges(record);
  record.badgesEarned = newBadges.map((badge) => badge.name);

  progress.totalXP += xpEarned;
  progress.totalScore += state.score;
  progress.completedGames += 1;
  progress.gameHistory = [record, ...progress.gameHistory].slice(0, 40);
  updateBestRecord(progress.bestBySubject, record.subject, record);
  updateBestRecord(progress.bestByMode, record.modeId, record);

  highScores = [record, ...highScores]
    .sort((a, b) => b.score - a.score || b.percentage - a.percentage)
    .slice(0, 25);
  recentGames = [record, ...recentGames].slice(0, 10);

  state.lastRecord = record;
  saveProgress();
  saveScores();
  saveRecentGames();
  saveGameAttemptToFirebase(record, newBadges);
  renderResult(record, newBadges);
  showScreen("result-screen");
}

function updateProgressStreak() {
  const today = toDateKey(new Date());
  const lastPlayed = progress.lastPlayedDate;

  if (!lastPlayed) {
    progress.currentStreak = 1;
  } else if (lastPlayed === today) {
    progress.currentStreak = Math.max(1, progress.currentStreak);
  } else if (daysBetween(lastPlayed, today) === 1) {
    progress.currentStreak += 1;
  } else {
    progress.currentStreak = 1;
  }

  progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
  progress.lastPlayedDate = today;
}

async function saveGameAttemptToFirebase(record, newBadges = []) {
  if (!db || !currentUser || !currentProfile) {
    return;
  }

  try {
    const attempt = {
      ...record,
      studentId: currentUser.uid,
      studentName: currentProfile.name || currentUser.displayName || currentUser.email,
      studentEmail: currentUser.email || "",
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "quizAttempts"), attempt);
    const cloudBadges = Array.from(new Set([...(currentProfile.progress?.badges || []), ...earnedBadges]));

    await setDoc(doc(db, "progress", currentUser.uid), {
      uid: currentUser.uid,
      email: currentUser.email || "",
      name: currentProfile.name || currentUser.displayName || currentUser.email,
      totalXP: increment(record.xp),
      totalScore: increment(record.score),
      quizzesCompleted: increment(1),
      lastAttempt: attempt,
      badges: cloudBadges,
      updatedAt: serverTimestamp()
    }, { merge: true });

    await updateDoc(doc(db, "users", currentUser.uid), {
      "progress.totalXP": increment(record.xp),
      "progress.quizzesCompleted": increment(1),
      "progress.badges": cloudBadges,
      updatedAt: serverTimestamp()
    });

    await Promise.all(newBadges.map((badge) => setDoc(doc(db, "users", currentUser.uid, "badges", badge.id), {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      earnedAt: serverTimestamp(),
      source: record.mode
    }, { merge: true })));

    await upsertLeaderboard(record, "overall");
    await upsertLeaderboard(record, "weekly");
    await upsertLeaderboard(record, "monthly");

    currentProfile = await ensureUserProfile(currentUser);
    await maybeIssueQuizCertificate(record);
    updateHeaderStats();
  } catch (error) {
    console.warn("Firebase progress sync failed:", error.message);
  }
}

async function upsertLeaderboard(record, range) {
  const leaderboardId = `${range}_${currentUser.uid}`;
  const boardRef = doc(db, "leaderboards", leaderboardId);
  const snapshot = await getDoc(boardRef);
  const previous = snapshot.exists() ? snapshot.data() : {};

  await setDoc(boardRef, {
    uid: currentUser.uid,
    name: currentProfile.name || currentUser.displayName || currentUser.email,
    role: currentProfile.role || "student",
    range,
    xp: (previous.xp || 0) + record.xp,
    score: (previous.score || 0) + record.score,
    games: (previous.games || 0) + 1,
    bestPercentage: Math.max(previous.bestPercentage || 0, record.percentage),
    lastSubject: record.subject,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

function updateUnlockedLevels(percentage) {
  if (state.selectedMode.id !== "level" || percentage < 70 || state.selectedLevel >= 3) {
    return "";
  }

  const subjectName = state.selectedSubject.name;
  const nextLevel = state.selectedLevel + 1;

  if ((unlockedLevels[subjectName] || 1) < nextLevel) {
    unlockedLevels[subjectName] = nextLevel;
    return `Level ${nextLevel} unlocked for ${subjectName}.`;
  }

  return "";
}

function updateBestRecord(collection, key, record) {
  const previous = collection[key];

  if (!previous || record.percentage > previous.percentage || record.score > previous.score) {
    collection[key] = {
      score: record.score,
      percentage: record.percentage,
      grade: record.grade,
      date: record.date
    };
  }
}

function evaluateBadges(record) {
  const badgeTests = {
    "quiz-starter": () => progress.completedGames + 1 >= 1,
    "fast-learner": () => record.modeId === "timed" && record.percentage >= 70,
    "perfect-score": () => record.percentage === 100,
    "computer-genius": () => record.subject === "Computer Science" && record.percentage >= 80,
    "math-master": () => record.subject === "Mathematics" && record.percentage >= 80,
    "english-expert": () => record.subject === "English" && record.percentage >= 80,
    "programming-beginner": () => record.subject === "Programming" && record.difficultyId === "beginner",
    "advanced-thinker": () => record.difficultyId === "advanced" && record.percentage >= 70,
    "streak-master": () => progress.currentStreak >= 3,
    "creative-player": () => ["charades", "drawGuess"].includes(record.modeId),
    "word-hunter": () => ["wordHunt", "wordBuilder", "scramble"].includes(record.modeId) && record.percentage >= 70,
    "memory-champion": () => ["memory", "zingo"].includes(record.modeId) && record.percentage >= 80,
    "quiz-master": () => progress.completedGames + 1 >= 10,
    "top-scorer": () => record.score >= 100,
    "learning-enthusiast": () => progress.currentStreak >= 5,
    "level-up": () => record.modeId === "level" && record.percentage >= 70,
    "course-master": () => false
  };

  const newlyEarned = [];

  BADGE_DEFINITIONS.forEach((badge) => {
    if (!earnedBadges.includes(badge.id) && badgeTests[badge.id]()) {
      earnedBadges.push(badge.id);
      newlyEarned.push(badge);
    }
  });

  return newlyEarned;
}

function renderResult(record, newBadges) {
  const perfectBonusText = record.percentage === 100 ? `+${POINTS.perfectBonus} perfect bonus` : "No perfect bonus";
  const unlockText = record.unlockedMessage || "Keep playing to unlock more levels.";

  elements.resultSummary.innerHTML = `
    <div class="result-card">
      <span>Grade</span>
      <strong>${escapeHtml(record.grade)}</strong>
      <small>${record.percentage}% accuracy</small>
    </div>
    <div class="result-card">
      <span>Score</span>
      <strong>${record.score}</strong>
      <small>${perfectBonusText}</small>
    </div>
    <div class="result-card">
      <span>XP Earned</span>
      <strong>${record.xp}</strong>
      <small>${record.correct}/${record.total} correct</small>
    </div>
    <div class="result-card">
      <span>Level Status</span>
      <strong>${record.level}</strong>
      <small>${escapeHtml(unlockText)}</small>
    </div>
  `;

  elements.newBadges.innerHTML = newBadges.length
    ? `
      <h2>New badges earned</h2>
      <div class="badge-grid compact-badges">
        ${newBadges.map((badge) => badgeMarkup(badge, true)).join("")}
      </div>
    `
    : `<p class="empty-state">No new badges this round. Your progress was saved locally.</p>`;
}

function renderProgressDashboard() {
  const bestSubject = getBestEntry(progress.bestBySubject);
  const bestMode = getBestEntry(progress.bestByMode, true);

  elements.progressStats.innerHTML = `
    <div class="stat-card">
      <span>Total XP</span>
      <strong>${progress.totalXP}</strong>
    </div>
    <div class="stat-card">
      <span>Total Score</span>
      <strong>${progress.totalScore}</strong>
    </div>
    <div class="stat-card">
      <span>Completed Games</span>
      <strong>${progress.completedGames}</strong>
    </div>
    <div class="stat-card">
      <span>Learning Streak</span>
      <strong>${progress.currentStreak}</strong>
      <small>Best: ${progress.longestStreak}</small>
    </div>
    <div class="stat-card wide-card">
      <span>Best Subject</span>
      <strong>${escapeHtml(bestSubject.label)}</strong>
      <small>${bestSubject.detail}</small>
    </div>
    <div class="stat-card wide-card">
      <span>Best Game Mode</span>
      <strong>${escapeHtml(bestMode.label)}</strong>
      <small>${bestMode.detail}</small>
    </div>
  `;

  elements.badgeGrid.innerHTML = BADGE_DEFINITIONS.map((badge) => (
    badgeMarkup(badge, earnedBadges.includes(badge.id))
  )).join("");

  renderRecentGames(elements.historyList, 8);
}

function getBestEntry(collection, isMode = false) {
  const entries = Object.entries(collection);

  if (!entries.length) {
    return {
      label: "No score yet",
      detail: "Play a game to set your first record."
    };
  }

  const [key, value] = entries.sort((a, b) => (
    b[1].percentage - a[1].percentage || b[1].score - a[1].score
  ))[0];
  const label = isMode ? getModeTitle(key) : key;

  return {
    label,
    detail: `${value.percentage}% accuracy, ${value.score} points`
  };
}

function renderHighScores() {
  if (!highScores.length) {
    elements.highScoreList.innerHTML = emptyState("No high scores yet. Complete a game to create one.");
    return;
  }

  elements.highScoreList.innerHTML = highScores.map((record, index) => `
    <article class="score-card">
      <span class="rank">#${index + 1}</span>
      <div>
        <h2>${escapeHtml(record.subject)}</h2>
        <p>${escapeHtml(record.mode)} / ${escapeHtml(record.difficulty)}</p>
      </div>
      <div class="score-value">
        <strong>${record.score}</strong>
        <span>${record.percentage}%</span>
      </div>
    </article>
  `).join("");
}

function renderRecentGames(container, limit) {
  const games = recentGames.slice(0, limit);

  if (!games.length) {
    container.innerHTML = emptyState("No recent games yet. Start a session to fill this area.");
    return;
  }

  container.innerHTML = games.map((game) => `
    <article class="history-card">
      <div>
        <h3>${escapeHtml(game.subject)}</h3>
        <p>${escapeHtml(game.mode)} / ${escapeHtml(game.difficulty)}</p>
      </div>
      <div>
        <strong>${game.percentage}%</strong>
        <span>${formatDate(game.date)}</span>
      </div>
    </article>
  `).join("");
}

function badgeMarkup(badge, earned) {
  return `
    <article class="badge-card ${earned ? "earned" : "locked"}">
      <span>${earned ? "Unlocked" : "Locked"}</span>
      <strong>${escapeHtml(badge.name)}</strong>
      <small>${escapeHtml(badge.description)}</small>
    </article>
  `;
}

function certificateListMarkup(certificates) {
  if (!certificates.length) {
    return emptyState("Certificates will appear here after completed lessons, passed quizzes, or milestone generation.");
  }

  return certificates.slice().reverse().map((certificate) => `
    <article class="history-card">
      <div>
        <h3>${escapeHtml(certificate.title || "Learning Certificate")}</h3>
        <p>${escapeHtml(certificate.subject || certificate.source || "EduQuest")}</p>
      </div>
      <div>
        <strong>${escapeHtml(certificate.type || "Milestone")}</strong>
        <span>${formatDate(certificate.issuedAt || new Date().toISOString())}</span>
      </div>
    </article>
  `).join("");
}

function updateHeaderStats() {
  const cloudProgress = currentProfile?.progress;
  elements.headerXp.textContent = cloudProgress?.totalXP ?? progress.totalXP;
  elements.headerCompleted.textContent = cloudProgress?.quizzesCompleted ?? progress.completedGames;
  elements.headerBadges.textContent = (cloudProgress?.badges || earnedBadges).length;
  elements.authStatusPill.textContent = currentProfile
    ? `${currentProfile.role}: ${currentProfile.name || currentUser.email}`
    : "Guest";
}

function updateLiveStats() {
  elements.liveScore.textContent = state.score;
  elements.liveCorrect.textContent = state.correctCount;

  if (state.selectedMode?.id === "matching") {
    const pairs = state.activeQuestions[state.questionIndex]?.pairs.length || 0;
    elements.liveProgressText.textContent = `${state.matchedPairs.size}/${pairs}`;
    elements.gameProgressBar.style.width = pairs
      ? `${(state.matchedPairs.size / pairs) * 100}%`
      : "0%";
    return;
  }

  if (state.selectedMode?.id === "memory") {
    const pairs = state.activeQuestions[state.questionIndex]?.pairs.length || 0;
    elements.liveProgressText.textContent = `${state.matchedPairs.size}/${pairs}`;
    elements.gameProgressBar.style.width = pairs
      ? `${(state.matchedPairs.size / pairs) * 100}%`
      : "0%";
    return;
  }

  if (state.selectedMode?.id === "zingo") {
    const calls = state.activeQuestions[state.questionIndex]?.calls.length || 0;
    elements.liveProgressText.textContent = `${state.zingoCallIndex}/${calls}`;
    elements.gameProgressBar.style.width = calls
      ? `${(state.zingoCallIndex / calls) * 100}%`
      : "0%";
    return;
  }

  elements.liveProgressText.textContent = `${Math.min(state.questionIndex + 1, state.activeQuestions.length)}/${state.activeQuestions.length}`;
  const completedQuestions = state.answered ? state.questionIndex + 1 : state.questionIndex;
  elements.gameProgressBar.style.width = `${(completedQuestions / state.activeQuestions.length) * 100}%`;
}

function showFeedback(type, title, detail) {
  elements.feedbackBox.className = `feedback-box ${type}`;
  elements.feedbackBox.innerHTML = `
    <strong>${escapeHtml(title)}</strong>
    <span>${escapeHtml(detail)}</span>
  `;
}

function startTimer(seconds) {
  state.timeLeft = Number(settings.timerSeconds) || seconds;
  elements.timerPill.hidden = false;
  elements.timerValue.textContent = state.timeLeft;

  state.timerId = setInterval(() => {
    state.timeLeft -= 1;
    elements.timerValue.textContent = state.timeLeft;

    if (state.timeLeft <= 0) {
      handleTimeExpired();
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }

  elements.timerPill.hidden = true;
}

function handleTimeExpired() {
  if (state.answered) {
    return;
  }

  stopTimer();
  state.answered = true;
  const question = state.activeQuestions[state.questionIndex];

  $$(".answer-btn").forEach((button) => {
    button.disabled = true;

    if (button.dataset.answer === question.correctAnswer) {
      button.classList.add("correct");
    }
  });

  showFeedback("error", "Time is up. 0 points.", question.explanation);
  enableNext();
}

function clearProgress() {
  const confirmed = window.confirm("Clear all saved progress from this browser?");

  if (!confirmed) {
    return;
  }

  [
    STORAGE_KEYS.progress,
    STORAGE_KEYS.highScores,
    STORAGE_KEYS.badges,
    STORAGE_KEYS.unlockedLevels,
    STORAGE_KEYS.recentGames
  ].forEach((key) => localStorage.removeItem(key));

  progress = loadProgress();
  highScores = [];
  earnedBadges = [];
  unlockedLevels = loadUnlockedLevels();
  recentGames = [];
  saveProgress();
  saveScores();
  saveRecentGames();
  applySettings();
  renderAllStaticScreens();
  showScreen("home-screen");
}

async function seedStarterContent() {
  if (!db || !currentUser || !canManageContent()) {
    window.alert("Sign in as an admin or teacher before seeding starter content.");
    return;
  }

  try {
    const subjectsSnapshot = await getDocs(collection(db, "subjects"));

    if (subjectsSnapshot.empty) {
      await Promise.all(SUBJECTS.map((subject) => setDoc(doc(db, "subjects", slugify(subject.name)), {
        name: subject.name,
        icon: subject.icon,
        color: subject.color,
        description: subject.description,
        createdAt: serverTimestamp()
      })));
    }

    await Promise.all(BADGE_DEFINITIONS.map((badge) => setDoc(doc(db, "badges", badge.id), {
      ...badge,
      active: true,
      xpBonus: badge.id === "course-master" ? 50 : 25,
      source: "seed",
      updatedAt: serverTimestamp()
    }, { merge: true })));

    const starterQuizzes = QUESTION_BANK
      .filter((question) => ["mcq", "trueFalse", "fillBlank", "scramble", "timed", "level"].includes(question.gameType))
      .slice(0, 35)
      .map((question) => setDoc(doc(db, "quizzes", `starter_${question.id}`), {
        ...question,
        source: "seed",
        teacherId: currentUser.uid,
        teacherName: currentProfile.name || currentUser.email,
        published: true,
        createdAt: serverTimestamp()
      }, { merge: true }));

    await Promise.all(starterQuizzes);
    window.alert("Starter subjects and quizzes were seeded into Firestore.");
  } catch (error) {
    window.alert(error.message);
  }
}

async function issueCertificate(certificate, renderTarget = false) {
  if (!db || !currentUser || !currentProfile) {
    return null;
  }

  const certificateRecord = {
    id: certificate.id || cryptoSafeId(),
    uid: currentUser.uid,
    name: currentProfile.name || currentUser.email,
    email: currentUser.email || "",
    title: certificate.title || "EduQuest Learning Certificate",
    type: certificate.type || "Milestone",
    source: certificate.source || "EduQuest",
    subject: certificate.subject || "All subjects",
    xp: certificate.xp ?? currentProfile.progress?.totalXP ?? 0,
    games: certificate.games ?? currentProfile.progress?.quizzesCompleted ?? 0,
    issuedAt: certificate.issuedAt || new Date().toISOString()
  };

  try {
    await setDoc(doc(db, "certificates", certificateRecord.id), {
      ...certificateRecord,
      createdAt: serverTimestamp()
    }, { merge: true });

    const certificates = dedupeCertificates([
      ...(currentProfile.progress?.certificates || []),
      certificateRecord
    ]);
    await updateDoc(doc(db, "users", currentUser.uid), {
      "progress.certificates": certificates,
      updatedAt: serverTimestamp()
    });

    currentProfile.progress = {
      ...(currentProfile.progress || {}),
      certificates
    };
  } catch (error) {
    console.warn("Certificate cloud save failed:", error.message);
  }

  if (renderTarget && $("#certificate-output")) {
    $("#certificate-output").innerHTML = certificateMarkup(certificateRecord);
    $("#print-certificate-btn").addEventListener("click", () => window.print());
  }

  if ($("#student-certificate-list")) {
    $("#student-certificate-list").innerHTML = certificateListMarkup(currentProfile.progress?.certificates || []);
  }

  updateHeaderStats();
  return certificateRecord;
}

async function maybeIssueQuizCertificate(record) {
  if (!record || record.percentage < 70) {
    return;
  }

  await issueCertificate({
    id: `quiz-${currentUser.uid}-${record.id}`,
    title: `${record.subject} Quiz Completion`,
    type: "Quiz",
    source: record.mode,
    subject: record.subject,
    xp: currentProfile.progress?.totalXP || record.xp,
    games: currentProfile.progress?.quizzesCompleted || 1,
    issuedAt: new Date().toISOString()
  });
}

async function maybeIssueLessonCertificate(lesson) {
  await issueCertificate({
    id: `lesson-${currentUser.uid}-${lesson.id}`,
    title: `${lesson.title || "Lesson"} Completion`,
    type: "Lesson",
    source: lesson.teacherName || "Teacher lesson",
    subject: lesson.subject || "Learning library",
    xp: currentProfile.progress?.totalXP || 0,
    games: currentProfile.progress?.quizzesCompleted || 0,
    issuedAt: new Date().toISOString()
  });
}

async function generateCertificate() {
  await issueCertificate({
    id: `milestone-${currentUser.uid}-${Date.now()}`,
    title: "EduQuest Learning Milestone",
    type: "Milestone",
    source: "Student dashboard"
  }, true);
}

function certificateMarkup(certificate) {
  return `
    <article class="certificate-card">
      <span>Certificate</span>
      <h2>${escapeHtml(certificate.title)}</h2>
      <p>Awarded to ${escapeHtml(certificate.name)} for ${escapeHtml(certificate.type.toLowerCase())} achievement in ${escapeHtml(certificate.subject)} with ${certificate.xp} XP.</p>
      <button class="secondary-btn" type="button" id="print-certificate-btn">Download / Print</button>
    </article>
  `;
}

function dedupeCertificates(certificates) {
  const seen = new Set();

  return certificates.filter((certificate) => {
    if (!certificate?.id || seen.has(certificate.id)) {
      return false;
    }

    seen.add(certificate.id);
    return true;
  });
}

function downloadReport(attempts) {
  const blob = new Blob([JSON.stringify(attempts, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `eduquest-report-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function truncateText(value, length) {
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getGrade(percentage) {
  if (percentage >= 90) {
    return "Excellent";
  }

  if (percentage >= 70) {
    return "Great";
  }

  if (percentage >= 50) {
    return "Good";
  }

  return "Needs Practice";
}

function getEffectiveTheme() {
  if (settings.theme === "system" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return settings.theme === "dark" ? "dark" : "light";
}

function getModeTitle(modeId) {
  return GAME_MODES.find((mode) => mode.id === modeId)?.title || modeId;
}

function isLastQuestion() {
  return state.questionIndex === state.activeQuestions.length - 1;
}

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function normalizeAnswer(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cssEscape(value) {
  if (window.CSS && CSS.escape) {
    return CSS.escape(value);
  }

  return String(value).replace(/"/g, '\\"');
}

function emptyState(message) {
  return `<p class="empty-state">${escapeHtml(message)}</p>`;
}

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(startKey, endKey) {
  const start = new Date(`${startKey}T00:00:00`);
  const end = new Date(`${endKey}T00:00:00`);
  return Math.round((end - start) / 86400000);
}

function cryptoSafeId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
