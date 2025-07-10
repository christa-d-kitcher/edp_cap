import express from 'express';
import { promises as fs } from 'fs';
import { MongoClient, ObjectId } from 'mongodb'
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

dotenv.config();

const url = process.env.MONGO_DB_URL;
const dbName = process.env.MONGO_DB;

const employeeSchema = new mongoose.Schema({
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      required: true, 
      enum: ['Manager', 'Employee'] 
    },
    manager_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Employee',
      default: null
    }
  }, { timestamps: true });
  
  const Employee = mongoose.model('Employee', employeeSchema);
  

mongoose.connect(url, {
    dbName: dbName
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.employee = decoded;
      next();
    } catch (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token.' });
    }
  };

const app = express();
app.use(cors());
const PORT = 3000;

app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if(!name || !email || !password || !role) {
            return res.status(400).send({ error: 'All fields are required.' });
        }

        const existingEmployee = await Employee.findOne({ email });
        if(existingEmployee) {
            return res.status(400).json({ sucess: false, error: 'Email already in use' });
        }

        const newEmployee = new Employee({
            name,
            email,
            password,
            role,
            manager_id: manager_id || null
        });

        await newEmployee.save();

        const token = jwt.sign(
            { id: newEmployee._id, role: newEmployee.role},
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.status(201).json({ 
            sucess: true,
            data: {
                employee: {
                    id: newEmployee._id,
                    name: newEmployee.name,
                    email: newEmployee.email,
                    role: newEmployee.role,
                    manager_id: newEmployee.manager_id
                },
                token
            },
            message: 'Employee created succesfully' 
        });
    } catch (err) {
        console.err("Error: ", err);
        res.status(500).json({ sucess: false, error: "Error creating employee" });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ sucess: false, error: 'email and password are required' });
    }

    const employee = await Employee.findOne({ email });
    if (!employee) {
        return res.status(401).json({ sucess: false, error: 'Invalid credentials' });
    }

    if (password !== employee.password) {
        return res.status(401).json({ sucess: false, error: 'Invalid password'});
    }

    const token = jwt.sign(
        { id: employee._id, role: employee.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    await employee.save();

    res.status(200).json({
        sucess: true,
        data: {
            employee: {
                id: employee._id,
                name: employee.name,
                email: employee.email,
                role: employee.role,
                manager_id: employee.manager_id
            },
            token
        },
        message: 'Login sucessful'
    });
} catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ sucess: false, error: 'Error during login'});
}
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        res.status(200).json({
            sucess: true,
            message: 'Logout sucessful'
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ sucess: false, error: "Error during logout" });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});