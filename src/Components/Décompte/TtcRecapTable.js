import React from 'react';
import styles from './DécompteForm.module.css';

function TtcRecapTable({ ttcActuel, ttcPrécedent }) {
    const reste = ttcActuel - ttcPrécedent;

    return (
        <div>
            <h3>Récapitulatif Financier TTC</h3>
            <table className={styles.recapTable}>
                <thead>
                    <tr>
                        <th>TTC Précédent</th>
                        <th>TTC Actuel</th>
                        <th>Reste</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{ttcPrécedent.toFixed(2)}</td>
                        <td>{ttcActuel.toFixed(2)}</td>
                        <td>{reste.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default TtcRecapTable;
