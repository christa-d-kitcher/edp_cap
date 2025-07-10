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

//Create models
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
  
const feedbackSchema = new mongoose.Schema({
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    manager_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Question', 'Feedback']
    },
    sentiment: {
        type: String,
        default: null
    },
    sentiment_score: {
        type: Number,
        default: null
    },
    response: {
        type: String,
        default: null
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    respondedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
  
//Connect to db
mongoose.connect(url, {
    dbName: dbName
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

//Authenticate token
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

//Register 
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role, manager_id } = req.body;
        if(!name || !email || !password || !role) {
            return res.status(400).send({ error: 'All fields are required.' });
        }

        const existingEmployee = await Employee.findOne({ email });
        if(existingEmployee) {
            return res.status(400).json({ success: false, error: 'Email already in use' });
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
            success: true,
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
            message: 'Employee created successfully'
        });
    } catch (err) {
        console.error("Error: ", err);
        res.status(500).json({ success: false, error: "Error creating employee" });
    }
});

//Login
app.post('/api/auth/login', async (req, res) => {
    try {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const employee = await Employee.findOne({ email });
    if (!employee) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (password !== employee.password) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { id: employee._id, role: employee.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.status(200).json({
        success: true, 
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
        message: 'Login successful'
    });
} catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ success: false, error: 'Error during login'});
}
});

//Logout
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Error during logout" });
    }
});

//Create new feedback/question
app.post('/api/feedback', authenticateToken, async (req, res) => {
    try {
        const { manager_id, message, type, isAnonymous } = req.body;

        if (!manager_id || !message || !type) {
            return res.status(400).json({
                success: false,
                error: "Manager ID, message and type are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(manager_id)) {
            return res.status(400).json({ success: false, error: "Invalid manager ID format" });
        }

        const manager = await Employee.findOne({ _id: manager_id, role: 'Manager' });
        if (!manager) {
            return res.status(404).json({ success: false, error: "Manager not found" });
        }

        const newFeedback = new Feedback({
            employee_id: req.employee.id,
            manager_id,
            message,
            type,
            isAnonymous: isAnonymous || false
        });

        await newFeedback.save();

        res.status(201).json({
            success: true,
            data: {
                feedback: {
                    id: newFeedback._id,
                    type: newFeedback.type,
                    message: newFeedback.message,
                    createdAt: newFeedback.createdAt,
                    isAnonymous: newFeedback.isAnonymous
                }
            },
            message: `${type} submitted successfully`
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: `Error submitting ${req.body.type || 'feedback'}` });
    }
});

//Get all feedback/questions for a manager
app.get('/api/managers/feedback', authenticateToken, async (req, res) => {
    try {
      if (req.employee.role !== 'Manager') {
        return res.status(403).json({ 
          success: false, 
          error: 'Access denied. Only managers can view feedback.' 
        });
      }
      
      const feedback = await Feedback.find({ manager_id: req.employee.id })
        .sort({ createdAt: -1 });
      
      const processedFeedback = feedback.map(item => {
        const feedbackObj = {
          id: item._id,
          message: item.message,
          type: item.type,
          createdAt: item.createdAt,
          sentiment: item.sentiment,
          sentiment_score: item.sentiment_score,
          response: item.response,
          respondedAt: item.respondedAt
        };
    
        if (!item.isAnonymous) {
          feedbackObj.employee_id = item.employee_id;
        } else {
          feedbackObj.isAnonymous = true;
        }
        
        return feedbackObj;
      });
      
      res.status(200).json({
        success: true,
        data: {
          feedback: processedFeedback
        },
        message: 'Feedback retrieved successfully'
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ success: false, error: "Error retrieving feedback" });
    }
  });

  // Get all feedback/questions submitted by an employee
app.get('/api/employees/feedback', authenticateToken, async (req, res) => {
    try {
      const feedback = await Feedback.find({ employee_id: req.employee.id })
        .sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        data: {
          feedback: feedback.map(item => ({
            id: item._id,
            manager_id: item.manager_id,
            message: item.message,
            type: item.type,
            createdAt: item.createdAt,
            response: item.response,
            respondedAt: item.respondedAt,
            isAnonymous: item.isAnonymous
          }))
        },
        message: 'Feedback history retrieved successfully'
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ success: false, error: "Error retrieving feedback history" });
    }
  });


  // Respond to feedback/question
app.post('/api/feedback/:feedbackId/respond', authenticateToken, async (req, res) => {
    try {
      const { feedbackId } = req.params;
      const { response } = req.body;
      
      if (!response) {
        return res.status(400).json({ success: false, error: 'Response is required' });
      }
      
      if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
        return res.status(400).json({ success: false, error: 'Invalid feedback ID format' });
      }
      
      const feedback = await Feedback.findById(feedbackId);
      
      if (!feedback) {
        return res.status(404).json({ success: false, error: 'Feedback not found' });
      }
      if (feedback.manager_id.toString() !== req.employee.id) {
        return res.status(403).json({ 
          success: false, 
          error: 'Access denied. You can only respond to feedback directed to you.' 
        });
      }
      
      feedback.response = response;
      feedback.respondedAt = new Date();
      await feedback.save();
      
      res.status(200).json({
        success: true,
        data: {
          feedback: {
            id: feedback._id,
            response: feedback.response,
            respondedAt: feedback.respondedAt
          }
        },
        message: 'Response submitted successfully'
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ success: false, error: "Error submitting response" });
    }
  });

  // Get all managers
app.get('/api/managers', authenticateToken, async (req, res) => {
    try {
      const managers = await Employee.find({ role: 'Manager' }).select('-password');
      
      res.status(200).json({
        success: true,
        data: {
          managers: managers.map(manager => ({
            id: manager._id,
            name: manager.name,
            email: manager.email
          }))
        },
        message: 'Managers retrieved successfully'
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ success: false, error: "Error retrieving managers" });
    }
  });

  // Sentiment analysis


  
  
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
