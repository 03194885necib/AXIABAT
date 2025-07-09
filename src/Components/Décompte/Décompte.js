import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, Timestamp, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

import styles from './DécompteForm.module.css';
import { Navigate, useNavigate } from 'react-router-dom';

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
    const [ttcPrécedent, setTtcPrécedent] = useState(0);
    const [ttcActuel, setTtcActuel] = useState(0);
  const navigate=useNavigate()
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
            );
            const snapshot = await getDocs(q);
            let totalPreviousQuantity = 0;
            snapshot.forEach(doc => {
                totalPreviousQuantity += doc.data().quantitéRéalisée || 0;
            });
            return totalPreviousQuantity;
        };

        fetchArticlesWithPreviousData();
    }, [selectedProjetId]);

    useEffect(() => {
        const fetchPreviousTTC = async (projectId, moisActuel) => {
            if (!projectId || !moisActuel) {
                return 0;
            }

            const premierJourMoisActuel = new Date(moisActuel + '-01');
            const premierJourMoisPrécedent = new Date(premierJourMoisActuel);
            premierJourMoisPrécedent.setMonth(premierJourMoisPrécedent.getMonth() - 1);

            const anneePrecedente = premierJourMoisPrécedent.getFullYear();
            const moisPrecedent = (premierJourMoisPrécedent.getMonth() + 1).toString().padStart(2, '0');
            const moisFormatPrecedent = `<span class="math-inline">\{anneePrecedente\}\-</span>{moisPrecedent}`;

            const décomptesRef = collection(db, 'décomptes');
            const q = query(
                décomptesRef,
                where('projetId', '==', projectId),
                where('mois', '==', moisFormatPrecedent),

            );

            const snapshot = await getDocs(q);
            console.log(snapshot)
            let totalTTC = 0;
            if (!snapshot.empty) {

                // Si plusieurs décomptes, vous devrez décider comment agréger (somme, dernier, etc.)
                const premierDoc = snapshot.docs[0];
                const ttc = parseFloat(premierDoc.ttc || 0);
                setTtcPrécedent(ttc);

                const articlesDecompteRef = collection(db, 'décomptes', premierDoc.id, 'ArticlesDecompte');

                const articlesSnapshot = await getDocs(articlesDecompteRef);
                articlesSnapshot.forEach(doc => {
                    const data = doc.data();
                    totalTTC += (data.quantitéRéalisée || 0) * (data.prixUnitaire || 0) * (1 + (data.tvaRate || 0));
                });
            }
            return totalTTC;
        };

        const calculateTtcActuel = () => {
            let total = 0;
            for (const articleId in quantitésRéalisées) {
                if (quantitésRéalisées.hasOwnProperty(articleId) && quantitésRéalisées[articleId] > 0) {
                    const article = articlesProjet.find(art => art.id === articleId);
                    if (article) {
                        total += quantitésRéalisées[articleId] * article.unitPrice * (1 + (article.tvaRate || 0));
                    }
                }
            }
            setTtcActuel(total);
        };

        if (selectedProjetId && moisDécompte) {
            fetchPreviousTTC(selectedProjetId, moisDécompte).then(ttc => setTtcPrécedent(ttc));
            calculateTtcActuel();
        } else {
            setTtcPrécedent(0);
            setTtcActuel(0);
        }
    }, [selectedProjetId, moisDécompte, quantitésRéalisées, articlesProjet]);


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
            ttc: ttcActuel,
        };

console.log(décompteData)
        try {
            const décompteRef = collection(db, 'décomptes');
            const newDécompteDocRef = await addDoc(décompteRef, décompteData);
            const décompteId = newDécompteDocRef.id;

            const articlesDecompteRef = collection(db, 'décomptes', décompteId, 'ArticlesDecompte');

            for (const articleId in quantitésRéalisées) {
                if (quantitésRéalisées.hasOwnProperty(articleId) && quantitésRéalisées[articleId] > 0) {
                    const article = articlesProjet.find(art => art.id === articleId);
                    if (article) {
                        await addDoc(articlesDecompteRef, {
                            projetId: selectedProjetId,
                            articleId: article.id,
                            articleNumber: article.articleNumber,
                            designation: article.designation,
                            unite: article.unite,
                            quantitéMarché: article.quantity,
                            prixUnitaire: article.unitPrice,
                            tvaRate: article.tvaRate || 0,
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
  const handleGoToComparison = () => {
        navigate('/ProjectComparison'); // This should match the route in your App.js
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
                <>
                   <div className={styles.buttonContainer}> {/* Add a container for styling if needed */}
                        <button type="button" onClick={handleGoToComparison} className={styles.secondaryButton}>
                            Voir le Tableau Comparatif
                        </button>
                    </div>
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
                                        <th>Quantité(Mois)</th>
                                        <th>Qte cumulé</th>
                                        <th>Prix Unitaire</th>
                                        <th>Prix Finale</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {articlesProjet.map(article => {
                                        const quantitéActuelle = quantitésRéalisées[article.id] || 0;
                                        const quantitéPrécédente = quantitésPrécédentes[article.id] || 0;
                                        const qteCumuléeCalculée = quantitéPrécédente + quantitéActuelle;
                                        const prixFinalCalculé = qteCumuléeCalculée * article.unitPrice * (1 + (article.tvaRate || 0));

                                        return (
                                            <tr key={article.id}>
                                                <td>{article.articleNumber}</td>
                                                <td>{article.designation}</td>
                                                <td>{article.unite}</td>
                                                <td>{article.quantity}</td>
                                                <td>{quantitéPrécédente}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        value={quantitéActuelle}
                                                        onChange={(e) => handleQuantitéChange(article.id, e)}
                                                        min="0"
                                                        className={styles.inputTable}
                                                    />
                                                </td>
                                                <td>{qteCumuléeCalculée}</td>
                                                <td>{article.unitPrice}</td>
                                                <td>{prixFinalCalculé.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                {/* Footer pour les totaux HT, TVA et TTC */}
                                <tfoot>
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total HT :</td>
                                        <td colSpan="2" style={{ fontWeight: 'bold' }}>
                                            {articlesProjet.reduce((total, article) => {
                                                const quantitéActuelle = quantitésRéalisées[article.id] || 0;
                                                const quantitéPrécédente = quantitésPrécédentes[article.id] || 0;
                                                const qteCumuléeCalculée = quantitéPrécédente + quantitéActuelle;
                                                return total + (qteCumuléeCalculée * article.unitPrice);
                                            }, 0).toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total TVA :</td>
                                        <td colSpan="2" style={{ fontWeight: 'bold' }}>
                                            {articlesProjet.reduce((total, article) => {
                                                const quantitéActuelle = quantitésRéalisées[article.id] || 0;
                                                const quantitéPrécédente = quantitésPrécédentes[article.id] || 0;
                                                const qteCumuléeCalculée = quantitéPrécédente + quantitéActuelle;
                                                return total + (qteCumuléeCalculée * article.unitPrice * (article.tvaRate || 0));
                                            }, 0).toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total TTC :</td>
                                        <td colSpan="2" style={{ fontWeight: 'bold' }}>
                                            {articlesProjet.reduce((total, article) => {
                                                const quantitéActuelle = quantitésRéalisées[article.id] || 0;
                                                const quantitéPrécédente = quantitésPrécédentes[article.id] || 0;
                                                const qteCumuléeCalculée = quantitéPrécédente + quantitéActuelle;
                                                return total + (qteCumuléeCalculée * article.unitPrice * (1 + (article.tvaRate || 0)));
                                            }, 0).toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            <h3>Récapitulatif Financier TTC</h3>
                            <table className={styles.recapTable}>
                                <thead>
                                    <tr>
                                        <th>TTC Mois Précédent</th>
                                        <th>TTC Mois Actuel</th>
                                        <th>Reste</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{ttcPrécedent.toFixed(2)}</td>
                                        <td>{ttcActuel.toFixed(2)}</td>
                                        <td>{(ttcActuel - ttcPrécedent).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <button type="submit" disabled={loadingArticles}
                                className={styles.button}
                            >
                                Enregistrer le Décompte
                            </button>
                        </form>
                    )}
                </div>
                </>
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


