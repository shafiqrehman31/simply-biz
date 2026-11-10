// Centralized Firebase Configuration for Simply Biz
// Self-contained within /src so local builds (Windows/Mac) and Vercel deployments succeed with 0 missing file errors.

export interface FirebaseAppConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId: string;
  storageBucket: string;
  messagingSenderId: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
}

export const firebaseConfig: FirebaseAppConfig = {
  projectId: "gen-lang-client-0839268711",
  appId: "1:21643875511:web:3d52b664ed5df30fb4a932",
  apiKey: "AIzaSyCcSnYm7Zs1xWIpiT402DPP1W5a48aUD8U",
  authDomain: "gen-lang-client-0839268711.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-simplybizuaebusi-afb444d5-3b85-4505-b1a1-a7ccad68a04b",
  storageBucket: "gen-lang-client-0839268711.firebasestorage.app",
  messagingSenderId: "21643875511",
  measurementId: "",
  oAuthClientId: "21643875511-ql9heh603sorb3kh5s5hklkk7j1tf22c.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

export default firebaseConfig;
