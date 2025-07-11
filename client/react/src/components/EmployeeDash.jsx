import { useState, useEffect } from "react";

const EmployeeDash = () => {
    const [feedbackSent, setFeedbackSent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("authToken"); // Or wherever you store it

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await fetch("/api/employees/feedback", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const json = await res.json();

                if (json.success) {
                    setFeedbackSent(json.data.feedback);
                } else {
                    throw new Error(json.error);
                }
            } catch (err) {
                console.error("Error:", err);
                setError("Failed to load employee feedback.");
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();
    }, [token]);

    if (loading) return <p>Loading feedback...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-4">
            <h3>Feedback You’ve Submitted</h3>
            {feedbackSent.length === 0 ? (
                <p>You haven’t submitted any feedback yet.</p>
            ) : (
                <ul className="list-group">
                    {feedbackSent.map((item) => (
                        <li key={item.id} className="list-group-item">
                            <strong>To Manager ID:</strong> {item.manager_id}<br />
                            <strong>Type:</strong> {item.type}<br />
                            <strong>Message:</strong> {item.message}<br />
                            <strong>Submitted:</strong> {new Date(item.createdAt).toLocaleString()}<br />
                            {item.response && (
                                <div>
                                    <strong>Response:</strong> {item.response}<br />
                                    <em>Responded At:</em> {new Date(item.respondedAt).toLocaleString()}
                                </div>
                            )}
                            <strong>Anonymous:</strong> {item.isAnonymous ? "Yes" : "No"}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default EmployeeDash;
