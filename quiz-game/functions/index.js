const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

exports.sendBadgeNotification = onDocumentCreated("users/{userId}/badges/{badgeId}", async (event) => {
  const badge = event.data.data();
  const { userId } = event.params;
  const userSnapshot = await db.doc(`users/${userId}`).get();
  const user = userSnapshot.data();

  await db.collection("notifications").add({
    uid: userId,
    type: "badge",
    title: "New badge earned",
    message: `${user?.name || "A learner"} earned ${badge.name}.`,
    badgeId: badge.id,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  logger.info("Badge notification queued", {
    userId,
    badgeId: badge.id
  });
});

exports.issueMilestoneCertificates = onDocumentUpdated("users/{userId}", async (event) => {
  const before = event.data.before.data() || {};
  const after = event.data.after.data() || {};
  const beforeProgress = before.progress || {};
  const afterProgress = after.progress || {};
  const { userId } = event.params;
  const certificates = [];

  if ((beforeProgress.quizzesCompleted || 0) < 10 && (afterProgress.quizzesCompleted || 0) >= 10) {
    certificates.push({
      id: `milestone-${userId}-10-quizzes`,
      title: "Quiz Mastery Milestone",
      type: "Milestone",
      source: "Cloud Function",
      subject: "All subjects",
      games: afterProgress.quizzesCompleted || 0,
      xp: afterProgress.totalXP || 0
    });
  }

  if ((beforeProgress.lessonsCompleted || 0) < 5 && (afterProgress.lessonsCompleted || 0) >= 5) {
    certificates.push({
      id: `milestone-${userId}-5-lessons`,
      title: "Course Completion Milestone",
      type: "Course",
      source: "Cloud Function",
      subject: "Learning library",
      games: afterProgress.quizzesCompleted || 0,
      xp: afterProgress.totalXP || 0
    });
  }

  if (!certificates.length) {
    return;
  }

  const existing = Array.isArray(afterProgress.certificates) ? afterProgress.certificates : [];
  const existingIds = new Set(existing.map((certificate) => certificate.id));
  const issuedAt = new Date().toISOString();
  const newCertificates = certificates
    .filter((certificate) => !existingIds.has(certificate.id))
    .map((certificate) => ({
      ...certificate,
      uid: userId,
      name: after.name || after.email || "Learner",
      email: after.email || "",
      issuedAt
    }));

  if (!newCertificates.length) {
    return;
  }

  const batch = db.batch();
  newCertificates.forEach((certificate) => {
    batch.set(db.doc(`certificates/${certificate.id}`), {
      ...certificate,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  });

  batch.update(db.doc(`users/${userId}`), {
    "progress.certificates": [...existing, ...newCertificates],
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await batch.commit();

  logger.info("Milestone certificates issued", {
    userId,
    certificateCount: newCertificates.length
  });
});
