import React from 'react';  

function About() {  
  return (  
    <div style={styles.container}>  
      <h1>À Propos de Nous</h1>  
      <p>Nous sommes une entreprise passionnée par l'innovation.</p>  
      <div style={styles.contactInfo}>  
        <h2>Contactez-nous</h2>  
        <p>Email: contact@exemple.com</p>  
        <p>Téléphone: 01 23 45 67 89</p>  
      </div>  
    </div>  
  );  
}  

const styles = {  
  container: {  
    textAlign: 'center',  
    padding: '20px',  
    backgroundColor: '#e0e0e0',  
    minHeight: 'calc(100vh - 50px)',  
  },  
  contactInfo: {  
    marginTop: '30px',  
    backgroundColor: 'white',  
    padding: '20px',  
    borderRadius: '10px',  
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',  
  }  
};  

export default About;  