import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, Container, Title, Button, FormGroup, FormLabel, FormInput } from '../Styled';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { parseISO, addDays, format, isAfter } from 'date-fns';
import { Navigate, useNavigate } from 'react-router-dom';

const DashboardDelai = () => {
  const [reportData, setReportData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectMap, setProjectMap] = useState({});
  const navigate =useNavigate()

  useEffect(() => {
    const fetchProjects = async () => {
      const snapshot = await getDocs(collection(db, 'projects'));
      const projectList = [];
      const map = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        const item = {
          id: doc.id,
          numProjet: data.numProjet,
          dateDemarrage: data.dateDemarrage,
          delais: parseInt(data.delais),
          bank: data.bank || '',
        };
        projectList.push(item);
        map[doc.id] = item;
      });
      setProjects(projectList);
      setProjectMap(map);
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchDeadlines = async () => {
      if (!selectedProjectId) return;

      const deadlinesSnapshot = await getDocs(collection(db, 'deadlines'));

      const filtered = deadlinesSnapshot.docs.filter(doc => doc.data().projectId === selectedProjectId);

      const project = projectMap[selectedProjectId];
      if (!project) return;

      const rows = filtered.map(doc => {
        const item = doc.data();
        const joursArret = item.workStoppages
          ? item.workStoppages.reduce((acc, s) => acc + (s.duration || 0), 0)
          : 0;

        const dateDebut = parseISO(project.dateDemarrage);
        const dateFinContractuelle = addDays(dateDebut, project.delais);
        const dateFinReelle = item.dateFinReelle ? parseISO(item.dateFinReelle) : null;

        const statut = dateFinReelle && isAfter(dateFinReelle, dateFinContractuelle) ? 'En retard' : 'OK';
        const delaiReel = project.delais + joursArret;
        const ratio = ((delaiReel / project.delais) * 100).toFixed(2);

        return {
          nomProjet: `${project.numProjet} - ${project.bank}`,
          delaiPrevus: project.delais,
          delaiReel,
          ratio: parseFloat(ratio),
          statut,
          dateFinReelle: format(dateFinReelle, 'yyyy-MM-dd'),
          dateFinContractuelle: format(dateFinContractuelle, 'yyyy-MM-dd'),
        };
      });

      setReportData(rows);
    };

    fetchDeadlines();
  }, [selectedProjectId, projectMap]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rapport Délais");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, "rapport_delais.xlsx");
  };



const goBuget =()=>{
    navigate("/BudgetDashboard")
}

  return (
    <Container>
      <Card>
        <Title>📊 Tableau de bord des délais</Title>

        <FormGroup style={{ marginTop: 20 }}>
          <FormLabel htmlFor="selectedProject">Sélectionner un projet</FormLabel>
          <select
            id="selectedProject"
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              width: '100%',
              fontSize: '16px'
            }}
          >
            <option value="">-- Choisir un numéro de projet --</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.numProjet} - {p.bank}</option>
            ))}
          </select>
        </FormGroup>

        {selectedProjectId && reportData.length > 0 ? (
          <>
            <div style={{ margin: '20px 0' }}>
              <Button onClick={exportToExcel}>📥 Exporter en Excel</Button>

              <Button onClick={goBuget}>📥 Voir Buget</Button>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reportData}>
                <XAxis dataKey="nomProjet" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="delaiPrevus" fill="#34d399" name="Prévu" />
                <Bar dataKey="delaiReel" fill="#f87171" name="Réel" />
              </BarChart>
            </ResponsiveContainer>

            <div style={{ marginTop: 30 }}>
              <h3>Détails du Projet</h3>
              <ul>
                {reportData.map((item, index) => (
                  <li key={index} style={{ marginBottom: '10px', color: item.statut === 'En retard' ? 'red' : 'green' }}>
                    <strong>{item.nomProjet}</strong> — Fin prévue : {item.dateFinContractuelle}, réelle : {item.dateFinReelle}, ratio : <strong>{item.ratio}%</strong> → {item.statut === 'En retard' ? '🔥 En retard' : '✅ OK'}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p style={{ marginTop: 30 }}>Veuillez sélectionner un projet pour afficher les données.</p>
        )}
      </Card>
    </Container>
  );
};

export default DashboardDelai;
