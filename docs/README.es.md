# MediGuard: Solución de gestión de medicamentos impulsada por IA

**MediGuard** es una solución de atención médica integral y móvil diseñada para simplificar la gestión de medicamentos tanto para personas mayores como para sus cuidadores. Aprovechando el poder de la IA, la aplicación automatiza el tedioso proceso de seguimiento de recetas, gestión de horarios y envío de recordatorios oportunos.

El sistema consta de dos componentes principales:

1.  Una **aplicación móvil multiplataforma** creada con React Native.
2.  Un **potente servidor backend** creado con Python y FastAPI, que cuenta con un motor de OCR impulsado por IA para el análisis de recetas.

-----

## ✨ Características principales

### 📱 Aplicación móvil (React Native)

La aplicación móvil proporciona una interfaz fácil de usar adaptada a dos roles distintos, garantizando una experiencia óptima para cada usuario.

#### 👴 **Modo Senior**

Diseñado con la simplicidad y la claridad en mente, este modo permite a las personas mayores gestionar su propia medicación con confianza.

  * **Panel de un vistazo**: La pantalla principal muestra claramente la hora actual y el próximo medicamento programado, eliminando cualquier conjetura.
  * **Notificaciones Push**: Se envían recordatorios amigables y oportunos para cada dosis, asegurando que nunca se olvide la medicación.
  * **Configuración simplificada**: Controles de fácil acceso para ajustar los horarios de medicación o cambiar los roles de usuario.

#### 👩‍⚕️ **Modo Cuidador**

Este modo ofrece un sólido conjunto de herramientas para que los cuidadores supervisen y gestionen los horarios de medicación de sus seres queridos.

  * **Panel completo**: Obtenga una visión general completa de la adherencia a la medicación del paciente y el próximo horario.
  * **Escáner de recetas con IA**: Digitalice nuevas recetas en segundos. Simplemente tome una foto y nuestra IA extraerá toda la información relevante automáticamente.
  * **Gestión remota de horarios**: Establezca y ajuste los horarios de medicación, las dosis y las preferencias de notificación para el paciente.
  * **Vista de calendario**: Visualice el horario de medicación de todo el mes para una mejor planificación y seguimiento.

### 🤖 Servidor backend de OCR con IA (Python)

El backend es el núcleo inteligente de MediGuard. Recibe imágenes de recetas desde la aplicación móvil y utiliza la IA Gemini de Google para realizar un reconocimiento óptico de caracteres (OCR) avanzado.

  * **Procesamiento seguro de imágenes**: Maneja de forma segura las cargas de imágenes desde la aplicación móvil.
  * **Extracción inteligente de datos**: Va más allá del simple reconocimiento de texto para identificar y estructurar de forma inteligente información crucial de una receta, que incluye:
      * `MED_NM`: Nombre del medicamento
      * `DOSAGE`: Dosis por toma
      * `TIMES_PER_DAY`: Frecuencia de tomas por día
      * `DURATION_DAYS`: Duración total de la receta
  * **Salida JSON estructurada**: Entrega los datos extraídos en un formato JSON limpio y estructurado, lo que permite que la aplicación móvil genere automáticamente horarios de medicación precisos.

-----

## 🛠️ Stack tecnológico

### **Frontend (Aplicación móvil)**

  * **Framework**: React Native (con Expo)
  * **Lenguaje**: TypeScript
  * **Navegación**: React Navigation
  * **Gestión de estado**: (Biblioteca de gestión de estado aplicable, por ejemplo, Zustand, Redux)
  * **Componentes de UI**: Componentes de UI personalizados para un diseño coherente y accesible

### **Backend (Servidor OCR)**

  * **Framework**: FastAPI
  * **Lenguaje**: Python
  * **IA / ML**: Google Gemini AI
  * **Procesamiento de imágenes**: Pillow

-----

## ⚙️ Arquitectura del sistema y flujo de trabajo

El viaje del usuario está diseñado para ser fluido e intuitivo:

1.  **Selección de rol**: Un usuario se registra y elige su rol: "Senior" o "Cuidador".
2.  **Carga de receta**: El usuario captura una foto de una receta usando la cámara de la aplicación o selecciona una imagen de su galería (`imagePicker.tsx`).
3.  **Solicitud de análisis de IA**: La imagen se envía de forma segura desde la aplicación móvil al servidor de OCR del backend para su procesamiento (`ocr-processing.tsx`).
4.  **Extracción de datos**: El servidor de Python utiliza el modelo Gemini AI para analizar la imagen, extraer los detalles del medicamento y estructurarlos (`ocr_service.py`).
5.  **Creación de horario**: El servidor devuelve los datos JSON estructurados a la aplicación, que luego completa automáticamente un nuevo horario de medicación (`medications.tsx`).
6.  **Recordatorios inteligentes**: La aplicación programa y entrega notificaciones push locales para recordar al usuario cuándo es el momento de tomar su medicamento (`ReminderHandler.tsx`).
7.  **Gestión continua**: Los usuarios pueden ver la adherencia, gestionar horarios y agregar nuevas recetas según sea necesario.

-----

## 🚀 Cómo empezar

### Prerrequisitos

  * Node.js y npm/yarn
  * Python 3.8+ y pip
  * Aplicación Expo Go en su dispositivo móvil (para desarrollo)
  * Una clave de API de Google Gemini

### Configuración del backend

```bash
# 1. Navegue al directorio del servidor OCR
cd ocr-server/

# 2. Instale las dependencias de Python
pip install -r requirements.txt

# 3. Cree un archivo .env y agregue su clave de API de Gemini
# GEMINI_API_KEY="YOUR_GOOGLE_API_KEY"

# 4. Ejecute el servidor FastAPI
uvicorn main:app --reload
```

### Configuración de la aplicación móvil

```bash
# 1. Navegue al directorio del proyecto React Native
cd mediguard-app/

# 2. Instale las dependencias de Node.js
npm install

# 3. Inicie el empaquetador Metro
npx expo start
```

Escanee el código QR con la aplicación Expo Go en su teléfono para ejecutar la aplicación.
