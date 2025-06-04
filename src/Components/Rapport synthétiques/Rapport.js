import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../../firebase'; // Assuming you have firebase config
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ProjectDetails from './ProjectDetails'; // Component for M1 data
import ArticlesList from './ArticlesList'; // Modified ListeArticle for project context
import FileUpload from './FileUpload'; // New component for file uploads
import ReportGenerator from './ReportGenerator'; // New component for PDF generation
import './MonthlyReportDashboard.css'; // For basic styling

const MonthlyReportDashboard = () => {
    const [projectId, setProjectId] = useState('');
    const [projects, setProjects] = useState([]); // New state to store fetched projects
    const [projectData, setProjectData] = useState(null);
    const [journalData, setJournalData] = useState([]);
    const [delayNotesData, setDelayNotesData] = useState([]);
    const [paymentData, setPaymentData] = useState([]);
    const [dashboardData, setDashboardData] = useState([]);
    const [projectArticles, setProjectArticles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const reportContentRef = useRef(null);

    // useEffect to fetch the list of all projects
    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            setError(null);
            try {
                const projectsCollectionRef = collection(db, 'projects'); // Assuming your collection is named 'projets' based on earlier code
                const q = query(projectsCollectionRef, orderBy('numProjet', 'asc')); // Order by project name
                const querySnapshot = await getDocs(q);
                const projectsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProjects(projectsList);
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError("Failed to load projects list.");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        const fetchData = async () => {
            if (!projectId) {
                // Clear data if no project is selected
                setProjectData(null);
                setJournalData([]);
                setDelayNotesData([]);
                setPaymentData([]);
                setDashboardData([]);
                setProjectArticles([]);
                setUploadedFiles([]);
                return; // Exit if no project ID
            }

            setLoading(true);
            setError(null);
            try {
                // Fetch Project Details (M1)
                const projectDocRef = doc(db, 'projects', projectId);
                const projectSnap = await getDoc(projectDocRef);
                if (projectSnap.exists()) {
                    setProjectData(projectSnap.data());
                } else {
                    setError('Project not found.');
                    setProjectData(null);
                }

                // Fetch Journal de Chantier (M2)
                const journalQuery = query(collection(db, 'projets', projectId, 'journalDeChantier'), orderBy('date', 'asc'));
                const journalSnapshot = await getDocs(journalQuery);
                setJournalData(journalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch Notes de calcul des délais (M3)
                const delayNotesQuery = query(collection(db, 'projects', projectId, 'notesCalculDelais'), orderBy('date', 'asc'));
                const delayNotesSnapshot = await getDocs(delayNotesQuery);
                setDelayNotesData(delayNotesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch Décomptes et tableaux comparatifs mensuels (M4)
                const paymentQuery = query(collection(db, 'projects', projectId, 'decompteTableauxComparatifs'), orderBy('month', 'asc'));
                const paymentSnapshot = await getDocs(paymentQuery);
                setPaymentData(paymentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch Tableaux de bord financiers et d'avancement (M5)
                const dashboardQuery = query(collection(db, 'projects', projectId, 'tableauxDeBord'), orderBy('date', 'asc'));
                const dashboardSnapshot = await getDocs(dashboardQuery);
                setDashboardData(dashboardSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch Project Articles (if stored as a subcollection or linked)
                const articlesQuery = query(collection(db, 'projects', projectId, 'ArticlesProjet'));
                const articlesSnapshot = await getDocs(articlesQuery);
                setProjectArticles(articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // (Optional) Fetch uploaded files for the project if they are linked to the project ID
                // For simplicity, this example just uses state, but in a real app, you'd fetch them from Storage or Firestore
                // const uploadedFilesQuery = query(collection(db, 'projectFiles'), where('projectId', '==', projectId));
                // const filesSnapshot = await getDocs(uploadedFilesQuery);
                // setUploadedFiles(filesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load project data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId]); // Re-run when projectId changes

    const handleFileUpload = async (file, type) => {
        if (!projectId) {
            alert("Please select a project first.");
            return;
        }
        setLoading(true);
        try {
            const fileRef = ref(storage, `project_files/${projectId}/${type}/${file.name}`);
            await uploadBytes(fileRef, file);
            const fileURL = await getDownloadURL(fileRef);
            setUploadedFiles(prev => [...prev, { name: file.name, url: fileURL, type: type }]);
            alert(`${file.name} uploaded successfully!`);
        } catch (err) {
            console.error("Error uploading file:", err);
            setError("Failed to upload file.");
        } finally {
            setLoading(false);
        }
    };

    // Render loading/error states for fetching projects list initially
    if (loading && projects.length === 0) return <div>Loading available projects...</div>;
    if (error && projects.length === 0) return <div>Error: {error}</div>;


    return (
        <div className="monthly-report-dashboard">
            <h1>Génération de Rapports Mensuels de Synthèse</h1>

            <div className="project-selection">
                <label htmlFor="project-select">Sélectionner un projet:</label>
                <select id="project-select" onChange={(e) => setProjectId(e.target.value)} value={projectId}>
                    <option value="">-- Sélectionnez un projet --</option>
                    {projects.map(project => (
                        <option key={project.id} value={project.id}>
                            { project.numProjet } 
                        </option>
                    ))}
                </select>
            </div>

            {projectId && (
                <div ref={reportContentRef} className="report-content">
                    {/* Section 1: Project Overview (M1 Data) */}
                    <h2>Fiche de Projet</h2>
                    {projectData ? (
                        <ProjectDetails data={projectData} />
                    ) : (
                        <p>Chargement des détails du projet...</p>
                    )}

                    {/* Section 2: Journal de Chantier (M2 Data) */}
                    <h2>Journal de Chantier</h2>
                    {journalData.length > 0 ? (
                        <ul>
                            {journalData.map(entry => (
                                <li key={entry.id}>
                                    <strong>{new Date(entry.date).toLocaleDateString()}:</strong> {entry.description}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Aucune entrée dans le journal de chantier.</p>
                    )}

                    {/* Section 3: Notes de calcul des délais (M3 Data) */}
                    <h2>Notes de calcul des délais</h2>
                    {delayNotesData.length > 0 ? (
                        <ul>
                            {delayNotesData.map(note => (
                                <li key={note.id}>
                                    <strong>Date: {new Date(note.date).toLocaleDateString()}</strong> - Délai calculé: {note.calculatedDelay} jours.
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Aucune note de calcul de délai.</p>
                    )}

                    {/* Section 4: Décomptes et tableaux comparatifs mensuels (M4 Data) */}
                    <h2>Décomptes et tableaux comparatifs mensuels</h2>
                    {paymentData.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Mois</th>
                                    <th>Montant Décompte</th>
                                    <th>Comparatif</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentData.map(data => (
                                    <tr key={data.id}>
                                        <td>{data.month}</td>
                                        <td>{data.amount}</td>
                                        <td>{data.comparative}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Aucun décompte ou tableau comparatif.</p>
                    )}

                    {/* Section 5: Tableaux de bord financiers et d'avancement (M5 Data) */}
                    <h2>Tableaux de bord</h2>
                    {dashboardData.length > 0 ? (
                        <ul>
                            {dashboardData.map(data => (
                                <li key={data.id}>
                                    <strong>{new Date(data.date).toLocaleDateString()}:</strong> Avancement: {data.progress}%, Financier: {data.financialStatus}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Aucune donnée de tableau de bord.</p>
                    )}

                    {/* Section for Articles (if applicable, perhaps a simplified view) */}
                    <h2>Articles du Projet</h2>
                    {projectArticles.length > 0 ? (
                        <ArticlesList articles={projectArticles} projectTVA={projectData?.tva} />
                    ) : (
                        <p>Aucun article associé à ce projet.</p>
                    )}

                    {/* Section for File Uploads (PVs, Photos, Correspondence) */}
                    <h2>Gestion des Annexes</h2>
                    <FileUpload onFileUpload={handleFileUpload} />

                    <h3>Pièces jointes:</h3>
                    <div className="uploaded-files-list">
                        {uploadedFiles.length > 0 ? (
                            <ul>
                                {uploadedFiles.map((file, index) => (
                                    <li key={index}>
                                        ({file.type}) <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Aucun fichier joint.</p>
                        )}
                    </div>
                </div>
            )}

            {projectId && projectData && ( // Only show generator if projectData is also loaded
                <ReportGenerator contentRef={reportContentRef} projectName={projectData?.nomProjet || projectData?.numProjet || 'Rapport'} />
            )}
        </div>
    );
};

export default MonthlyReportDashboard;