const CATEGORY_FEEDS = [
  {
    key: 'son-dakika',
    name: 'Son Dakika',
    feeds: [
      { source: 'NTV', url: 'https://www.ntv.com.tr/son-dakika.rss' },
      { source: 'Hürriyet', url: 'https://www.hurriyet.com.tr/rss/anasayfa' },
      { source: 'Milliyet', url: 'https://www.milliyet.com.tr/rss/rssnew/sondakikarss.xml' }
    ]
  },
  {
    key: 'guncel',
    name: 'Güncel',
    feeds: [
      { source: 'CNN Türk', url: 'https://www.cnnturk.com/feed/rss/all/news' },
      { source: 'Habertürk', url: 'https://www.haberturk.com/rss' },
      { source: 'Sözcü', url: 'https://www.sozcu.com.tr/feeds-rss-category-gundem' }
    ]
  },
  {
    key: 'spor',
    name: 'Spor',
    feeds: [
      { source: 'NTV Spor', url: 'https://www.ntvspor.net/rss' },
      { source: 'Sözcü Spor', url: 'https://www.sozcu.com.tr/feeds-rss-category-spor' }
    ]
  },
  {
    key: 'ekonomi',
    name: 'Ekonomi',
    feeds: [
      {
        source: 'Ekonomi Karma 1',
        urls: [
          'https://www.hurriyet.com.tr/rss/ekonomi',
          'https://www.ntv.com.tr/ekonomi.rss',
          'https://www.aa.com.tr/tr/rss/default?cat=ekonomi'
        ]
      },
      {
        source: 'Ekonomi Karma 2',
        urls: ['https://www.haberturk.com/rss/ekonomi', 'https://www.cnnturk.com/feed/rss/ekonomi/news']
      }
    ]
  },
  {
    key: 'dunya',
    name: 'Dünya',
    feeds: [
      { source: 'BBC Türkçe', url: 'https://feeds.bbci.co.uk/turkce/rss.xml' },
      { source: 'Cumhuriyet Dünya', url: 'https://www.cumhuriyet.com.tr/rss/8.xml' }
    ]
  },
  {
    key: 'teknoloji',
    name: 'Teknoloji',
    feeds: [
      { source: 'Webrazzi', urls: ['https://webrazzi.com/feed/', 'https://www.webrazzi.com/feed/'] },
      { source: 'ShiftDelete', urls: ['https://shiftdelete.net/feed'] },
      { source: 'DonanımHaber', urls: ['https://www.donanimhaber.com/rss/tum/'] }
    ]
  },
  {
    key: 'magazin',
    name: 'Magazin',
    feeds: [
      { source: 'Hürriyet Kelebek', urls: ['https://www.hurriyet.com.tr/rss/kelebek'] },
      { source: 'Habertürk Magazin', urls: ['https://www.haberturk.com/rss/magazin'] },
      { source: 'CNN Türk Magazin', urls: ['https://www.cnnturk.com/feed/rss/magazin/news'] }
    ]
  }
];

const PROXY_BASES = ['https://api.allorigins.win/raw?url=', 'https://r.jina.ai/http://'];
const MAX_NEWS_COUNT = 60;
const FETCH_TIMEOUT_MS = 12000;

const STORAGE_KEYS = {
  favorites: 'favorites',
  readNews: 'readNews',
  theme: 'theme'
};

const $ = (id) => document.getElementById(id);
const sourceSelect = $('sourceSelect');
const refreshBtn = $('refreshBtn');
const searchInput = $('searchInput');
const sortSelect = $('sortSelect');
const autoRefreshSelect = $('autoRefreshSelect');
const unreadOnlyCheck = $('unreadOnlyCheck');
const clearReadBtn = $('clearReadBtn');
const statusText = $('statusText');
const statsText = $('statsText');
const newsList = $('newsList');
const themeBtn = $('themeBtn');
const allTab = $('allTab');
const favoritesTab = $('favoritesTab');
const cardTemplate = $('newsCardTemplate');

const state = {
  allNews: [],
  currentView: 'all',
  timerId: null,
  lastUpdateAt: null,
  favorites: loadSet(STORAGE_KEYS.favorites),
  readNews: loadSet(STORAGE_KEYS.readNews)
};

init();

function init() {
  restoreTheme();
  renderCategoryOptions();
  bindEvents();
  setupAutoRefresh();
}

function bindEvents() {
  sourceSelect.addEventListener('change', loadNews);
  refreshBtn.addEventListener('click', loadNews);
  searchInput.addEventListener('input', applyAndRender);
  sortSelect.addEventListener('change', applyAndRender);
  autoRefreshSelect.addEventListener('change', setupAutoRefresh);
  unreadOnlyCheck.addEventListener('change', applyAndRender);
  clearReadBtn.addEventListener('click', clearReadHistory);
  themeBtn.addEventListener('click', toggleTheme);
  allTab.addEventListener('click', () => switchView('all'));
  favoritesTab.addEventListener('click', () => switchView('favorites'));
}

function renderCategoryOptions() {
  const fragment = document.createDocumentFragment();
  CATEGORY_FEEDS.forEach((category, index) => {
    const option = document.createElement('option');
    option.value = category.key;
    option.textContent = `${category.name} (${category.feeds.length} kaynak)`;
    option.selected = index === 0;
    fragment.appendChild(option);
  });
  sourceSelect.appendChild(fragment);
}

function switchView(view) {
  state.currentView = view;
  allTab.classList.toggle('active', view === 'all');
  favoritesTab.classList.toggle('active', view === 'favorites');
  applyAndRender();
}

async function fetchTextWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithFallback(feedUrl) {
  const requestUrls = [
    feedUrl,
    `${PROXY_BASES[0]}${encodeURIComponent(feedUrl)}`,
    `${PROXY_BASES[1]}${feedUrl.replace(/^https?:\/\//, '')}`
  ];

  for (const requestUrl of requestUrls) {
    try {
      const text = await fetchTextWithTimeout(requestUrl);
      if (text && text.length > 40) return text;
    } catch (error) {
      console.warn('Feed denemesi başarısız:', requestUrl, error.message);
    }
  }

  throw new Error('Feed alınamadı.');
}

async function resolveFeedText(feed) {
  const urlCandidates = feed.urls?.length ? feed.urls : [feed.url];

  for (const candidate of urlCandidates) {
    if (!candidate) continue;
    try {
      return await fetchWithFallback(candidate);
    } catch (error) {
      console.warn('Alternatif feed başarısız:', candidate, error.message);
    }
  }

  throw new Error(`${feed.source} için tüm feed alternatifleri başarısız.`);
}

async function loadNews() {
  const selectedCategory = CATEGORY_FEEDS.find((category) => category.key === sourceSelect.value);
  if (!selectedCategory) {
    statusText.textContent = 'Geçersiz başlık seçildi.';
    return;
  }

  setLoading(true, `${selectedCategory.name} haberleri yükleniyor...`);

  try {
    const settled = await Promise.allSettled(
      selectedCategory.feeds.map(async (feed) => {
        const feedText = await resolveFeedText(feed);
        return parseFeed(feedText, feed.source);
      })
    );

    const merged = [];
    let failedCount = 0;

    settled.forEach((result) => {
      if (result.status === 'fulfilled') merged.push(...result.value);
      else failedCount += 1;
    });

    state.allNews = deduplicateNews(merged)
      .sort((a, b) => getTime(b.publishedAt) - getTime(a.publishedAt))
      .slice(0, MAX_NEWS_COUNT);

    state.lastUpdateAt = new Date();
    localStorage.setItem(cacheKey(selectedCategory.key), JSON.stringify(state.allNews));
    applyAndRender();

    const failInfo = failedCount ? ` • ${failedCount} kaynak alınamadı` : '';
    statusText.textContent = `${selectedCategory.name}: ${state.allNews.length} haber güncellendi${failInfo}.`;
  } catch (error) {
    state.allNews = readCachedNews(selectedCategory.key);
    applyAndRender();
    statusText.textContent =
      state.allNews.length > 0
        ? 'Canlı veri alınamadı, kayıtlı haberler gösteriliyor.'
        : 'Haberler alınamadı. Lütfen daha sonra tekrar dene.';
    console.error(error);
  } finally {
    setLoading(false);
  }
}

function getTime(date) {
  return date instanceof Date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

function deduplicateNews(items) {
  const map = new Map();
  items.forEach((item) => {
    const identity = item.link && item.link !== '#' ? item.link : `${item.sourceName}:${item.title}`;
    if (!map.has(identity)) map.set(identity, item);
  });
  return Array.from(map.values());
}

function readCachedNews(cacheId) {
  const cached = localStorage.getItem(cacheKey(cacheId));
  if (!cached) return [];

  try {
    return JSON.parse(cached).map((item) => ({ ...item, publishedAt: item.publishedAt ? new Date(item.publishedAt) : null }));
  } catch {
    return [];
  }
}

function cacheKey(id) {
  return `cache:${id}`;
}

function setLoading(isLoading, message = '') {
  refreshBtn.disabled = isLoading;
  sourceSelect.disabled = isLoading;
  if (message) statusText.textContent = message;
}

function parseFeed(feedText, sourceName) {
  const xml = new DOMParser().parseFromString(feedText, 'text/xml');
  if (xml.querySelector('parsererror')) return [];

  const rssItems = Array.from(xml.querySelectorAll('item'));
  if (rssItems.length > 0) return rssItems.map((item) => parseRssItem(item, sourceName));

  const atomEntries = Array.from(xml.querySelectorAll('entry'));
  return atomEntries.map((entry) => parseAtomEntry(entry, sourceName));
}

function parseRssItem(item, sourceName) {
  return {
    id: getText(item, 'guid') || getText(item, 'link') || crypto.randomUUID(),
    title: getText(item, 'title') || 'Başlık yok',
    link: normalizeLink(getText(item, 'link')),
    description: cleanHtml(getText(item, 'description') || getText(item, 'content\\:encoded') || 'Özet bulunamadı.'),
    publishedAt: getDate(getText(item, 'pubDate') || getText(item, 'dc\\:date')),
    image: getImageFromNode(item),
    sourceName
  };
}

function parseAtomEntry(entry, sourceName) {
  const linkNode = entry.querySelector('link[rel="alternate"]') || entry.querySelector('link[href]') || entry.querySelector('link');
  const link = linkNode?.getAttribute('href') || linkNode?.textContent?.trim() || '#';

  return {
    id: getText(entry, 'id') || link || crypto.randomUUID(),
    title: getText(entry, 'title') || 'Başlık yok',
    link: normalizeLink(link),
    description: cleanHtml(getText(entry, 'summary') || getText(entry, 'content') || 'Özet bulunamadı.'),
    publishedAt: getDate(getText(entry, 'updated') || getText(entry, 'published')),
    image: getImageFromNode(entry),
    sourceName
  };
}

function normalizeLink(value) {
  if (!value) return '#';
  if (/^https?:\/\//i.test(value)) return value;
  return '#';
}

function getImageFromNode(root) {
  const mediaThumb = root.querySelector('media\\:thumbnail')?.getAttribute('url');
  const mediaContent = root.querySelector('media\\:content')?.getAttribute('url');
  const enclosure = root.querySelector('enclosure[type^="image"]')?.getAttribute('url');
  const html = getText(root, 'description') || getText(root, 'content') || '';
  const htmlMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return mediaThumb || mediaContent || enclosure || htmlMatch?.[1] || '';
}

function getText(rootNode, selector) {
  return rootNode.querySelector(selector)?.textContent?.trim() || '';
}

function cleanHtml(value) {
  const temp = document.createElement('div');
  temp.innerHTML = value;
  return (temp.textContent || temp.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 240) || 'Özet bulunamadı.';
}

function getDate(dateValue) {
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date) {
  if (!date) return 'Tarih yok';
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function applyAndRender() {
  const keyword = searchInput.value.trim().toLowerCase();
  const direction = sortSelect.value;

  let filtered = [...state.allNews];
  if (state.currentView === 'favorites') filtered = filtered.filter((news) => state.favorites.has(news.id));
  if (unreadOnlyCheck.checked) filtered = filtered.filter((news) => !state.readNews.has(news.id));
  if (keyword) filtered = filtered.filter((news) => `${news.title} ${news.description} ${news.sourceName}`.toLowerCase().includes(keyword));

  filtered.sort((a, b) => {
    const delta = getTime(b.publishedAt) - getTime(a.publishedAt);
    return direction === 'newest' ? delta : -delta;
  });

  updateStats(filtered.length);
  renderNews(filtered);
}

function updateStats(visibleCount) {
  const readCount = state.allNews.filter((news) => state.readNews.has(news.id)).length;
  const favoriteCount = state.allNews.filter((news) => state.favorites.has(news.id)).length;
  const last = state.lastUpdateAt ? ` • Son güncelleme: ${formatDate(state.lastUpdateAt)}` : '';
  statsText.textContent = `Toplam: ${state.allNews.length} • Görünen: ${visibleCount} • Favori: ${favoriteCount} • Okundu: ${readCount}${last}`;
}

function renderNews(items) {
  newsList.innerHTML = '';

  if (!items.length) {
    const emptyMessage = document.createElement('li');
    emptyMessage.className = 'news-card';
    emptyMessage.innerHTML = '<p class="news-link">Bu filtrede haber bulunamadı. Aramayı temizleyip tekrar dene.</p>';
    newsList.appendChild(emptyMessage);
    return;
  }

  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const card = cardTemplate.content.cloneNode(true);
    const root = card.querySelector('.news-card');
    const link = card.querySelector('.news-link');
    const favBtn = card.querySelector('.fav-btn');
    const shareBtn = card.querySelector('.share-btn');
    const image = card.querySelector('.news-image');
    const readBadge = card.querySelector('.read-badge');

    const isRead = state.readNews.has(item.id);
    const isFavorite = state.favorites.has(item.id);

    root.classList.toggle('read', isRead);
    readBadge.textContent = isRead ? 'Okundu' : 'Yeni';

    link.href = item.link;
    link.addEventListener('click', () => markAsRead(item.id));

    card.querySelector('.news-title').textContent = item.title;
    card.querySelector('.news-summary').textContent = item.description;
    card.querySelector('.news-date').textContent = formatDate(item.publishedAt);
    card.querySelector('.news-source').textContent = item.sourceName;

    if (item.image) {
      image.src = item.image;
      image.classList.add('show');
    }

    favBtn.classList.toggle('active', isFavorite);
    favBtn.textContent = isFavorite ? '★ Favori' : '☆ Favori';
    favBtn.addEventListener('click', (event) => {
      event.preventDefault();
      toggleFavorite(item.id);
      applyAndRender();
    });

    shareBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      await shareNews(item);
    });

    fragment.appendChild(card);
  });

  newsList.appendChild(fragment);
}

function markAsRead(id) {
  state.readNews.add(id);
  saveSet(STORAGE_KEYS.readNews, state.readNews);
  applyAndRender();
}

function clearReadHistory() {
  state.readNews.clear();
  saveSet(STORAGE_KEYS.readNews, state.readNews);
  applyAndRender();
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) state.favorites.delete(id);
  else state.favorites.add(id);
  saveSet(STORAGE_KEYS.favorites, state.favorites);
}

async function shareNews(item) {
  const payload = { title: item.title, text: item.description, url: item.link };
  try {
    if (navigator.share) {
      await navigator.share(payload);
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(`${item.title}\n${item.link}`);
      statusText.textContent = 'Link panoya kopyalandı.';
      return;
    }

    if (legacyCopyToClipboard(`${item.title}\n${item.link}`)) {
      statusText.textContent = 'Link panoya kopyalandı (uyumlu mod).';
      return;
    }

    statusText.textContent = 'Paylaşım desteklenmiyor.';
  } catch (error) {
    console.error(error);
  }
}

function setupAutoRefresh() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }

  const seconds = Number(autoRefreshSelect.value);
  if (seconds > 0) state.timerId = setInterval(loadNews, seconds * 1000);
}

function restoreTheme() {
  const theme = localStorage.getItem(STORAGE_KEYS.theme) || 'light';
  document.body.classList.toggle('dark', theme === 'dark');
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
}

function loadSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || '[]'));
  } catch {
    return new Set();
  }
}

function saveSet(key, valueSet) {
  localStorage.setItem(key, JSON.stringify(Array.from(valueSet)));
}

function legacyCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }

  document.body.removeChild(textArea);
  return copied;
}
