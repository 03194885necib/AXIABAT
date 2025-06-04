import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, Timestamp, query, where, addDoc ,orderBy} from 'firebase/firestore';
import { db } from '../../firebase';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
    const [ttcPrécedent, setTtcPrécedent] = useState(0);
    const [ttcActuel, setTtcActuel] = useState(0);

    const [décomptes, setDécomptes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProjectName, setSelectedProjectName] = useState('');
    const [netAPayer, setNetAPayer] = useState(0);
    const [netAPayerEnLettres, setNetAPayerEnLettres] = useState('');

    const [ajouterDecompte, setAjouterDecompte] = useState(false)

    useEffect(() => {
        const fetchDécomptesData = async () => {
            if (!selectedProjetId || !moisDécompte) {
                setDécomptes([]);
                setTtcPrécedent(0);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Récupérer la liste des décomptes pour le projet actuel
                const décomptesRef = collection(db, 'décomptes');
                const qDécomptesActuel = query(décomptesRef, where('projetId', '==', selectedProjetId));
                const querySnapshotActuel = await getDocs(qDécomptesActuel);
                const décomptesDataActuel = querySnapshotActuel.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setDécomptes(décomptesDataActuel);
                console.log("liiiiste", décomptesDataActuel);

                console.log("moiis", moisDécompte);
                const premierJourMoisActuel = new Date(moisDécompte + '-01');
                console.log("premierJourMoisActuel", premierJourMoisActuel);
                const premierJourMoisPrécedent = new Date(premierJourMoisActuel);
                premierJourMoisPrécedent.setMonth(premierJourMoisPrécedent.getMonth() - 1);
                console.log("premierJourMoisPrécedent", premierJourMoisPrécedent);
                const anneePrecedente = premierJourMoisPrécedent.getFullYear();
                const moisPrecedent = String(premierJourMoisPrécedent.getMonth() + 1).padStart(2, '0');
                const moisFormatPrecedent = `${anneePrecedente}-${moisPrecedent}`;
                console.log(moisFormatPrecedent);

                // Récupérer le TTC du mois précédent pour le projet actuel
                const qDécomptesPrecedent = query(
                    décomptesRef,
                    where('projetId', '==', selectedProjetId),
                    where('mois', '==', moisFormatPrecedent)
                );
                const snapshotPrecedent = await getDocs(qDécomptesPrecedent);

                if (!snapshotPrecedent.empty) {
                    console.log("yees (mois précédent trouvé)");
                    const premierDocPrecedent = snapshotPrecedent.docs[0];
                    const ttcPrecedent = parseFloat(premierDocPrecedent.data().ttc || 0);
                    console.log("ttc précédent:", ttcPrecedent);
                    setTtcPrécedent(ttcPrecedent);
                } else {
                    setTtcPrécedent(0); // Si aucun décompte trouvé pour le mois précédent
                }

            } catch (err) {
                console.error("Erreur lors de la récupération des décomptes : ", err);
                setError("Erreur lors de la récupération des décomptes.");
            } finally {
                setLoading(false);
            }
        };

        fetchDécomptesData();
    }, [selectedProjetId, moisDécompte, setDécomptes, setLoading, setError, setTtcPrécedent]);




    useEffect(() => {
        const fetchPreviousQuantities = async () => {
            if (!selectedProjetId || !moisDécompte) return;

            const articlesProjetRef = collection(db, 'articlesProjet');
            const qArticles = query(articlesProjetRef, where('projectId', '==', selectedProjetId));
            const articlesSnapshot = await getDocs(qArticles);
            const articlesData = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setArticlesProjet(articlesData);

            const décomptesRef = collection(db, 'décomptes');
            const qDécomptes = query(décomptesRef, where('projetId', '==', selectedProjetId));
            const décomptesSnap = await getDocs(qDécomptes);

            const totalQuantités = {};

            for (const docDécompte of décomptesSnap.docs) {
                const décompte = docDécompte.data();
                if (!décompte.mois || décompte.mois >= moisDécompte) continue;

                const articlesRef = collection(db, 'décomptes', docDécompte.id, 'ArticlesDecompte');
                const articlesSnap = await getDocs(articlesRef);

                articlesSnap.forEach(articleDoc => {
                    const data = articleDoc.data();
                    const articleId = data.articleId;
                    if (!articleId) return;
                    totalQuantités[articleId] = (totalQuantités[articleId] || 0) + (data.quantitéRéalisée || 0);
                });
            }

            setQuantitésPrécédentes(totalQuantités);
        };

        fetchPreviousQuantities();
    }, [selectedProjetId, moisDécompte]);


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

                        // initialPourcentages[article.id] = article.quantity > 0
                        //     ? Math.round(((initialQuantitésPrécédentes[article.id] || 0) / article.quantity) * 100)
                        //     : 0;
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
            // D'abord, trouvez tous les décomptes précédents pour ce projet
            const decomptesRef = collection(db, 'décomptes');
            const q = query(decomptesRef, where('projetId', '==', projectId));

            const snapshot = await getDocs(q);
            let totalPreviousQuantity = 0;

            // Pour chaque décompte trouvé, cherchez l'article dans sa sous-collection
            for (const doc of snapshot.docs) {
                const articlesRef = collection(db, 'décomptes', doc.id, 'ArticlesDecompte');
                const articleQuery = query(articlesRef, where('articleId', '==', articleId));
                const articleSnapshot = await getDocs(articleQuery);

                articleSnapshot.forEach(articleDoc => {
                    totalPreviousQuantity += articleDoc.data().quantitéRéalisée || 0;
                });
            }

            return totalPreviousQuantity;
        };
        fetchArticlesWithPreviousData();
    }, [selectedProjetId]);



    useEffect(() => {


        const calculateTtcActuel = () => {
            let totalHT = 0;
            let totalTVA = 0;

            for (const articleId in quantitésRéalisées) {
                const article = articlesProjet.find(a => a.id === articleId);
                if (!article) continue;
                // console.log("ndndnndndndndnd",quantitésRéalisées[articleId])
                const qteActuelle = quantitésRéalisées[articleId] || 0;
                const qtePrec = quantitésPrécédentes[articleId] || 0;
                console.log("qtePrec3", qtePrec)
                const qteCumule = qteActuelle + qtePrec;

                totalHT += qteCumule * article.unitPrice;
                totalTVA += qteCumule * article.unitPrice * ((article.tvaRate / 100) || 0);


            }


            console.log("totalHT", totalHT)
            setTtcActuel(totalHT + totalTVA);
        };


        if (selectedProjetId && moisDécompte) {
            // fetchPreviousTTC(selectedProjetId, moisDécompte).then(ttc => setTtcPrécedent(ttc));
            calculateTtcActuel();
        } else {
            setTtcPrécedent(0);
            setTtcActuel(0);
        }
    }, [selectedProjetId, moisDécompte, quantitésRéalisées, articlesProjet]);



    useEffect(() => {
        // Récupérer le nom du projet sélectionné
        const selectedProject = projets.find(p => p.id === selectedProjetId);
        setSelectedProjectName(selectedProject ? selectedProject.name : '');
    }, [selectedProjetId, projets]);





    const numberToWords = (number) => {
        const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
        const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];
        const teens = ['onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];

        function convertLessThanThousand(num) {
            if (num === 0) return '';
            if (num < 10) return units[num];
            if (num < 20) return teens[num - 11];
            if (num < 100) {
                const ten = Math.floor(num / 10);
                const unit = num % 10;
                return tens[ten] + (unit ? `-${units[unit]}` : '');
            }
            const hundred = Math.floor(num / 100);
            const remainder = num % 100;
            return units[hundred] + ' cent ' + (remainder ? convertLessThanThousand(remainder) : '');
        }

        if (number === 0) return 'zéro';

        let result = '';
        const milliard = Math.floor(number / 1000000000);
        const million = Math.floor((number % 1000000000) / 1000000);
        const thousand = Math.floor((number % 1000000) / 1000);
        const rest = Math.floor(number % 1000);

        if (milliard) {
            result += convertLessThanThousand(milliard) + (milliard > 1 ? ' milliards ' : ' milliard ');
        }
        if (million) {
            result += convertLessThanThousand(million) + (million > 1 ? ' millions ' : ' million ');
        }
        if (thousand) {
            result += convertLessThanThousand(thousand) + ' mille ';
        }
        if (rest) {
            result += convertLessThanThousand(rest);
        }

        const decimalPart = Math.round((number % 1) * 100); // Get the decimal part, rounded to 2 digits.
        if (decimalPart > 0) {
            result += ' virgule ' + convertLessThanThousand(decimalPart);
        }

        return result.trim();
    };



    const exportToPDF = () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        const sectionFontSize = 14;
        const normalFontSize = 12;
        const margin = 15;
        const titleFontSize = 18;

        doc.setFont('Helvetica');

        // Titre principal centré
        const titleText = 'Décompte Mensuel';
        const titleWidth = doc.getTextWidth(titleText);
        const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
        doc.setFontSize(titleFontSize);
        doc.setTextColor(0); // Noir
        doc.text(titleX, margin + 10, titleText);

        // Infos Projet et Mois
        doc.setFontSize(normalFontSize);
        doc.setTextColor(50);  // Gris foncé
        doc.text(`Projet : ${selectedProjectName}`, margin, margin + 30);
        doc.text(`Mois : ${moisDécompte}`, margin, margin + 38);
         doc.text(`Numéro : ${numeroDécompte}`, margin, margin + 44);

        const tableMarginTop = margin + 50;
        const tableHeadColor = '#3498db'; // Bleu plat
        const tableTextColor = '#FFFFFF';
        const tableBodyTextColor = '#2c3e50'; // Gris très foncé
        const tableLineWidth = 0.2;
        const tableLineColor = '#e0e0e0'; // Gris clair

        const addStyledTable = (doc, options) => {
            autoTable(doc, {
                ...options,
                styles: {
                    headStyles: {
                        fillColor: tableHeadColor,
                        textColor: tableTextColor,
                        lineWidth: tableLineWidth,
                        lineColor: tableLineColor,
                        font: 'Helvetica',
                        fontSize: normalFontSize,
                        fontStyle: 'bold',
                        halign: 'center'
                    },
                    bodyStyles: {
                        textColor: tableBodyTextColor,
                        lineWidth: tableLineWidth,
                        lineColor: tableLineColor,
                        font: 'Helvetica',
                        fontSize: normalFontSize,
                        halign: 'right' // Aligner le contenu du corps à droite par défaut
                    },
                    columnStyles: {
                        0: { halign: 'left' }, // Aligner la première colonne (Article) à gauche
                        1: { halign: 'left' }, // Aligner la deuxième colonne (Designation) à gauche
                        2: { halign: 'center' },
                        3: { halign: 'center' },
                        4: { halign: 'center' },
                        5: { halign: 'center' },
                        6: { halign: 'center' },
                        7: { halign: 'right' },
                        8: { halign: 'right' },
                    },
                },
            });
        };

        // Calculate totals
        let totalHT = 0;
        let totalTVA = 0;
        let totalTTC = 0;

        const tableData = articlesProjet.map(article => {
            const qte = quantitésRéalisées[article.id] || 0;
            const qtePrec = quantitésPrécédentes[article.id] || 0;
            const qteCumul = qte + qtePrec;
            const prixFinal = qteCumul * article.unitPrice;
            const tva = prixFinal * (article.tvaRate / 100 || 0);
            const ttc = prixFinal + tva;

            totalHT += prixFinal;
            totalTVA += tva;
            totalTTC += ttc;

            return [
                article.articleNumber,
                article.designation,
                article.unite,
                article.quantity,
                qtePrec,
                qte,
                qteCumul,
                article.unitPrice.toFixed(2),
                prixFinal.toFixed(2)
            ];
        });

        // Add totals row
        tableData.push([
            { content: 'Total HT', colSpan: 7, styles: { halign: 'right', fontStyle: 'bold', textColor: tableBodyTextColor } },
            '',
            totalHT.toFixed(2)
        ]);
        tableData.push([
            { content: 'Total TVA', colSpan: 7, styles: { halign: 'right', fontStyle: 'bold', textColor: tableBodyTextColor } },
            '',
            totalTVA.toFixed(2)
        ]);
        tableData.push([
            { content: 'Total TTC', colSpan: 7, styles: { halign: 'right', fontStyle: 'bold', textColor: tableBodyTextColor } },
            '',
            totalTTC.toFixed(2)
        ]);

        // Table 1: Articles
        addStyledTable(doc, {
            startY: tableMarginTop,
            head: [['Article', 'Désignation', 'Unité', 'Quantité Marché', 'Quantité Précédente', 'Quantité (Mois)', 'Qte cumulée', 'Prix Unitaire', 'Prix Finale']],
            body: tableData,
        });

        const finalY = doc.lastAutoTable.finalY + 20;

        // Table 2: Récapitulatif
        addStyledTable(doc, {
            startY: finalY,
            head: [['TTC Mois Précédent', 'TTC Mois Actuel', 'Reste']],
            body: [
                [ttcPrécedent.toFixed(2), ttcActuel.toFixed(2), (ttcActuel - ttcPrécedent).toFixed(2)]
            ]
        });


        const recapFinancierY = finalY + 30;

        // Bloc Récapitulatif Financier
        doc.setFontSize(sectionFontSize);
        doc.setTextColor(0);
        doc.text("Récapitulatif Financier", margin, recapFinancierY);

        doc.setFontSize(normalFontSize);
        doc.setTextColor(50);
        const reste = ttcActuel - ttcPrécedent;
        const retenueTVA = -(reste - (reste / 1.19)) / 4;
        const retenueFiscale = -reste * 0.0115;
        const netAPayerLocal = reste + retenueTVA + retenueFiscale;

        // Convertir le montant net à payer en lettres
        const amountInWords = numberToWords(netAPayerLocal);
        setNetAPayerEnLettres(amountInWords);

        doc.text(`Reste à payer : ${reste.toFixed(2)}`, margin, recapFinancierY + 10);
        doc.text(`Retenue TVA (25%): ${retenueTVA.toFixed(2)}`, margin, recapFinancierY + 15);
        doc.text(`Retenue Fiscale (1.15%): ${retenueFiscale.toFixed(2)}`, margin, recapFinancierY + 20);
        doc.setFontSize(sectionFontSize);
        doc.setTextColor(0);
        doc.text(`Net à Payer : ${netAPayerLocal.toFixed(2)}`, margin, recapFinancierY + 30);
        doc.setFontSize(normalFontSize);
        doc.setTextColor(50);
        doc.text(`Net à Payer en lettres : ${amountInWords}`, margin, recapFinancierY + 35);


        // Ajouter une note de bas de page
        const footerText = "AxiaBat groupe.";
        const footerFontSize = 10;
        doc.setFontSize(footerFontSize);
        const footerWidth = doc.getTextWidth(footerText);
        const footerX = (doc.internal.pageSize.width - footerWidth) / 2;
        const footerY = doc.internal.pageSize.height - margin - 5;
        doc.setTextColor(128);
        doc.text(footerX, footerY, footerText);
        doc.save(`Décompte_${moisDécompte}.pdf`);
    };

    const exportToExcel = () => {
        const data = articlesProjet.map(article => {
            const qte = quantitésRéalisées[article.id] || 0;
            return {
                Article: article.articleNumber,
                Désignation: article.designation,
                Quantité: qte,
                'Prix Unitaire': article.unitPrice,
                'TVA (%)': (article.tvaRate || 0) * 100,
                'Total TTC': qte * article.unitPrice * (1 + (article.tvaRate || 0))
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Décompte');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBuffer]), `Decompte_${moisDécompte}.xlsx`);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionStatus(null);

        if (!selectedProjetId || !moisDécompte) {
            setSubmissionStatus({ type: 'error', message: 'Veuillez remplir tous les champs requis.' });
            return;
        }

        const décompteData = {
            projetId: selectedProjetId,
            mois: moisDécompte,
            numero: numeroDécompte,
            dateCréation: Timestamp.now(),
            ttc: ttcActuel,
        };

        try {
            const décompteRef = collection(db, 'décomptes');
            const newDécompteDocRef = await addDoc(décompteRef, décompteData);
            const décompteId = newDécompteDocRef.id;

            const articlesDecompteRef = collection(db, 'décomptes', décompteId, 'ArticlesDecompte');
            for (const articleId in quantitésRéalisées) {
                if (quantitésRéalisées[articleId] > 0) {
                    const article = articlesProjet.find(a => a.id === articleId);
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

            setSubmissionStatus({ type: 'success', message: 'Décompte enregistré avec succès !' });
        } catch (error) {
            console.error("Erreur lors de l'enregistrement :", error);
            setSubmissionStatus({ type: 'error', message: 'Erreur lors de l\'enregistrement du décompte.' });
        }
    };


    const AjouterDecompte = () => {
        if (selectedProjetId) {
            setAjouterDecompte(!ajouterDecompte)
        }
    }


useEffect(() => {
  const afficherPlusGrandNumeroDecompte = async () => {
    try {
      const decomptesRef = collection(db, 'décomptes');
      const q = query(decomptesRef, where('projetId', '==', selectedProjetId));
      const querySnapshot = await getDocs(q);

      const decomptes = querySnapshot.docs.map(doc => doc.data());
      const plusGrandNumero = decomptes.sort((a, b) => b.numero - a.numero)[0]?.numero || 0;

      console.log('Plus grand numéro de décompte :', plusGrandNumero);
      setNumeroDécompte(plusGrandNumero + 1);
    } catch (error) {
      console.error('Erreur lors de la récupération des décomptes :', error);
    }
  };

  // Appeler la fonction
  if (selectedProjetId) {
    afficherPlusGrandNumeroDecompte();
  }
}, [selectedProjetId, projets]);


    return (
        <div className={styles.container}>



            <h2>Créer un Décompte Mensuel</h2>

            {loadingProjets ? (
                <p className={styles.loading}>Chargement des projets...</p>
            ) : (
                <div className={styles.formGroup}>
                    <label htmlFor="projet">Sélectionner le projet :</label>
                    <select id="projet" value={selectedProjetId} onChange={(e) => setSelectedProjetId(e.target.value)} className={styles.select}>
                        <option value="">-- Choisir un projet --</option>
                        {projets.map(projet => (
                            <option key={projet.id} value={projet.id}>{projet.numProjet}</option>
                        ))}
                    </select>
                </div>


            )}

            <button onClick={AjouterDecompte}>Ajouter Décompte</button>

            {ajouterDecompte && <div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="mois">Mois du décompte :</label>
                        <input type="month" id="mois" value={moisDécompte} onChange={(e) => setMoisDécompte(e.target.value)} className={styles.input} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="numero">Numéro du décompte :</label>
                        <input type="number" id="numero" min="1" value={numeroDécompte} 
                        // onChange={(e) => setNumeroDécompte(parseInt(e.target.value))} 
                        readOnly
                        className={styles.input} />
                    </div>

                    {loadingArticles ? (
                        <p className={styles.loading}>Chargement des articles...</p>
                    ) : (
                        <table className={styles.articlesTable}>
                            <thead>
                                <tr>
                                    <th>Article</th>
                                    <th>Désignation</th>
                                    <th>Unité</th>
                                    <th>Quantité Marché</th>
                                    <th>Quantité Précédente</th>
                                    <th>Quantité (Mois)</th>
                                    <th>Qte cumulée</th>
                                    <th>Prix Unitaire</th>
                                    <th>Prix Finale</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articlesProjet.map(article => {
                                    console.log(article.id)
                                    const qActuelle = quantitésRéalisées[article.id] || 0;
                                    const qPrec = quantitésPrécédentes[article.id] || 0;
                                    console.log(qPrec)
                                    const qCumul = qPrec + qActuelle;
                                    const total = qCumul * article.unitPrice;

                                    return (
                                        <tr key={article.id}>
                                            <td>{article.articleNumber}</td>
                                            <td>{article.designation}</td>
                                            <td>{article.unite}</td>
                                            <td>{article.quantity}</td>
                                            <td>{qPrec}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={qActuelle}
                                                    onChange={(e) => setQuantitésRéalisées(prev => ({ ...prev, [article.id]: parseInt(e.target.value) || 0 }))}
                                                    min="0"
                                                    className={styles.inputTable}
                                                />
                                            </td>
                                            <td>{qCumul}</td>
                                            <td>{article.unitPrice}</td>
                                            <td>{total.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total HT :</td>
                                    <td colSpan="2">
                                        {articlesProjet.reduce((total, article) => {
                                            const qActuelle = quantitésRéalisées[article.id] || 0;
                                            const qPrec = quantitésPrécédentes[article.id] || 0;
                                            const qCumul = qPrec + qActuelle;
                                            return total + (qCumul * article.unitPrice);
                                        }, 0).toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total TVA :</td>
                                    <td colSpan="2">
                                        {articlesProjet.reduce((total, article) => {
                                            const qActuelle = quantitésRéalisées[article.id] || 0;
                                            const qPrec = quantitésPrécédentes[article.id] || 0;
                                            const qCumul = qPrec + qActuelle;
                                            console.log("tva", article.tvaRate)

                                            console.log("le total est ", total + (qCumul * article.unitPrice * (article.tvaRate / 100 || 0)))
                                            return total + (qCumul * article.unitPrice * (article.tvaRate / 100 || 0));

                                            // return total * (article.tvaRate);
                                        }, 0).toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total TTC :</td>
                                    <td colSpan="2">
                                        {articlesProjet.reduce((total, article) => {
                                            const qActuelle = quantitésRéalisées[article.id] || 0;
                                            const qPrec = quantitésPrécédentes[article.id] || 0;
                                            const qCumul = qPrec + qActuelle;
                                            const ttc = total + (qCumul * article.unitPrice * (1 + (article.tvaRate / 100 || 0)));
                                            //    setTtcActuel(ttc)
                                            return total + (qCumul * article.unitPrice * (1 + (article.tvaRate / 100 || 0)));
                                        }, 0).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    )}

                    <div className={styles.recapTable}>
                        <h3>Récapitulatif Financier TTC</h3>
                        <table>
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
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className={styles.button}>Enregistrer le Décompte</button>
                        <button type="button" onClick={exportToPDF} className={styles.button}>Exporter en PDF</button>
                        
                    </div>
                </form>

            </div>}
            {submissionStatus && (
                <p className={submissionStatus.type === 'success' ? styles['success-message'] : styles['error-message']}>
                    {submissionStatus.message}
                </p>
            )}
        </div>
    );
}
export default DécompteForm