const sources = [
  { name: 'TRT Haber - Son Dakika', rssUrl: 'https://www.trthaber.com/sondakika_articles.rss' },
  { name: 'TRT Haber - Gündem', rssUrl: 'https://www.trthaber.com/gundem_articles.rss' },
  { name: 'TRT Haber - Dünya', rssUrl: 'https://www.trthaber.com/dunya_articles.rss' },
  { name: 'TRT Haber - Ekonomi', rssUrl: 'https://www.trthaber.com/ekonomi_articles.rss' },
  { name: 'TRT Haber - Spor', rssUrl: 'https://www.trthaber.com/spor_articles.rss' },
  { name: 'BBC Türkçe', rssUrl: 'https://feeds.bbci.co.uk/turkce/rss.xml' },
  { name: 'NTV - Son Dakika', rssUrl: 'https://www.ntv.com.tr/son-dakika.rss' },
  { name: 'Anadolu Ajansı - Güncel', rssUrl: 'https://www.aa.com.tr/tr/rss/default?cat=guncel' }
];

const sourceSelect = document.getElementById('sourceSelect');
const refreshBtn = document.getElementById('refreshBtn');
const statusText = document.getElementById('statusText');
const newsList = document.getElementById('newsList');
const cardTemplate = document.getElementById('newsCardTemplate');

const rssProxyBase = 'https://api.allorigins.win/raw?url=';
const maxNewsCount = 20;

function init() {
  sources.forEach((source, index) => {
    const option = document.createElement('option');
    option.value = source.rssUrl;
    option.textContent = source.name;
    if (index === 0) {
      option.selected = true;
    }
    sourceSelect.appendChild(option);
  });

  sourceSelect.addEventListener('change', loadNews);
  refreshBtn.addEventListener('click', loadNews);
  loadNews();
}

async function loadNews() {
  const selectedSource = sources.find((source) => source.rssUrl === sourceSelect.value);
  if (!selectedSource) {
    statusText.textContent = 'Geçersiz kaynak seçildi.';
    return;
  }

  statusText.textContent = `${selectedSource.name} haberleri yükleniyor...`;
  refreshBtn.disabled = true;
  sourceSelect.disabled = true;

  try {
    const requestUrl = `${rssProxyBase}${encodeURIComponent(selectedSource.rssUrl)}`;
    const response = await fetch(requestUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const rssText = await response.text();
    const items = parseFeed(rssText);
    renderNews(items, selectedSource.name);

    statusText.textContent = `${selectedSource.name} kaynağından ${items.length} haber listelendi.`;
  } catch (error) {
    newsList.innerHTML = '';
    statusText.textContent = 'Haberler alınamadı. İnternetini veya kaynak bağlantısını kontrol et.';
    console.error(error);
  } finally {
    refreshBtn.disabled = false;
    sourceSelect.disabled = false;
  }
}

function parseFeed(feedText) {
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(feedText, 'text/xml');

  if (xmlDocument.querySelector('parsererror')) {
    return [];
  }

  const rssItems = Array.from(xmlDocument.querySelectorAll('item'));
  if (rssItems.length > 0) {
    return rssItems.slice(0, maxNewsCount).map(parseRssItem);
  }

  const atomEntries = Array.from(xmlDocument.querySelectorAll('entry'));
  return atomEntries.slice(0, maxNewsCount).map(parseAtomEntry);
}

function parseRssItem(item) {
  const title = getText(item, 'title') || 'Başlık yok';
  const link = getText(item, 'link') || '#';
  const description =
    getText(item, 'description') ||
    getText(item, 'content\\:encoded') ||
    getText(item, 'summary') ||
    'Özet bulunamadı.';

  return {
    title,
    link,
    description: cleanHtml(description),
    publishedAt: formatDate(getText(item, 'pubDate') || getText(item, 'dc\\:date'))
  };
}

function parseAtomEntry(entry) {
  const title = getText(entry, 'title') || 'Başlık yok';
  const linkNode =
    entry.querySelector('link[rel="alternate"]') ||
    entry.querySelector('link[href]') ||
    entry.querySelector('link');

  const link =
    linkNode?.getAttribute('href') ||
    linkNode?.textContent?.trim() ||
    '#';

  const summary = getText(entry, 'summary') || getText(entry, 'content') || 'Özet bulunamadı.';

  return {
    title,
    link,
    description: cleanHtml(summary),
    publishedAt: formatDate(getText(entry, 'updated') || getText(entry, 'published'))
  };
}

function getText(rootNode, selector) {
  return rootNode.querySelector(selector)?.textContent?.trim() || '';
}

function cleanHtml(value) {
  const temp = document.createElement('div');
  temp.innerHTML = value;
  const text = temp.textContent || temp.innerText || '';
  return text.replace(/\s+/g, ' ').trim().slice(0, 180) || 'Özet bulunamadı.';
}

function formatDate(dateValue) {
  if (!dateValue) {
    return 'Tarih yok';
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return 'Tarih yok';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function renderNews(items, sourceName) {
  newsList.innerHTML = '';

  if (!items.length) {
    const emptyMessage = document.createElement('li');
    emptyMessage.className = 'news-card';
    emptyMessage.innerHTML = '<p class="news-link">Bu kaynakta gösterilecek haber bulunamadı.</p>';
    newsList.appendChild(emptyMessage);
    return;
  }

  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const card = cardTemplate.content.cloneNode(true);
    const link = card.querySelector('.news-link');

    link.href = item.link;
    card.querySelector('.news-title').textContent = item.title;
    card.querySelector('.news-summary').textContent = item.description;
    card.querySelector('.news-date').textContent = item.publishedAt;
    card.querySelector('.news-source').textContent = sourceName;

    fragment.appendChild(card);
  });

  newsList.appendChild(fragment);
}

init();
