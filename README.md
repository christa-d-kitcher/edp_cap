EDP Final Capstone Project

MongoDB Schemas
**Employee Schema**
o	employee_id: ObjectId (*Mongo will generate)
o	manager_id: ObjectId (*Mongo will generate)
o Name: string
o	email: string
o	password: string
o	role: string [Manager | Employee]

**Feedback/Question/Response Schema**
o _id: ObjectId (*Mongo will generate)
o employee_id: ObjectId (*Mongo will generate)
o manager_id: ObjectId (*Mongo will generate)
o message: string
o type: string [Question | Feedback]
o sentiment: string 
o sentiment_score: float
o createdAt: Date
o respondedAt: Date
o response: string
o isAnonymous: boolean



**API Endpoints**
- POST /api/auth/register - User registration
  Response: status
  
- POST /api/auth/login - User login
  Response: status
  
- GET /api/managers - Get all managers
  Response: Employee object
  
- POST /api/feedback - Submit feedback
  Response: status
  
- GET /api/feedback - Get feedback (role-based)
  Response: Feedback object
  
- POST /api/feedback/[_id]/response - Response to a specific feedback
  Response: status
  
- POST /api/sentiment - Analyze sentiment
  Response: TBD



Front End 
Components:
- App
- Header
    - Page title
    - Welcome *User's Name* & *User's role*
    - Logout button
- Login
    Form fields:
      - Email
      - Password
- Register
    -> Form fields:
      - Name: text
      - Email: text
      - Password: password
      - Role: Select
      - Manager: Select
- EmployeeDashboard
    -> Form fields:
      - Message Type: Select
      - Message: text
      - Submit Anonymously: Checkbox
      - Submit button
- ManagerDashboard
    - EmployeeFeedback
        -> Form fields:
          - Message: text
          - Submit button







