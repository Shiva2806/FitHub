# FitHub: Your Personal AI Fitness Companion

<div align="center">
  <img src="https://raw.githubusercontent.com/Shiva2806/FitHub/main/client/src/assets/FitHub.png" alt="FitHub Logo" width="100"/>
</div>

<p align="center">
  <strong>Transform your fitness journey with the power of AI.</strong> FitHub is a modern, full-stack web application designed to provide personalized workout guidance, real-time pose correction, and intelligent nutrition planning, all tailored to your unique body type and goals.
</p>

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-ai-models--technology">AI Models</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-screenshots">Screenshots</a>
</p>

---

## ✨ Key Features

- **Three Core AI Models**: Specialized modules for body type analysis, diet planning, and real-time workout training.
- **User Authentication**: Secure user registration and login system to manage your personal dashboard and track progress.
- **Interactive Dashboard**: A central hub to view your stats, access AI models, and get workout recommendations.
- **Fully Responsive Design**: A sleek, modern, and dark-themed UI that looks great on any device, from mobile phones to desktops.

---

## 🤖 AI Models & Technology

FitHub's intelligence is powered by a suite of specialized machine learning models running on a Python backend. Each model is designed to tackle a specific aspect of your fitness journey.

### 1. AI Body Type Analyzer
- **Purpose**: To classify a user's physique into one of the three main somatotypes: Ectomorph, Mesomorph, or Endomorph.
- **How it Works**: The model is a **Convolutional Neural Network (CNN)** trained on a large dataset of body images. It analyzes a user-submitted photo to identify key physical features and predicts the most likely body type, providing a confidence score for its classification.
- **Technology**: **Python**, **TensorFlow/Keras**, **OpenCV** for image preprocessing.

### 2. AI Diet Planner
- **Purpose**: To generate personalized meal plans based on user-provided data.
- **How it Works**: This model uses a combination of rule-based algorithms and machine learning to create a diet plan. It considers the user's body type, BMI, fitness goals (e.g., weight loss, muscle gain), and dietary preferences to recommend meals that meet specific caloric and macronutrient targets.
- **Technology**: **Python**, **Scikit-learn**, **Pandas** for data manipulation.

### 3. AI Workout Trainer
- **Purpose**: To provide real-time feedback on exercise form during a workout session.
- **How it Works**: This feature utilizes a **real-time pose estimation model**. It processes the user's webcam feed to map out 33 key body landmarks (joints, limbs, etc.). By analyzing the angles and positions of these landmarks, it can determine if an exercise is being performed correctly and provide instant corrective feedback.
- **Technology**: **Python**, **OpenCV**, **MediaPipe** for pose estimation.

---

## 🛠️ Tech Stack

This project is a full-stack application built with the MERN stack and other modern technologies.

| Category                | Technology                                                                                                  |
|-------------------------|-------------------------------------------------------------------------------------------------------------|
| **Frontend** | **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **Shadcn/UI** |
| **Backend** | **Node.js**, **Express.js** |
| **Database** | **MongoDB** with **Mongoose** |
| **AI / Machine Learning** | **Python**, **TensorFlow**, **OpenCV**, **MediaPipe** |
| **Auth** | **JSON Web Tokens (JWT)**, **bcrypt.js** for password hashing                                                 |
| **Styling** | **Tailwind CSS**, **Lucide React** for icons                                                                |

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally.
- [Python](https://www.python.org/downloads/) (v3.8 or later) with relevant ML libraries.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Shiva2806/FitHub.git](https://github.com/Shiva2806/FitHub.git)
    cd FitHub
    ```

2.  **Set up the Backend Server:**
    - Navigate to the `server` directory:
      ```bash
      cd server
      ```
    - Install the dependencies:
      ```bash
      npm install
      ```
    - Create a `.env` file in the `server` directory and add your MongoDB connection string:
      ```env
      MONGODB_URI=mongodb://localhost:27017/fithub
      JWT_SECRET=your_jwt_secret_key_here
      ```
    - Start the backend server:
      ```bash
      npm run dev
      ```
    Your backend should now be running on `http://localhost:5000`.

3.  **Set up the Frontend Client:**
    - Open a **new terminal** and navigate to the `client` directory:
      ```bash
      cd client
      ```
    - Install the dependencies:
      ```bash
      npm install
      ```
    - Start the frontend development server:
      ```bash
      npm run dev
      ```
    Your frontend should now be running on `http://localhost:3000` (or another port if 3000 is busy).

4.  **You're all set!** Open your browser and navigate to the frontend URL to start using FitHub.

---

## 📸 Screenshots

<p align="center">
  <img src="https://raw.githubusercontent.com/Shiva2806/FitHub/main/client/src/assets/HomePage.png" alt="Hero Section" width="600"/>
  <em>Homepage</em>
</p>
<p align="center">
  <img src="https://raw.githubusercontent.com/Shiva2806/FitHub/main/client/src/assets/AiModels.png" alt="AI Models" width="600"/>
  <em>AI Models Selection Page</em>
</p>
<p align="center">
  <img src="https://raw.githubusercontent.com/Shiva2806/FitHub/main/client/src/assets/Dashboard.png" alt="Dashboard" width="600"/>
  <em>User Dashboard</em>
</p>
