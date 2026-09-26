

## Premium frontend refresh
The frontend now uses a dark graphite/electric-blue visual system, supplied AxelPath AI imagery, animated hero visuals, and curated six-item public sections for courses, projects, internships and careers. Backend routes and database structure are preserved.

## Course registration + Razorpay

The course registration flow is implemented at `/register-course`.

Flow:
1. User enters full name, email, phone, referral ID and selects a course.
2. Backend creates a Razorpay Order using the course price stored in MySQL.
3. Razorpay Checkout opens in the browser.
4. After successful checkout, the browser sends the Razorpay payment ID/order ID/signature to the backend.
5. Backend verifies the HMAC signature, checks the payment is captured, checks the order and amount, and checks the UTR/transaction reference.
6. UTRs, Razorpay order IDs and payment IDs are unique in MySQL.
7. A `APREG-YYYY-XXXXXXXX` registration ID is generated and the confirmation email is sent through the configured SMTP account.

### Required server environment

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_server_only_key_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-mail@example.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-mail@example.com
FRONTEND_URL=https://your-frontend-domain
```

Never put `RAZORPAY_KEY_SECRET` in frontend code or commit it to GitHub.

### Google Cloud deployment

For Cloud Run, add the variables above as service environment variables/secrets. Point `FRONTEND_URL` at the deployed frontend and expose the backend over HTTPS. For live Razorpay payments, replace the test key with the live key only after the Razorpay account and webhook/payment-capture settings are ready.
I’ll structure it around your actual stack and project:

Frontend: React / Vite, HTML, CSS, JavaScript
Backend: FastAPI, Python
Database: MySQL
ORM: SQLAlchemy
Migrations: Alembic
Authentication: JWT / python-jose, password hashing with Passlib + bcrypt
API: REST APIs
Payments: Razorpay
Email: Gmail SMTP
Containers: Docker + Docker Compose
Environment: .env / .env.example
Testing: Pytest + HTTPX
Frontend sections: Home, Services, Academy, Courses, Internships, Careers, Projects, Premium, News, About, Contact, Registration
MySQL database and seeding
Complete registration → course selection → payment → email flow
How the frontend communicates with FastAPI
How FastAPI communicates with MySQL
How Docker runs MySQL + backend
How to run the complete project
How to add/update data
How to deploy
Git/GitHub workflow
Project folder structure
Troubleshooting

And I won't invent technologies or features that aren't in your project.
# ==========================================
# AxelPath - COMPLETE START COMMANDS
# ==========================================

# 1. GO TO PROJECT ROOT
cd "C:\Users\HP\OneDrive\Desktop\AxelPath Premium\AxelPath"


# ==========================================
# 2. START MYSQL + BACKEND WITH DOCKER
# ==========================================

docker compose up -d --build


# ==========================================
# 3. CHECK DOCKER CONTAINERS
# ==========================================

docker compose ps


# ==========================================
# 4. SEED MYSQL DATABASE
# ==========================================

docker compose exec backend python -c "from app.database.seed import seed_database; seed_database()"


# ==========================================
# 5. RESTART BACKEND
# ==========================================

docker compose restart backend


# ==========================================
# 6. CHECK BACKEND LOGS
# ==========================================

docker compose logs -f backend


# ==========================================
# 7. CHECK MYSQL LOGS
# ==========================================

docker compose logs -f mysql


# ==========================================
# 8. MYSQL TERMINAL
# ==========================================

docker compose exec mysql mysql -uroot -p

# MySQL password:
# Password

# Inside MySQL:
SHOW DATABASES;
USE AxelPath;
SHOW TABLES;
exit;


# ==========================================
# 9. RUN FRONTEND
# ==========================================
# OPEN A NEW POWERSHELL WINDOW

cd "C:\Users\HP\OneDrive\Desktop\AxelPath Premium\AxelPath\frontend"

npm install

npm run dev


# ==========================================
# 10. OPEN WEBSITE
# ==========================================

# Frontend:
# http://localhost:5173

# Backend:
# http://localhost:8000

# FastAPI Swagger:
# http://localhost:8000/docs

# MySQL from Windows:
# localhost:3307


# ==========================================
# 11. STOP FRONTEND
# ==========================================

# Press:
# Ctrl + C


# ==========================================
# 12. STOP DOCKER
# ==========================================

cd "C:\Users\HP\OneDrive\Desktop\AxelPath Premium\AxelPath"

docker compose stop


# ==========================================
# 13. START DOCKER AGAIN
# ==========================================

docker compose start


# ==========================================
# 14. STOP AND REMOVE CONTAINERS
# ==========================================

docker compose down


# ==========================================
# 15. REBUILD EVERYTHING
# ==========================================

docker compose down

docker compose up -d --build


# ==========================================
# 16. COMPLETE DATABASE RESET
# WARNING: THIS DELETES MYSQL DATA
# ==========================================

docker compose down -v

docker compose up -d --build

docker compose exec backend python -c "from app.database.seed import seed_database; seed_database()"

docker compose restart backend


# ==========================================
# 17. CHECK ALL DOCKER SERVICES
# ==========================================

docker compose ps


# ==========================================
# 18. BACKEND LAST 100 LOGS
# ==========================================

docker compose logs --tail=100 backend


# ==========================================
# 19. MYSQL LAST 100 LOGS
# ==========================================

docker compose logs --tail=100 mysql


# ==========================================
# 20. COMPLETE NORMAL START
# ==========================================

# TERMINAL 1

cd "C:\Users\HP\OneDrive\Desktop\AxelPath Premium\AxelPath"

docker compose up -d

docker compose ps


# TERMINAL 2

cd "C:\Users\HP\OneDrive\Desktop\AxelPath Premium\AxelPath\frontend"

npm run dev


# ==========================================
# WEBSITE
# ==========================================

# http://localhost:5173
