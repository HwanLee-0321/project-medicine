/**
 * JavaScript (ECMAScript 6)
 * 이 스크립트는 Gemini OCR 웹 페이지의 모든 클라이언트 사이드 로직을 처리합니다.
 * 기능: 이미지 선택(갤러리/카메라), 이미지 미리보기, 서버에 이미지 업로드, 스트리밍 결과 처리 및 표시
 */
document.addEventListener('DOMContentLoaded', () => {
    // === 1. DOM 요소 초기화 ===
    // HTML에서 필요한 모든 요소를 찾아 변수에 할당합니다.
    const galleryBtn = document.getElementById('gallery-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const fileInput = document.getElementById('file-input');
    const submitBtn = document.getElementById('submit-btn');
    const resultContainer = document.getElementById('result-container');
    const loader = document.getElementById('loader');
    const preview = document.getElementById('preview');
    const previewContainer = document.getElementById('preview-container');
    
    const videoContainer = document.getElementById('video-container');
    const video = document.getElementById('video');
    const captureBtn = document.getElementById('capture-btn');

    // === 2. 상태 변수 선언 ===
    let imageFile = null; // 서버로 전송할 이미지 파일(File 또는 Blob 객체)을 저장합니다.
    let stream = null;    // 카메라 비디오 스트림 객체를 저장합니다.

    // === 3. UI 제어 모듈 ===
    // 복잡한 UI 상태 변경 로직을 객체에 묶어 체계적으로 관리합니다.
    const ui = {
        // 카메라 뷰를 보여주는 함수
        showCamera: () => {
            videoContainer.style.display = 'flex';
            previewContainer.style.display = 'none';
            ui.resetResult();
        },
        // 카메라 뷰를 숨기고 스트림을 중지하는 함수
        hideCamera: () => {
            videoContainer.style.display = 'none';
            if (stream) {
                // 모든 비디오 트랙을 중지하여 카메라 사용을 비활성화합니다.
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
        },
        // 이미지 미리보기를 보여주는 함수
        showPreview: (src) => {
            preview.src = src;
            previewContainer.style.display = 'block';
            submitBtn.disabled = false; // 이미지가 있으니 전송 버튼 활성화
            ui.hideCamera(); // 미리보기가 보이면 카메라는 숨깁니다.
            ui.resetResult();
        },
        // 모든 미리보기 관련 상태를 초기화하는 함수
        resetPreview: () => {
            preview.src = '';
            previewContainer.style.display = 'none';
            submitBtn.disabled = true; // 이미지가 없으니 전송 버튼 비활성화
            imageFile = null;
            fileInput.value = null; // input의 파일 선택 기록을 초기화합니다.
        },
        // 로딩 인디케이터를 표시/숨김
        showLoader: () => loader.style.display = 'block',
        hideLoader: () => loader.style.display = 'none',
        // 결과 컨테이너를 비움
        resetResult: () => resultContainer.innerHTML = '',
    };

    // === 4. 이벤트 리스너 등록 ===

    // '갤러리에서 선택' 버튼 클릭 시, 숨겨진 file input을 클릭합니다.
    galleryBtn.addEventListener('click', () => {
        ui.hideCamera();
        fileInput.click();
    });

    // '카메라로 촬영' 버튼 클릭 시,
    cameraBtn.addEventListener('click', async () => {
        ui.resetPreview(); // 이전 미리보기 초기화
        try {
            // Web API를 사용하여 사용자 미디어(카메라)에 접근합니다.
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } // 후면 카메라를 우선 사용
            });
            video.srcObject = stream; // <video> 요소에 스트림을 연결
            ui.showCamera();
        } catch (err) {
            console.error("카메라 접근 오류:", err);
            alert('카메라에 접근할 수 없습니다. 브라우저의 권한 설정을 확인해주세요.');
        }
    });

    // 파일이 선택되었을 때 (갤러리)
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            imageFile = file; // 상태 변수에 파일 저장
            const reader = new FileReader();
            // 파일 로드가 완료되면, Base64 인코딩된 데이터 URL을 미리보기에 표시
            reader.onload = (e) => ui.showPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    });

    // '촬영하기' 버튼 클릭 시 (카메라)
    captureBtn.addEventListener('click', () => {
        // <canvas>를 사용하여 현재 비디오 프레임을 이미지로 캡처합니다.
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // 캡처된 이미지를 미리보기에 표시합니다.
        const dataUrl = canvas.toDataURL('image/jpeg');
        ui.showPreview(dataUrl);
        
        // 캔버스 이미지를 Blob 객체로 변환하고, 이를 File 객체로 만들어 상태 변수에 저장합니다.
        canvas.toBlob(blob => {
            imageFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
        }, 'image/jpeg');
    });

    // '텍스트 추출' 버튼 클릭 시 (메인 로직)
    submitBtn.addEventListener('click', async () => {
        if (!imageFile) {
            alert('이미지를 먼저 선택하거나 촬영해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('file', imageFile);

        ui.resetResult();
        ui.showLoader();
        submitBtn.disabled = true;

        try {
            // 서버에 POST 요청으로 이미지 파일을 전송합니다.
            const response = await fetch('/upload-image/', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`서버 오류: ${response.status} ${response.statusText}`);
            }

            // --- [충돌 해결 핵심] 효율적인 스트림 처리 (main 브랜치 방식 채택) ---
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            // 1. 스트림이 완료될 때까지 모든 텍스트 조각을 'fullText' 변수에 누적합니다.
            while (true) {
                const { done, value } = await reader.read();
                if (done) break; // 스트림이 끝나면 반복 종료
                fullText += decoder.decode(value, { stream: true });
            }
            
            // 2. 모든 데이터 수신이 완료된 후, 전체 텍스트를 한 번만 파싱하여 HTML로 렌더링합니다.
            // 이 방식은 데이터 조각마다 파싱하는 것보다 훨씬 효율적입니다.
            resultContainer.innerHTML = marked.parse(fullText);

        } catch (error) {
            resultContainer.innerHTML = `<p style="color: red;">오류가 발생했습니다: ${error.message}</p>`;
        } finally {
            // 작업이 성공하든 실패하든 항상 실행됩니다.
            ui.hideLoader();
            submitBtn.disabled = false; // 다시 버튼 활성화
        }
    });

    // === 5. 라이브러리 설정 ===
    // marked.js 라이브러리 설정을 통해, 마크다운의 줄바꿈(\n)이 HTML의 <br> 태그로 변환되도록 합니다.
    marked.setOptions({
        breaks: true
    });

    // === 6. 초기 상태 설정 ===
    // 페이지 로드 시, 모든 미리보기 관련 UI를 초기 상태로 설정합니다.
    ui.resetPreview();
});
