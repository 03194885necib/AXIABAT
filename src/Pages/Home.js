import React from 'react';  
import { Link, Outlet, useNavigate } from "react-router-dom";  

function Home() {  
const navigate=useNavigate()
   
const go = () => {
    navigate("/template/Projects"); // Redirection sans rechargement
};
  return (  
    <div>  
       <div className="cardBox">
          
       <div className="card" onClick={go}>
                    
                    <div>
                        <div className="numbers" >
                            Projects</div>
                        <div className="cardName">liste</div>
                    </div>
                  
                    <div className="iconBx">
                        <ion-icon name="eye-outline"></ion-icon>
                    </div>
                </div>
                
                <div className="card">
                    <div>
                        <div className="numbers">Attachement</div>
                        <div className="cardName">Sales</div>
                    </div>

                    <div className="iconBx">
                        <ion-icon name="cart-outline"></ion-icon>
                    </div>
                </div>

                <div className="card">
                    <div>
                        <div className="numbers">Délai</div>
                        <div className="cardName">Comments</div>
                    </div>

                    <div className="iconBx">
                        <ion-icon name="chatbubbles-outline"></ion-icon>
                    </div>
                </div>

                <div className="card">
                    <div>
                        <div className="numbers">Rapport</div>
                        <div className="cardName">Earning</div>
                    </div>

                    <div className="iconBx">
                        <ion-icon name="cash-outline"></ion-icon>
                    </div>
                </div>
            </div>

            {/* <div className="details">
                <div className="recentOrders">
                    <div className="cardHeader">
                        <h2>Recent Orders</h2>
                        <a href="#" className="btn">View All</a>
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
                                <td><span className="status delivered">Delivered</span></td>
                            </tr>

                            <tr>
                                <td>Dell Laptop</td>
                                <td>$110</td>
                                <td>Due</td>
                                <td><span className="status pending">Pending</span></td>
                            </tr>

                            <tr>
                                <td>Apple Watch</td>
                                <td>$1200</td>
                                <td>Paid</td>
                                <td><span className="status return">Return</span></td>
                            </tr>

                            <tr>
                                <td>Addidas Shoes</td>
                                <td>$620</td>
                                <td>Due</td>
                                <td><span className="status inProgress">In Progress</span></td>
                            </tr>

                            <tr>
                                <td>Star Refrigerator</td>
                                <td>$1200</td>
                                <td>Paid</td>
                                <td><span className="status delivered">Delivered</span></td>
                            </tr>

                            <tr>
                                <td>Dell Laptop</td>
                                <td>$110</td>
                                <td>Due</td>
                                <td><span className="status pending">Pending</span></td>
                            </tr>

                            <tr>
                                <td>Apple Watch</td>
                                <td>$1200</td>
                                <td>Paid</td>
                                <td><span className="status return">Return</span></td>
                            </tr>

                            <tr>
                                <td>Addidas Shoes</td>
                                <td>$620</td>
                                <td>Due</td>
                                <td><span className="status inProgress">In Progress</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="recentCustomers">
                    <div className="cardHeader">
                        <h2>Recent Customers</h2>
                    </div>

                 <table>
                         <tr>
                             <td width="60px">
                                 <div className="imgBx"><img src="assets/imgs/customer02.jpg" alt=""/></div>
                             </td>
                             <td>
                                 <h4>David <br/> <span>Italy</span></h4>
                             </td>
                         </tr>
                        <tr>
                            <td width="60px">
                                 <div className="imgBx"><img src="assets/imgs/customer01.jpg" alt=""/></div>
                             </td>
                             <td>
                                 <h4>Amit <br/> <span>India</span></h4>
                             </td>
                        </tr>

                         <tr>
                             <td width="60px">
                                 <div className="imgBx"><img src="assets/imgs/customer02.jpg" alt=""/></div>
                             </td>
                             <td>
                                 <h4>David <br/> <span>Italy</span></h4>
                             </td>
                         </tr>

                         <tr>
                             <td width="60px">
                                 <div className="imgBx"><img src="assets/imgs/customer01.jpg" alt=""/></div>
                             </td>
                             <td>
                                 <h4>Amit <br/> <span>India</span></h4>
                            </td>
                         </tr>

                         <tr>
                            <td width="60px">
                                 <div className="imgBx"><img src="assets/imgs/customer02.jpg" alt=""/></div>
                             </td>
                             <td>
                                 <h4>David <br/> <span>Italy</span></h4>
                             </td>
                         </tr>

                         <tr>
                             <td width="60px">
                                 <div className="imgBx"><img src="assets/imgs/customer01.jpg" alt=""/></div>
                             </td>
                             <td>
                                 <h4>Amit <br/> <span>India</span></h4>
                             </td>
                         </tr>

                         <tr>
                             <td width="60px">
                                 <div className="imgBx"><img src="assets/imgs/customer01.jpg" alt=""/></div>
                             </td>
                             <td>
                                 <h4>David <br/> <span>Italy</span></h4>
                             </td>
                         </tr>
                         <tr>
                             <td width="60px">
                                 <div className="imgBx"><img src="assets/imgs/customer02.jpg" alt=""/></div>
                             </td>
                             <td>
                                 <h4>Amit <br/> <span>India</span></h4>
                             </td>
                        </tr>
                    </table> 
                    
                </div>
            </div>  */}
    </div>  
  );  
}  

const styles = {  
  container: {  
    textAlign: 'center',  
    padding: '10px',  
    backgroundColor: '#f0f0f0',  
    minHeight: 'calc(100vh - 50px)',  
  }  
};  

export default Home;  