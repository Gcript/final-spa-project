<script setup>
import { onMounted } from 'vue';
import { useMovieStore } from '../stores/movieStore';

const store = useMovieStore();

// onMounted는 이 화면이 브라우저에 장착(Mount) 되는 순간을 감지하여 내부 코드를 즉시 실행합니다.
onMounted(() => {
    store.fetchMovies();
    // [12주차 추가] 상세 정보에 갔다 돌아왔을 때 브라우저 탭 이름을 원래대로 복구합니다.
    document.title = '🍿 국내 극장 화제작 (인기순)';
});
</script>

<template>
    <main class="page">
        <div class="header-section">
            <h1>🍿 국내 극장 화제작 (인기순)</h1>
            <p class="sub-title">2025년 이후 국내 정식 개봉한 실시간 인기 상영작</p>
        </div>
        <div v-if="store.isLoading" class="status-message loading">⏳ 실시간 국내 개봉작 데이터를 싣고 오는 중입니다...</div>
        <div v-else-if="store.errorMessage" class="status-message error">🚨 {{ store.errorMessage }}</div>
        <div v-else class="movie-list">
            <div v-for="movie in store.movies" :key="movie.id" class="movie-card">
                <img v-if="movie.poster_path" :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`" :alt="movie.title" class="poster" />
                <div v-else class="poster-placeholder">이미지 준비 중</div>
                <div class="card-content">
                    <h3 class="title">{{ movie.title }}</h3>
                    <p class="release-date" v-if="movie.release_date">📅 개봉일: {{ movie.release_date }}</p>
                    <p class="rating">⭐️ {{ movie.vote_average.toFixed(1) }} / 10</p>
                    <p class="overview">
                        {{ movie.overview ? movie.overview.substring(0, 60) + '...' : '국내에 등록된 중거리 요약 정보가 없습니다.' }}
                    </p>
                    <!-- 11주차 내용 동일 -->
                    <button @click="store.toggleFavorite(movie.id)" :class="{ active: movie.isFavorite }"
                        class="fav-btn">
                        {{ movie.isFavorite ? '❤️ 찜 해제' : '🤍 찜하기' }}
                    </button>
                </div>
                <!-- 12주차 RouterLink 추가 -->
                <RouterLink
                    :to="`/movies/${movie.id}`"
                    class="stretched-link"
                    :aria-label="`${movie.title} 상세 정보 보기`"
                ></RouterLink>
            </div>
        </div>
    </main>
</template>

<style scoped>
.page {
    padding: 40px;
    background-color: #f8f9fa;
    min-height: 100vh;
}
.header-section {
    text-align: center;
    margin-bottom: 30px;
    color: #2c3e50;
}
.sub-title { 
    color: #7f8c8d;
    font-size: 14px;
    margin-top: 5px;
}
.status-message {
    text-align: center;
    border-radius: 23px;
    font-size: 20px;
    font-weight: bold;
    padding: 50px;
}
.loading {
    color: #3498db;
    background-color: #e3f2fd;
}
.error {
    color: #e74c3c;
    background-color: #fdeaea;
}
.movie-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 30px;
}
/* 🌟 [12주차 수정] 카드 내부에 투명 확장 링크를 가두기 위해 position: relative; 만 쏙 추가 */
.movie-card {
    position: relative; /* + 투명 링크 영역 확장을 위한 기준점 추가 */
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease;
    text-align: left;
}
.movie-card:hover {
    transform: translateY(-5px);
}
.poster {
    width: 100%;
    height: 380px;
    object-fit: cover;
}
.poster-placeholder {
    width: 100%;
    height: 380px;
    background-color: #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7f8c8d;
    font-weight: bold;
}
.card-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}
.title {
    font-size: 18px;
    margin: 0 0 6px 0;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: bold;
}
.release-date {
    font-size: 13px;
    color: #7f8c8d;
    margin-bottom: 10px;
    font-size: 16px;
}
.overview {
    font-size: 13px;
    color: #555;
    flex-grow: 1;
    margin-bottom: 20px;
    line-height: 1.4;
}
/* 🌟 [12주차 수정] 투명 링크(1)보다 무조건 한 층 위로 올리기 위해 z-index: 2; 만 쏙 추가 */
.fav-btn {
    position: relative; /* + 레이어 층위 조절을 위한 포지션 추가 */
    z-index: 2; /* + 투명 링크 위로 올려 버튼 단독 클릭 활성화 */
    width: 100%;
    padding: 12px;
    cursor: pointer;
    border: none;
    border-radius: 8px;
    background: #ecf0f1;
    color: #333;
    font-weight: bold;
    font-size: 14px;
    transition: 0.3s;
    margin-top: auto;
}
.fav-btn.active {
    background: #ff4757;
    color: white;
}
/* + [12주차 추가] 카드 껍데기를 가상으로 100% 덮는 투명 링크 스타일 */
.stretched-link {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
}
</style>
