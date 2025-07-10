//Importing needed modules from react-router-dom
import {
    Link,
    useNavigate
} from "react-router-dom";
import { useState, useEffect } from "react";

//importing the bootstrap
import "bootstrap/dist/css/bootstrap.min.css"; import "bootstrap/dist/js/bootstrap.js";
import "./styles/register.css";

const Register = () => {

    const [regFormData, setRegFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
        manager: '',
    });

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [userRole, setUserRole] = useState("Employee")
    const [managers, setManagers] = useState([])
    const [managersError, setManagersError] = useState("")
    const [managersLoading, setManagersLoading] = useState(false)



    useEffect(() => {
        fetchManagers()
    }, [])

    const fetchManagers = async () => {
        try {
            setManagersLoading(true)
            setManagersError("")
            const response = await fetch("/mockManagers.json")

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            // Ensure data is an array
            if (Array.isArray(data)) {
                setManagers(data)
            } else {
                console.error("Managers data is not an array:", data)
                setManagers([])
                setManagersError("Invalid data format received")
            }
        } catch (error) {
            console.error("Error fetching managers:", error);
            setManagers([])
            setManagersError("Failed to load managers")
        } finally {
            setManagersLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRegFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleRoleSelect = (e) => {
        setUserRole(e.target.value)
        setRegFormData((prevData) => ({
            ...prevData,
            role: e.target.value,
          }));
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        console.log('Form data submitted:', regFormData);
        try {
            const response = await fetch(`${import.meta.env.FEEDBACK_API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(regFormData),
            })

            const data = await response.json()

            if (response.ok) {
                navigate('/login')
            } else {
                setError(data.error)
            }
        } catch (error) {
            setError("Registration failed. Please try again.")
        } finally {
            setLoading(false)
        }
    };


    return (
        <>
            <section>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-4 col-lg-6 text-center mb-3 mt-5">
                            <h2>Register</h2>
                        </div>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-md-4 col-lg-6">
                            <div>
                                <h5 className="text-center text-secondary">Don't have an account?</h5>
                                <form onSubmit={handleRegister}>
                                    <div className="form-group mb-3">
                                        <label htmlFor="name">Name</label>
                                        <input
                                            type="text"
                                            className="form-control form rounded"
                                            id="name"
                                            name="name"
                                            placeholder="Name"
                                            value={regFormData.name}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group mb-3">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            className="form-control form-rounded"
                                            id="email"
                                            name="email"
                                            placeholder="Email"
                                            value={regFormData.email}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group mb-3">
                                        <label htmlFor="password">Password</label>
                                        <input
                                            type="password"
                                            className="form-control form rounded"
                                            id="password"
                                            name="password"
                                            placeholder="Password"
                                            value={regFormData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="form-group mb-3 col-6">
                                            <label htmlFor="role">Role</label>
                                            <select
                                                id="role"
                                                className="form-select"
                                                name="role"
                                                value={regFormData.role}
                                                onChange={(e) => { handleChange(e), handleRoleSelect(e);}}>
                                                
                                                <option value="Employee">Employee</option>
                                                <option value="Manager">Manager</option>
                                            </select>
                                        </div>

                                        {userRole === "Employee" &&
                                            <div className="form-group mb-3 col-6">
                                                <label htmlFor="manager">Select Your Manager</label>
                                                <select
                                                    id="manager"
                                                    className="form-select"
                                                    name="manager"
                                                    value={regFormData.manager}
                                                    onChange={handleChange}
                                                >
                                                    {managers && managers.length > 0 ? managers.map((manager) => (
                                                        <option key={manager.manager_id} value={manager.name}>
                                                                {manager.name}
                                                        </option>
                                                    )) : (<option>No Managers</option>)}
                                                </select>
                                            </div>}
                                    </div>


                                    {error && <p className="text-danger text-xsm">{error}</p>}

                                    <div className="text-center">
                                        <button type="submit" className="w-100 btn btn-dark mt-4" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
                                    </div>

                                    <div className="text-center mt-3">
                                        <p>Already have an account? Login</p>
                                        <Link className="btn btn-outline-success" to="/login">
                                            Login
                                        </Link>
                                    </div>
                                    
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Register