# SoftSkills — E-learning Platform

Training platform for soft-skills courses, built as a university team project (Computer Engineering, Instituto Politécnico de Viseu).

> Academic project, team of five. I was responsible for the web application: the React frontend and the Node.js/Express API.

## Features

- **Roles**: learners, trainers and managers, with JWT authentication and role-based routes.
- **Courses**: areas, categories and topics, sections and resources, enrolments and course requests.
- **Certificates**: PDF certificates generated with PDFKit, with revocation.
- **Forum**: topics, comments, reactions and content reports.
- **Notifications** by email (Nodemailer) and scheduled jobs (node-cron).
- **File uploads** to Cloudinary.
- **Dashboards** with charts for managers.

## Stack

**Backend:** Node.js · Express · Sequelize · PostgreSQL · JWT · bcrypt · Multer · Cloudinary · PDFKit · Nodemailer
**Frontend:** React · Vite · React Router · React Bootstrap · Axios · Chart.js / Recharts

## Running locally

```bash
# API
cd backend
cp .env.example .env   # fill in your own values
npm install
npm run dev

# Web app
cd ../frontend
npm install
npm run dev
```
