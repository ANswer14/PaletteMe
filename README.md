# 환경 설정
- 파이썬 버전: 3.10.11
1. 가상 환경 활성화
  - 터미널에서 cd .venv/Scripts
  - activate 혹은 ./activate
2. requirements.txt 내에 있는 모든 라이브러리 다운로드
  - 터미널에 pip install -r requirements.txt 입력
  - requirements.txt는 환경 설정을 위해 현재 라이브러리 버전들을 모두 모아놓은 파일
  - 만약 pip install 명령어를 통해 외부 라이브러리를 다운로드 받을 시 git commit 이전에 무조건 다음 명령어 작성!!!
    - pip freeze > requirements.txt
3. .env 파일 설정
  - .env 파일은 Github에 올라가면 안되는 정보들을 모아놓는 파일
  - 터미널에 copy .env.example .env 입력
    - .env 파일을 만드는 명령어
  - 자신의 로컬 설정에 맞게 .env 설정
 
# templates / static
- templates: HTML 파일들을 모아놓는 장소
  - 앱(ex: accounts) 내에 있는 templates는 해당 앱에 관한 HTML만 들어가있음
- static: 정적 파일들을 모아놓는 장소
  - 앱(ex: blogs) 내에 있는 static은 해당 앱에 관한 정적 파일들(ex: 이미지, JS, CSS 등)만 들어가있음

# Branch 네이밍 컨벤션 / Git Commit Message 컨벤션
- Branch
  - refactor: 리팩토링 용도
  - feat: 기능 구현 용도
  - EX) feat-login
- Git Commit Message
  - 
