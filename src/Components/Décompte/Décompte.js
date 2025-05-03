import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, Timestamp, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

import styles from './DécompteForm.module.css';

function DécompteForm() {
    const [projets, setProjets] = useState([]);
    const [selectedProjetId, setSelectedProjetId] = useState('');
    const [moisDécompte, setMoisDécompte] = useState('');
    const [numeroDécompte, setNumeroDécompte] = useState(1);
    const [articlesProjet, setArticlesProjet] = useState([]);
    const [quantitésRéalisées, setQuantitésRéalisées] = useState({});
    const [pourcentagesRéalisation, setPourcentagesRéalisation] = useState({});
    const [quantitésPrécédentes, setQuantitésPrécédentes] = useState({});
    const [loadingProjets, setLoadingProjets] = useState(true);
    const [loadingArticles, setLoadingArticles] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null);

    useEffect(() => {
        const fetchProjets = async () => {
            try {
                const projetsCollection = collection(db, 'projects');
                const querySnapshot = await getDocs(projetsCollection);
                const projetsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProjets(projetsData);
                setLoadingProjets(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des projets : ", error);
                setLoadingProjets(false);
                setSubmissionStatus({ type: 'error', message: 'Erreur lors de la récupération des projets.' });
            }
        };

        fetchProjets();
    }, []);

    useEffect(() => {
        const fetchArticlesWithPreviousData = async () => {
            if (selectedProjetId) {
                setLoadingArticles(true);
                const articlesProjetRef = collection(db, 'articlesProjet');
                const q = query(articlesProjetRef, where('projectId', '==', selectedProjetId));

                try {
                    const querySnapshot = await getDocs(q);
                    const articlesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setArticlesProjet(articlesData);

                    const initialQuantités = {};
                    const initialPourcentages = {};
                    const initialQuantitésPrécédentes = {};

                    for (const article of articlesData) {
                        initialQuantités[article.id] = 0;
                        initialPourcentages[article.id] = 0;
                        initialQuantitésPrécédentes[article.id] = await fetchPreviousQuantity(selectedProjetId, article.id);
                        
                        initialPourcentages[article.id] = article.quantity > 0
                            ? Math.round(((initialQuantitésPrécédentes[article.id] || 0) / article.quantity) * 100)
                            : 0;
                    }

                    setQuantitésRéalisées(initialQuantités);
                    setPourcentagesRéalisation(initialPourcentages);
                    setQuantitésPrécédentes(initialQuantitésPrécédentes);
                    setLoadingArticles(false);
                } catch (error) {
                    console.error("Erreur lors de la récupération des articles : ", error);
                    setLoadingArticles(false);
                    setSubmissionStatus({ type: 'error', message: 'Erreur lors de la récupération des articles.' });
                }
            } else {
                setArticlesProjet([]);
                setQuantitésRéalisées({});
                setPourcentagesRéalisation({});
                setQuantitésPrécédentes({});
                setLoadingArticles(false);
            }
        };

        const fetchPreviousQuantity = async (projectId, articleId) => {
            const articlesDecompteRef = collection(db, 'ArticlesDecompte');
            const q = query(
                articlesDecompteRef,
                where('projetId', '==', projectId),
                where('articleId', '==', articleId),

                // Ordonner par date de création pour obtenir le plus récent
                // orderBy('dateCréation', 'desc'),
                // limit(1)
            );
            const snapshot = await getDocs(q);
            let totalPreviousQuantity = 0;
            snapshot.forEach(doc => {
                totalPreviousQuantity += doc.data().quantitéRéalisée || 0;
                console.log("totalPreviousQuantity",articleId)

            });
            return totalPreviousQuantity;
        };

        fetchArticlesWithPreviousData();
    }, [selectedProjetId]);

    const handleProjetChange = (event) => {
        setSelectedProjetId(event.target.value);
    };

    const handleQuantitéChange = (articleId, event) => {
        setQuantitésRéalisées({
            ...quantitésRéalisées,
            [articleId]: parseInt(event.target.value) || 0,
        });
    };

    const handlePourcentageChange = (articleId, event) => {
        setPourcentagesRéalisation({
            ...pourcentagesRéalisation,
            [articleId]: parseInt(event.target.value) || 0,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmissionStatus(null);

        if (!selectedProjetId || !moisDécompte) {
            setSubmissionStatus({ type: 'error', message: 'Veuillez sélectionner un projet et un mois.' });
            return;
        }

        const décompteData = {
            projetId: selectedProjetId,
            mois: moisDécompte,
            numero: parseInt(numeroDécompte),
            dateCréation: Timestamp.now(),
        };

        try {
            const décompteRef = collection(db, 'décomptes');
            const newDécompteDocRef = await addDoc(décompteRef, décompteData);
            const décompteId = newDécompteDocRef.id;

            const articlesDecompteRef = collection(db, 'ArticlesDecompte');

            for (const articleId in quantitésRéalisées) {
                if (quantitésRéalisées.hasOwnProperty(articleId) && quantitésRéalisées[articleId] > 0) {
                    const article = articlesProjet.find(art => art.id === articleId);
                    if (article) {
                        await addDoc(articlesDecompteRef, {
                            décompteId: décompteId,
                            projetId: selectedProjetId,
                            articleId: article.id,
                            articleNumber: article.articleNumber,
                            designation: article.designation,
                            unite: article.unite,
                            quantitéMarché: article.quantity,
                            prixUnitaire: article.unitPrice,
                            tvaRate: article.tvaRate,
                            quantitéRéalisée: quantitésRéalisées[articleId],
                            pourcentageRéalisation: pourcentagesRéalisation[articleId] || 0,
                        });
                    }
                }
            }

            setSubmissionStatus({ type: 'success', message: 'Décompte et articles enregistrés avec succès !' });
            setMoisDécompte('');
            setNumeroDécompte(1);
            setQuantitésRéalisées({});
            setPourcentagesRéalisation({});
        } catch (error) {
            console.error("Erreur lors de l'enregistrement du décompte et des articles : ", error);
            setSubmissionStatus({ type: 'error', message: 'Erreur lors de l\'enregistrement du décompte et des articles.' });
        }
    };

    return (
        <div className={styles.container}>
            <h2>Créer un Décompte Mensuel</h2>

            {loadingProjets ? (
                <p className={styles.loading}>Chargement des projets...</p>
            ) : (
                <div className={styles.formGroup}>
                    <label htmlFor="projet">Sélectionner le projet :</label>
                    <select id="projet" value={selectedProjetId} onChange={handleProjetChange} required className={styles.select}>
                        <option value="">-- Choisir un projet --</option>
                        {projets.map(projet => (
                            <option key={projet.id} value={projet.id}>
                                {projet.numProjet}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {selectedProjetId && (
                <div>
                    <div className={styles.formGroup}>
                        <label htmlFor="moisDécompte">Mois du décompte :</label>
                        <input
                            type="month"
                            id="moisDécompte"
                            value={moisDécompte}
                            onChange={(e) => setMoisDécompte(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="numeroDécompte">Numéro du décompte :</label>
                        <input
                            type="number"
                            id="numeroDécompte"
                            value={numeroDécompte}
                            onChange={(e) => setNumeroDécompte(parseInt(e.target.value) || 1)}
                            min="1"
                            required
                            className={styles.input}
                        />
                    </div>

                    <h3>Articles du Projet</h3>
                    {loadingArticles ? (
                        <p className={styles.loading}>Chargement des articles...</p>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <table className={styles.articlesTable}>
                                <thead>
                                    <tr>
                                        <th>Article</th>
                                        <th>Désignation</th>
                                        <th>Unité</th>
                                        <th>Quantité Marché</th>
                                        <th>Quantité Précédente</th>
                                        <th>Quantité</th>
                                        <th>Prix Unitaire</th>
                                        <th>TVA</th>
                                        <th>Pourcentage de Réalisation</th>
                                        <th>Prix Final</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {articlesProjet.map(article => {
                                        const quantitéActuelle = quantitésRéalisées[article.id] || 0;
                                        const pourcentageRéalisationCalculé = article.quantity > 0 ? ((quantitésPrécédentes[article.id] || 0) + quantitéActuelle) / article.quantity * 100 : 0;
                                        const prixFinalCalculé = quantitéActuelle * article.unitPrice * (1 + (article.tvaRate || 0));

                                        return (
                                            <tr key={article.id}>
                                                <td>{article.articleNumber}</td>
                                                <td>{article.designation}</td>
                                                <td>{article.unite}</td>
                                                <td>{article.quantity}</td>
                                                <td>{quantitésPrécédentes[article.id] || 0}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={quantitéActuelle}
                                                        onChange={(e) => handleQuantitéChange(article.id, e)}
                                                        min="0"
                                                        className={styles.inputTable}
                                                    />
                                                </td>
                                                <td>{article.unitPrice}</td>
                                                <td>{article.tvaRate}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={pourcentagesRéalisation[article.id] !== undefined ? pourcentagesRéalisation[article.id] : Math.round(pourcentageRéalisationCalculé)}
                                                        onChange={(e) => handlePourcentageChange(article.id, e)}
                                                        min="0"
                                                        max="100"
                                                        className={styles.inputTable}
                                                    />%
                                                </td>
                                                <td>{prixFinalCalculé.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <button type="submit" disabled={loadingArticles} className={styles.button}>
                                Enregistrer le Décompte
                            </button>
                        </form>
                    )}
                </div>
            )}

            {submissionStatus && (
                <p className={submissionStatus.type === 'success' ? styles['success-message'] : styles['error-message']}>
                    {submissionStatus.message}
                </p>
            )}
        </div>
    );
}

export default DécompteForm;