import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc, arrayUnion , serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const ProjetSuivi = () => {
    const [projets, setProjets] = useState([]);
    const [selectedProjet, setSelectedProjet] = useState(null);
    const [showSuivi, setShowSuivi] = useState(false);
    const [showArret, setShowArret] = useState(false);
    const [arrets, setArrets] = useState([]);
    const [newArret, setNewArret] = useState({
        dateDebut: '',
        dateFin: '',
        motif: '',
    });
    const [dateFinReelle, setDateFinReelle] = useState('');
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate()

    // Charger les projets depuis Firebase
    useEffect(() => {
        const fetchProjets = async () => {
            const querySnapshot = await getDocs(collection(db, 'projects'));
            const projetsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProjets(projetsList);
        };

        fetchProjets();
    }, []);

    // Mettre à jour la date de fin réelle quand le projet ou les arrêts changent
    useEffect(() => {
        if (selectedProjet) {
            const newDateFinReelle = calculateDateFinReelle();
            setDateFinReelle(newDateFinReelle);
        }
    }, [selectedProjet, arrets]);

    // Calculer la durée en jours/mois entre deux dates
    const calculateDuree = (dateDebut, dateFin) => {
        if (!dateDebut || !dateFin) return { jours: 0, mois: 0 };

        const debut = new Date(dateDebut);
        const fin = new Date(dateFin);
        const diffTime = Math.abs(fin - debut);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffMonths = Math.floor(diffDays / 30);

        return {
            jours: diffDays,
            mois: diffMonths,
            resteJours: diffDays % 30
        };
    };

    // Calculer la date de fin réelle en fonction des arrêts
    const calculateDateFinReelle = () => {
        if (!selectedProjet || !selectedProjet.dateDemarrage) return '';

        const dateDemarrage = new Date(selectedProjet.dateDemarrage);
        const delaisJours = parseInt(selectedProjet.delais) || 0;

        // Calculer le nombre total de jours d'arrêt
        const totalArretJours = arrets.reduce((total, arret) => {
            return total + calculateDuree(arret.dateDebut, arret.dateFin).jours;
        }, 0);

        const dateFin = new Date(dateDemarrage);
        dateFin.setDate(dateFin.getDate() + delaisJours + totalArretJours);

        return dateFin.toISOString().split('T')[0];
    };

    // Calculer la date de fin contractuelle
    const calculateDateFinContractuelle = () => {
        if (!selectedProjet || !selectedProjet.dateDemarrage || !selectedProjet.delais) return '';

        const date = new Date(selectedProjet.dateDemarrage);
        date.setDate(date.getDate() + parseInt(selectedProjet.delais));
        return date.toISOString().split('T')[0];
    };

    // Ajouter un nouvel arrêt
    const handleAddArret = () => {
        if (!newArret.dateDebut || !newArret.dateFin || !newArret.motif) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        // Vérifier que la date de fin est après la date de début
        if (new Date(newArret.dateFin) < new Date(newArret.dateDebut)) {
            alert('La date de fin doit être après la date de début');
            return;
        }

        const duree = calculateDuree(newArret.dateDebut, newArret.dateFin);
        const arretComplet = {
            ...newArret,
            dureeJours: duree.jours,
            dureeMois: duree.mois,
            resteJours: duree.resteJours,
            createdAt: new Date().toISOString()
        };

        setArrets([...arrets, arretComplet]);
        setNewArret({
            dateDebut: '',
            dateFin: '',
            motif: '',
        });
    };

    // Enregistrer les arrêts dans la table "deadlines"
    const handleSaveArrets = async () => {
        if (!selectedProjet || arrets.length === 0) return;

        try {
            // Créer un document dans la collection "deadlines"
            const deadlineData = {
                projetId: selectedProjet.id,
                projetNom: selectedProjet.nomProjet,
                dateDemarrage: selectedProjet.dateDemarrage,
                dateFinContractuelle: calculateDateFinContractuelle(),
                dateFinReelle: dateFinReelle,
                delaisInitial: selectedProjet.delais,
                delaisReel: calculateDuree(selectedProjet.dateDemarrage, dateFinReelle).jours,
                arrets: arrets,
                updatedAt: new Date().toISOString()
            };

            // Utiliser le projetId comme ID du document pour faciliter les requêtes
            await setDoc(doc(db, 'deadlines', selectedProjet.id), deadlineData);

            // Mettre à jour le projet avec la nouvelle date de fin réelle
            await updateDoc(doc(db, 'projets', selectedProjet.id), {
                dateFinReelle: dateFinReelle,
                arrets: arrayUnion(...arrets)
            });

            alert('Données enregistrées avec succès dans la table deadlines!');
            setShowArret(false);
        } catch (error) {
            console.error("Erreur lors de l'enregistrement:", error);
            alert("Une erreur est survenue lors de l'enregistrement");
        }
    };

    // Supprimer un arrêt
    const handleDeleteArret = (index) => {
        const newArrets = [...arrets];
        newArrets.splice(index, 1);
        setArrets(newArrets);
    };
    const saveToDeadlines = async () => {
        if (!selectedProjet || arrets.length === 0) return;

        setLoading(true);
        try {
            const deadlineData = {
                projetId: selectedProjet.id,
                projetInfo: {
                    nomProjet: selectedProjet.nomProjet,
                    numProjet: selectedProjet.numProjet,
                    description: selectedProjet.description,
                    budget: selectedProjet.budget,
                    bank: selectedProjet.bank,
                    dateDemarrage: selectedProjet.dateDemarrage,
                    delaisInitial: parseInt(selectedProjet.delais),
                    dateApprobation: selectedProjet.dateApprobation,
                    tva: selectedProjet.tva
                },
                suivis: {
                    dateFinContractuelle: calculateDateFinContractuelle(),
                    dateFinReelle: dateFinReelle,
                    delaisReel: calculateDuree(selectedProjet.dateDemarrage, dateFinReelle).jours,
                    delaiDepasse: new Date(dateFinReelle) > new Date(calculateDateFinContractuelle())
                },
                arrets: arrets,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            const deadlineRef = doc(db, 'deadlines', selectedProjet.id);
            await setDoc(deadlineRef, deadlineData, { merge: true });

            alert('Deadline enregistrée avec succès !');
            setShowArret(false);
            // Recharger les deadlines
            const querySnapshot = await getDocs(collection(db, 'deadlines'));
            setDeadlines(querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })));
        } catch (error) {
            console.error("Erreur:", error);
            alert(`Erreur: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


 const VoirDashboard =()=>{
    navigate('/DashDelais')
 }
    return (
        <div className="projet-suivi-container">
            <h1 className="title">Suivi des Projets</h1>

            {!selectedProjet ? (
                <div className="projet-list">
                    <h2>Liste des Projets</h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>N°</th>
                                    <th>Nom du Projet</th>
                                    <th>Description</th>
                                    <th>Budget</th>
                                    <th>Banque</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projets.map(projet => (
                                    <tr
                                        key={projet.id}
                                        onClick={() => {
                                            setSelectedProjet(projet);
                                            setArrets(projet.arrets || []);
                                        }}
                                    >
                                        <td>{projet.numProjet}</td>
                                        <td>{projet.nomProjet}</td>
                                        <td>{projet.description}</td>
                                        <td>{projet.budget}</td>
                                        <td>{projet.bank}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="projet-details">
                    <button
                        className="back-button"
                        onClick={() => {
                            setSelectedProjet(null);
                            setShowSuivi(false);
                            setShowArret(false);
                        }}
                    >
                        &larr; Retour à la liste
                    </button>

                    <h2>{selectedProjet.nomProjet}</h2>

                    <div className="projet-info-grid">
                        <div className="info-group">
                            <label>Numéro du projet</label>
                            <input type="text" value={selectedProjet.numProjet} readOnly />
                        </div>

                        <div className="info-group">
                            <label>Description</label>
                            <textarea value={selectedProjet.description} readOnly />
                        </div>

                        <div className="info-group">
                            <label>Budget</label>
                            <input type="text" value={`${selectedProjet.budget} ${selectedProjet.bank}`} readOnly />
                        </div>

                        <div className="info-group">
                            <label>Date d'approbation</label>
                            <input type="date" value={selectedProjet.dateApprobation} readOnly />
                        </div>

                        <div className="info-group">
                            <label>TVA</label>
                            <input type="text" value={`${selectedProjet.tva}%`} readOnly />
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button
                            className={`suivi-button ${showSuivi ? 'active' : ''}`}
                            onClick={() => {
                                setShowSuivi(!showSuivi);
                                setShowArret(false);
                            }}
                        >
                            Suivi Travaux
                        </button>

                        <button
                            className={`arret-button ${showArret ? 'active' : ''}`}
                            onClick={() => {
                                setShowArret(!showArret);
                                setShowSuivi(false);
                            }}
                        >
                            Suivi Arrêt Travaux
                        </button>
                    </div>

                    {showSuivi && (
                        <div className="suivi-section">
                            <h3>Suivi des Délais</h3>
                            <div className="suivi-grid">
                                <div className="info-group">
                                    <label>Date de démarrage</label>
                                    <input
                                        type="date"
                                        value={selectedProjet.dateDemarrage}
                                        readOnly
                                    />
                                </div>

                                <div className="info-group">
                                    <label>Date fin contractuelle</label>
                                    <input
                                        type="date"
                                        value={calculateDateFinContractuelle()}
                                        readOnly
                                    />
                                </div>

                                <div className="info-group">
                                    <label>Date fin réelle</label>
                                    <input
                                        type="date"
                                        value={dateFinReelle}
                                        readOnly
                                        className={dateFinReelle > calculateDateFinContractuelle() ? 'delai-depasse' : ''}
                                    />
                                </div>

                                <div className="info-group">
                                    <label>Délais initial (jours)</label>
                                    <input
                                        type="text"
                                        value={selectedProjet.delais}
                                        readOnly
                                    />
                                </div>

                                <div className="info-group">
                                    <label>Délais réel (jours)</label>
                                    <input
                                        type="text"
                                        value={calculateDuree(selectedProjet.dateDemarrage, dateFinReelle).jours}
                                        readOnly
                                        className={calculateDuree(selectedProjet.dateDemarrage, dateFinReelle).jours > parseInt(selectedProjet.delais) ? 'delai-depasse' : ''}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {showArret && (
                        <div className="arret-section">
                            <h3>Gestion des Arrêts de Travaux</h3>

                            <div className="arret-form">
                                <h4>Ajouter un nouvel arrêt</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date début</label>
                                        <input
                                            type="date"
                                            value={newArret.dateDebut}
                                            onChange={(e) => setNewArret({ ...newArret, dateDebut: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Date fin</label>
                                        <input
                                            type="date"
                                            value={newArret.dateFin}
                                            onChange={(e) => setNewArret({ ...newArret, dateFin: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Motif</label>
                                    <input
                                        type="text"
                                        value={newArret.motif}
                                        onChange={(e) => setNewArret({ ...newArret, motif: e.target.value })}
                                        placeholder="Raison de l'arrêt"
                                    />
                                </div>

                                <button
                                    className="add-button"
                                    onClick={handleAddArret}
                                >
                                    + Ajouter Arrêt
                                </button>
                            </div>

                            <div className="arret-list">
                                <h4>Liste des Arrêts</h4>
                                {arrets.length === 0 ? (
                                    <p className="no-arrets">Aucun arrêt enregistré</p>
                                ) : (
                                    <div className="table-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Date Début</th>
                                                    <th>Date Fin</th>
                                                    <th>Durée</th>
                                                    <th>Motif</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {arrets.map((arret, index) => (
                                                    <tr key={index}>
                                                        <td>{arret.dateDebut}</td>
                                                        <td>{arret.dateFin}</td>
                                                        <td>{arret.dureeJours} jours ({arret.dureeMois > 0 ? `${arret.dureeMois} mois ` : ''}{arret.resteJours > 0 ? `${arret.resteJours} jours` : ''})</td>
                                                        <td>{arret.motif}</td>
                                                        <td>
                                                            <button
                                                                className="delete-button"
                                                                onClick={() => handleDeleteArret(index)}
                                                            >
                                                                Supprimer
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="summary">
                                <p>
                                    <strong>Total jours d'arrêt:</strong> {arrets.reduce((total, arret) => total + arret.dureeJours, 0)} jours
                                </p>
                                <p>
                                    <strong>Nouvelle date de fin:</strong> {dateFinReelle}
                                </p>
                            </div>

                            <button
                                className="save-button"
                                onClick={saveToDeadlines}
                                disabled={arrets.length === 0}
                            >
                                Enregistrer les Arrêts
                            </button>


                             <button
                                className="save-button"
                                onClick={VoirDashboard}
                            >
                                VoirDashboard
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjetSuivi;

// Styles CSS
const styles = `
.projet-suivi-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: auto;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.title {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
}

.projet-list {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

tbody tr {
  transition: background-color 0.2s;
}

tbody tr:hover {
  background-color: #f8f9fa;
  cursor: pointer;
}

.projet-details {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.back-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.back-button:hover {
  background: #5a6268;
}

.projet-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-group label {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.info-group input, .info-group textarea {
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: #f8f9fa;
  font-family: inherit;
}

.info-group textarea {
  min-height: 80px;
  resize: vertical;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

.suivi-button, .arret-button {
  padding: 12px 25px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 15px;
}

.suivi-button {
  background: #3498db;
  color: white;
}

.suivi-button:hover {
  background: #2980b9;
}

.suivi-button.active {
  background: #1a6ea0;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3);
}

.arret-button {
  background: #e74c3c;
  color: white;
}

.arret-button:hover {
  background: #c0392b;
}

.arret-button.active {
  background: #a53125;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.3);
}

.suivi-section, .arret-section {
  margin-top: 20px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.suivi-section h3, .arret-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
}

.suivi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.delai-depasse {
  color: #e74c3c;
  font-weight: bold;
}

.arret-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.arret-form h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #495057;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 500;
  font-size: 14px;
  color: #495057;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-family: inherit;
}

.add-button, .save-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 10px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.add-button:hover, .save-button:hover {
  background: #218838;
}

.save-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.no-arrets {
  text-align: center;
  color: #6c757d;
  padding: 20px;
  background: white;
  border-radius: 4px;
}

.delete-button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.delete-button:hover {
  background: #bb2d3b;
}

.summary {
  background: white;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
  display: flex;
  justify-content: space-between;
}

.summary p {
  margin: 0;
  font-weight: 500;
}

@media (max-width: 768px) {
  .projet-info-grid, .suivi-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    flex-direction: column;
    gap: 15px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .summary {
    flex-direction: column;
    gap: 10px;
  }
}
`;

// Ajouter les styles au document
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);