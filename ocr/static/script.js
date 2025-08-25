document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 가져오기
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

    let imageFile = null; // 업로드할 이미지 파일(Blob)을 저장할 변수
    let stream = null; // 카메라 스트림 객체를 저장할 변수

    // UI 상태를 관리하는 함수
    const ui = {
        showCamera: () => {
            videoContainer.style.display = 'flex';
            previewContainer.style.display = 'none';
            ui.resetResult();
        },
        hideCamera: () => {
            videoContainer.style.display = 'none';
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
        },
        showPreview: (src) => {
            preview.src = src;
            previewContainer.style.display = 'block';
            submitBtn.disabled = false;
            ui.hideCamera();
            ui.resetResult();
        },
        resetPreview: () => {
            preview.src = '';
            previewContainer.style.display = 'none';
            submitBtn.disabled = true;
            imageFile = null;
        },
        showLoader: () => loader.style.display = 'block',
        hideLoader: () => loader.style.display = 'none',
        resetResult: () => resultContainer.innerHTML = '',
    };

    // 갤러리 버튼 클릭 이벤트
    galleryBtn.addEventListener('click', () => {
        ui.hideCamera();
        fileInput.click();
    });

    // 카메라 버튼 클릭 이벤트
    cameraBtn.addEventListener('click', async () => {
        ui.resetPreview();
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } // 후면 카메라 우선
            });
            video.srcObject = stream;
            ui.showCamera();
        } catch (err) {
            console.error("카메라 접근 오류:", err);
            alert('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
        }
    });

    // 파일 입력 변경 이벤트 (갤러리에서 파일 선택 시)
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            imageFile = file;
            const reader = new FileReader();
            reader.onload = (e) => ui.showPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    });

    // 촬영 버튼 클릭 이벤트
    captureBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        ui.showPreview(canvas.toDataURL('image/jpeg'));
        
        canvas.toBlob(blob => {
            imageFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
        }, 'image/jpeg');
    });

    // 텍스트 추출 버튼 클릭 이벤트 (폼 제출)
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
            const response = await fetch('/upload-image/', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`서버 오류: ${response.status} ${response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                fullText += decoder.decode(value, { stream: true });
                resultContainer.innerHTML = marked.parse(fullText);
            }
        } catch (error) {
            resultContainer.innerHTML = `<p style="color: red;">오류: ${error.message}</p>`;
        } finally {
            ui.hideLoader();
            submitBtn.disabled = false;
        }
    });

    // marked.js 옵션 설정 (줄 바꿈을 <br>로 변환)
    marked.setOptions({
        breaks: true
    });

    // 초기 상태 설정
    ui.resetPreview();
});
