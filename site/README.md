# Animal Clicker – Static Front-end + Supabase

이 디렉터리(`site/`)는 **서버 없이** Cloudflare Pages + Supabase로 운영할 수 있는 정적 사이트입니다.

---

## 1. Supabase 프로젝트 만들기

1. [supabase.com](https://supabase.com) → **New project** 생성  
2. 프로젝트 이름/비밀번호/리전 설정 후 생성 완료 대기 (1~2분)

---

## 2. DB 스키마 적용

1. Supabase 대시보드 → 왼쪽 메뉴 **SQL Editor** 클릭  
2. **New query** 클릭  
3. 레포지토리의 `supabase/schema.sql` 전체 내용을 붙여넣기  
4. **Run** 클릭  

✅ `players` 테이블과 아래 RPC 함수 3개가 생성됩니다:
- `login_or_create_player(p_nickname, p_pin)`
- `increment_score(p_nickname, p_pin, p_delta)`
- `get_rankings(p_limit, p_offset)`

---

## 3. config.js 만들기

1. `site/config.example.js`를 `site/config.js`로 복사  
2. Supabase 대시보드 → **Settings → API** 에서 아래 두 값을 복사해 채워 넣기:

```js
window.SUPABASE_URL     = "https://xxxxxxxxxx.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhb...";
```

> `config.js`는 `.gitignore`에 포함되어 있어 저장소에 커밋되지 않습니다.

---

## 4. Cloudflare Pages 배포

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Pages** → **Create a project**  
2. GitHub 계정 연결 → `naeuun/clicker` 레포 선택  
3. 빌드 설정:
   - **Framework preset**: `None`  
   - **Build command**: *(비움)*  
   - **Build output directory**: `site`  
4. **Save and Deploy** 클릭  
5. 배포가 완료되면 `*.pages.dev` URL로 접속 확인

> `site/config.js`는 gitignore 처리되어 있으므로,  
> Cloudflare Pages → **Settings → Environment variables** 대신  
> **빌드 이전에 config.js를 직접 추가**하거나,  
> Pages 빌드 훅(Build Hook)으로 파일을 생성하는 방식을 쓰세요.  
>
> 가장 간단한 방법: config.js를 로컬에서만 유지하고,  
> Cloudflare Pages 대신 **직접 파일 업로드(Drag & Drop)** 방식으로 배포.  
> → Cloudflare Pages 대시보드 → 프로젝트 → **Deployments** → **Upload assets**

---

## 5. 커스텀 도메인 연결

1. Cloudflare Pages → 프로젝트 → **Custom domains** → **Set up a custom domain**  
2. `naongnyaong.site` 입력 → DNS 레코드 자동 추가 확인  
3. HTTPS 인증서는 Cloudflare가 자동 발급 (몇 분 소요)

---

## 6. EC2 종료 (서버비 0)

정적 사이트가 정상 동작하는 것을 확인한 뒤:

1. AWS 콘솔 → **EC2** → 인스턴스 선택 → **Instance state → Stop** (또는 Terminate)  
2. **Elastic IP** 가 붙어 있다면 **Release** (연결 안 된 EIP는 매 시간 요금 발생)  
3. 기타 로드 밸런서, RDS 등 연결된 리소스도 확인 후 정리

---

## 파일 구조

```
site/
├── index.html          # 시작 화면 (닉네임 + PIN 로그인, 랭킹 미리보기)
├── clicker.html        # 게임 화면 (클릭 + 1초 배치 sync)
├── ranking.html        # 전체 랭킹 (페이지네이션)
├── config.example.js   # 설정 템플릿 (이것을 config.js로 복사해서 사용)
├── config.js           # ← 직접 만들어야 함 (gitignore 처리됨)
└── assets/
    ├── style.css
    ├── clicker.js       # 게임 로직 + Supabase 배치 sync
    ├── supabaseClient.js
    ├── images/
    │   ├── lion_default.png / lion_click.png
    │   ├── bear_default.png / bear_click.png
    │   └── cat_default.png  / cat_click.png
    └── sounds/
        ├── clicker1.mp3
        ├── clicker2.mp3
        └── clicker3.mp3
```
