import pymongo
import random
import datetime
from faker import Faker
from bson import ObjectId

# Initialize Faker
fake = Faker()

def connect_to_mongodb():
    mongo_url = "mongodb://localhost:27017"
    client = pymongo.MongoClient(mongo_url)
    db = client["feedbackdb"]
    return db

def generate_employee(count=50):
    """Generate employee records with managers and regular employees"""
    employee = []
    
    manager_count = int(count * 0.2)
    for _ in range(manager_count):
        employee.append({
            "_id": ObjectId(),
            "name": fake.name(),
            "email": fake.email(),
            "password": "password123",
            "role": "Manager",
            "manager_id": None,
            "createdAt": fake.date_time_between(start_date="-1y", end_date="now"),
            "updatedAt": fake.date_time_between(start_date="-1y", end_date="now")
        })
    
    for _ in range(count - manager_count):
        random_manager = random.choice(employee[:manager_count])
        
        employee.append({
            "_id": ObjectId(),
            "name": fake.name(),
            "email": fake.email(),
            "password": "password123",
            "role": "Employee",
            "manager_id": random_manager["_id"],
            "createdAt": fake.date_time_between(start_date="-1y", end_date="now"),
            "updatedAt": fake.date_time_between(start_date="-1y", end_date="now")
        })
    
    return employee

def generate_feedback(employee, count=950):
    """Generate feedback records between employees and managers"""
    feedback = []
    
    managers = [emp for emp in employee if emp["role"] == "Manager"]
    regular_employee = [emp for emp in employee if emp["role"] == "Employee"]

    for _ in range(count):
        employee = random.choice(regular_employee)
        
        if employee["manager_id"]:
            manager_id = employee["manager_id"]
        else:
            manager = random.choice(managers)
            manager_id = manager["_id"]
        
        has_response = random.random() > 0.3 
        
        created_at = fake.date_time_between(start_date="-1y", end_date="now")
        
        responded_at = None
        if has_response:
            responded_at = fake.date_time_between(start_date=created_at, end_date="now")
        
        sentiment_score = None
        sentiment = None
        if random.random() > 0.2:
            sentiment_score = round(random.uniform(-1.0, 1.0), 2)
            if sentiment_score > 0.3:
                sentiment = "Positive"
            elif sentiment_score < -0.3:
                sentiment = "Negative"
            else:
                sentiment = "Neutral"
        
        feedback_type = random.choice(["Feedback", "Question"])
        is_anonymous = random.random() < 0.3
        
        feedback.append({
            "_id": ObjectId(),
            "employee_id": employee["_id"],
            "manager_id": manager_id,
            "message": fake.paragraph() if feedback_type == "Feedback" else fake.sentence() + "?",
            "type": feedback_type,
            "sentiment": sentiment,
            "sentiment_score": sentiment_score,
            "response": fake.paragraph() if has_response else None,
            "isAnonymous": is_anonymous,
            "respondedAt": responded_at,
            "createdAt": created_at,
            "updatedAt": created_at
        })
    
    return feedback

def seed_database():
    """Seed the database with employees and feedback"""
    db = connect_to_mongodb()
    
    # Clear existing collections - use pluralized names to match Mongoose convention
    db.employees.delete_many({})
    db.feedbacks.delete_many({})
    
    print("Generating employees...")
    employee = generate_employee(50)
    
    print("Generating feedback...")
    feedback = generate_feedback(employee, 950)
    
    print("Inserting employees into database...")
    db.employees.insert_many(employee)
    
    print("Inserting feedback into database...")
    db.feedbacks.insert_many(feedback)
    
    print(f"Database seeded successfully with {len(employee)} employees and {len(feedback)} feedback records")

if __name__ == "__main__":
    seed_database()
