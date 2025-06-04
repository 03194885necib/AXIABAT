import React from 'react';

const ProjectDetails = ({ data }) => {
    if (!data) return <p>Chargement des détails du projet...</p>;

    return (
        <div className="project-details">
            <p><strong>Numéro Projet:</strong> {data.numProjet}</p>
            <p><strong>Nom Projet:</strong> {data.nomProjet}</p>
            <p><strong>Description:</strong> {data.description}</p>
            <p><strong>Banque:</strong> {data.bank}</p>
            <p><strong>Délais:</strong> {data.delais}</p>
            <p><strong>Budget:</strong> {data.budget}</p>
            <p><strong>TVA:</strong> {data.tva}%</p>
            <p><strong>Date Approbation:</strong> {data.dateApprobation}</p>
            <p><strong>Date Démarrage:</strong> {data.dateDemarrage}</p>
            {/* Add other M1 fields as necessary */}
        </div>
    );
};

export default ProjectDetails;