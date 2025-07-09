import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardDelais = () => {
  const [projets, setProjets] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [deadlineData, setDeadlineData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Charger la liste des projets
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        setProjets(querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error("Erreur chargement projets:", error);
      }
    };
    fetchProjects();
  }, []);

  // Charger les données du projet sélectionné
  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchDeadlineData = async () => {
      setLoading(true);
      try {
        // Récupérer depuis la collection 'deadlines'
        const deadlineDoc = await getDoc(doc(db, 'deadlines', selectedProjectId));
        
        if (deadlineDoc.exists()) {
          setDeadlineData(deadlineDoc.data());
        } else {
          // Si pas dans deadlines, chercher dans projets
          const projetDoc = await getDoc(doc(db, 'projets', selectedProjectId));
          if (projetDoc.exists()) {
            const projet = projetDoc.data();
            setDeadlineData({
              projetInfo: {
                nomProjet: projet.nomProjet,
                numProjet: projet.numProjet,
                description: projet.description,
                budget: projet.budget,
                bank: projet.bank,
                dateDemarrage: projet.dateDemarrage,
                delaisInitial: parseInt(projet.delais) || 0
              },
              suivis: {
                dateFinContractuelle: calculateDateFinContractuelle(projet),
                dateFinReelle: projet.dateFinReelle || '',
                delaisReel: 0,
                delaiDepasse: false
              },
              arrets: projet.arrets || []
            });
          } else {
            console.error("Projet non trouvé");
            setDeadlineData(null);
          }
        }
      } catch (error) {
        console.error("Erreur chargement données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeadlineData();
  }, [selectedProjectId]);

  // Calculer la date de fin contractuelle
  const calculateDateFinContractuelle = (projet) => {
    if (!projet?.dateDemarrage || !projet?.delais) return '';
    const date = new Date(projet.dateDemarrage);
    date.setDate(date.getDate() + parseInt(projet.delais));
    return date.toISOString().split('T')[0];
  };

  // Calculer la durée en jours
  const calculateDuree = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) return 0;
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    return Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Préparer les données pour le graphique
  const prepareChartData = () => {
    if (!deadlineData) return null;

    return {
      labels: ['Démarrage', 'Fin contractuelle', 'Fin réelle'],
      datasets: [
        {
          label: 'Planning',
          data: [
            0,
            deadlineData.projetInfo.delaisInitial,
            deadlineData.suivis.delaisReel || 0
          ],
          borderColor: '#4e73df',
          backgroundColor: 'rgba(78, 115, 223, 0.05)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Suivi des Délais de Projet</h1>

      {/* Sélection du projet */}
      <div className="project-selector">
        <label>Sélectionner un projet :</label>
        <select 
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          disabled={loading}
        >
          <option value="">-- Choisir un projet --</option>
          {projets.map(projet => (
            <option key={projet.id} value={projet.id}>
              {projet.numProjet} - {projet.nomProjet}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="loading">Chargement...</div>}

      {!loading && selectedProjectId && deadlineData && (
        <>
          {/* Résumé du projet */}
          <div className="project-summary">
            <h2>{deadlineData.projetInfo.nomProjet}</h2>
            <p>{deadlineData.projetInfo.description}</p>
            <div className="project-dates">
              <div>
                <span>Date démarrage :</span>
                <strong>{deadlineData.projetInfo.dateDemarrage}</strong>
              </div>
              <div>
                <span>Fin contractuelle :</span>
                <strong>{deadlineData.suivis.dateFinContractuelle}</strong>
              </div>
              <div>
                <span>Fin réelle :</span>
                <strong className={
                  deadlineData.suivis.delaiDepasse ? 'text-danger' : ''
                }>
                  {deadlineData.suivis.dateFinReelle || 'Non définie'}
                </strong>
              </div>
            </div>
          </div>

          {/* Graphique */}
          <div className="chart-card">
            <h3>Évolution des Délais</h3>
            <div className="chart-container">
              {prepareChartData() && (
                <Line 
                  data={prepareChartData()} 
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Jours' }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Délai initial</h4>
              <p>{deadlineData.projetInfo.delaisInitial} jours</p>
            </div>
            <div className="stat-card">
              <h4>Délai réel</h4>
              <p>{deadlineData.suivis.delaisReel || '--'} jours</p>
            </div>
            <div className="stat-card">
              <h4>Retard</h4>
              <p className={
                deadlineData.suivis.delaiDepasse ? 'text-danger' : ''
              }>
                {deadlineData.suivis.delaisReel 
                  ? `${deadlineData.suivis.delaisReel - deadlineData.projetInfo.delaisInitial} jours` 
                  : '--'}
              </p>
            </div>
            <div className="stat-card">
              <h4>Arrêts de travail</h4>
              <p>{deadlineData.arrets?.length || 0}</p>
            </div>
          </div>

          {/* Liste des arrêts */}
          <div className="arrets-list">
            <h3>Arrêts de travail enregistrés</h3>
            {deadlineData.arrets?.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Date début</th>
                    <th>Date fin</th>
                    <th>Durée (jours)</th>
                    <th>Motif</th>
                  </tr>
                </thead>
                <tbody>
                  {deadlineData.arrets.map((arret, index) => (
                    <tr key={index}>
                      <td>{arret.dateDebut}</td>
                      <td>{arret.dateFin}</td>
                      <td>{calculateDuree(arret.dateDebut, arret.dateFin)}</td>
                      <td>{arret.motif}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Aucun arrêt de travail enregistré pour ce projet</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardDelais;

// Styles
const styles = `
.dashboard-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-title {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
}

.project-selector {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.project-selector label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
}

.project-selector select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.project-summary {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.project-summary h2 {
  margin-top: 0;
  color: #2c3e50;
}

.project-dates {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.project-dates div {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.project-dates span {
  display: block;
  font-size: 14px;
  color: #666;
}

.project-dates strong {
  font-size: 16px;
}

.text-danger {
  color: #e74c3c;
}

.chart-card {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.chart-card h3 {
  margin-top: 0;
}

.chart-container {
  height: 300px;
  margin-top: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h4 {
  margin-top: 0;
  color: #666;
  font-size: 16px;
}

.stat-card p {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 0;
}

.arrets-list {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.arrets-list h3 {
  margin-top: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: 600;
}

@media (max-width: 768px) {
  .project-dates {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  th, td {
    padding: 8px 10px;
  }
}
`;

// Ajouter les styles
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);