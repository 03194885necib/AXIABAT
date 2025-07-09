import React, { useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import styles from './DecompteDashboard.module.css';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DecompteDashboard = () => {
  const [timeRange, setTimeRange] = useState('last6months');
  const [projectFilter, setProjectFilter] = useState('all');
  const [decomptes, setDecomptes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const navigate=useNavigate()
  // Charger les données
  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Charger les projets
      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);

      // 2. Construire la requête pour les décomptes
      let decomptesQuery = query(collection(db, 'décomptes'), orderBy('dateCréation', 'desc'));

      // Appliquer les filtres
      if (timeRange === 'last6months') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        decomptesQuery = query(
          decomptesQuery,
          where('dateCréation', '>=', sixMonthsAgo)
        );
      } else if (timeRange === 'currentYear') {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        decomptesQuery = query(
          decomptesQuery,
          where('dateCréation', '>=', startOfYear)
        );
      }

      if (projectFilter !== 'all') {
        decomptesQuery = query(
          decomptesQuery,
          where('projetId', '==', projectFilter)
        );
      }

      // 3. Exécuter la requête
      const decomptesSnapshot = await getDocs(decomptesQuery);
      const decomptesData = decomptesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convertir le timestamp Firestore en date JS
        date: doc.data().dateCreation?.toDate() || new Date()
      }));
      setDecomptes(decomptesData);

      // 4. Calculer les statistiques
      calculateStats(decomptesData, projectsData);

      setLoading(false);
    } catch (err) {
      console.error("Erreur de chargement:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const calculateStats = (decomptesData, projectsData) => {
    // Calculs des statistiques
    const totalHT = decomptesData.reduce((sum, d) => sum + (d.ht || 0), 0);
    const totalTVA = decomptesData.reduce((sum, d) => sum + (d.tva || 0), 0);
    const totalTTC = decomptesData.reduce((sum, d) => sum + (d.ttc || 0), 0);

    // Groupement par projet
    const byProject = decomptesData.reduce((acc, d) => {
      const project = projectsData.find(p => p.id === d.projetId) || {};
      if (!acc[d.projetId]) {
        acc[d.projetId] = {
          name: project.numProjet || 'Inconnu',
          value: 0,
          count: 0
        };
      }
      acc[d.projetId].value += d.ttc || 0;
      acc[d.projetId].count += 1;
      return acc;
    }, {});

    // Groupement par mois
    const byMonth = decomptesData.reduce((acc, d) => {
      const monthYear = d.date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          ttc: 0,
          count: 0
        };
      }
      acc[monthYear].ttc += d.ttc || 0;
      acc[monthYear].count += 1;
      return acc;
    }, {});

    setStats({
      totalHT,
      totalTVA,
      totalTTC,
      totalDecomptes: decomptesData.length,
      byProject: Object.values(byProject),
      byMonth: Object.values(byMonth)
    });
  };

  // Charger les données au montage et quand les filtres changent
  React.useEffect(() => {
    loadData();
  }, [timeRange, projectFilter]);

  if (loading) return <div className={styles.loading}>Chargement des décomptes...</div>;
  if (error) return <div className={styles.error}>Erreur: {error}</div>;




  return (
    <div className={styles.container}>
      <h1>Dashboard des Décomptes</h1>
      
      {/* Filtres */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Période :</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className={styles.select}
          >
            <option value="last6months">6 derniers mois</option>
            <option value="currentYear">Année en cours</option>
            <option value="all">Toutes les données</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Projet :</label>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">Tous les projets</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.numProjet} - {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <h3>Total Décomptes</h3>
          <p className={styles.statValue}>{stats.totalDecomptes}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Montant Total HT</h3>
          <p className={styles.statValue}>{stats.totalHT?.toFixed(2)} €</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total TVA</h3>
          <p className={styles.statValue}>{stats.totalTVA?.toFixed(2)} €</p>
        </div>
        <div className={styles.statCard}>
          <h3>Montant Total TTC</h3>
          <p className={styles.statValue}>{stats.totalTTC?.toFixed(2)} €</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className={styles.chartsRow}>
        <div className={styles.chartContainer}>
          <h2>Répartition par Projet</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.byProject}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {stats.byProject?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value.toFixed(2)} €`, "Montant TTC"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartContainer}>
          <h2>Évolution Mensuelle</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.byMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value.toFixed(2)} €`, "Montant TTC"]} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ttc" 
                stroke="#8884d8" 
                name="Montant TTC"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#82ca9d" 
                name="Nombre de décomptes"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Liste des décomptes récents */}
      <div className={styles.recentDecomptes}>
        <h2>Décomptes Récents</h2>
        <div className={styles.tableContainer}>
          <table className={styles.decompteTable}>
            <thead>
              <tr>
                <th>N° Décompte</th>
                <th>Projet</th>
                <th>Mois</th>
                <th>Date</th>
                <th>HT (€)</th>
                <th>TVA (€)</th>
                <th>TTC (€)</th>
              </tr>
            </thead>
            <tbody>
              {decomptes.slice(0, 10).map(decompte => {
                const project = projects.find(p => p.id === decompte.projetId) || {};
                return (
                  <tr key={decompte.id}>
                    <td>{decompte.numero}</td>
                    <td>{project.numProjet || 'Inconnu'}</td>
                    <td>{decompte.mois}</td>
                    <td>{decompte.date?.toLocaleDateString() || '-'}</td>
                    <td>{(decompte.ht || 0).toFixed(2)}</td>
                    <td>{(decompte.tva || 0).toFixed(2)}</td>
                    <td>{(decompte.ttc || 0).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DecompteDashboard;