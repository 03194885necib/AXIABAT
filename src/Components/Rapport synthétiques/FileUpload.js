import React, { useState } from 'react';

const FileUpload = ({ onFileUpload }) => {
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState('pv_reunion'); // Default type

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleTypeChange = (e) => {
        setFileType(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (file && fileType) {
            onFileUpload(file, fileType);
            setFile(null); // Clear input
            e.target.reset(); // Reset form
        } else {
            alert("Please select a file and a type.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="file-upload-form">
            <input type="file" onChange={handleFileChange} />
            <select value={fileType} onChange={handleTypeChange}>
                <option value="pv_reunion">PV de réunion</option> [cite: 3]
                <option value="pv_reception_travaux">PV de réception des travaux</option> [cite: 3]
                <option value="pv_essais_materiaux">PV d'essais de matériaux</option> [cite: 9]
                <option value="pv_achevement_travaux">PV d'achèvement des travaux</option> [cite: 10]
                <option value="pv_reception_provisoire">PV de réception provisoire</option> [cite: 10]
                <option value="pv_reception_definitive">PV de réception définitive</option> [cite: 10]
                <option value="photographie">Photographie du chantier</option> [cite: 3, 11]
                <option value="correspondance">Courrier de correspondance</option> [cite: 11]
            </select>
            <button type="submit">Upload</button>
        </form>
    );
};

export default FileUpload;