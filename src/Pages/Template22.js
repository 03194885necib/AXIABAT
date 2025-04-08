import { color } from "chart.js/helpers";
import React, { useState } from "react";  
import { Link, Outlet } from "react-router-dom";  

export function Template22(){  
 

 return(


    <div class="container">
        <div class="navigation">
            <ul>
                <li>
                     <Link to="/template/home" style={{ color: "white", textDecoration: "none" }}> 
                        {/* <span class="icon">
                            <ion-icon name="logo-apple"></ion-icon>
                        </span> */}
                        {/* <img src="/assets/imgs/LOGO.jpg" alt=""/> */}
                        <div>
            <img src="/assets/imgs/LOGO.jpg" alt="Logo" width="150" height="auto" />

        </div><br></br>

                        
                    </Link>
                    <span class="title" style={{ color: "white", textDecoration: "none" }}>Gestion des taches</span>
                </li>
                <li>
                    <Link to="/template/Article" > 
                        <span class="icon">
                            <ion-icon name="home-outline"></ion-icon>
                        </span>
                        <span class="title">Data base </span>
                    </Link>
                </li>

                <li>
                    <Link to="/template/TestProjet" > 
                        <span class="icon">
                            <ion-icon name="home-outline"></ion-icon>
                        </span>
                        <span class="title">Teeest</span>
                    </Link>
                </li>
                <li>
                    <Link to="/template/FirstPage" > 
                        <span class="icon">
                            <ion-icon name="home-outline"></ion-icon>
                        </span>
                        <span class="title">FirstPage</span>
                    </Link>
                </li>
                <li>
                    <Link to="/template/Test2" > 
                        <span class="icon">
                            <ion-icon name="home-outline"></ion-icon>
                        </span>
                        <span class="title">Test2</span>
                    </Link>
                </li>

                <li>
                    <Link to="/template/home" > 
                        <span class="icon">
                            <ion-icon name="home-outline"></ion-icon>
                        </span>
                        <span class="title">Dashboard</span>
                    </Link>
                </li>

                <li>
                <Link to="/template/Projects" > 

                        <span class="icon">
                            <ion-icon name="people-outline"></ion-icon>
                        </span>
                        <span class="title">Projects</span>
                </Link>
                </li>



                <li>
                <Link to="/template/AllCharts" > 

                        <span class="icon">
                            <ion-icon name="people-outline"></ion-icon>
                        </span>
                        <span class="title">Attachement</span>
                </Link>
                </li>
                <li>
                <Link to="/template/Article" > 

                        <span class="icon">
                            <ion-icon name="people-outline"></ion-icon>
                        </span>
                        <span class="title">Articles</span>
                </Link>
                </li>
                <li>
                <Link to="/template/Catégorie" > 

                        <span class="icon">
                            <ion-icon name="people-outline"></ion-icon>
                        </span>
                        <span class="title">Catégories</span>
                </Link>
                </li>
                <li>
                <Link to="/template/AllCharts" > 

                        <span class="icon">
                            <ion-icon name="people-outline"></ion-icon>
                        </span>
                        <span class="title">Contact us</span>
                </Link>
                </li>
                
                
{/* 
                <li>
                    <a href="#">
                        <span class="icon">
                            <ion-icon name="chatbubble-outline"></ion-icon>
                        </span>
                        <span class="title">Messages</span>
                    </a>
                </li>

                <li>
                    <a href="#">
                        <span class="icon">
                            <ion-icon name="help-outline"></ion-icon>
                        </span>
                        <span class="title">Help</span>
                    </a>
                </li>

                <li>
                    <a href="#">
                        <span class="icon">
                            <ion-icon name="settings-outline"></ion-icon>
                        </span>
                        <span class="title">Settings</span>
                    </a>
                </li>

                <li>
                    <a href="#">
                        <span class="icon">
                            <ion-icon name="lock-closed-outline"></ion-icon>
                        </span>
                        <span class="title">Password</span>
                    </a>
                </li>

                <li>
                    <a href="#">
                        <span class="icon">
                            <ion-icon name="log-out-outline"></ion-icon>
                        </span>
                        <span class="title">Sign Out</span>
                    </a>
                </li> */}
            </ul>
        </div>

        <div class="main">
            <div class="topbar">
                <div class="toggle">
                    <ion-icon name="menu-outline"></ion-icon>
                </div>

                <div class="search">
                    <label>
                        <input type="text" placeholder="Search here"/>
                        <ion-icon name="search-outline"></ion-icon>
                    </label>
                </div>

                <div class="user">
                    <img src="assets/imgs/customer01.jpg" alt=""/>
                </div>
            </div>

            {/* <div class="cardBox">
                <div class="card">
                    <div>
                        <div class="numbers">1,504</div>
                        <div class="cardName">Daily Views</div>
                    </div>

                    <div class="iconBx">
                        <ion-icon name="eye-outline"></ion-icon>
                    </div>
                </div>

                <div class="card">
                    <div>
                        <div class="numbers">80</div>
                        <div class="cardName">Sales</div>
                    </div>

                    <div class="iconBx">
                        <ion-icon name="cart-outline"></ion-icon>
                    </div>
                </div>

                <div class="card">
                    <div>
                        <div class="numbers">284</div>
                        <div class="cardName">Comments</div>
                    </div>

                    <div class="iconBx">
                        <ion-icon name="chatbubbles-outline"></ion-icon>
                    </div>
                </div>

                <div class="card">
                    <div>
                        <div class="numbers">$7,842</div>
                        <div class="cardName">Earning</div>
                    </div>

                    <div class="iconBx">
                        <ion-icon name="cash-outline"></ion-icon>
                    </div>
                </div>
            </div> */}

            {/* <div class="details">
                <div class="recentOrders">
                    <div class="cardHeader">
                        <h2>Recent Orders</h2>
                        <a href="#" class="btn">View All</a>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <td>Name</td>
                                <td>Price</td>
                                <td>Payment</td>
                                <td>Status</td>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>Star Refrigerator</td>
                                <td>$1200</td>
                                <td>Paid</td>
                                <td><span class="status delivered">Delivered</span></td>
                            </tr>

                            <tr>
                                <td>Dell Laptop</td>
                                <td>$110</td>
                                <td>Due</td>
                                <td><span class="status pending">Pending</span></td>
                            </tr>

                            <tr>
                                <td>Apple Watch</td>
                                <td>$1200</td>
                                <td>Paid</td>
                                <td><span class="status return">Return</span></td>
                            </tr>

                            <tr>
                                <td>Addidas Shoes</td>
                                <td>$620</td>
                                <td>Due</td>
                                <td><span class="status inProgress">In Progress</span></td>
                            </tr>

                            <tr>
                                <td>Star Refrigerator</td>
                                <td>$1200</td>
                                <td>Paid</td>
                                <td><span class="status delivered">Delivered</span></td>
                            </tr>

                            <tr>
                                <td>Dell Laptop</td>
                                <td>$110</td>
                                <td>Due</td>
                                <td><span class="status pending">Pending</span></td>
                            </tr>

                            <tr>
                                <td>Apple Watch</td>
                                <td>$1200</td>
                                <td>Paid</td>
                                <td><span class="status return">Return</span></td>
                            </tr>

                            <tr>
                                <td>Addidas Shoes</td>
                                <td>$620</td>
                                <td>Due</td>
                                <td><span class="status inProgress">In Progress</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="recentCustomers">
                    <div class="cardHeader">
                        <h2>Recent Customers</h2>
                    </div>

                    <table>
                        <tr>
                            <td width="60px">
                                <div class="imgBx"><img src="assets/imgs/customer02.jpg" alt=""/></div>
                            </td>
                            <td>
                                <h4>David <br/> <span>Italy</span></h4>
                            </td>
                        </tr>

                        <tr>
                            <td width="60px">
                                <div class="imgBx"><img src="assets/imgs/customer01.jpg" alt=""/></div>
                            </td>
                            <td>
                                <h4>Amit <br/> <span>India</span></h4>
                            </td>
                        </tr>

                        <tr>
                            <td width="60px">
                                <div class="imgBx"><img src="assets/imgs/customer02.jpg" alt=""/></div>
                            </td>
                            <td>
                                <h4>David <br/> <span>Italy</span></h4>
                            </td>
                        </tr>

                        <tr>
                            <td width="60px">
                                <div class="imgBx"><img src="assets/imgs/customer01.jpg" alt=""/></div>
                            </td>
                            <td>
                                <h4>Amit <br/> <span>India</span></h4>
                            </td>
                        </tr>

                        <tr>
                            <td width="60px">
                                <div class="imgBx"><img src="assets/imgs/customer02.jpg" alt=""/></div>
                            </td>
                            <td>
                                <h4>David <br/> <span>Italy</span></h4>
                            </td>
                        </tr>

                        <tr>
                            <td width="60px">
                                <div class="imgBx"><img src="assets/imgs/customer01.jpg" alt=""/></div>
                            </td>
                            <td>
                                <h4>Amit <br/> <span>India</span></h4>
                            </td>
                        </tr>

                        <tr>
                            <td width="60px">
                                <div class="imgBx"><img src="assets/imgs/customer01.jpg" alt=""/></div>
                            </td>
                            <td>
                                <h4>David <br/> <span>Italy</span></h4>
                            </td>
                        </tr>

                        <tr>
                            <td width="60px">
                                <div class="imgBx"><img src="assets/imgs/customer02.jpg" alt=""/></div>
                            </td>
                            <td>
                                <h4>Amit <br/> <span>India</span></h4>
                            </td>
                        </tr>
                    </table>
                </div>
            </div> */}

  <div className="content-area">  
                     <Outlet />  
                 </div> 
        </div>
    </div>


      )
}
export default Template22;  

{/* // <div class="container">
//         <div class="navigation">
//             <ul>
//                 <li>
//                     <a href="#">
//                         <span class="icon">
//                             <ion-icon name="logo-apple"></ion-icon>
//                         </span>
//                         <span class="title">Brand Name</span>
//                     </a>
//                 </li>

//                 <li>
//                   <Link to="/home" style={{ color: "black", textDecoration: "none" }}>  
//                         <span class="icon">
//                             <ion-icon name="home-outline"></ion-icon>
//                         </span>
//                         <span class="title">Dashboard</span>
//                    </Link>
//                 </li>

//                 <li>
//                     <Link to="/about" style={{ color: "black", textDecoration: "none" }}>  
//                         <span class="icon">
//                             <ion-icon name="people-outline"></ion-icon>
//                         </span>
//                         <span class="title">Customers</span>
//                 </Link>
//                 </li>
           
//             </ul>
//         </div>

//         <div class="main">
//             <div class="topbar">
//                 <div class="toggle">
//                     <ion-icon name="menu-outline"></ion-icon>
//                 </div>

//                 <div class="search">
//                     <label>
//                         <input type="text" placeholder="Search here"/>
//                         <ion-icon name="search-outline"></ion-icon>
//                     </label>
//                 </div>

//                 <div class="user">
//                     <img src="assets/imgs/customer01.jpg" alt=""/>
//                 </div>
//             </div>


//  <div className="content-area">  
//                     <Outlet />  
//                 </div> 

        
//         </div>
//     </div> */}