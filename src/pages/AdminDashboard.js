import React, { useState } from "react";  
import { Link } from "react-router-dom";  

// Importez vos composants de contenu  
import Dashboard from "../Components/Dashboard";  
import Customers from "../Components/Customers";  
// import Messages from "./components/Messages";  
// import Help from "./components/Help";  
// import Settings from "./components/Settings";  
// import Password from "./components/Password";  

export function AdminDashboard() {  
    // State pour gérer le contenu actuel  
    const [currentContent, setCurrentContent] = useState(<Dashboard />);  

    // Fonction pour mettre à jour le contenu  
    const handleNavigation = (content) => {  
        setCurrentContent(content);  
    };  

    return (  
        <div className="container">  
            {/* Navigation Sidebar */}  
            <div className="navigation">  
                <ul>  
                    <li>  
                        <a href="#" className="brand">  
                            <span className="icon">  
                                <ion-icon name="logo-apple"></ion-icon>  
                            </span>  
                            <span className="title">Admin Panel</span>  
                        </a>  
                    </li>  

                    <li onClick={() => handleNavigation(<Dashboard />)}>  
                       
                        <a href="#">  
                            <span className="icon">  
                                <ion-icon name="home-outline"></ion-icon>  
                            </span>  
                            <span className="title">Dashboard</span>  
                        </a>  

                    </li>  

                    <li onClick={() => handleNavigation(<Customers />)}>  
                        <a href="#">  
                            <span className="icon">  
                                <ion-icon name="people-outline"></ion-icon>  
                            </span>  
                            <span className="title">Customers</span>  
                        </a>  
                    </li>  

                    <li onClick={() => handleNavigation(<Customers />)}>  
                        <a href="#">  
                            <span className="icon">  
                                <ion-icon name="chatbubble-outline"></ion-icon>  
                            </span>  
                            <span className="title">Messages</span>  
                        </a>  
                    </li>  

                    <li onClick={() => handleNavigation(<Customers />)}>  
                        <a href="#">  
                            <span className="icon">  
                                <ion-icon name="help-outline"></ion-icon>  
                            </span>  
                            <span className="title">Help</span>  
                        </a>  
                    </li>  

                    <li onClick={() => handleNavigation(<Customers />)}>  
                        <a href="#">  
                            <span className="icon">  
                                <ion-icon name="settings-outline"></ion-icon>  
                            </span>  
                            <span className="title">Settings</span>  
                        </a>  
                    </li>  

                    <li onClick={() => handleNavigation(<Customers />)}>  
                        <a href="#">  
                            <span className="icon">  
                                <ion-icon name="lock-closed-outline"></ion-icon>  
                            </span>  
                            <span className="title">Password</span>  
                        </a>  
                    </li>  

                    <li>  
                        <a href="#">  
                            <span className="icon">  
                                <ion-icon name="log-out-outline"></ion-icon>  
                            </span>  
                            <span className="title">Sign Out</span>  
                        </a>  
                    </li>  
                </ul>  
            </div>  

            {/* Main Content Area */}  
            <div className="main">  
                {/* Topbar */}  
                <div className="topbar">  
                    <div className="toggle">  
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

                {/* Dynamic Content Area */}  
                <div className="content-area">  
                    {currentContent}  
                </div>  
            </div>  
        </div>  
    );  
}  


export default AdminDashboard;  