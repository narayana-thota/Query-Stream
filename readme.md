<div align="center">
  <br />
    <a href="https://query-stream.netlify.app" target="_blank">
      <img src="https://via.placeholder.com/150?text=QueryStream+Logo" alt="QueryStream Logo" width="100">
    </a>
  <br />

  <h1>QueryStream</h1>

  <p>
    <strong>A Next-Generation Productivity Suite integrating Task Management with Generative AI.</strong>
  </p>

  <p>
    <a href="https://query-stream.netlify.app"><strong>View Live Deployment »</strong></a>
    <br />
    <br />
    <a href="https://github.com/yourusername/querystream/issues">Report Bug</a>
    ·
    <a href="https://github.com/yourusername/querystream/issues">Request Feature</a>
  </p>
</div>

<div align="center">

![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-000000?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

</div>

<br />

## 📋 Table of Contents

1. [About The Project](#about-the-project)
2. [Key Features](#key-features)
3. [System Architecture](#system-architecture)
4. [Tech Stack](#tech-stack)
5. [Getting Started](#getting-started)
6. [Challenges & Solutions](#challenges--solutions)
7. [Contact](#contact)

---

## 💡 About The Project

**QueryStream** is a comprehensive productivity platform engineered to solve the fragmentation between task management and content consumption. It leverages Generative AI to transform static documentation into interactive audio experiences, increasing accessibility for auditory learners.

The platform is built on the **MERN stack (MongoDB, Express, React, Node.js)**, featuring a secure, scalable backend deployed on Render and a responsive frontend hosted on Netlify. It employs a **Clean Architecture** approach to ensure maintainability and separation of concerns.

---

## 🚀 Key Features

### **AI-Powered Podcast Generator**
* **Text-to-Audio Synthesis:** Converts user notes, text inputs, or uploaded PDFs into natural-sounding audio podcasts.
* **Multi-Voice Support:** Offers selectable voice profiles (Indian Female/Male, US Professional) to suit user preference.
* **Contextual Scripting:** Generates structured scripts with distinct tones (Professional, Casual, Humorous) before synthesis.

### **Advanced Task Management**
* **Priority Matrix:** Categorizes tasks by High, Medium, and Low priority with visual indicators.
* **Optimistic UI:** Implements optimistic state updates for immediate user feedback during CRUD operations, synchronizing with the server in the background.
* **Time-Series Sorting:** Automatically organizes tasks into "Today," "Tomorrow," and specific dates.

### **Data & Analytics**
* **Real-Time Dashboard:** visualizes pending tasks, total PDF uploads, and podcast generation metrics.
* **Secure File Handling:** Manages PDF uploads via Multer with secure retrieval protocols.

---

## 🏗 System Architecture

The application follows a **Service-Oriented Architecture (SOA)** within a monolithic codebase to ensure modularity.

* **Frontend (Client):** React.js with Vite for high-performance rendering. Uses Axios interceptors for handling JWT injection and global error management.
* **Backend (Server):** Express.js REST API.
    * **Auth Layer:** Handles JWT issuance, HTTP-Only Cookie management, and Bcrypt hashing.
    * **Service Layer:** Separates business logic from HTTP transport layers.
    * **Model Layer:** Mongoose schemas defining strict data typing and validation.
* **Database:** MongoDB Atlas (Cloud) for persistent, scalable data storage.

---

## 🛠 Tech Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS, Lucide React, Axios, Vite |
| **Backend** | Node.js, Express.js, JSON Web Token (JWT), Bcrypt.js, Multer |
| **Database** | MongoDB, Mongoose ODM |
| **DevOps** | Render (Backend), Netlify (Frontend), Git |
| **AI Integration** | Generative AI APIs (Text-to-Speech & LLM) |

---

## ⚡ Getting Started

Follow these steps to set up the project locally for development.

### Prerequisites
* Node.js (v18.x or higher)
* npm or yarn
* MongoDB Atlas Account

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/querystream.git](https://github.com/yourusername/querystream.git)
    cd querystream
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the `backend` directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secure_jwt_secret
    NODE_ENV=development
    ```

4.  **Install Frontend Dependencies**
    ```bash
    cd ../frontend
    npm install
    ```

5.  **Run the Application**
    * **Backend:** `npm run dev` (Runs on port 5000)
    * **Frontend:** `npm run dev` (Runs on port 5173)

---

## 🔧 Challenges & Solutions

### 1. The "Double Hashing" Authentication Issue
* **Problem:** Users were unable to log in due to password hashes mismatching. The root cause was a conflict between a Mongoose `pre-save` hook and the Controller logic, resulting in the password being hashed twice.
* **Solution:** Refactored the authentication flow to centralize encryption logic strictly within the Service layer, removing side-effect hooks from the Model to ensure deterministic behavior.

### 2. Cross-Origin Resource Sharing (CORS) with Cookies
* **Problem:** Security policies on modern browsers blocked `Set-Cookie` headers because the frontend (Netlify) and backend (Render) resided on different domains.
* **Solution:** Configured dynamic CORS policies and cookie settings (`SameSite: None`, `Secure: True`) that adapt based on the `NODE_ENV` (Production vs. Development).

### 3. Deployment Consistency (Git Case Sensitivity)
* **Problem:** The deployment pipeline on Render (Linux-based) failed to recognize file updates due to a casing mismatch (`User.js` vs `user.js`) that was ignored by the local Windows environment.
* **Solution:** Enforced strict naming conventions (`UserModel.js`) and implemented a rigorous Git renaming strategy to clear the cache and force a fresh build.

---

## 👤 Author

**Narayana Thota**
* *Full Stack Developer & Computer Science Engineer*

<p align="left">
  <a href="https://www.linkedin.com/in/your-linkedin-profile" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
  <a href="mailto:narayanathota23@gmail.com">
    <img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email">
  </a>
</p>

---
<p align="center">
  Built with ❤️ by Narayana Thota
</p>