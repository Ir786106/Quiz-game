export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const platformConfig = {
  bootstrapAdminEmails: ["admin@example.com"],
  defaultSignupRole: "student"
};

export function hasFirebaseConfig() {
  return !Object.values(firebaseConfig).some((value) => String(value).startsWith("YOUR_"));
}
