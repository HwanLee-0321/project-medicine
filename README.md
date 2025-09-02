# MediGuard: AI-Powered Medication Management Solution

**MediGuard** is a comprehensive, mobile-first healthcare solution designed to simplify medication management for both seniors and their caregivers. Leveraging the power of AI, the application automates the tedious process of tracking prescriptions, managing schedules, and sending timely reminders.

The system consists of two main components:

1.  **A cross-platform mobile application** built with React Native.
2.  **A powerful backend server** built with Python and FastAPI, featuring an AI-driven OCR engine for prescription analysis.

-----

## ✨ Core Features

### 📱 Mobile Application (React Native)

The mobile app provides a user-friendly interface tailored to two distinct roles, ensuring an optimal experience for every user.

#### 👴 **Senior Mode**

Designed with simplicity and clarity in mind, this mode empowers seniors to manage their own medication with confidence.

  * **At-a-Glance Dashboard**: The main screen clearly displays the current time and the next scheduled medication, removing any guesswork.
  * **Push Notifications**: Timely, friendly reminders are sent for each dose, ensuring medication is never missed.
  * **Simplified Settings**: Easily accessible controls for adjusting medication times or switching user roles.

#### 👩‍⚕️ **Caregiver Mode**

This mode offers a robust set of tools for caregivers to monitor and manage the medication schedules of their loved ones.

  * **Comprehensive Dashboard**: Get a complete overview of the patient's medication adherence and upcoming schedule.
  * **AI Prescription Scanner**: Digitize new prescriptions in seconds. Simply take a photo, and our AI will extract all relevant information automatically.
  * **Remote Schedule Management**: Set and adjust medication times, dosages, and notification preferences for the patient.
  * **Calendar View**: Visualize the entire month's medication schedule for better planning and tracking.

### 🤖 AI OCR Backend Server (Python)

The backend is the intelligent core of MediGuard. It receives prescription images from the mobile app and uses Google's Gemini AI to perform advanced Optical Character Recognition (OCR).

  * **Secure Image Processing**: Safely handles image uploads from the mobile application.
  * **Intelligent Data Extraction**: Goes beyond simple text recognition to intelligently identify and structure crucial information from a prescription, including:
      * `MED_NM`: Medication Name
      * `DOSAGE`: Dosage per intake
      * `TIMES_PER_DAY`: Frequency of intake per day
      * `DURATION_DAYS`: Total duration of the prescription
  * **Structured JSON Output**: Delivers the extracted data in a clean, structured JSON format, allowing the mobile app to automatically generate accurate medication schedules.

-----

## 🛠️ Tech Stack

### **Frontend (Mobile App)**

  * **Framework**: React Native (with Expo)
  * **Language**: TypeScript
  * **Navigation**: React Navigation
  * **State Management**: (Applicable state management library, e.g., Zustand, Redux)
  * **UI Components**: Custom UI components for a consistent and accessible design

### **Backend (OCR Server)**

  * **Framework**: FastAPI
  * **Language**: Python
  * **AI / ML**: Google Gemini AI
  * **Image Processing**: Pillow

-----

## ⚙️ System Architecture & Workflow

The user journey is designed to be seamless and intuitive:

1.  **Role Selection**: A user signs up and chooses their role: "Senior" or "Caregiver".
2.  **Prescription Upload**: The user captures a photo of a prescription using the in-app camera or selects an image from their gallery (`imagePicker.tsx`).
3.  **AI Analysis Request**: The image is securely sent from the mobile app to the backend OCR server for processing (`ocr-processing.tsx`).
4.  **Data Extraction**: The Python server utilizes the Gemini AI model to analyze the image, extract the medication details, and structure it (`ocr_service.py`).
5.  **Schedule Creation**: The server returns the structured JSON data to the app, which then automatically populates a new medication schedule (`medications.tsx`).
6.  **Smart Reminders**: The app schedules and delivers local push notifications to remind the user when it's time to take their medicine (`ReminderHandler.tsx`).
7.  **Ongoing Management**: Users can view adherence, manage schedules, and add new prescriptions as needed.

-----

## 🚀 Getting Started

### Prerequisites

  * Node.js and npm/yarn
  * Python 3.8+ and pip
  * Expo Go app on your mobile device (for development)
  * A Google Gemini API Key

### Backend Setup

```bash
# 1. Navigate to the OCR server directory
cd ocr-server/

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Create a .env file and add your Gemini API Key
# GEMINI_API_KEY="YOUR_GOOGLE_API_KEY"

# 4. Run the FastAPI server
uvicorn main:app --reload
```

### Mobile App Setup

```bash
# 1. Navigate to the React Native project directory
cd mediguard-app/

# 2. Install Node.js dependencies
npm install

# 3. Start the Metro bundler
npx expo start
```

Scan the QR code with the Expo Go app on your phone to run the application.