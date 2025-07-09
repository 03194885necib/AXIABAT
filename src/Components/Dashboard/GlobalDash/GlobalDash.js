
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './Dashboard.module.css';

// Données factices pour les graphiques
const monthlyData = [
  { name: 'Jan', projects: 4, payments: 2400 },
  { name: 'Fév', projects: 3, payments: 1398 },
  { name: 'Mar', projects: 6, payments: 9800 },
  { name: 'Avr', projects: 2, payments: 3908 },
  { name: 'Mai', projects: 5, payments: 4800 },
  { name: 'Juin', projects: 7, payments: 6800 },
];

const projectStatusData = [
  { name: 'En cours', value: 45 },
  { name: 'Terminés', value: 30 },
  { name: 'En attente', value: 25 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleNavigation = (path) => {
    navigate(path);
    setActiveTab(path.substring(1)); // Enlève le '/' du path
  };

  const stats = [
    { title: 'Projets actifs', value: '12', change: '+2 ce mois', icon: '📋' },
    { title: 'Décomptes', value: '24', change: '+5 ce mois', icon: '💰' },
    { title: 'CA Total', value: '458,750 €', change: '+12%', icon: '📈' },
    { title: 'Retards', value: '3', change: '-1', icon: '⚠️' },
  ];

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.logo}>Gestion Projets</div>
        <nav>
          <ul>
            <li 
              className={activeTab === 'dashboard' ? styles.active : ''}
              onClick={() => handleNavigation('/GlobalDash')}
            >
              <span>💼</span> Tableau de bord
            </li>
            <li 
              className={activeTab === 'decomptes' ? styles.active : ''}
              onClick={() => handleNavigation('/DashDecompte')}
            >
              <span>📝</span> Décomptes
            </li>

             <li 
              className={activeTab === 'decomptes' ? styles.active : ''}
              onClick={() => handleNavigation('/TabComp')}
            >
              <span>📊​</span> Tableau comparatif
            </li>


            <li 
              className={activeTab === 'projects' ? styles.active : ''}
              onClick={() => handleNavigation('/DashDelais')}>
            
              <span>🏗️</span> Delais 
              </li>
            {/* <li 
              className={activeTab === 'comparison' ? styles.active : ''}
              onClick={() => handleNavigation('/ProjectComparison')}
            >
              <span>📊</span> Comparaison
            </li>
            <li 
              className={activeTab === 'settings' ? styles.active : ''}
              onClick={() => handleNavigation('/DashDelais')}
            >
              <span>⚙️</span> Paramètres
            </li> */}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Tableau de Bord</h1>
          <div className={styles.userProfile}>
            <span>👤 Admin</span>
          </div>
        </header>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statIcon}>{stat.icon}</div>
              <div className={styles.statContent}>
                <h3>{stat.title}</h3>
                <p className={styles.statValue}>{stat.value}</p>
                <p className={styles.statChange}>{stat.change}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className={styles.chartsSection}>
          <div className={styles.chartContainer}>
            <h2>Activité Mensuelle</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="projects" fill="#8884d8" name="Projets" />
                <Bar dataKey="payments" fill="#82ca9d" name="Paiements (k€)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartContainer}>
            <h2>Statut des Projets</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.recentActivity}>
          <h2>Activité Récente</h2>
          <table className={styles.activityTable}>
            <thead>
              <tr>
                <th>Projet</th>
                <th>Action</th>
                <th>Utilisateur</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PROJ-2024-001</td>
                <td>Décompte créé</td>
                <td>Admin</td>
                <td>2024-06-15</td>
              </tr>
              <tr>
                <td>PROJ-2024-002</td>
                <td>Projet modifié</td>
                <td>User1</td>
                <td>2024-06-14</td>
              </tr>
              <tr>
                <td>PROJ-2024-003</td>
                <td>Paiement enregistré</td>
                <td>Admin</td>
                <td>2024-06-12</td>
              </tr>
              <tr>
                <td>PROJ-2024-004</td>
                <td>Nouveau projet</td>
                <td>User2</td>
                <td>2024-06-10</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;