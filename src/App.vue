<script setup>
import { computed } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
// 전역 비동기 세션 데이터가 들어있는 스토어를 임포트합니다.
import { useMovieStore } from './stores/movieStore';

const store = useMovieStore();

// [반응형 연산 1] 세션 스토리지 기반 실시간 찜 개수를 계산합니다.
const totalFavoritesCount = computed(() => {
    return store.favorites.length;
});

// [반응형 연산 2] TMDB vote_average 스펙에 맞춘 평균 평점 실시간 집계 로직입니다.
const avrageFavoriteRating = computed(() => {
    if (store.favorites.length === 0) return 0.0;

    // .reduce() 메서드를 사용하여 찜한 영화들의 평점 총합을 누적 계산합니다.
    const totalRatingSum = store.favorites.reduce((accumulator, movie) => {
        return accumulator + movie.vote_average;
    }, 0);
    // 총합을 찜한 영화 수로 나누어 평균 평점을 계산하고 소수점 첫째 자리까지 포맷팅합니다.
    const calculatedAverage = totalRatingSum / store.favorites.length;
    return calculatedAverage.toFixed(1);
});
</script>

<template>
  <div class="app-container">
    <header class="main-header">
      <div class="header-content">
        <RouterLink to="/" class="logo-zone">
          <span class="logo-icon">🍿</span>
          <h1 class="logo-text">NETVUE</h1>
        </RouterLink>
        <nav class="nav-menu">
          <RouterLink to="/" class="nav-item">홈</RouterLink>
          <RouterLink to="/movies" class="nav-item">영화 목록</RouterLink>
        </nav>
        <div class="header-dashboard">
          <div class="dashboard-badge favorite-count">
            <span class="badge-label">❤️ 찜한 작품</span>
            <span class="badge-value">{{ totalFavoritesCount }}개</span>
          </div>
          <div class="dashboard-badge average-rating">
            <span class="badge-label">⭐️ 찜한 작품 평균 평점</span>
            <span class="badge-value">{{ avrageFavoriteRating }} / 10</span>
          </div>
        </div>
      </div>
    </header>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  font-family: "Noto Sans KR", sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.main-header {
  background-color: #1e272e;
  color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 0 40px;
}
.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo-zone {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #ffffff;
}
.logo-icon {
  font-size: 28px;
}
.logo-text {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.5px;
  background: linear-gradient(45deg, #ff4757, #ff6b81);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.nav-menu {
  display: flex;
  gap: 30px;
}
.nav-item {
  color: #ced5e0;
  text-decoration: none;
  font-size: 16px;
  font-weight: 700;
  transition: color 0.2s ease;
  padding: 8px 12px;
  border-radius: 6px;
}
.nav-item:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.05);
}
.router-link-active.nav-item {
  color: #ff4757;
  background-color: rgba(255, 87, 87, 0.1);
}
.header-dashboard {
  display: flex;
  gap: 15px;
}
.dashboard-badge {
  background-color: #2f3542;
  padding: 10px 16px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #3f4656;
}
.badge-label {
  font-size: 13px;
  color: #a4b0be;
  font-weight: 500;
}
.badge-value {
  font-size: 14px;
  color: #ffffff;
  font-weight: 800;
}
.average-rating .badge-value {
  color: #e1b12c;
}
.main-content {
  flex-grow: 1;
  width: 100%;
  box-sizing: border-box;
}
</style>