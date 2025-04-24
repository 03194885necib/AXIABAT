// import React, { useState } from "react";
// import "./Login.css";
// import { useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../firebase"; 

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState(""); 
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault(); 

//     if (!email || !password) {
//       setError("Veuillez remplir tous les champs");
//       return;
//     }



    
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       navigate("/FirstPage");
//     } catch (error) {
//       setError("Email ou mot de passe incorrect");
//       console.error("Erreur d'authentification :", error.message);
//     }
//   };

//   return (
//     <section className="login-container">
//       <div className="radius-shape-1"></div>
//       <div className="radius-shape-2"></div>

//       <div className="bg-glass">
//         <h2>Connexion</h2>
//         <form onSubmit={handleLogin}>
//           {error && <p className="error-message">{error}</p>}
//           <div>
//             <label>Email :</label>
//             <input
//               type="email"
//               placeholder="Entrez votre email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
             
//               required
//             />
//           </div>
//           <div>
//             <label>Mot de passe :</label>
//             <input
//               type="password"
//               placeholder="Entrez votre mot de passe"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
            
//               required
//             />
//           </div>
//           <button type="submit">Se connecter</button>
//           {/* <p>
//             mot de passe oblier?{" "}
//             <Link to="/Signup" className="signup-link">Créer un compte</Link>
//           </p> */}
//         </form>
//       </div>
//     </section>
//   );
// };

// export default Login;
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Veuillez entrer votre adresse email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Email de réinitialisation envoyé !");
      setError("");
    } catch (err) {
      setError("Erreur : cet email est introuvable.");
      setMessage("");
    }
  };

  return (
    <section className="login-container">
      <div className="radius-shape-1"></div>
      <div className="radius-shape-2"></div>

      <div className="bg-glass">
        <h2>Mot de passe oublié</h2>
        <form onSubmit={handleReset}>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          <div>
            <label>Email :</label>
            <input
              type="email"
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit">Envoyer un lien de réinitialisation</button>
          <p>
            Retour à la <span style={{ color: "#007bff", cursor: "pointer" }} onClick={() => navigate("/")}>connexion</span>
          </p>
        </form>
      </div>
    </section>
  );
};

export default ForgetPassword;
