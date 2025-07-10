import { useState, useEffect } from "react";

const ManagerDash = () => {
    const [feedbackReceived, setFeedbackReceived] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchManagerFeedback = async () => {
            try {
                const res = await fetch("/api/managers/feedback", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const json = await res.json();

                if (json.success) {
                    setFeedbackReceived(json.data.feedback);
                } else {
                    throw new Error(json.error);
                }
            } catch (err) {
                console.error("Error:", err);
                setError("Failed to load feedback for manager.");
            } finally {
                setLoading(false);
            }
        };

        fetchManagerFeedback();
    }, [token]);

    if (loading) return <p>Loading feedback...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-4">
            <h3>Feedback You’ve Received</h3>
            {feedbackReceived.length === 0 ? (
                <p>No feedback received yet.</p>
            ) : (
                <ul className="list-group">
                    {feedbackReceived.map((fb) => (
                        <li key={fb.id} className="list-group-item">
                            <strong>Type:</strong> {fb.type}<br />
                            <strong>Message:</strong> {fb.message}<br />
                            <strong>Submitted:</strong> {new Date(fb.createdAt).toLocaleString()}<br />
                            <strong>Anonymous:</strong> {fb.isAnonymous ? "Yes" : "No"}<br />
                            {fb.isAnonymous ? (
                                <p><strong>From:</strong> Anonymous</p>
                            ) : (
                                <p><strong>From Employee ID:</strong> {fb.employee_id}</p>
                            )}
                            {fb.response && (
                                <div>
                                    <strong>Your Response:</strong> {fb.response}<br />
                                    <em>Responded At:</em> {new Date(fb.respondedAt).toLocaleString()}
                                </div>
                            )}
                            {fb.sentiment && (
                                <div>
                                    <strong>Sentiment:</strong> {fb.sentiment}<br />
                                    <strong>Score:</strong> {fb.sentiment_score}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ManagerDash;
