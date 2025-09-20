# MediGuard: KI-gestützte Lösung für das Medikamentenmanagement

**MediGuard** ist eine umfassende, mobil ausgerichtete Gesundheitslösung, die entwickelt wurde, um das Medikamentenmanagement für Senioren und ihre Pflegekräfte zu vereinfachen. Durch die Nutzung der Leistungsfähigkeit von KI automatisiert die Anwendung den mühsamen Prozess der Nachverfolgung von Rezepten, der Verwaltung von Zeitplänen und dem Senden rechtzeitiger Erinnerungen.

Das System besteht aus zwei Hauptkomponenten:

1.  Eine **plattformübergreifende mobile Anwendung**, die mit React Native erstellt wurde.
2.  Ein **leistungsstarker Backend-Server**, der mit Python und FastAPI erstellt wurde und über eine KI-gesteuerte OCR-Engine zur Rezeptanalyse verfügt.

-----

## ✨ Kernfunktionen

### 📱 Mobile Anwendung (React Native)

Die mobile App bietet eine benutzerfreundliche Oberfläche, die auf zwei verschiedene Rollen zugeschnitten ist und so jedem Benutzer ein optimales Erlebnis gewährleistet.

#### 👴 **Senioren-Modus**

Dieser Modus wurde mit Blick auf Einfachheit und Klarheit entwickelt und befähigt Senioren, ihre eigene Medikation selbstbewusst zu verwalten.

  * **Dashboard auf einen Blick**: Der Hauptbildschirm zeigt deutlich die aktuelle Uhrzeit und die nächste geplante Medikation an, sodass kein Rätselraten erforderlich ist.
  * **Push-Benachrichtigungen**: Für jede Dosis werden rechtzeitige, freundliche Erinnerungen gesendet, um sicherzustellen, dass keine Medikation verpasst wird.
  * **Vereinfachte Einstellungen**: Leicht zugängliche Steuerelemente zum Anpassen der Medikamentenzeiten oder zum Wechseln der Benutzerrollen.

#### 👩‍⚕️ **Pflegekraft-Modus**

Dieser Modus bietet eine robuste Reihe von Werkzeugen für Pflegekräfte, um die Medikamentenpläne ihrer Angehörigen zu überwachen und zu verwalten.

  * **Umfassendes Dashboard**: Erhalten Sie einen vollständigen Überblick über die Medikamenteneinhaltung des Patienten und den bevorstehenden Zeitplan.
  * **KI-Rezept-Scanner**: Digitalisieren Sie neue Rezepte in Sekundenschnelle. Machen Sie einfach ein Foto, und unsere KI extrahiert automatisch alle relevanten Informationen.
  * **Fernverwaltung des Zeitplans**: Legen Sie Medikamentenzeiten, Dosierungen und Benachrichtigungseinstellungen für den Patienten fest und passen Sie sie an.
  * **Kalenderansicht**: Visualisieren Sie den Medikamentenplan des gesamten Monats für eine bessere Planung und Nachverfolgung.

### 🤖 KI-OCR-Backend-Server (Python)

Das Backend ist der intelligente Kern von MediGuard. Es empfängt Rezeptbilder von der mobilen App und verwendet Googles Gemini AI, um eine fortschrittliche optische Zeichenerkennung (OCR) durchzuführen.

  * **Sichere Bildverarbeitung**: Behandelt sicher Bild-Uploads von der mobilen Anwendung.
  * **Intelligente Datenextraktion**: Geht über die einfache Texterkennung hinaus, um wichtige Informationen aus einem Rezept intelligent zu identifizieren und zu strukturieren, einschließlich:
      * `MED_NM`: Medikamentenname
      * `DOSAGE`: Dosierung pro Einnahme
      * `TIMES_PER_DAY`: Häufigkeit der Einnahme pro Tag
      * `DURATION_DAYS`: Gesamtdauer des Rezepts
  * **Strukturierte JSON-Ausgabe**: Liefert die extrahierten Daten in einem sauberen, strukturierten JSON-Format, sodass die mobile App automatisch genaue Medikamentenpläne erstellen kann.

-----

## 🛠️ Technologie-Stack

### **Frontend (Mobile App)**

  * **Framework**: React Native (mit Expo)
  * **Sprache**: TypeScript
  * **Navigation**: React Navigation
  * **Zustandsverwaltung**: (Anwendbare Zustandsverwaltungsbibliothek, z. B. Zustand, Redux)
  * **UI-Komponenten**: Benutzerdefinierte UI-Komponenten für ein konsistentes und zugängliches Design

### **Backend (OCR-Server)**

  * **Framework**: FastAPI
  * **Sprache**: Python
  * **KI / ML**: Google Gemini AI
  * **Bildverarbeitung**: Pillow

-----

## ⚙️ Systemarchitektur & Arbeitsablauf

Die Benutzerreise ist nahtlos und intuitiv gestaltet:

1.  **Rollenauswahl**: Ein Benutzer meldet sich an und wählt seine Rolle: "Senior" oder "Pflegekraft".
2.  **Rezept-Upload**: Der Benutzer nimmt ein Foto eines Rezepts mit der In-App-Kamera auf oder wählt ein Bild aus seiner Galerie aus (`imagePicker.tsx`).
3.  **KI-Analyseanforderung**: Das Bild wird sicher von der mobilen App zur Verarbeitung an den Backend-OCR-Server gesendet (`ocr-processing.tsx`).
4.  **Datenextraktion**: Der Python-Server verwendet das Gemini-KI-Modell, um das Bild zu analysieren, die Medikamentendetails zu extrahieren und zu strukturieren (`ocr_service.py`).
5.  **Zeitplanerstellung**: Der Server gibt die strukturierten JSON-Daten an die App zurück, die dann automatisch einen neuen Medikamentenplan ausfüllt (`medications.tsx`).
6.  **Intelligente Erinnerungen**: Die App plant und liefert lokale Push-Benachrichtigungen, um den Benutzer daran zu erinnern, wann es Zeit ist, sein Medikament einzunehmen (`ReminderHandler.tsx`).
7.  **Laufende Verwaltung**: Benutzer können die Einhaltung einsehen, Zeitpläne verwalten und bei Bedarf neue Rezepte hinzufügen.

-----

## 🚀 Erste Schritte

### Voraussetzungen

  * Node.js und npm/yarn
  * Python 3.8+ und pip
  * Expo Go App auf Ihrem Mobilgerät (für die Entwicklung)
  * Ein Google Gemini API-Schlüssel

### Backend-Einrichtung

```bash
# 1. Navigieren Sie zum OCR-Server-Verzeichnis
cd ocr-server/

# 2. Installieren Sie die Python-Abhängigkeiten
pip install -r requirements.txt

# 3. Erstellen Sie eine .env-Datei und fügen Sie Ihren Gemini-API-Schlüssel hinzu
# GEMINI_API_KEY="YOUR_GOOGLE_API_KEY"

# 4. Starten Sie den FastAPI-Server
uvicorn main:app --reload
```

### Mobile App-Einrichtung

```bash
# 1. Navigieren Sie zum React Native-Projektverzeichnis
cd mediguard-app/

# 2. Installieren Sie die Node.js-Abhängigkeiten
npm install

# 3. Starten Sie den Metro-Bundler
npx expo start
```

Scannen Sie den QR-Code mit der Expo Go App auf Ihrem Telefon, um die Anwendung auszuführen.
