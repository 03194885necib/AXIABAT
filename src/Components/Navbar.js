import React from 'react';  
import { Link } from 'react-router-dom';  

function Navbar() {  
  return (  
    <nav style={styles.nav}>  
      <ul style={styles.navList}>  
        <li style={styles.navItem}>  
          <Link to="/" style={styles.navLink}>Accueil</Link>  
        </li>  
        <li style={styles.navItem}>  
          <Link to="/about" style={styles.navLink}>À Propos</Link>  
        </li>  
      </ul>  
    </nav>  
  );  
}  

// Styles en ligne pour l'exemple (vous pouvez utiliser CSS séparé)  
const styles = {  
  nav: {  
    backgroundColor: '#333',  
    padding: '10px',  
  },  
  navList: {  
    listStyle: 'none',  
    display: 'flex',  
    justifyContent: 'center',  
    padding: 0,  
    margin: 0,  
  },  
  navItem: {  
    margin: '0 15px',  
  },  
  navLink: {  
    color: 'white',  
    textDecoration: 'none',  
    fontSize: '18px',  
  }  
};  

export default Navbar;  