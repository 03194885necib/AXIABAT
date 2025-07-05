// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore, collection, addDoc } from "firebase/firestore"; 
// import { getStorage } from "firebase/storage"; // Correct import for Storage

// const firebaseConfig = {
//   apiKey: "AIzaSyBoCISb72ovn6fGk-yciQYvknA7V3QgsHk",
//   authDomain: "genie-civil-app.firebaseapp.com",
//   projectId: "genie-civil-app",
//   storageBucket: "genie-civil-app.firebasestorage.app",
//   messagingSenderId: "1027418503027",
//   appId: "1:1027418503027:web:79308782b4608704573706"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app); 

// export { auth, db, app, storage };




import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore"; 
import { getStorage } from "firebase/storage"; // Correct import for Storage



const firebaseConfig = {
  apiKey: "AIzaSyBVQYW552WACRkQ6P_u73qRLFIPGYb48iI",
  authDomain: "geniecivil-954a8.firebaseapp.com",
  projectId: "geniecivil-954a8",
  storageBucket: "geniecivil-954a8.firebasestorage.app",
  messagingSenderId: "276948664999",
  appId: "1:276948664999:web:3943a1469870d1b9a85182"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); 


export { auth, db, app, storage };