import firebase from 'firebase/app'
import 'firebase/storage';
import 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAn0hB0skriGqd4WxE7jpFv1ibeNaF21mI",
  authDomain: "warehousespace-36258.firebaseapp.com",
  projectId: "warehousespace-36258",
  storageBucket: "warehousespace-36258.appspot.com",
  messagingSenderId: "157925804181",
  appId: "1:157925804181:web:61b2669b95ca0a1e4af39c",
  measurementId: "G-MK9P5QGW28"
}; 


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//analytics is optional for this tutoral 
firebase.analytics();

const storage = firebase.storage()

export {
  storage, firebase as default
}
