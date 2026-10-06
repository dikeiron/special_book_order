# 배포 저장소 관련 필수 숙지 사항 (CRITICAL)

**[경고] AI 에이전트는 이 프로젝트와 관련된 모든 코드 수정 시 이 문서를 먼저 확인해야 합니다.**

이 프로젝트는 현재 다운로드 폴더(작업용 폴더)에 열려 있더라도, **실제 서비스 배포(podcafe.co.kr)**는 GitHub Desktop을 통해 아래 경로의 폴더에서 이루어집니다.

- **실제 배포용 GitHub 저장소 경로:** `/Users/mac/Documents/GitHub/special_book_order`
- **배포 도메인:** `podcafe.co.kr`

### AI 행동 지침:
1. 다운로드 폴더(`/Users/mac/Downloads/표지생성기_개발과정/책자표지내지견적및 주문생성기`)의 코드를 수정한 경우, 수정이 완료되면 **반드시** 동일한 파일을 `/Users/mac/Documents/GitHub/special_book_order` 경로에도 덮어쓰기(동기화) 해야 합니다.
2. 사용자가 "배포가 안 된다" 또는 "깃허브 데스크탑에 안 뜬다"라고 할 경우 100% 동기화를 누락한 것이므로 즉시 복사 명령어(`cp`)를 사용해 GitHub 저장소에 변경 사항을 반영하세요.
