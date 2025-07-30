document.getElementById('upload-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('file-input');
    const resultContainer = document.getElementById('result-container');
    const loader = document.getElementById('loader');
    
    if (fileInput.files.length === 0) {
        alert('이미지 파일을 선택해주세요.');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    resultContainer.innerHTML = '';
    loader.style.display = 'block';

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

        // 1. 스트리밍 데이터가 완료될 때까지 모든 텍스트를 fullText 변수에 저장만 합니다.
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            fullText += decoder.decode(value, { stream: true });
        }
        
        // 2. 모든 데이터를 받은 후, 완전한 fullText를 한 번만 파싱하여 결과를 렌더링합니다.
        resultContainer.innerHTML = marked.parse(fullText);

    } catch (error) {
        resultContainer.innerHTML = `<p style="color: red;">오류: ${error.message}</p>`;
    } finally {
        loader.style.display = 'none';
    }
});