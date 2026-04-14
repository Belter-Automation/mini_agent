const sidebarSelector = '.sidebar';
const mainSelector = 'main';

function normalizeUrl(url) {
  const loc = new URL(url, location.href);
  return loc.pathname + loc.search + loc.hash;
}

function updateActiveLinks(url) {
  const normalized = normalizeUrl(url).split('/').pop();
  document.querySelectorAll('.sidebar a').forEach((link) => {
    const href = normalizeUrl(link.getAttribute('href')).split('/').pop();
    if (href === normalized) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

async function loadPage(url, addHistory = true) {
  const response = await fetch(url);
  if (!response.ok) {
    console.error('Failed to load page:', url);
    return;
  }
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  const newMain = doc.querySelector(mainSelector);
  if (!newMain) {
    console.error('No <main> found in loaded page:', url);
    return;
  }

  const currentMain = document.querySelector(mainSelector);
  currentMain.replaceWith(newMain.cloneNode(true));
  if (addHistory) {
    history.pushState({ url }, '', url);
  }
  document.title = doc.title;
  updateActiveLinks(url);
  window.scrollTo(0, 0);
}

function handleNavigation(event) {
  const anchor = event.target.closest('a');
  if (!anchor) return;
  const sidebar = anchor.closest(sidebarSelector);
  if (!sidebar) return;
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('http') && new URL(href).origin !== location.origin) return;
  event.preventDefault();
  loadPage(href);
}

window.addEventListener('click', handleNavigation);
window.addEventListener('popstate', (event) => {
  const url = event.state?.url || location.pathname;
  loadPage(url, false);
});

updateActiveLinks(location.href);
