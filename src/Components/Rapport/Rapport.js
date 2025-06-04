import React from 'react';
import './rapport.css'; 
import { FaDownload, FaFileUpload } from 'react-icons/fa'; // Import icons from react-icons
import { useNavigate } from 'react-router-dom';

const CardsPage = () => {
     const navigate=useNavigate()
    
         const handleCardClick = (route) => {
        navigate(route);
      };

  // You can add state or functions here if these cards will have specific actions
  const handleDownloadClick = () => {
    alert('Action: Téléchargement en cours...');
    // Implement actual download logic here, e.g., fetching a file
  };

  const handleImportClick = () => {
    alert('Action: Importer un fichier...');
    // Implement actual import logic here, e.g., opening a file input
  };

  return (
    <div className="cards-page-container">
      <h1 className="page-title">Gestion des Fichiers</h1> {/* Page title */}

      <div className="cards-grid">
        {/* Téléchargement Card */}
        <div className="card download-card" onClick={() => handleCardClick('/ImporterRapport')}>
          <div className="card-icon">
            <FaDownload /> {/* Download icon */}
          </div>
          <h2 className="card-title">Téléchargement</h2>
          <p className="card-description">
            Téléchargez les documents importants ou les modèles de fichiers.
          </p>
          <button className="card-button">Télécharger</button>
        </div>

        {/* Importer Card */}
        <div className="card import-card" onClick={() => handleCardClick('/ImporterRapport')}>
          <div className="card-icon">
            <FaFileUpload /> {/* File upload icon */}
          </div>
          <h2 className="card-title">Importer</h2>
          <p className="card-description">
            Importez de nouveaux fichiers ou mettez à jour des données existantes.
          </p>
          <button className="card-button">Importer Fichier</button>
        </div>
      </div>
    </div>
  );
};

export default CardsPage;