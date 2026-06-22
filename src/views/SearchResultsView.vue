<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { isMatchedTitle } from '../searchText';
import { useMovieStore } from '../stores/movieStore';

const route = useRoute();
const router = useRouter();
const store = useMovieStore();
const defaultSortDirections = {
    popularity: 'desc',
    title: 'asc',
    releaseDate: 'desc',
    rating: 'desc'
};
const searchKeyword = ref('');
const searchGuideMessage = ref('');
const sortType = ref('popularity');
const sortDirection = ref(defaultSortDirections.popularity);
const currentPage = ref(1);
const pageSize = 6;

const currentKeyword = computed(() => {
    return String(route.query.keyword || '').trim();
});

const filteredMovies = computed(() => {
    const keyword = currentKeyword.value;
    if (!keyword) return [];

    return store.movies.filter((movie) => {
        return isMatchedTitle(movie.title, keyword);
    });
});

const sortedFilteredMovies = computed(() => {
    const copiedMovies = [...filteredMovies.value];
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

    return copiedMovies;
});

const changeSort = (newSortType) => {
    if (sortType.value === newSortType) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortType.value = newSortType;
        sortDirection.value = defaultSortDirections[newSortType];
    }
    currentPage.value = 1;
};

const getSortMark = (targetSortType) => {
    if (sortType.value !== targetSortType) return '';
    return sortDirection.value === 'asc' ? ' ↑' : ' ↓';
};

const totalPages = computed(() => {
    return Math.ceil(sortedFilteredMovies.value.length / pageSize);
});

const paginatedMovies = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedFilteredMovies.value.slice(startIndex, endIndex);
});

const changePage = (pageNumber) => {
    currentPage.value = pageNumber;
};

const goPrevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value -= 1;
    }
};

const goNextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value += 1;
    }
};

const submitSearch = () => {
    const keyword = searchKeyword.value.trim();
    searchKeyword.value = keyword;

    if (!keyword) {
        searchGuideMessage.value = '검색어를 입력한 뒤 검색 버튼을 눌러주세요.';
        return;
    }

    searchGuideMessage.value = '';

    router.push({
        name: 'search-results',
        query: { keyword }
    });
};

onMounted(() => {
    searchKeyword.value = currentKeyword.value;
    document.title = `검색 결과: ${currentKeyword.value} | NETVUE`;

    if (store.movies.length === 0) {
        store.fetchMovies();
    }
});

watch(currentKeyword, (newKeyword) => {
    searchKeyword.value = newKeyword;
    searchGuideMessage.value = '';
    currentPage.value = 1;
    document.title = `검색 결과: ${newKeyword} | NETVUE`;
});
</script>

<template>
    <main class="page">
        <div class="header-section">
            <h1>🔎 영화 검색 결과</h1>
            <p class="sub-title">입력한 제목이 포함된 영화만 표시합니다.</p>
        </div>

        <form class="search-section" @submit.prevent="submitSearch">
            <input
                v-model="searchKeyword"
                type="text"
                class="search-input"
                placeholder="영화 제목을 검색하세요"
            >
            <button type="submit" class="search-btn">검색</button>
        </form>
        <p v-if="searchGuideMessage" class="search-guide">{{ searchGuideMessage }}</p>

        <div class="result-actions">
            <RouterLink to="/movies" class="back-list-btn">전체 영화 목록으로 돌아가기</RouterLink>
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
        </div>

        <div v-if="store.isLoading" class="status-message loading">⏳ 검색에 사용할 영화 데이터를 불러오는 중입니다...</div>
        <div v-else-if="store.errorMessage" class="status-message error">🚨 {{ store.errorMessage }}</div>
        <div v-else-if="!currentKeyword" class="status-message empty">
            검색창에 영화 제목을 입력하면 검색 결과를 확인할 수 있습니다.
        </div>
        <div v-else-if="filteredMovies.length === 0" class="status-message empty">
            "{{ currentKeyword }}"에 대한 검색 결과가 없습니다.
        </div>
        <section v-else>
            <p class="result-count">
                "{{ currentKeyword }}" 검색 결과 {{ filteredMovies.length }}개
            </p>
            <div class="movie-list">
                <div v-for="movie in paginatedMovies" :key="movie.id" class="movie-card">
                    <img v-if="movie.poster_path" :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`" :alt="movie.title" class="poster" />
                    <div v-else class="poster-placeholder">이미지 준비 중</div>
                    <div class="card-content">
                        <h3 class="title">{{ movie.title }}</h3>
                        <p class="release-date" v-if="movie.release_date">📅 개봉일: {{ movie.release_date }}</p>
                        <p class="rating">⭐️ {{ movie.vote_average.toFixed(1) }} / 10</p>
                        <p class="overview">
                            {{ movie.overview ? movie.overview.substring(0, 60) + '...' : '국내에 등록된 줄거리 요약 정보가 없습니다.' }}
                        </p>
                        <button @click="store.toggleFavorite(movie.id)" :class="{ active: movie.isFavorite }" class="fav-btn">
                            {{ movie.isFavorite ? '❤️ 찜 해제' : '🤍 찜하기' }}
                        </button>
                    </div>
                    <RouterLink
                        :to="`/movies/${movie.id}`"
                        class="stretched-link"
                        :aria-label="`${movie.title} 상세 정보 보기`"
                    ></RouterLink>
                </div>
            </div>
            <div v-if="totalPages > 1" class="pagination">
                <button
                    @click="goPrevPage"
                    :disabled="currentPage === 1"
                    class="page-btn move-page-btn"
                >
                    이전
                </button>
                <button
                    v-for="pageNumber in totalPages"
                    :key="pageNumber"
                    @click="changePage(pageNumber)"
                    :class="{ active: currentPage === pageNumber }"
                    class="page-btn"
                >
                    {{ pageNumber }}
                </button>
                <button
                    @click="goNextPage"
                    :disabled="currentPage === totalPages"
                    class="page-btn move-page-btn"
                >
                    다음
                </button>
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
.search-section {
    display: flex;
    justify-content: center;
    gap: 10px;
    max-width: 520px;
    margin: 0 auto 30px;
}
.search-input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #dfe4ea;
    border-radius: 8px;
    font-size: 15px;
    outline: none;
}
.search-input:focus {
    border-color: #ff4757;
}
.search-btn {
    padding: 12px 22px;
    border: none;
    border-radius: 8px;
    background-color: #1e272e;
    color: #ffffff;
    font-weight: bold;
    cursor: pointer;
}
.search-guide {
    text-align: center;
    color: #ff4757;
    font-size: 14px;
    font-weight: bold;
    margin: -18px 0 22px;
}
.result-actions {
    text-align: center;
    margin-bottom: 22px;
}
.back-list-btn {
    display: inline-block;
    padding: 10px 18px;
    border-radius: 20px;
    background-color: #ffffff;
    border: 1px solid #dfe4ea;
    color: #2c3e50;
    font-size: 14px;
    font-weight: bold;
    text-decoration: none;
}
.back-list-btn:hover {
    border-color: #ff4757;
    color: #ff4757;
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
.empty {
    color: #7f8c8d;
    background-color: #ffffff;
}
.result-count {
    text-align: center;
    color: #2c3e50;
    font-weight: bold;
    margin-bottom: 24px;
}
.movie-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 30px;
}
.pagination {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 34px;
}
.page-btn {
    width: 38px;
    height: 38px;
    border: 1px solid #dfe4ea;
    border-radius: 50%;
    background-color: #ffffff;
    color: #2c3e50;
    font-weight: bold;
    cursor: pointer;
}
.page-btn.active {
    background-color: #ff4757;
    border-color: #ff4757;
    color: #ffffff;
}
.move-page-btn {
    width: auto;
    padding: 0 14px;
    border-radius: 20px;
}
.page-btn:disabled {
    color: #b2bec3;
    cursor: not-allowed;
    background-color: #f1f2f6;
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
