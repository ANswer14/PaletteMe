var mapContainer = document.getElementById('map'),
    mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 초기 중심좌표
        level: 3
    };
var map = new kakao.maps.Map(mapContainer, mapOption);
var geocoder = new kakao.maps.services.Geocoder();
// 1. 마커를 미리 생성해둡니다 (처음에는 표시하지 않거나 특정 위치에 생성)
var marker = new kakao.maps.Marker({
    position: map.getCenter()
});
var lat = 37.566826
var lng = 126.9786567
var infowindow = new kakao.maps.InfoWindow({
    zIndex: 1
});

// 좌표 to 주소 변환기
function searchDetailAddrFromCoords(coords, callback) {
    geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// 주소 검색 함수 (기존 기능 유지)
function searchAddress() {
    var addr = document.getElementById('address').value;
    if (!addr) return;

    geocoder.addressSearch(addr, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

            // 검색된 위치로 마커 이동 및 지도 중심 이동
            marker.setPosition(coords);
            map.setCenter(coords);
        }
    });
}

function handleRowClick(element) {
    // 1. tr에 숨겨둔 데이터 가져오기
    const temp = element.getAttribute('data-temp'); // 기온
    const sky = element.getAttribute('data-sky'); // 하늘 상태
    const windSpeed = element.getAttribute('data-wsd'); // 풍속
    const humidity = element.getAttribute('data-reh'); // 습도
    const POP = element.getAttribute('data-pop'); // 강수확률
    const PCP = element.getAttribute('data-pcp'); // 1시간 강수량
    const snow = element.getAttribute('data-sno'); // 1시간 신적설
    const PTY = element.getAttribute('data-pty'); // 강수 형태
    const TMN = element.getAttribute('data-tmn');
    const TMX = element.getAttribute('data-tmx');

    console.log(TMN)


    // 주소 출력
    searchDetailAddrFromCoords(marker.getPosition(), function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            // 지번 주소
            var jibunAddress = result[0].address.address_name.split(' ');
            console.log('클릭한 위치의 지번 주소 : ' + jibunAddress);

            document.getElementById('locationName').innerText = jibunAddress[0] +  ' ' + jibunAddress[1];

        }
    });

    document.getElementById('temp').innerText = temp + '°C';
    document.getElementById('lowestTemp').innerText = TMN + '°C';
    document.getElementById('highestTemp').innerText = TMX + '°C';
    document.getElementById('feelsLike').innerText = (13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * Math.pow(windSpeed, 0.16) * temp).toFixed(1) + '°C';
    document.getElementById('humidity').innerText = humidity
    document.getElementById('weather').innerText = getPTYText(PTY)
    document.getElementById('sky').innerText = getSKYText(sky)

}

 function getPTYText(code) {
     const ptyMap = {
         '0': '없음',
         '1': '비',
         '2': '비/눈',
         '3': '눈',
         '4': '소나기',
         '5': '빗방울',
         '6': '빗방울눈날림',
         '7': '눈날림',
     };
     return ptyMap[code] || '알 수 없음';
 }

function getSKYText(code) {
    const skyMap = { '1': '☀️ 맑음', '3': '☁️ 구름많음', '4': '☁️ 흐림' };
    return skyMap[code] || '데이터 없음';
}

async function fetchWeather(lat, lng) {
    const requestData = {
        latitude: lat,
        longitude: lng
    };

    // console.log('test 용도00')/*test 용도*/
    try {
        // 2. Fetch API를 이용한 비동기 요청
        // console.log('test 용도01')/*test 용도*/
        const response = await fetch('weather/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'), // CSRF 토큰 함수 필요
            },
            body: JSON.stringify(requestData)
        });
        // 3. 서버로부터 받은 JSON 응답 처리
        const result = await response.json();
        if (result.status === 'success') {
        // 인포윈도우 스타일 및 레이아웃 설정
        let listHtml = `
            <style>
                /* 마우스 오버 시 배경색 변경 및 커서 포인터 설정 */
                .forecast-row {
                    transition: background-color 0.2s ease;
                    cursor: pointer;
                }
                .forecast-row:hover {
                    background-color: #f1f8ff !important; /* 연한 파란색 배경 */
                    color: #3498db; /* 글자색 변경 */
                }
                /* 스크롤바 디자인 (선택 사항) */
                .scroll-container::-webkit-scrollbar { width: 6px; }
                .scroll-container::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
            </style>
            <div style="padding:10px; width:220px; font-family: 'Malgun Gothic', sans-serif; ">
                <h4 style="margin:0 0 10px 0; padding-bottom:5px; border-bottom:2px solid #3498db; color:#2c3e50;">
                    5일간 시간별 예보
                </h4>
                
                <div style="max-height:220px; overflow-y:auto; overflow-x:hidden; scrollbar-width: thin;">
                    <table style="width:100%; font-size:12px; border-collapse:collapse;">
                        <thead style="background:#f8f9fa; position:sticky; top:0; z-index:10;">
                            <tr style="border-bottom:1px solid #ddd;">
                                <th style="padding:5px;">시간</th>
                                <th style="padding:5px;">기온</th>
                                <th style="padding:5px;">상태</th>
                            </tr>
                        </thead>
                        <tbody>`;

            result.forecast_list.forEach(item => {
                const dateStr = item.date.substring(4, 6) + "/" + item.date.substring(6, 8);
                const timeStr = item.time.substring(0, 2) + ":00";
                const temp = item.TMP; // 단기예보는 TMP, 초단기예보는 T1H입니다. 상황에 맞게 수정하세요.
//                console.log(result.TMNTMX_dict[item.date])
//                console.log(item.date, item.time, result.condition)
//                console.log(Number(item.date + item.time))
                if (Number(item.date + item.time) >= Number(result.condition)) {
                listHtml += `
                    <tr class="forecast-row" onclick="handleRowClick(this)" data-temp="${temp}" data-reh="${item.REH}" data-pop="${item.POP}" data-pcp="${item.PCP}" data-sno="${item.SNO}"
                     data-wsd="${item.WSD}" data-pty="${item.PTY}" data-date="${item.date}" data-sky="${item.SKY}" data-tmn="${result.TMNTMX_dict[item.date]['TMN']}"
                      data-tmx="${result.TMNTMX_dict[item.date]['TMX']}" style="cursor:pointer; border-bottom:1px solid #f1f1f1; text-align:center;">
                        <td style="padding:8px 5px;">
                            <span style="font-size:10px; color:#7f8c8d;">${dateStr}</span><br>
                            <b>${timeStr}</b>
                        </td>
                        <td style="color:#e74c3c; font-weight:bold;">${temp}°C</td>
                        <td style="font-size:11px;">${getSKYText(item.SKY)}</td>
                    </tr>`;
                }
            });

            listHtml += `
                            </tbody>
                        </table>
                    </div>
                    <div style="margin-top:5px; text-align:right; font-size:10px; color:#bdc3c7;">
                        * 스크롤하여 더보기
                    </div>
                </div>`;

            infowindow.setContent(listHtml);
            infowindow.open(map, marker);
        }
    } catch (error) {
        console.error("AJAX 통신 실패:", error);
    }
}

marker.setMap(map); // 지도 위에 마커 표시

// ---------------------------------------------------------
// [기능 1] 지도를 클릭했을 때 마커를 해당 위치로 이동
// ---------------------------------------------------------
kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
    infowindow.close();
    // 클릭한 위도, 경도 정보를 가져옵니다
    latlng = mouseEvent.latLng;
    lat = latlng.getLat();
    lng = latlng.getLng();

    // 마커 위치를 클릭한 곳으로 이동시킵니다
    marker.setPosition(latlng);
    // console.log("클릭한 위치의 위도: " + lat + ", 경도: " + lng);
});
// ---------------------------------------------------------

// [기능 2] 마커를 클릭했을 때 원하는 이벤트(함수) 실행
// ---------------------------------------------------------
kakao.maps.event.addListener(marker, 'click', function(mouseEvent) {
    // 여기에 원하는 이벤트를 작성하세요. (예: 알림창, 상세정보 표시 등)
    // alert("마커를 클릭하셨습니다! 이곳에 커스텀 이벤트를 추가할 수 있습니다.");
    fetchWeather(lat, lng);
});

document.addEventListener("DOMContentLoaded", () => {

    const nextBtn = document.getElementById("nextBtn");



    /* ⏭ NEXT 버튼 */
    nextBtn.addEventListener("click", () => {
        // 다음 화면으로 이동
        // (퍼스널컬러 + 날씨 종합 결과 페이지)
        window.location.href = "../FinalResult/styleResult.html";
    });

});


