import React from 'react';
import LineChart from './LineChart';
import BarChart from './BarChart';
import DoughnutChart from './DoughnutChart';
import './styles.css';

function App() {
    return (
        <div className="Charts_container">
            <LineChart />
            <BarChart />
            <DoughnutChart />
        </div>
    );
}

export default App;