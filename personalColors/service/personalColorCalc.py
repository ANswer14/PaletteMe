def calcColor(request):
    worm = int(request.POST.get('worm', 1))
    cool = int(request.POST.get('cool', 1))
    light = int(request.POST.get('light', 1))
    dark = int(request.POST.get('dark', 1))
    mute = int(request.POST.get('mute', 1))
    vivid = int(request.POST.get('vivid', 1))
    idk = int(request.POST.get('idk', 1))
    if worm + cool + light + dark + mute + vivid < idk:
        result = '응답 수가 부족하여 정확한 진단이 어렵습니다.'
        mood = ''
        goodColor = ''
        badColor = ''
    elif worm > cool:
        if light >= dark:
            if vivid >= mute:
                result = '봄 웜 브라이트'
                mood = '생기 폭발, 상큼'
                goodColor = '코랄, 피치, 맑은 오렌지, 라임'
                badColor = '회기 도는 컬러, 다크 컬러 X'
            else:
                result = '봄 웜 소프트'
                mood = '부드럽고 따뜻한이미지'
                goodColor = '살구, 소프트 코랄, 크림 옐로우'
                badColor = '쨍한 원색, 대비 강한 색 X'
        else:
            if vivid >= mute:
                result = '가을 웜 스트롱'
                mood = '강렬하고 카리스마'
                goodColor = '브릭 레드, 선명한 브라운, 딥 오렌지'
                badColor = '파스텔, 연한 색 X'
            else:
                result = '가을 웜 딥'
                mood = '분위기/고급/성숙'
                goodColor = '카멜, 모카, 올리브, 웜 와인'
                badColor = '쨍한 색, 차가운 핑크 X'
    elif worm == cool:
        result = '뉴트럴 톤'
        if light >= dark:
            if vivid >= mute:
                mood = '맑고 자연스러운 이미지'
                    # 밝지만 노랑/핑크 과하지 않음
                    # 깨끗하고 투명한 인상
                goodColor = '라이트 코랄핑크, 클린 레드(노랑/블루기 적은 레드), 애플그린, 스카이블루'
                badColor = '탁한 뮤트 컬러, 지나치게 웜한 오렌지, 딥한 다크 컬러 X'
            else:
                mood = '부드럽고 따뜻한 이미지'
                    # 웜/쿨 중간, 회기 살짝
                    # 전체적으로 연하고 소프트한 인상
                goodColor = '살구, 소프트 코랄, 크림 옐로우, 라이트 베이지, 더스티 로즈, 연한 그레이'
                badColor = '쨍한 원색, 대비 강한 블랙&화이트, 네온, 형광 컬러 X'
        else:
            if vivid >= mute:
                mood = '도회적이고 세련된 이미지'
                    # 대비는 있지만 색감이 한쪽으로 치우치지 않음
                    # 시크하고 현대적인 느낌
                goodColor = '뉴트럴 레드, 차콜, 딥 그레이, 쿨&웜 중간의 네이비, 다크 에메랄드'
                badColor = '파스텔 톤, 웜 오렌지, 쿨 마젠타, 회기 심한 뮤트 컬러 X'
            else:
                mood = '차분하고 고급스러운 이미지'
                    # 웜/쿨 경계에 있는 묵직함
                    # 성숙하고 분위기 있는 인상
                goodColor = '토프, 그레이지, 소프트 브라운, 더스티 카키, 로즈 브라운, 뮤트 네이비'
                badColor = '쨍한 비비드 컬러, 노랑기 강한 브라운, 순수 블랙 퓨어 화이트 X'

    else:
        if light >= dark:
            if vivid >= mute:
                result = '여름 쿨 브라이트'
                mood = '시원하고 청량'
                goodColor = '쿨 핑크, 라즈베리, 민트, 라일락'
                badColor = '노랑기 강한 색 X'
            else:
                result = '여름 쿨 소프트'
                mood = '차분/우아/부드러움'
                goodColor = '로즈베이지, 그레이 핑크 소프트 블루'
                badColor = '원색, 어두운 컬러 X'
        else:
            if vivid >= mute:
                result = '겨울 쿨 브라이트'
                mood = '대비 강함, 도시적'
                goodColor = '트루 레드, 블랙, 코발트, 퓨어 화이트'
                badColor = '탁한 색, 웜 브라운 X'
            else:
                result = '겨울 쿨 딥'
                mood = '시크/무게감/고급'
                goodColor = '버건디, 차콜, 딥 플럼, 스모키 네이비'
                badColor = '파스텔, 노랑기 컬러 X'
    return result, mood, goodColor, badColor