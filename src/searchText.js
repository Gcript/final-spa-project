const normalizeSearchText = (text) => {
    return String(text || '').replace(/\s/g, '').toLowerCase();
};

export const isMatchedTitle = (title, keyword) => {
    const normalizedKeyword = normalizeSearchText(keyword);
    if (!normalizedKeyword) return true;

    const normalizedTitle = normalizeSearchText(title);
    return normalizedTitle.includes(normalizedKeyword);
};
