import React from 'react';  

export function Customers() {  
    return (  
        <div className="customers-page">  
            <h1>Customer Management</h1>  
            <table>  
                <thead>  
                    <tr>  
                        <th>Name</th>  
                        <th>Email</th>  
                        <th>Actions</th>  
                    </tr>  
                </thead>  
                <tbody>  
                    {/* Données dynamiques */}  
                </tbody>  
            </table>  
        </div>  
    );  
}  

export default Customers;  