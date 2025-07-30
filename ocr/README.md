|[한국어 README](https://github.com/HwanLee-0321/gemini_OCR/blob/main/README(KOR).md)|

# gemini_OCR

To use OCR with the Gemini API.

## Installation

This project uses Anaconda for environment management.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd gemini_OCR
    ```

2.  **Create the Anaconda environment:**
    Make sure you have Anaconda or Miniconda installed. Create the environment using the `environment.yml` file. This will create an environment named `dev`.
    ```bash
    conda env create -f environment.yml
    ```

3.  **Activate the environment:**
    ```bash
    conda activate dev
    ```

## Usage

Run the FastAPI application using uvicorn:
```bash
uvicorn main:app --reload
```

The application will be available at `http://127.0.0.1:8000`.
