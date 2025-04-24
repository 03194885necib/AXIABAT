import React, { useState, useEffect } from 'react';
import './article.css';

import { collection, doc, updateDoc } from 'firebase/firestore';

function ListeArticle({ listeArt, onArticleUpdated }) {
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        setTableData(listeArt);
    }, [listeArt]);

    const handleInputChange = (event, id, field) => {
        const { value } = event.target;

        setTableData(prevData =>
            prevData.map((item) => {
                if (item.id === id) {
                    let updatedItem = { ...item };
                    switch(field) {
                        case 'tvaRate':
                            const numericValue = parseFloat(value.replace(',', '.'));
                            updatedItem[field] = isNaN(numericValue) ? 0 : numericValue / 100;
                            break;
                        case 'quantity':
                        case 'unitPrice':
                            updatedItem[field] = value.replace(',', '.');
                            break;
                        case 'articleNumber':
                        case 'designation':
                        case 'unite':
                            updatedItem[field] = value;
                            break;
                        default:
                            updatedItem[field] = value;
                    }
                    return updatedItem;
                }
                return item;
            })
        );
    };

    useEffect(() => {
        // Informer le composant parent des changements dans les articles
        if (onArticleUpdated && tableData.length > 0) {
            onArticleUpdated(tableData);
        }
    }, [tableData, onArticleUpdated]);

    const calculateTotalPrice = (item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        return (quantity * unitPrice).toFixed(2);
    };

    const calculateTVAAmount = (item) => {
        const totalPrice = parseFloat(calculateTotalPrice(item));
        const tvaRate = parseFloat(item.tvaRate) || 0;
        return (totalPrice * tvaRate).toFixed(2);
    };

    const calculateTotalWithTVA = (item) => {
        const totalPrice = parseFloat(calculateTotalPrice(item));
        const tvaAmount = parseFloat(calculateTVAAmount(item));
        return (totalPrice + tvaAmount).toFixed(2);
    };

    const calculateOverallTotal = (calculationFn) => {
        return tableData
            .reduce((sum, item) => sum + parseFloat(calculationFn(item)), 0)
            .toFixed(2);
    };

    return (
        <div className="invoice-container">
            <table className="invoice-table">
                <thead>
                    <tr>
                        {[
                            'N° Article', 'Désignation', 'Qté', 'Unité',
                            'Prix Unitaire', 'TVA', 'Prix HT',
                            'Montant TVA', 'Prix TTC'
                        ].map(header => <th key={header}>{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((item) => (
                        <tr key={item.id}>
                            {/* Article Number */}
                            <td>
                                <input
                                    type="number"
                                    value={item.articleNumber || ''}
                                    onChange={(e) => handleInputChange(e, item.id, 'articleNumber')}
                                    className="editable-field"
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={item.designation || ''}
                                    onChange={(e) => handleInputChange(e, item.id, 'designation')}
                                    className="editable-field"
                                />
                            </td>

                            {/* Quantity */}
                            <td>
                                <input
                                    type="text"
                                    value={item.quantity || ''}
                                    onChange={(e) => handleInputChange(e, item.id, 'quantity')}
                                    className="editable-field"
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={item.unite || ''}
                                    onChange={(e) => handleInputChange(e, item.id, 'unite')}
                                    className="editable-field"
                                />
                            </td>

                            {/* Unit Price */}
                            <td>
                                <input
                                    type="text"
                                    value={item.unitPrice || ''}
                                    onChange={(e) => handleInputChange(e, item.id, 'unitPrice')}
                                    className="editable-field"
                                />
                            </td>

                            {/* TVA Rate */}
                            <td>
                                <input
                                    type="text"
                                    value={item.tvaRate ? (item.tvaRate * 100).toFixed(2) : ''}
                                    onChange={(e) => handleInputChange(e, item.id, 'tvaRate')}
                                    className="editable-field"
                                    placeholder="Taux TVA (%)"
                                />%
                            </td>

                            {/* Calculated Columns */}
                            <td>{calculateTotalPrice(item)}</td>
                            <td>{calculateTVAAmount(item)}</td>
                            <td>{calculateTotalWithTVA(item)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    {[
                        { label: 'Total HT', column: 6, calculationFn: calculateTotalPrice },
                        { label: 'Total TVA', column: 7, calculationFn: calculateTVAAmount },
                        { label: 'Total TTC', column: 8, calculationFn: calculateTotalWithTVA }
                    ].map(({ label, column, calculationFn }) => (
                        <tr key={label}>
                            <td colSpan="6" style={{ textAlign: 'right', fontWeight: 'bold' }}>{label}</td>
                            {[...Array(3)].map((_, index) => (
                                <td
                                    key={index}
                                    style={{
                                        fontWeight: 'bold',
                                        display: index === column - 6 ? 'table-cell' : 'none'
                                    }}
                                >
                                    {calculateOverallTotal(calculationFn)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tfoot>
            </table>
        </div>
    );
}

export default ListeArticle;