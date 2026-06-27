# PetSociety 🐾

**PetSociety** is a smart, full-stack web application designed to provide a comprehensive digital ecosystem for pet owners. By combining modern software engineering with advanced Artificial Intelligence, the platform seamlessly integrates pet adoption, personalized care subscription services, community communication, and automated pet recovery into a single, connected system.

---

## 🎯 Project Vision

The core mission of **PetSociety** is to unify all pet-related needs within a centralized platform. We aim to build a cohesive technological environment that bridges the gap between software solutions, community engagement, and animal care—making it effortless for pet owners to manage every aspect of their pets' lives in one place while eliminating the fragmentation of traditional services.

---

## ✨ Key Features

* **Pet Adoption Center:** A dedicated hub for browsing and adopting pets posted by individuals or shelters, facilitating animal rescue and streamlining the adoption workflow.
* **Pet Service Hub+:** A dynamic monthly subscription plan that curates and delivers selected pet supplies and essentials tailored strictly to user preferences and pet profiles.
* **Live Chat Community:** A real-time (Socket-based) communication system enabling pet owners to connect, share advice, seek immediate assistance, and interact with local communities.
* **AI Lost & Found:** A sophisticated recovery subsystem powered by Computer Vision. It automatically extracts distinctive physical visual traits from lost and found pet photos to identify high-probability matches and speed up reunification.

---

## 🛠️ Tech Stack

### **Core Platform Infrastructure**
* **Frontend:** Angular – Employed to build a highly dynamic, scalable, and responsive Single Page Application (SPA).
* **Backend:** ASP.NET Core (C#) – Powers the secure, robust, enterprise-grade RESTful APIs handling business logic.
* **Database:** SQL Server – Manages relational relational data structures, logs, subscriptions, and platform telemetry.
* **Authentication:** ASP.NET Core Identity – Secures user identities, token generation, and role-based access control (RBAC).

### **Artificial Intelligence Microservice**
* **Python Flask:** A microservice container hosting the AI models, ensuring complete separation of concerns and high-throughput processing.
* **FastReID:** A state-of-the-art Computer Vision framework utilized for appearance-based feature extraction and Re-Identification (ReID) to execute precise image comparison.

---

## 📐 System Architecture

The ecosystem leverages a decoupled, Service-Oriented Architecture:
1. The **Angular Frontend** handles user interactions and sends API requests to the **ASP.NET Core Backend** for core operations (Adoption tracking, Live Chat, Subscriptions).
2. When a Lost/Found report is filed, the .NET backend securely routes the uploaded media payload to the **Python Flask Microservice**.
3. The Flask service executes the **FastReID** pipeline, generating dense Feature Vectors from the pet's image and computing cosine similarities against existing target feature vectors in the system.
4. The calculated **Possible Matches** are passed back to the .NET pipeline and instantly rendered on the user's interface.

---

## 🚀 Installation & Local Setup

### Prerequisites
* .NET SDK 8.0+
* Node.js & Angular CLI
* Python 3.8+
* SQL Server Management Studio (SSMS)


***This project was developed as a Graduation Project to fulfill the requirements for a Bachelor's Degree in Computer Information Systems (CIS) at Hashemite University.

### Set Up the AI Microservice (Flask) / runnig the Angular 
```bash
# Navigate to the AI microservice directory
cd ai-microservice

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the local Flask server
python app.py


# Navigate to the frontend directory
cd petsociety-frontend
cd petsociety

# Install node dependencies
npm install

# Run the local development server
ng serve
