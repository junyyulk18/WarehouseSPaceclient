import firebase from 'firebase/app'
import 'firebase/storage';
import 'firebase/analytics';

// const firebaseConfig = {
//   apiKey: "AIzaSyAn0hB0skriGqd4WxE7jpFv1ibeNaF21mI",
//   authDomain: "https://warehouse-spaceclient.vercel.app",
//   //"warehousespace-36258.firebaseapp.com",
//   projectId: "warehousespace-36258",
//   storageBucket: "warehousespace-36258.appspot.com",
//   messagingSenderId: "157925804181",
//   appId: "1:157925804181:web:61b2669b95ca0a1e4af39c",
//   measurementId: "G-MK9P5QGW28"
// }; 

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//analytics is optional for this tutoral 
firebase.analytics();

const storage = firebase.storage()

export {
  storage, firebase as default
}
