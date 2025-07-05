import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase'; // Assure-toi que le chemin est correct
import styles from './ProjectDashboard.module.css'; // Pour le CSS

function ProjectDashboard() {
    const [projets, setProjets] = useState([]);
    const [selectedProjetId, setSelectedProjetId] = useState('');
    const [projetData, setProjetData] = useState(null); // Pour stocker les données du projet sélectionné
    const [totalRealise, setTotalRealise] = useState(0); // Montant réalisé (total du marché)
    const [totalDecompte, setTotalDecompte] = useState(0); // Montant actualisé par les décomptes (total TTC cumulé)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- EFFET 1: Récupérer la liste des projets au montage du composant ---
    useEffect(() => {
        const fetchProjets = async () => {
            try {
                const projetsCollection = collection(db, 'projects');
                const querySnapshot = await getDocs(projetsCollection);
                const projetsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProjets(projetsData);
                setLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des projets : ", error);
                setError('Erreur lors du chargement des projets.');
                setLoading(false);
            }
        };

        fetchProjets();
    }, []);

    // --- EFFET 2: Calculer les totaux lorsque le projet sélectionné change ---
    useEffect(() => {
        const calculateProjectData = async () => {
            if (!selectedProjetId) {
                setProjetData(null);
                setTotalRealise(0);
                setTotalDecompte(0);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // 1. Récupérer les détails du projet sélectionné
                const projectDoc = projets.find(p => p.id === selectedProjetId);
                setProjetData(projectDoc);

                // 2. Calculer le 'Montant réalisé des travaux' (basé sur tous les articles du marché du projet)
                const articlesProjetRef = collection(db, 'articlesProjet');
                const qArticles = query(articlesProjetRef, where('projectId', '==', selectedProjetId));
                const articlesSnapshot = await getDocs(qArticles);
                let realisedAmount = 0;
                articlesSnapshot.forEach(doc => {
                    const article = doc.data();
                    realisedAmount += (article.quantity || 0) * (article.unitPrice || 0) * (1 + (article.tvaRate / 100 || 0));
                });
                setTotalRealise(realisedAmount);

                // 3. Calculer le 'Montant actualisé par les décomptes' (somme des TTC de tous les décomptes du projet)
                const décomptesRef = collection(db, 'décomptes');
                const qDécomptes = query(décomptesRef, where('projetId', '==', selectedProjetId));
                const décomptesSnapshot = await getDocs(qDécomptes);

                let actualizedAmount = 0;
                if (!décomptesSnapshot.empty) {
                    décomptesSnapshot.forEach(doc => {
                        const decompte = doc.data();
                        actualizedAmount += (decompte.ttc || 0); // Utilise le champ TTC directement
                    });
                }
                setTotalDecompte(actualizedAmount);

            } catch (err) {
                console.error("Erreur lors du calcul des données du projet : ", err);
                setError('Erreur lors de la récupération des données du projet.');
            } finally {
                setLoading(false);
            }
        };

        calculateProjectData();
    }, [selectedProjetId, projets]); // Dépend de selectedProjetId et de la liste des projets (pour trouver le projet data)

    const rapport = totalRealise > 0 ? (totalDecompte / totalRealise) * 100 : 0;

    return (
        <div className={styles.dashboardContainer}>
            <h2 className={styles.dashboardTitle}>Tableau de Bord du Projet</h2>

            {loading && <p className={styles.loadingMessage}>Chargement des données...</p>}
            {error && <p className={styles.errorMessage}>{error}</p>}

            <div className={styles.formGroup}>
                <label htmlFor="project-select" className={styles.label}>Sélectionner un Projet :</label>
                <select
                    id="project-select"
                    className={styles.select}
                    value={selectedProjetId}
                    onChange={(e) => setSelectedProjetId(e.target.value)}
                    disabled={loading}
                >
                    <option value="">-- Choisir un projet --</option>
                    {projets.map((projet) => (
                        <option key={projet.id} value={projet.id}>
                            {projet.numProjet} - {projet.name} {/* Affiche le numéro et le nom du projet */}
                        </option>
                    ))}
                </select>
            </div>

            {selectedProjetId && projetData && !loading && !error && (
                <div className={styles.projectDetails}>
                    <h3 className={styles.projectName}>Détails du Projet : {projetData.numProjet} - {projetData.name}</h3>
                    <div className={styles.metricsGrid}>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Montant Total du Marché (TTC) :</span>
                            <span className={styles.metricValue}>{totalRealise.toFixed(2)} TND</span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Montant Cumulé des Décomptes (TTC) :</span>
                            <span className={styles.metricValue}>{totalDecompte.toFixed(2)} TND</span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Reste à Réaliser (TTC) :</span>
                            <span className={styles.metricValue}>{(totalRealise - totalDecompte).toFixed(2)} TND</span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Pourcentage de Réalisation :</span>
                            <span className={styles.metricValue} style={{ color: rapport >= 100 ? 'green' : 'orange' }}>
                                {rapport.toFixed(2)}%
                            </span>
                        </div>
                    </div>

                    {/* Tu peux ajouter des barres de progression ou des graphiques ici plus tard */}
                    <div className={styles.progressBarContainer}>
                        <div
                            className={styles.progressBarFill}
                            style={{ width: `${Math.min(rapport, 100)}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {!selectedProjetId && !loading && (
                <p className={styles.infoMessage}>Veuillez sélectionner un projet pour afficher le tableau de bord.</p>
            )}
        </div>
    );
}

export default ProjectDashboard;