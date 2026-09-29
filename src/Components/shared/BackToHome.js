import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./BackToHome.css";

export default function BackToHome() {
  const navigate = useNavigate();

  return (
    <div className="back-to-home-bar">
      <button
        type="button"
        className="back-to-home-button"
        onClick={() => navigate("/home")}
        aria-label="Retourner à l'accueil"
      >
        <FiArrowLeft aria-hidden="true" />
        <span>Retour à l'accueil</span>
      </button>
    </div>
  );
}