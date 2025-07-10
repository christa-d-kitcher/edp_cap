import { useState, useEffect } from "react";

const EmployeeDash = () => {
    const [employeeData, setEmployeeData] = useState(null);
    const [feedbackReceived, setFeedbackReceived] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Replace with real endpoints when backend is ready
            const userRes = await fetch("/api/employee/me");
            const userData = await userRes.json();

            const feedbackRes = await fetch("/api/feedback/received");
            const feedbackData = await feedbackRes.json();

            setEmployeeData(userData);
            setFeedbackReceived(feedbackData);
        } catch (err) {
            setError("Failed to load dashboard");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading dashboard...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-4">
            <h2>Welcome, {employeeData.name}</h2>
            <p>Email: {employeeData.email}</p>
            <p>Manager: {employeeData.manager}</p>

            <hr />

            <h4>Feedback You've Received</h4>

            {feedbackReceived.length === 0 ? (
                <p>No feedback yet.</p>
            ) : (
                <ul className="list-group">
                    {feedbackReceived.map((item) => (
                        <li key={item._id} className="list-group-item">
                            <strong>From:</strong> {item.senderName || "Anonymous"}<br />
                            <strong>Category:</strong> {item.category}<br />
                            <strong>Sentiment:</strong> {item.sentimentScore}<br />
                            <strong>Message:</strong> {item.message}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};


export default EmployeeDash