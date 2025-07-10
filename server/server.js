import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const client = new MongoClient(`${process.env.MONGO_DB_URL}`);
await client.connect();
const db = client.db(process.env.MONGO_DB);
const feedbackCollection = db.collection('feedback');

// Route example
app.get('/api/feedback', async (req, res) => {
    const feedback = await feedbackCollection.find().toArray();
    res.status(200).json(feedback);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
