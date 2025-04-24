import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";  


const firebaseConfig = {
  apiKey: "AIzaSyBoCISb72ovn6fGk-yciQYvknA7V3QgsHk",
  authDomain: "genie-civil-app.firebaseapp.com",
  projectId: "genie-civil-app",
  storageBucket: "genie-civil-app.firebasestorage.app",
  messagingSenderId: "1027418503027",
  appId: "1:1027418503027:web:79308782b4608704573706"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 

export { auth, db ,app};  
