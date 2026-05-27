/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, getDocFromServer, query, orderBy, limit, setDoc } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// User's private Firebase Web configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZ0RB5sBxPca5SMQHUnB9AJVNK0OY_XJ8",
  authDomain: "genz-tech-ai.firebaseapp.com",
  projectId: "genz-tech-ai",
  storageBucket: "genz-tech-ai.firebasestorage.app",
  messagingSenderId: "175931590823",
  appId: "1:175931590823:web:926802f46067592c7a3382",
  measurementId: "G-J07F6EHQRF"
};

// Initialize app safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics conditionally to avoid failure in iframe dev sandboxes
export const initAnalytics = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
  } catch (e) {
    console.warn("Analytics not supported or blocked in this window framework environment:", e);
  }
  return null;
};

// Error handling logic as required by the Firebase Integration Skill instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
    },
    operationType,
    path
  };
  console.error("Lỗi Firestore được phân tích bởi GENZ TECH AI System: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Kết nối tới máy chủ Firebase genz-tech-ai thành công!");
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Bảo trì / Đang ngoại tuyến. Hãy kiểm tra kết nối mạng của bạn.");
    }
  }
}
testConnection();
