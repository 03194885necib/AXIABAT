import React , { useState } from "react";
import "./SignUp.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";  
import { db } from "../firebase"; 
import { collection, addDoc } from "firebase/firestore"; 
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  const auth = getAuth();
//   const goTo = (e) => {
//     e.preventDefault();
//     navigate("/Template");
//   };
const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      // Ajout des données dans Firestore
      const docRef = await addDoc(collection(db, "users"), {
        name: name,
        email: email,
        password: password,
      });
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Document written with ID: ", docRef.id);
      alert("Inscription réussie!");
      // Vous pouvez rediriger l'utilisateur vers une autre page ici si nécessaire
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Erreur lors de l'inscription. Veuillez réessayer.");
    }
  };


  return (
    <section className="signup-container">
      <div className="radius-shape-1"></div>
      <div className="radius-shape-2"></div>

      <div className="bg-glass">
        <h2>Inscription</h2>
        
        <br></br>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nom :</label>
            <input type="text" placeholder="Entrez votre nom"
             value={name}
             onChange={(e) => setName(e.target.value)}
              required />
          </div>
          <div>
            <label>Email :</label>
            <input type="email" placeholder="Entrez votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
             required />
          </div>
          <div>
            <label>Mot de passe :</label>
            <input type="password" placeholder="Entrez votre mot de passe" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required />
          </div>
          <div>
            <label>Confirmer le mot de passe :</label>
            <input type="password" placeholder="Confirmez votre mot de passe" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required />
          </div>
          <button type="submit">S'inscrire</button>

        </form>
        <p>
          Vous avez déja un compte ?{" "}
          <Link to="/" className="signup-link">se connecter</Link>
        </p>
      </div>
    </section>
  );
};

export default SignUp;

