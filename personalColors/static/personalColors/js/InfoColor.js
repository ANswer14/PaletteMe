document.addEventListener("DOMContentLoaded", function() {
    // --- 1. [색상 사전] 단어별 매칭될 HEX 코드 정의 ---
    const colorPalette = {
        // 봄 웜
        '코랄': '#FF7F50', '피치': '#FFDAB9', '맑은 오렌지': '#FF8C00', '라임': '#32CD32',
        '살구': '#FBCEB1', '소프트 코랄': '#F88379', '크림 옐로우': '#FFF5A6',
        // 가을 웜
        '브릭 레드': '#AA4A44', '선명한 브라운': '#8B4513', '딥 오렌지': '#DC4D01',
        '카멜': '#C19A6B', '모카': '#967969', '올리브': '#808000', '웜 와인': '#722F37',
        // 여름 쿨
        '쿨 핑크': '#FF69B4', '라즈베리': '#E30B5D', '민트': '#AAF0D1', '라일락': '#C8A2C8',
        '로즈베이지': '#E1B3B1', '그레이 핑크': '#D1A3A4', '소프트 블루': '#93B5C6',
        // 겨울 쿨
        '트루 레드': '#FF0000', '블랙': '#000000', '코발트': '#0047AB', '퓨어 화이트': '#C7C7C7',
        '버건디': '#800020', '차콜': '#36454F', '딥 플럼': '#673147', '스모키 네이비': '#2F3A4A',
        // 뉴트럴/기타
        '라이트 코랄핑크': '#F9C1BB', '클린 레드(노랑/블루기 적은 레드)': '#E34234', '애플그린': '#8DB600', '스카이블루': '#87CEEB',
        '라이트 베이지': '#C7C7C7', '더스티 로즈': '#BA7F8C', '연한 그레이': '#C7C7C7',
        '뉴트럴 레드': '#A33B39', '딥 그레이': '#4E4E4E', '쿨&웜 중간의 네이비': '#2E4053', '다크 에메랄드': '#043927',
        '토프': '#483C32', '그레이지': '#B0A999', '소프트 브라운': '#967969', '더스티 카키': '#828662', '로즈 브라운': '#805959', '뮤트 네이비': '#3C4451'
    };

    // --- 2. [디자인 로직] 퍼스널 컬러 및 상세 색상 강조 ---

    // (1) 퍼스널 컬러 결과 명칭 색상 (봄, 여름, 가을, 겨울 키워드별)
    const resultElement = document.querySelector('.result-name');
    if (resultElement) {
        const resultText = resultElement.innerText;

        if (resultText.includes('봄')) resultElement.style.color = '#F28D8D';      // 봄 대표색
        else if (resultText.includes('여름')) resultElement.style.color = '#7FB3D5'; // 여름 대표색
        else if (resultText.includes('가을')) resultElement.style.color = '#B36D3E'; // 가을 대표색
        else if (resultText.includes('겨울')) resultElement.style.color = '#8E44AD'; // 겨울 대표색
        else if (resultText.includes('뉴트럴')) resultElement.style.color = '#8E8474'; // 뉴트럴 대표색
    }

    // (2) 어울리는 색 상세 단어별 처리
    const colorTarget = document.querySelector('.color-target');
    if (colorTarget) {
        const fullText = colorTarget.innerText;
        const words = fullText.split(','); // 쉼표로 단어 분리

        colorTarget.innerHTML = ''; // 기존 내용 삭제

        words.forEach((word, index) => {
            const trimmedWord = word.trim();
            const span = document.createElement('span');
            span.innerText = trimmedWord;

            // 사전에 있으면 해당 색 적용, 없으면 기본색(검정/회색)
            if (colorPalette[trimmedWord]) {
                span.style.color = colorPalette[trimmedWord];
            } else {
                span.style.color = 'inherit';
            }
            span.style.fontWeight = 'bold';

            colorTarget.appendChild(span);

            // 쉼표 다시 붙여주기
            if (index < words.length - 1) {
                colorTarget.appendChild(document.createTextNode(', '));
            }
        });
    }

    // --- 3. [기능 로직] 버튼 클릭 이벤트 ---
    // 로그인한 유저 아이디 (예시: localStorage에서 가져오기)

    const proceedBtn = document.getElementById("proceedBtn");
    const retryBtn = document.getElementById("retryBtn");
    const checkBtn = document.getElementById('colorCheckBtn');

    // 유저 퍼스널컬러 정보가 있는지 확인

    // 진행 버튼 클릭
    if (proceedBtn) {
        proceedBtn.addEventListener("click", function() {
            // 다음 화면으로 이동 (예: 컬러 분석 페이지)
            window.location.href = "map/";
        });
    }

    // 다시하기 버튼 클릭
    if (retryBtn !== null) {
        retryBtn.addEventListener("click", function () {
            // 퍼스널컬러 재측정 페이지로 이동
            window.location.href = "check/";
        });
    }

    // 진단 버튼 클릭
    if (checkBtn !== null) {
        checkBtn.addEventListener('click', function () {
            window.location.href = 'check/';
        })
    }
});
