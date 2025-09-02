-----

## gemini\_OCR

Gemini API와 함께 OCR을 사용하는 방법

### 설치

이 프로젝트는 Anaconda를 사용하여 환경을 관리합니다.

1.  **저장소 복제:**

    ```bash
    git clone <repository-url>
    cd gemini_OCR
    ```

2.  **Anaconda 환경 생성:**
    Anaconda 또는 Miniconda가 설치되어 있는지 확인하세요. `environment.yml` 파일을 사용하여 환경을 생성합니다. 이렇게 하면 `dev`라는 이름의 환경이 생성됩니다.

    ```bash
    conda env create -f environment.yml
    ```

3.  **환경 활성화:**

    ```bash
    conda activate dev
    ```

### 사용법

uvicorn을 사용하여 FastAPI 애플리케이션을 실행합니다.

```bash
uvicorn main:app --reload
```

애플리케이션은 `http://127.0.0.1:8000`에서 사용할 수 있습니다.
