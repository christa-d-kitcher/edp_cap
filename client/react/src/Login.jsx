//Importing needed modules from react-router-dom
import {
    Link,
    useNavigate
} from "react-router-dom";
import { useState, useEffect } from "react";

//importing the bootstrap
import "bootstrap/dist/css/bootstrap.min.css"; import "bootstrap/dist/js/bootstrap.js";

//Beginning of function
const Login = () => {

    //storing a useNavigate function in a variable for page navigation
    const navigate = useNavigate();

    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")


    const handleEmailChange = (e) => {
        const { value } = e.target;
        setUserEmail(value);
    }

    const handlePasswordChange = (e) => {
        const { value } = e.target;
        setUserPassword(value);
    }

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${import.meta.env.FEEDBACK_API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userEmail, userPassword }),
            }) 

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem("token", data.token)
                localStorage.setItem("user", JSON.stringify(data.user))
                console.log(data.token)
                console.log(data.user)

                const userRole = data.role;
                {userRole === "employee" ? navigate('/employeedash') : navigate('/managerdash')}
                // onLogin(data.token, data.user)
            } else {
                setError(data.error)
            }
        } catch (error) {
            setError("Login failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <section>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-4 col-lg-6 text-center mb-3 mt-5">
                            <h2>Login</h2>
                        </div>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-md-4 col-lg-6">
                            <div>
                                <h5 className="text-center text-secondary">Have an account?</h5>
                                <form onSubmit={handleLogin}>
                                    <div className="form-group mb-3">
                                        <label htmlFor="emailInput">Email Address</label>
                                        <input
                                            type="text"
                                            className="form-control form-rounded"
                                            id="emailInput"
                                            name="emailInput"
                                            placeholder="Email"
                                            value={userEmail}
                                            onChange={handleEmailChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="passwordInput">Password</label>
                                        <input
                                            type="password"
                                            className="form-control form-rounded"
                                            id="passwordInput"
                                            name="passwordInput"
                                            placeholder="Password"
                                            value={userPassword}
                                            onChange={handlePasswordChange}
                                        />
                                    </div>
                                    {error && <p className="text-danger text-xsm">{error}</p>}
                                   
                                    <div className="text-center">
                                        <button type="submit" className="w-100 btn btn-dark mt-4 login-button" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
                                    </div>


                                    <div className="text-center mt-3">
                                        <p>Don'thave an account?</p>
                                        <Link className="btn btn-outline-success" to="/register">
                                            Register
                                        </Link>
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