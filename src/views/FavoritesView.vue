<script setup>
import { computed, onMounted, ref } from 'vue';
import { isMatchedTitle } from '../searchText';
import { useMovieStore } from '../stores/movieStore';

const store = useMovieStore();
const defaultSortDirections = {
    popularity: 'desc',
    title: 'asc',
    releaseDate: 'desc',
    rating: 'desc',
    added: 'desc'
};
const sortType = ref('popularity');
const sortDirection = ref(defaultSortDirections.popularity);
const searchKeyword = ref('');

const filteredFavorites = computed(() => {
    const keyword = searchKeyword.value.trim();
    if (!keyword) return store.favorites;

    return store.favorites.filter((movie) => {
        return isMatchedTitle(movie.title, keyword);
    });
});

const sortedFavorites = computed(() => {
    const copiedMovies = [...filteredFavorites.value];
    const direction = sortDirection.value === 'asc' ? 1 : -1;

    if (sortType.value === 'popularity') {
        return copiedMovies.sort((a, b) => (a.popularity - b.popularity) * direction);
    }

    if (sortType.value === 'title') {
        return copiedMovies.sort((a, b) => a.title.localeCompare(b.title, 'ko-KR') * direction);
    }

    if (sortType.value === 'releaseDate') {
        return copiedMovies.sort((a, b) => (new Date(a.release_date) - new Date(b.release_date)) * direction);
    }

    if (sortType.value === 'rating') {
        return copiedMovies.sort((a, b) => (a.vote_average - b.vote_average) * direction);
    }

    if (sortType.value === 'added' && sortDirection.value === 'asc') {
        return copiedMovies.reverse();
    }

    return copiedMovies;
});

const changeSort = (newSortType) => {
    if (sortType.value === newSortType) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortType.value = newSortType;
        sortDirection.value = defaultSortDirections[newSortType];
    }
};

const getSortMark = (targetSortType) => {
    if (sortType.value !== targetSortType) return '';
    return sortDirection.value === 'asc' ? ' ↑' : ' ↓';
};

const trimSearchKeyword = () => {
    searchKeyword.value = searchKeyword.value.trim();
};

onMounted(() => {
    document.title = '찜 목록 | NETVUE';
});
</script>

<template>
    <main class="page">
        <div class="header-section">
            <h1>❤️ 찜한 작품</h1>
            <p class="sub-title">사용자가 선택한 영화만 모아 보여주는 독립 페이지입니다.</p>
        </div>

        <div v-if="store.favorites.length === 0" class="empty-state">
            <p class="empty-title">아직 찜한 영화가 없습니다.</p>
            <p class="empty-sub">영화 목록에서 마음에 드는 작품을 찜해보세요.</p>
            <RouterLink to="/movies" class="go-movies-btn">영화 목록으로 이동</RouterLink>
        </div>

        <section v-else>
            <div class="search-section">
                <input
                    :value="searchKeyword"
                    @input="searchKeyword = $event.target.value"
                    @blur="trimSearchKeyword"
                    type="text"
                    class="search-input"
                    placeholder="찜한 영화 제목을 검색하세요"
                >
            </div>

            <div class="sort-section">
                <span class="sort-label">정렬</span>
                <button
                    @click="changeSort('popularity')"
                    :class="{ active: sortType === 'popularity' }"
                    class="sort-btn"
                >
                    인기순{{ getSortMark('popularity') }}
                </button>
                <button
                    @click="changeSort('title')"
                    :class="{ active: sortType === 'title' }"
                    class="sort-btn"
                >
                    제목순{{ getSortMark('title') }}
                </button>
                <button
                    @click="changeSort('releaseDate')"
                    :class="{ active: sortType === 'releaseDate' }"
                    class="sort-btn"
                >
                    개봉일순{{ getSortMark('releaseDate') }}
                </button>
                <button
                    @click="changeSort('rating')"
                    :class="{ active: sortType === 'rating' }"
                    class="sort-btn"
                >
                    평점순{{ getSortMark('rating') }}
                </button>
                <button
                    @click="changeSort('added')"
                    :class="{ active: sortType === 'added' }"
                    class="sort-btn"
                >
                    추가순{{ getSortMark('added') }}
                </button>
            </div>

            <div v-if="sortedFavorites.length === 0" class="empty-state">
                <p class="empty-title">검색 결과가 없습니다.</p>
                <p class="empty-sub">다른 제목으로 다시 검색해보세요.</p>
            </div>

            <div v-else class="movie-list">
                <div v-for="movie in sortedFavorites" :key="movie.id" class="movie-card">
                    <img v-if="movie.poster_path" :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`" :alt="movie.title" class="poster" />
                    <div v-else class="poster-placeholder">이미지 준비 중</div>
                    <div class="card-content">
                        <h3 class="title">{{ movie.title }}</h3>
                        <p class="release-date" v-if="movie.release_date">📅 개봉일: {{ movie.release_date }}</p>
                        <p class="rating">⭐️ {{ movie.vote_average.toFixed(1) }} / 10</p>
                        <p class="overview">
                            {{ movie.overview ? movie.overview.substring(0, 60) + '...' : '국내에 등록된 줄거리 요약 정보가 없습니다.' }}
                        </p>
                        <button @click="store.toggleFavorite(movie.id)" class="fav-btn active">
                            ❤️ 찜 해제
                        </button>
                    </div>
                    <RouterLink
                        :to="`/movies/${movie.id}`"
                        class="stretched-link"
                        :aria-label="`${movie.title} 상세 정보 보기`"
                    ></RouterLink>
                </div>
            </div>
        </section>
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
.empty-state {
    text-align: center;
    background-color: #ffffff;
    border-radius: 16px;
    padding: 70px 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}
.empty-title {
    color: #2c3e50;
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 8px;
}
.empty-sub {
    color: #7f8c8d;
    margin-bottom: 24px;
}
.go-movies-btn {
    display: inline-block;
    padding: 12px 24px;
    border-radius: 8px;
    background-color: #ff4757;
    color: #ffffff;
    text-decoration: none;
    font-weight: bold;
}
.search-section {
    display: flex;
    justify-content: center;
    max-width: 520px;
    margin: 0 auto 20px;
}
.search-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #dfe4ea;
    border-radius: 8px;
    font-size: 15px;
    outline: none;
}
.search-input:focus {
    border-color: #ff4757;
}
.sort-section {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-bottom: 30px;
}
.sort-label {
    color: #7f8c8d;
    font-size: 14px;
    font-weight: bold;
}
.sort-btn {
    padding: 9px 16px;
    border: 1px solid #dfe4ea;
    border-radius: 20px;
    background-color: #ffffff;
    color: #2c3e50;
    font-weight: bold;
    cursor: pointer;
    transition: 0.2s;
}
.sort-btn:hover {
    border-color: #ff4757;
    color: #ff4757;
}
.sort-btn.active {
    background-color: #ff4757;
    border-color: #ff4757;
    color: #ffffff;
}
.movie-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 30px;
}
.movie-card {
    position: relative;
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
    color: #7f8c8d;
    margin-bottom: 10px;
    font-size: 16px;
}
.rating {
    color: #f39c12;
    font-weight: bold;
}
.overview {
    font-size: 13px;
    color: #555;
    flex-grow: 1;
    margin-bottom: 20px;
    line-height: 1.4;
}
.fav-btn {
    position: relative;
    z-index: 2;
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
.stretched-link {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
}
</style>
