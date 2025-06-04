import React from 'react';
import './ArticlesList.css'; // Or reuse article.css

const ArticlesList = ({ articles }) => {
    const calculateTotalPrice = (item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        return (quantity * unitPrice).toFixed(2);
    };

    // Note: TVA calculation here would ideally use the project's global TVA,
    // which would need to be passed as a prop from MonthlyReportDashboard
    // For simplicity, let's assume `item.tva` holds the project's TVA rate in decimal
    // or you pass `projectTVA` as a prop here too.
    const calculateTVAAmount = (item, projectTVA) => {
        const totalPrice = parseFloat(calculateTotalPrice(item));
        const tvaRate = parseFloat(projectTVA) / 100 || 0; // Use projectTVA passed down
        return (totalPrice * tvaRate).toFixed(2);
    };

    const calculateTotalWithTVA = (item, projectTVA) => {
        const totalPrice = parseFloat(calculateTotalPrice(item));
        const tvaAmount = parseFloat(calculateTVAAmount(item, projectTVA));
        return (totalPrice + tvaAmount).toFixed(2);
    };

    return (
        <div className="articles-list-container">
            <table>
                <thead>
                    <tr>
                        <th>N° Article</th>
                        <th>Désignation</th>
                        <th>Qté</th>
                        <th>Unité</th>
                        <th>Prix Unitaire</th>
                        <th>Prix HT</th>
                        {/* If you want to show TVA for each article, pass projectTVA to this component */}
                        {/* <th>TVA (%)</th> */}
                        <th>Montant TVA</th>
                        <th>Prix TTC</th>
                    </tr>
                </thead>
                <tbody>
                    {articles.map(item => (
                        <tr key={item.id}>
                            <td>{item.articleNumber}</td>
                            <td>{item.designation}</td>
                            <td>{item.quantity}</td>
                            <td>{item.unite}</td>
                            <td>{item.unitPrice}</td>
                            <td>{calculateTotalPrice(item)}</td>
                            {/* You'll need to pass projectTVA from the parent (MonthlyReportDashboard) */}
                            <td>{calculateTVAAmount(item, item.projectTVA)}</td>
                            <td>{calculateTotalWithTVA(item, item.projectTVA)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ArticlesList;