import React, { useState } from "react";  
import { Link, Outlet } from "react-router-dom";  

export function Template(){  
    const [isMenuOpen, setIsMenuOpen] = useState(false);  

    const toggleMenu = () => {  
        setIsMenuOpen(!isMenuOpen);  
    };  

    return(  
        <div className={`container ${isMenuOpen ? 'active' : ''}`}>  
            <div className="navigation">  
                <ul>  
                    <li>  
                        <Link to="/" style={{ color: "white", textDecoration: "none" }}>  
                            <span className="icon">  
                                <ion-icon name="logo-apple"></ion-icon>  
                            </span>  
                            <span className="title">Brand Name</span>  
                        </Link>  
                    </li>  

                    <li>  
                        <Link to="/home" style={{ color: "white", textDecoration: "none" }}>  
                            <span className="icon">  
                                <ion-icon name="home-outline"></ion-icon>  
                            </span>  
                            <span className="title">Dashboard</span>  
                        </Link>  
                    </li>  

                    <li>  
                        <Link to="/about" style={{ color: "white", textDecoration: "none" }}>   
                            <span className="icon">  
                                <ion-icon name="people-outline"></ion-icon>  
                            </span>  
                            <span className="title">Customers</span>  
                        </Link>  
                    </li>  

                    <li>  
                        <Link to="/about" style={{ color: "white", textDecoration: "none" }}>  
                            <span className="icon">  
                                <ion-icon name="help-outline"></ion-icon>  
                            </span>  
                            <span className="title">About</span>  
                        </Link>  
                    </li>  

                    {/* Autres éléments de menu */}  
                </ul>  
            </div>  

            <div className="main">  
                <div className="topbar">  
                    <div className="toggle" onClick={toggleMenu}>  
                        <ion-icon name="menu-outline"></ion-icon>  
                    </div>  

                    <div className="search">  
                        <label>  
                            <input type="text" placeholder="Search here"/>  
                            <ion-icon name="search-outline"></ion-icon>  
                        </label>  
                    </div>  

                    <div className="user">  
                        <img src="assets/imgs/customer01.jpg" alt=""/>  
                    </div>  
                </div>  

                {/* Emplacement pour le contenu dynamique */}  
                <div className="content-area">  
                    <Outlet />  
                </div>  
            </div>  
        </div>  
    )  
}  

export default Template;  