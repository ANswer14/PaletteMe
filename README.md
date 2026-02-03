# 환경 설정
- 파이썬 버전: 3.10.11
- 가상 환경 활성화
  - cd .venv/Scripts
  - activate 혹은 ./activate
- pip install -r requirements.txt
  - 라이브러리 다운로드를 의미
- copy .env.example .env
  - 이후, 해당 .env 파일 내의 설정을 로컬에 맞추어 변경
 
# templates / static
- templates: HTML 파일들을 모아놓는 장소
  - 앱(ex: accounts) 내에 있는 templates는 해당 앱에 관한 HTML만 들어가있음
- static: 정적 파일들을 모아놓는 장소
  - 앱(ex: blogs) 내에 있는 static은 해당 앱에 관한 정적 파일들(ex: 이미지, JS, CSS 등)만 들어가있음

