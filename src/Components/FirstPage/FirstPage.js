import React from 'react';
import './FirstPage.css'; 
import { useNavigate } from 'react-router-dom';

  
  
const GESCOMP = () => {
    const navigate=useNavigate()

     const handleCardClick = (route) => {
    navigate(route);
  };
  return (
    <div className="FirstPagecontainer">
      <div className="FirstPageheader">
        <h1 className="FirstPagetitle">    AxIABat</h1>
      </div>
      
      <div className="module-grid">
        <div className="module-card" onClick={() => handleCardClick('/MesArticles')}>
          <div className="module-icon module-icon-data-entry"></div>
          <div className="module-label"> Base des données</div>
        </div>
        {/* <div className="module-card" >
          <div className="module-icon module-icon-tender-management" onClick={() => handleCardClick('/ListeArticle')}></div>
          <div className="module-label">TEEST</div>
        </div> */}
        <div className="module-card" >
          <div className="module-icon module-icon-tender-management" onClick={() => handleCardClick('/FicheProjet')}></div>
          <div className="module-label">Fiche de Projet</div>
        </div>
        <div className="module-card">
          <div className="module-icon module-icon-offer-opening" onClick={() => handleCardClick('/JournalCHantier')}></div>
          <div className="module-label">Jornale de chantier  </div>
          
        </div>
        <div className="module-card">
          <div className="module-icon module-icon-evaluation"></div>
          <div className="module-label" onClick={() => handleCardClick('/Delais')}>Suivie et Delais</div>
        </div>
        <div className="module-card" onClick={() => handleCardClick('/TestProjet')}>
          <div className="module-icon module-icon-contracts" ></div>
          <div className="module-label">Administration</div>
        </div>
        <div className="module-card">
          <div className="module-icon module-icon-financial-transactions"></div>
          <div className="module-label">  Suivie budgutaire</div>
        </div>
        <div className="module-card">
          <div className="module-icon module-icon-monitoring-followup"></div>
          <div className="module-label">Tableau des bords</div>
        </div>
        <div className="module-card">
          <div className="module-icon module-icon-settlement"></div>
          <div className="module-label">Rapport synthétiques</div>
        </div>
      </div>
    </div>
  );
};

export default GESCOMP;