//Importing needed modules from react-router-dom
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Link
} from "react-router-dom";
import { useState, useEffect } from "react";

//Importing the needed react components
import Login from "./Login";
import Register from "./Register";
import EmployeeDash from "./EmployeeDash";
import ManagerDash from "./ManagerDash";


const CapApp = () => {

  useEffect(() => {
    

  });


  return (
    <Router>
      <>
        <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-md-4">
          <div className="container-fluid">
            <Routes>
              <Route exact path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/employeedash" element={<EmployeeDash />} />
              <Route path="/managerdash" element={<ManagerDash/>} />
            </Routes>
          </div>
        </main>
      </>
    </Router>
  )
}

export default CapApp