# MediGuard : Solution de gestion des médicaments basée sur l'IA

**MediGuard** est une solution de santé complète et mobile conçue pour simplifier la gestion des médicaments pour les personnes âgées et leurs aidants. En exploitant la puissance de l'IA, l'application automatise le processus fastidieux de suivi des ordonnances, de gestion des horaires et d'envoi de rappels opportuns.

Le système se compose de deux composants principaux :

1.  Une **application mobile multiplateforme** développée avec React Native.
2.  Un **serveur backend puissant** développé avec Python et FastAPI, doté d'un moteur OCR piloté par l'IA pour l'analyse des ordonnances.

-----

## ✨ Fonctionnalités principales

### 📱 Application mobile (React Native)

L'application mobile offre une interface conviviale adaptée à deux rôles distincts, garantissant une expérience optimale pour chaque utilisateur.

#### 👴 **Mode Senior**

Conçu dans un souci de simplicité et de clarté, ce mode permet aux personnes âgées de gérer leurs propres médicaments en toute confiance.

  * **Tableau de bord en un coup d'œil** : L'écran principal affiche clairement l'heure actuelle et le prochain médicament programmé, éliminant toute incertitude.
  * **Notifications Push** : Des rappels amicaux et opportuns sont envoyés pour chaque dose, garantissant que les médicaments ne sont jamais oubliés.
  * **Paramètres simplifiés** : Des commandes facilement accessibles pour ajuster les heures de prise des médicaments ou changer de rôle utilisateur.

#### 👩‍⚕️ **Mode Aidant**

Ce mode offre un ensemble d'outils robustes pour les aidants afin de surveiller et de gérer les horaires de médication de leurs proches.

  * **Tableau de bord complet** : Obtenez un aperçu complet de l'observance du traitement par le patient et de son calendrier à venir.
  * **Scanner d'ordonnances IA** : Numérisez de nouvelles ordonnances en quelques secondes. Prenez simplement une photo, et notre IA extraira automatiquement toutes les informations pertinentes.
  * **Gestion des horaires à distance** : Définissez et ajustez les heures de prise, les dosages et les préférences de notification pour le patient.
  * **Vue Calendrier** : Visualisez le calendrier de médication du mois entier pour une meilleure planification et un meilleur suivi.

### 🤖 Serveur backend OCR IA (Python)

Le backend est le cœur intelligent de MediGuard. Il reçoit les images d'ordonnances de l'application mobile et utilise l'IA Gemini de Google pour effectuer une reconnaissance optique de caractères (OCR) avancée.

  * **Traitement sécurisé des images** : Gère en toute sécurité les téléchargements d'images depuis l'application mobile.
  * **Extraction intelligente des données** : Va au-delà de la simple reconnaissance de texte pour identifier et structurer intelligemment les informations cruciales d'une ordonnance, notamment :
      * `MED_NM` : Nom du médicament
      * `DOSAGE` : Dosage par prise
      * `TIMES_PER_DAY` : Fréquence des prises par jour
      * `DURATION_DAYS` : Durée totale de la prescription
  * **Sortie JSON structurée** : Fournit les données extraites dans un format JSON propre et structuré, permettant à l'application mobile de générer automatiquement des calendriers de médication précis.

-----

## 🛠️ Stack technologique

### **Frontend (Application mobile)**

  * **Framework** : React Native (avec Expo)
  * **Langage** : TypeScript
  * **Navigation** : React Navigation
  * **Gestion de l'état** : (Bibliothèque de gestion d'état applicable, par ex., Zustand, Redux)
  * **Composants UI** : Composants UI personnalisés pour un design cohérent et accessible

### **Backend (Serveur OCR)**

  * **Framework** : FastAPI
  * **Langage** : Python
  * **IA / ML** : Google Gemini AI
  * **Traitement d'image** : Pillow

-----

## ⚙️ Architecture système et flux de travail

Le parcours utilisateur est conçu pour être fluide et intuitif :

1.  **Sélection du rôle** : Un utilisateur s'inscrit et choisit son rôle : "Senior" ou "Aidant".
2.  **Téléchargement de l'ordonnance** : L'utilisateur prend une photo d'une ordonnance à l'aide de l'appareil photo de l'application ou sélectionne une image de sa galerie (`imagePicker.tsx`).
3.  **Demande d'analyse IA** : L'image est envoyée en toute sécurité de l'application mobile au serveur OCR backend pour traitement (`ocr-processing.tsx`).
4.  **Extraction des données** : Le serveur Python utilise le modèle Gemini AI pour analyser l'image, extraire les détails du médicament et les structurer (`ocr_service.py`).
5.  **Création du calendrier** : Le serveur renvoie les données JSON structurées à l'application, qui remplit alors automatiquement un nouveau calendrier de médication (`medications.tsx`).
6.  **Rappels intelligents** : L'application planifie et envoie des notifications push locales pour rappeler à l'utilisateur quand il est temps de prendre son médicament (`ReminderHandler.tsx`).
7.  **Gestion continue** : Les utilisateurs peuvent consulter l'observance, gérer les calendriers et ajouter de nouvelles ordonnances si nécessaire.

-----

## 🚀 Démarrage

### Prérequis

  * Node.js et npm/yarn
  * Python 3.8+ et pip
  * Application Expo Go sur votre appareil mobile (pour le développement)
  * Une clé API Google Gemini

### Configuration du backend

```bash
# 1. Accédez au répertoire du serveur OCR
cd ocr-server/

# 2. Installez les dépendances Python
pip install -r requirements.txt

# 3. Créez un fichier .env et ajoutez votre clé API Gemini
# GEMINI_API_KEY="YOUR_GOOGLE_API_KEY"

# 4. Lancez le serveur FastAPI
uvicorn main:app --reload
```

### Configuration de l'application mobile

```bash
# 1. Accédez au répertoire du projet React Native
cd mediguard-app/

# 2. Installez les dépendances Node.js
npm install

# 3. Démarrez le bundler Metro
npx expo start
```

Scannez le code QR avec l'application Expo Go sur votre téléphone pour exécuter l'application.
