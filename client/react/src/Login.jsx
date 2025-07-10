//Importing needed modules from react-router-dom
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Link
} from "react-router-dom";
import { useState, useEffect } from "react";


//Beginning of function
function Login() {

    const [userData, setUserData] = useState({});

    // useEffect(() => {});

    const handleChange = (e) => {
        const { name, value } = e.target;
            setUserData({});
    }
   
    const handleLogin = async(e) => {
        e.preventDefault();
    }

    return (
        <>
            <section>
                <div className="container">
                    <div className="row justify content center">
                        <div className="col-md-6 text-center mb-5">
                            <h2>Login</h2>
                        </div>
                    </div>
                    <div className="row justify content center">
                        <div className="col-md-6 col-lg-4">
                            <div>
                                <h3 className="mb-4 text-center">Have an account?</h3>
                                <form onSubmit={handleLogin}>
                                    <div class="form-group">
                                        <label for="emailInput">Email Address</label>
                                        <input 
                                            type="text" 
                                            class="form-control" 
                                            id="emailInput" 
                                            name="emailInput" 
                                            placeholder="Email"
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div class="form-group">
                                        <label for="passwordInput">Password</label>
                                        <input 
                                            type="password" 
                                            class="form-control" 
                                            id="passwordInput" 
                                            name="passwordInput" 
                                            placeholder="Password"
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-secondary">Sign In</button>

                                    <div className="text-center">
                                        <p>Don'thave an account?</p>

                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Login