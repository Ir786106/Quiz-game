# EduQuest Firebase Setup

This project is a Firebase Hosting-ready learning platform with Auth, Firestore realtime dashboards, Storage-backed lesson media, gamified XP/badges/certificates, and optional Cloud Functions.

## 1. Create Firebase Project

1. Open the Firebase Console.
2. Create a project.
3. Add a Web App.
4. Copy the Firebase config object into `firebase-config.js`.
5. Replace `YOUR_PROJECT_ID` in `.firebaserc`.

## 2. Enable Products

Enable these Firebase services:

- Authentication: Email/Password and Google provider.
- Firestore Database.
- Firebase Storage.
- Firebase Hosting.

## 3. Admin User

Edit `firebase-config.js` and add your admin email:

```js
export const platformConfig = {
  bootstrapAdminEmails: ["your-email@example.com"],
  defaultSignupRole: "student"
};
```

The first time that email signs in, it receives the `admin` role in Firestore.

Also update the same email in `firestore.rules` inside `isBootstrapAdminEmail()`. For production, prefer Firebase custom claims set by the Admin SDK or Cloud Functions.

## 4. Deploy Rules and Hosting

Install Firebase CLI, log in, then run:

```bash
firebase deploy
```

Useful partial deploys:

```bash
firebase deploy --only hosting
firebase deploy --only firestore:rules,storage
```

## 5. Seed Starter Content

Sign in as Admin or Teacher, open Settings, and click `Seed Starter Content`.

This creates:

- `subjects`
- `badges`
- starter `quizzes`

Admins can manage users, subjects, lessons, quizzes, badges, and analytics from the Admin dashboard. Teachers can create lessons/quizzes and monitor student performance from the Teacher dashboard. Lessons can upload media to Firebase Storage.

## 6. Collections

- `users`: profiles, roles, progress, badges, certificates.
- `users/{uid}/badges`: per-student earned badge events for Cloud Functions triggers.
- `subjects`: available learning subjects.
- `lessons`: teacher-created lessons with optional media URLs.
- `quizzes`: teacher/admin-created quiz questions.
- `quizAttempts`: synced game results.
- `progress`: realtime progress per student.
- `leaderboards`: overall, weekly, monthly ranking entries.
- `badges`: admin-managed badge catalog.
- `lessonCompletions`: lesson completion events and XP rewards.
- `feedback`: teacher feedback for student attempts.
- `certificates`: generated lesson, quiz, and milestone certificates.
- `notifications`: optional Cloud Functions notification records.

## Optional Cloud Functions

The `functions/` folder includes:

- `sendBadgeNotification`: creates a notification document whenever a badge is added under `users/{uid}/badges/{badgeId}`.
- `issueMilestoneCertificates`: creates milestone certificates when students cross 10 completed quizzes or 5 completed lessons.

Install and deploy functions:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

Deploy the leaderboard index after the first setup:

```bash
firebase deploy --only firestore:indexes
```

## Security Note

Firestore rules enforce role checks using the user's Firestore profile. For production-grade role security, use Firebase Admin SDK or Cloud Functions to set custom claims and update the rules to read `request.auth.token.role`.
