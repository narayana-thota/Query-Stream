<div align="center">

  <h1>QueryStream</h1>

  <p>
    <strong>A Next-Generation Productivity Suite integrating Intelligent Task Management with Generative AI.</strong>
  </p>

  <p>
    <a href="https://query-stream.netlify.app"><strong>View Live Deployment »</strong></a>
  </p>

  <br />

  ![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-000000?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

</div>

<br />

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Core Functionality](#-core-functionality)
3. [System Architecture](#-system-architecture)
4. [Tech Stack](#-tech-stack)
5. [Local Installation](#-local-installation)

---

## 💡 Project Overview

**QueryStream** is an advanced full-stack application designed to optimize personal workflow by converging task management and auditory learning into a single interface. Recognizing the fragmentation between organizing tasks and consuming content, QueryStream leverages **Generative AI** to transform static documentation into interactive audio experiences.

The application is built on a robust **MERN (MongoDB, Express, React, Node.js)** architecture. It prioritizes data security through industry-standard encryption and offers a seamless user experience via optimistic UI updates and responsive design patterns. The platform serves as a demonstration of scalable full-stack development, integrating third-party AI services with a custom RESTful API.

---

## 🚀 Core Functionality

### **1. AI-Powered Podcast Generator**
Transforms written content into consumption-ready audio, increasing accessibility for users who prefer auditory learning.
* **Text-to-Audio Synthesis:** Converts raw text inputs or uploaded PDF documents into natural-sounding speech.
* **Multi-Voice Engine:** Features a selection of distinct voice profiles (Indian Female/Male, US Professional) to suit user preference.
* **Contextual Scripting:** utilized Generative AI to structure raw data into a coherent, conversational script before synthesis.

### **2. Advanced Task Management System**
A comprehensive CRUD (Create, Read, Update, Delete) system designed for high-frequency usage.
* **Priority Matrix:** Tasks are categorized by urgency (High, Medium, Low) with distinct visual indicators for quick scanning.
* **Time-Series Sorting:** An intelligent sorting algorithm automatically organizes tasks into logical timeframes ("Today," "Tomorrow," and specific dates).
* **Optimistic UI:** The interface updates state immediately upon user interaction, synchronizing with the server in the background to ensure zero latency.

### **3. Analytics Dashboard**
A centralized hub for visualizing productivity metrics.
* **Real-Time Data Visualization:** Displays aggregate counts of pending tasks, processed PDFs, and generated podcasts.
* **Session Management:** Tracks user activity and persists state across sessions securely.

---

## 🏗 System Architecture

The application follows a **Service-Oriented Architecture (SOA)** approach within a monolithic codebase to ensure modularity and maintainability.

* **Secure Authentication Layer:**
    * Authentication is handled via **JSON Web Tokens (JWT)** stored in **HTTP-Only Cookies**. This prevents XSS (Cross-Site Scripting) attacks by ensuring tokens cannot be accessed via client-side JavaScript.
    * Passwords are salted and hashed using **Bcrypt** before storage, ensuring data integrity.

* **API Service Layer:**
    * The backend implements a clear separation of concerns. **Controllers** handle HTTP requests, while **Services** manage business logic and database interactions.
    * **Cross-Origin Resource Sharing (CORS)** is dynamically configured to allow secure communication between the Netlify frontend and Render backend.

* **Database Schema Design:**
    * Utilizes **Mongoose ODM** for strict schema modeling.
    * Data relationships are normalized to ensure efficient querying and scalability.

---

## 🛠 Tech Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS, Lucide React, Axios, Vite |
| **Backend** | Node.js, Express.js, JWT, Bcrypt.js, Multer |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **DevOps** | Render (Backend), Netlify (Frontend), Git Version Control |
| **Security** | HTTP-Only Cookies, Environment Variable Management |

---

## ⚡ Local Installation

Follow these steps to set up the project locally for development.

### Prerequisites
* Node.js (v18.x or higher)
* MongoDB Atlas Account

### Installation Steps

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/querystream.git](https://github.com/yourusername/querystream.git)
    cd querystream
    ```

2.  **Backend Setup**
    Navigate to the backend directory and install dependencies:
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory with the following variables:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secure_jwt_secret
    NODE_ENV=development
    ```
    Start the server:
    ```bash
    npm run dev
    ```

3.  **Frontend Setup**
    Open a new terminal, navigate to the frontend directory, and install dependencies:
    ```bash
    cd ../frontend
    npm install
    ```
    Start the React application:
    ```bash
    npm run dev
    ```

---

## 👤 Author

**Narayana Thota**