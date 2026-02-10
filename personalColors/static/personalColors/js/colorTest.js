document.addEventListener("DOMContentLoaded", function() {
    const nextBtn = document.getElementById("nextBtn");
    const progressFill = document.querySelector(".progress-fill");
    const progressText = document.getElementById("progress-text");
    let currentPage = Number(document.getElementById('page').value);
    const totalPages = 7; // 총 페이지 수
    const percent = (currentPage / totalPages) * 100;
    let warm = Number(document.getElementById('warm')?.value || 0); // id가 worm인 태그의 value를 갖고오거나 없다면 0
    let cool = Number(document.getElementById('cool')?.value || 0);
    let light = Number(document.getElementById('light')?.value || 0);
    let dark = Number(document.getElementById('dark')?.value || 0);
    let mute = Number(document.getElementById('mute')?.value || 0);
    let vivid = Number(document.getElementById('vivid')?.value || 0);
    let idk = Number(document.getElementById('idk')?.value || 0);
    console.log(currentPage)
    function makeForm(URL, data) {
        const form = document.createElement('form');
                form.method = 'POST';
                form.action = URL; // 장고에서 데이터를 처리할 URL

                // 2) CSRF 토큰 추가 (Django 필수 보안)
                // HTML에 {% csrf_token %}이 어딘가에 있어야 가져올 수 있습니다.
                const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
                if (csrfToken) {
                    const csrfInput = document.createElement('input');
                    csrfInput.type = 'hidden';
                    csrfInput.name = 'csrfmiddlewaretoken';
                    csrfInput.value = csrfToken;
                    form.appendChild(csrfInput);
                }

                for (const key in data) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = data[key];
                    console.log(data[key])
                    form.appendChild(input);
                }

            // 4) 폼을 body에 붙여서 실행 (안 보이지만 전송됨)
                document.body.appendChild(form);
                form.submit();
    }
    console.log('warm: ', warm)
    console.log('idk: ', idk)


    // 진행바 갱신 (간단 뼈대)
    progressFill.style.width = percent + "%";
    progressText.textContent = `Progress: ${currentPage}/${totalPages}`;

    nextBtn.addEventListener("click", function() {
        const radioButtons = document.querySelectorAll('input[type="radio"]');

        // 2. 모든 name 속성값을 중복 없이 가져오기 (Set 활용)
        const groupNames = new Set();
        radioButtons.forEach(radio => groupNames.add(radio.name));

        let allChecked = true;

        for (const name of groupNames) {
            let group = document.querySelectorAll(`input[name="${name}"]:checked`);
            if (group.length === 0) {
                allChecked = false;
            }
        }

        // 3. 각 그룹별로 하나라도 체크되었는지 확인
        for (const name of groupNames) {
            let group = document.querySelectorAll(`input[name="${name}"]:checked`);
            for (let entity of group) {
                if (entity.value === 'W') {
                    warm++;
                }
                if (entity.value === 'C') {
                    cool++;
                }
                if (entity.value === 'light') {
                    light++;
                }
                if (entity.value === 'dark') {
                    dark++;
                }
                if (entity.value === 'M') {
                    mute++;
                }
                if (entity.value === 'V') {
                    vivid++;
                }
                if (entity.value === 'IDK') {
                    console.log('IDK 당첨!')
                    idk++;
                    console.log('idk 당첨 후 값', idk)
                }
            }
        }

        // 4. 검증 실패 시 다음 페이지 이동 막기
        if (!allChecked) {
            // event.preventDefault(); // 기본 동작(폼 제출 등) 중단

            warm = Number(document.getElementById('warm')?.value || 0); // id가 worm인 태그의 value를 갖고오거나 없다면 0
            cool = Number(document.getElementById('cool')?.value || 0);
            light = Number(document.getElementById('light')?.value || 0);
            dark = Number(document.getElementById('dark')?.value || 0);
            mute = Number(document.getElementById('mute')?.value || 0);
            vivid = Number(document.getElementById('vivid')?.value || 0);
            idk = Number(document.getElementById('idk')?.value || 0);
            alert("모든 항목에 답변해 주세요!");
        } else {
            if(currentPage < totalPages) {
                const data = {
                    page: currentPage + 1,
                    warm: warm,
                    cool: cool,
                    light: light,
                    dark: dark,
                    mute: mute,
                    vivid: vivid,
                    idk: idk
                };
                console.log(currentPage)
                makeForm('/personalColors/check/', data);
            } else {
                const data = {
                    warm: warm,
                    cool: cool,
                    light: light,
                    dark: dark,
                    mute: mute,
                    vivid: vivid,
                    idk: idk
                };
                // alert("마지막 페이지입니다!");
                makeForm('/personalColors/result/', data)
            }
        }
    });
});
