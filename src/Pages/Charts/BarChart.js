import React from 'react';
import './styles.css';

const BarChart = () => {
    return (
        <div className="chart-container">
            <h1>Bar Chart</h1>
            <div className="bar-chart">
                <div className="bar" style={{ height: '60%' }}></div>
                <div className="bar" style={{ height: '80%' }}></div>
                <div className="bar" style={{ height: '40%' }}></div>
                <div className="bar" style={{ height: '70%' }}></div>
                <div className="bar" style={{ height: '50%' }}></div>
            </div>
            <div className="labels">
                <span>2013</span>
                <span>2014</span>
                <span>2015</span>
                <span>2016</span>
                <span>2017</span>
            </div>
        </div>
    );
};

export default BarChart;