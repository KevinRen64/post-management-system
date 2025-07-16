# 📝 Post Management System

A full-stack cloud-native application for managing blog posts with secure JWT-based authentication. Built with **React**, **ASP.NET Core**, **MySQL**, **Docker**, **AWS ECS Fargate**, **S3**, and **GitHub Actions** for automated CI/CD.

---

## 🚀 Features

### 🔐 Authentication
- JWT-based login and registration
- Secured endpoints with role-based access

### 📦 Backend (ASP.NET Core + Dapper)
- RESTful API with full CRUD for posts
- Connected to Amazon RDS (MySQL)
- Containerized with Docker and deployed to AWS ECS Fargate
- Load balanced via AWS Application Load Balancer
- CI/CD with GitHub Actions (ECR build + ECS deploy)

### 🎨 Frontend (React)
- Login and Register pages
- Post list, create, update, and delete views
- Token-based session management
- Hosted on Amazon S3 with CI/CD via GitHub Actions

---

## 🛠 Tech Stack

| Layer       | Technology                            |
|-------------|----------------------------------------|
| Frontend    | React, Axios, React Router             |
| Backend     | ASP.NET Core Web API, Dapper ORM       |
| Database    | Amazon RDS (MySQL)                     |
| DevOps      | Docker, GitHub Actions, Amazon ECR     |
| Deployment  | AWS ECS Fargate, Application Load Balancer, Amazon S3 |
| Security    | JWT, HTTPS                             |

---

## 📂 Project Structure

<img width="393" height="229" alt="image" src="https://github.com/user-attachments/assets/7b4ac5d1-3bab-404a-89fd-89a8d19db9b2" />


🔗 Live Links
🌐 Frontend: http://posts-app-frontend.s3-website-ap-southeast-2.amazonaws.com/login

🔌 API Endpoint: http://posts-api-alb-1842861892.ap-southeast-2.elb.amazonaws.com/


   Auth Management
   | HTTP Method | Endpoint                      | Description                                        |
   | ----------- | ----------------------------- | ------------------------------------------------   |
   | POST        | `/Auth/Register`              | Registers a new user and stores hashed credentials |
   | POST        | `/Auth/Login`                 | Verifies credentials and returns success or error  |
   
   Post Management
   | HTTP Method | Endpoint                      | Description                                        |
   | ----------- | ----------------------------- | ------------------------------------------------   |
   | GET         | `/Post/GetPosts`              | Retrieves all posts                                |
   | GET         | `/Post/GetPost/{id}`          | Retrieves a post by postId                         |
   | POST        | `/Post/AddPost`               | Adds a new post                                    |
   | PUT         | `/Post/EditPost`              | Updates an existing post                           |
   | DELETE      | `/Post/DeletePost/{id}`       | Deletes a post by postId                           |

   
