import React from 'react';
import './FirstPage.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AxiaBatLogo from './logo2.png';

const GESCOMP = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const userName =
    userProfile?.displayName ||
    currentUser?.displayName ||
    currentUser?.email ||
    "Utilisateur";

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div className="FirstPagecontainer" style={{ position: "relative" }}>
      {/* User avatar — top right */}
      <div style={{
        position: "absolute",
        top: 16,
        right: 24,
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#f59e0b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          fontWeight: 700,
          color: "#1e3a5f",
        }}>
          {userName[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Bienvenue</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{userName}</div>
        </div>
      </div>

      <div className="FirstPageheader">
        <img src={AxiaBatLogo} alt="AxiaBat Logo" className="FirstPageLogo" />
      </div>

      <div className="module-grid">
        <div className="module-card" onClick={() => handleCardClick('/MesArticles')}>
          <div className="module-icon module-icon-data-entry"></div>
          <div className="module-label">Base des données</div>
        </div>
        <div className="module-card">
          <div className="module-icon module-icon-tender-management" onClick={() => handleCardClick('/FicheProjet')}></div>
          <div className="module-label">Fiche de Projet</div>
        </div>
        <div className="module-card">
          <div className="module-icon module-icon-offer-opening" onClick={() => handleCardClick('/JournalCHantier')}></div>
          <div className="module-label">Jornale de chantier</div>
        </div>
        <div className="module-card">
          <div className="module-icon module-icon-evaluation" onClick={() => handleCardClick('/Delais')}></div>
          <div className="module-label">Gestion des Delais</div>
        </div>
        <div className="module-card" onClick={() => handleCardClick('/TestProjet')}>
          <div className="module-icon module-icon-contracts"></div>
          <div className="module-label">Administration</div>
        </div>
        <div className="module-card">
          <div className="module-icon module-icon-financial-transactions" onClick={() => handleCardClick('/DecompteForm')}></div>
          <div className="module-label">Suivie budgutaire</div>
        </div>
        <div className="module-card">
          <div className="module-icon module-icon-monitoring-followup" onClick={() => handleCardClick('/GlobalDash')}></div>
          <div className="module-label">Tableau des bords 2</div>
        </div>
        <div className="module-card">
          <div className="module-icon module-icon-settlement" onClick={() => handleCardClick('/Rapport')}></div>
          <div className="module-label">Rapport synthétiques</div>
        </div>
      </div>
    </div>
  );
};

export default GESCOMP;
