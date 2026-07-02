import React from 'react';
// html2pdf.js unavailable (blocked by security policy — depends on jspdf)
const html2pdf = () => ({ from: () => ({ set: () => ({ save: () => alert('PDF export is currently unavailable.') }) }) });

const ReportGenerator = ({ contentRef, projectName }) => {

    const generatePdf = () => {
        if (contentRef.current) {
            const element = contentRef.current;
            const opt = {
                margin: 0.5,
                filename: `${projectName}_RapportMensuel.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().from(element).set(opt).save();
        } else {
            alert("No content to generate PDF from.");
        }
    };

    return (
        <div className="report-generator">
            <button onClick={generatePdf}>Générer le Rapport Mensuel (PDF)</button> [cite: 4]
        </div>
    );
};

export default ReportGenerator;