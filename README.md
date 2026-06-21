# NETVUE Final Movie App

Vue 3, Vue Router, Pinia, Axios를 사용해 만든 영화 정보 SPA 프로젝트입니다. TMDB API에서 국내 개봉 영화 데이터를 가져오고, 목록 조회, 상세 페이지, 검색, 정렬, 찜 목록, 페이지네이션, AI 추천사 기능을 제공합니다.

## 기술 스택

- Vue 3
- Vite
- Vue Router
- Pinia
- Axios
- TMDB API
- Groq AI API
- Session Storage

## 주요 기능

### 1. 영화 목록 조회

- `src/views/MoviesView.vue`에서 국내 극장 화제작 목록을 보여줍니다.
- `src/stores/movieStore.js`의 `fetchMovies()` action이 TMDB API에 요청을 보내 영화 데이터를 가져옵니다.
- 가져온 데이터는 Pinia 상태인 `movies`에 저장됩니다.
- 로딩 중에는 로딩 메시지, 실패 시에는 에러 메시지를 표시합니다.

### 2. 영화 상세 페이지

- 영화 카드를 클릭하면 `/movies/:id` 경로로 이동합니다.
- `src/router/index.js`에서 `/movies/:id` 라우트를 `MovieDetailView.vue`와 연결합니다.
- `MovieDetailView.vue`는 `useRoute()`와 `route.params.id`로 주소의 영화 번호를 읽습니다.
- 읽어낸 `movieId`를 `store.fetchMovieDetail(movieId)`에 넘기고, Pinia action 내부에서 Axios로 상세 API를 호출합니다.
- 서버 응답 데이터는 `selectedMovie`에 저장되고, 템플릿에서는 `store.selectedMovie`로 제목, 포스터, 평점, 장르, 줄거리, 제작비, 수익 등을 출력합니다.
- 상세 페이지에서도 찜하기와 찜 해제를 할 수 있습니다.

### 3. 정렬 기능

- 영화 목록과 검색 결과에서 다음 기준으로 정렬할 수 있습니다.
  - 인기순
  - 제목순
  - 개봉일순
  - 평점순
- 찜 목록에서는 위 기준에 추가로 `추가순` 정렬을 지원합니다.
- 같은 정렬 버튼을 한 번 더 누르면 오름차순과 내림차순이 전환됩니다.
- 현재 차순은 버튼 옆의 `↑`, `↓` 표시로 확인할 수 있습니다.
- 제목순은 기본 오름차순, 인기순/개봉일순/평점순/추가순은 기본 내림차순으로 동작합니다.
- 정렬 시 `store.movies` 원본 배열을 직접 바꾸지 않고, `[...store.movies]`로 복사한 배열을 정렬해 화면 표시용 결과만 만듭니다.

### 4. 검색 기능

- 영화 목록에서 검색어를 입력하면 검색 결과 페이지(`/search`)로 이동합니다.
- 검색 결과 페이지는 URL query의 `keyword` 값을 기준으로 결과를 필터링합니다.
- `src/searchText.js`의 `isMatchedTitle()`을 사용해 영화 제목과 검색어를 비교합니다.
- 검색어 앞뒤 공백은 `trim()`으로 제거합니다.
- 제목과 검색어의 중간 띄어쓰기도 `replace(/\s/g, '')`로 제거해 비교합니다.
  - 예: `범죄 도시`는 `범죄도시`로 검색해도 찾을 수 있습니다.
- 빈 검색어로 검색하면 안내 문구를 보여줍니다.
- 검색 결과에서도 정렬과 페이지네이션을 사용할 수 있습니다.
- 검색 결과 페이지에는 전체 영화 목록으로 돌아가는 버튼이 있습니다.

### 5. 찜 목록 기능

- 사용자가 선택한 영화만 모아 `/favorites` 페이지에서 보여줍니다.
- 찜 상태는 Pinia의 `favorites` 상태와 `sessionStorage`에 저장됩니다.
- 새로고침 후에도 세션이 유지되는 동안 찜 목록을 확인할 수 있습니다.
- 영화 목록, 검색 결과, 상세 페이지, 찜 목록에서 모두 찜 해제/추가 상태가 동기화됩니다.
- 찜 목록 안에서도 검색할 수 있습니다.
- 찜 목록 안에서도 인기순, 제목순, 개봉일순, 평점순, 추가순 정렬을 지원합니다.
- 찜 목록은 페이지네이션 없이 전체 찜한 영화를 한 화면에 보여줍니다.

### 6. 페이지네이션

- 영화 목록과 검색 결과는 한 페이지에 6개씩 표시합니다.
- 하단 번호 버튼으로 페이지를 이동할 수 있습니다.
- `이전`, `다음` 버튼을 추가해 페이지 이동을 더 쉽게 했습니다.
- 첫 페이지에서는 `이전`, 마지막 페이지에서는 `다음` 버튼이 비활성화됩니다.
- 정렬 기준이 바뀌면 `currentPage`를 1로 되돌려 첫 페이지부터 다시 보여줍니다.

### 7. AI 추천사 기능

- 상세 페이지에서 `AI 맞춤 추천사 듣기` 버튼을 누르면 Groq AI API를 호출합니다.
- 현재 영화의 제목, 장르, 평점을 기반으로 추천 문장을 생성합니다.
- 요청 중에는 버튼이 `생성 중...` 상태로 바뀝니다.
- API 호출 실패 시 안내 문구를 보여줍니다.

### 8. 예외 처리와 UX 보강

- API 키가 없거나 서버 통신이 실패하면 에러 메시지를 표시합니다.
- 상세 페이지에서 존재하지 않는 영화 id를 요청하면 별도 에러 메시지를 보여줍니다.
- 포스터가 없는 영화는 대체 박스를 보여줍니다.
- 줄거리, 제작비, 수익이 없는 경우 기본 안내 문구를 표시합니다.
- 상세 페이지 찜 버튼은 찜 전/후 색상이 다르게 보여 눌렀는지 쉽게 확인할 수 있습니다.
- 존재하지 않는 경로는 `NotFoundView.vue`에서 404 화면으로 처리합니다.

## 주요 데이터 흐름

### 목록에서 상세 페이지로 이동

1. `MoviesView.vue`에서 영화 카드가 `v-for="movie in paginatedMovies"`로 생성됩니다.
2. 카드 내부의 `RouterLink`가 `:to="\`/movies/${movie.id}\`"`로 상세 주소를 만듭니다.
3. `router/index.js`의 `/movies/:id` 라우트가 `MovieDetailView.vue`를 렌더링합니다.
4. `MovieDetailView.vue`에서 `useRoute()`로 route 객체를 가져옵니다.
5. `route.params.id` 값을 `movieId` 변수에 저장합니다.
6. `store.fetchMovieDetail(movieId)`를 호출합니다.
7. `movieStore.js`의 `fetchMovieDetail()` action이 Axios로 TMDB 상세 API를 요청합니다.
8. 응답 데이터 `response.data`를 `detailMovie`에 담고, `selectedMovie.value = detailMovie`로 저장합니다.
9. 템플릿에서는 `store.selectedMovie`를 읽어 상세 화면을 구성합니다.

### 찜 상태 동기화

1. 컴포넌트는 `store.toggleFavorite(movie.id)` 또는 `store.toggleFavorite(store.selectedMovie.id)`를 호출합니다.
2. `movieStore.js`의 `toggleFavorite()` action이 현재 영화가 이미 찜 목록에 있는지 확인합니다.
3. 찜 상태에 따라 `favorites` 배열에 추가하거나 `filter()`로 제거합니다.
4. 목록 영화(`listMovie`)와 상세 영화(`detailMovie`)의 `isFavorite` 값을 함께 맞춥니다.
5. 변경된 찜 목록을 `sessionStorage`에 저장합니다.

## 주요 파일 구조

```text
src
├── App.vue                         # 공통 헤더, 라우터 출력, 찜 개수/평균 평점 표시
├── main.js                         # Vue 앱 생성, Pinia와 Router 연결
├── router
│   └── index.js                    # /, /movies, /movies/:id, /search, /favorites, 404 라우트
├── searchText.js                   # 검색어 정규화, 제목 매칭 함수
├── stores
│   ├── movieStore.js               # 영화 목록, 상세 데이터, 찜 목록 Pinia store
│   └── favorites.js                # 이전 주차 실습용 파일, 현재 앱에서는 사용하지 않음
└── views
    ├── HomeView.vue                # 홈 화면
    ├── MoviesView.vue              # 영화 목록, 검색 진입, 정렬, 페이지네이션
    ├── MovieDetailView.vue         # 영화 상세 정보, 상세 찜하기, AI 추천사
    ├── SearchResultsView.vue       # 검색 결과, 정렬, 페이지네이션
    ├── FavoritesView.vue           # 찜 목록, 찜 검색, 찜 정렬
    └── NotFoundView.vue            # 404 페이지
```

## 환경 변수

프로젝트 실행을 위해 `.env` 파일에 아래 값이 필요합니다. 실제 키 값은 저장소나 문서에 노출하지 않습니다.

```env
VITE_MOVIE_API_KEY=TMDB_API_KEY
VITE_AI_API_KEY=GROQ_API_KEY
```

## 실행 방법

```sh
npm install
```

```sh
npm run dev
```

프로덕션 빌드:

```sh
npm run build
```

빌드 결과 미리보기:

```sh
npm run preview
```

## 구현하면서 신경 쓴 점

- Pinia 전역 상태는 컴포넌트에서 직접 바꾸지 않고 action을 통해 변경하도록 구성했습니다.
- 정렬은 원본 배열을 직접 바꾸지 않고 복사본을 정렬해 화면 표시용 데이터만 만들었습니다.
- 검색은 앞뒤 공백과 중간 띄어쓰기 차이로 결과가 누락되지 않도록 보완했습니다.
- 상세 페이지, 검색 결과, 찜 목록 등 각 화면에서 로딩, 빈 결과, 에러 상태를 구분해 보여주도록 구성했습니다.
- 파일과 변수의 역할이 드러나도록 이름을 정리해 이후 기능 수정과 유지보수가 쉽도록 했습니다.
