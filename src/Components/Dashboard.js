import React from "react";

function Dashboard() {  
    return (  
        <div className="dashboard">  
            <h1>Dashboard</h1>  
            <div className="dashboard-content">  
                {/* Vos widgets et statistiques */}  
                <div className="stats-container">  
                    <div className="stat-card">  
                        <h3>Total Users</h3>  
                        <p>1,254</p>  
                    </div>  
                    <div className="stat-card">  
                        <h3>Revenue</h3>  
                        <p>$45,230</p>  
                    </div>  
                </div>  
            </div>  
        </div>  
    );  
}  
export default Dashboard