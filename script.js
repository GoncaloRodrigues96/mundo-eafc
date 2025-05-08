// ==================== Funções auxiliares ====================

function formatDate(date) {
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();

  const suffix = (d => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  })(day);

  return `Last Update: ${day}${suffix} ${month} ${year}`;
}

function getPosts() {
  const stored = localStorage.getItem('mundoEafcPosts');
  if (stored) {
    return JSON.parse(stored);
  } else {
    return []; // retorno seguro
  }
}

function savePosts(posts) {
  localStorage.setItem('mundoEafcPosts', JSON.stringify(posts));
}

function populateCategoryFilter() {
  const posts = getPosts();
  const allCategories = [...new Set(posts.flatMap(p => p.categories || []))];
  const filter = document.getElementById('category-filter');
  if (filter) {
    filter.innerHTML = '';
    allCategories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      filter.appendChild(option);
    });
  }
}

// ==================== Renderização pública ====================

function renderPosts() {
  const posts = getPosts();

  const container = document.getElementById('posts-container');
  const all = document.getElementById('all-posts');
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');

  let filteredPosts = posts;

  if (searchInput && searchInput.value) {
    const term = searchInput.value.toLowerCase();
    filteredPosts = filteredPosts.filter(p => p.title.toLowerCase().includes(term));
  }

  if (categoryFilter && categoryFilter.selectedOptions.length > 0) {
    const selected = Array.from(categoryFilter.selectedOptions).map(o => o.value);
    filteredPosts = filteredPosts.filter(p => p.categories.some(cat => selected.includes(cat)));
  }

  if (container) {
    container.innerHTML = '';
    filteredPosts.forEach(p => {
      const el = document.createElement('div');
el.innerHTML = `
  <div class="card-horizontal">
    ${p.cover ? `<img src="${p.cover}" class="thumb" alt="capa">` : '<div class="thumb placeholder">1:1 image example</div>'}
    <div class="card-content">
      <h3>${p.title}</h3>
      ${p.categories && p.categories.length
  ? `<div class="badges">${p.categories.map(cat => `<span class="badge">${cat}</span>`).join('')}</div>`
  : ''}

      <p>${p.summary}</p>
      <small>${p.date || ''}</small>
    </div>
  </div>
`;

      el.classList.add('post-card');
      container.appendChild(el);
    });
  }

  if (watchedList) {
    watchedList.innerHTML = '';
    posts.slice(0, 3).forEach(p => {
      const el = document.createElement('div');
      el.innerHTML = `
  <div class="card-horizontal">
    ${p.cover ? `<img src="${p.cover}" class="thumb" alt="capa">` : '<div class="thumb placeholder">1:1 image example</div>'}
    <div class="card-content">
      <h3>${p.title}</h3>
      ${p.categories && p.categories.length
  ? `<div class="badges">${p.categories.map(cat => `<span class="badge">${cat}</span>`).join('')}</div>`
  : ''}

      <p>${p.summary}</p>
      <small>${p.date || ''}</small>
    </div>
  </div>
`;

      el.classList.add('post-card');
      watchedList.appendChild(el);
    });
  }

  if (all) {
    all.innerHTML = '';
    filteredPosts.forEach(p => {
      const el = document.createElement('div');
      const galleryHTML = p.gallery && p.gallery.length
        ? `<div class="slideshow">${p.gallery.map(url => `<img src="${url}" class="slide-img">`).join('')}</div>`
        : '';
      el.innerHTML = `
        <h3>${p.title}</h3>
        ${p.cover ? `<img src="${p.cover}" class="cover-img">` : ''}
        <p>${p.content}</p>
        ${galleryHTML}
        ${p.categories && p.categories.length
  ? `<div class="badges">${p.categories.map(cat => `<span class="badge">${cat}</span>`).join('')}</div>`
  : ''}

        <small>${p.date || ''}</small>
      `;
      el.classList.add('post-card');
      all.appendChild(el);
    });
  }
}

// ==================== Admin (criação e edição) ====================

let editMode = false;
let editIndex = null;

const form = document.getElementById('post-form');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const summary = document.getElementById('summary').value;
    const content = document.getElementById('content').value;
    const cover = document.getElementById('cover').value;
    const galleryRaw = document.getElementById('gallery').value;
    const gallery = galleryRaw.split(',').map(url => url.trim()).filter(Boolean);
    const categoriesRaw = document.getElementById('categories').value;
    const categories = categoriesRaw.split(',').map(c => c.trim()).filter(Boolean);
    const now = formatDate(new Date());

    const posts = getPosts();

    if (editMode && editIndex !== null) {
      posts[editIndex] = { title, summary, content, cover, gallery, categories, date: posts[editIndex].date || now };
      alert('Post atualizado com sucesso!');
    } else {
      posts.unshift({ title, summary, content, cover, gallery, categories, date: now });
      alert('Novo post guardado com sucesso!');
    }

    savePosts(posts);
    editMode = false;
    editIndex = null;
    form.reset();
    renderAdminPosts();
    renderPosts();
    populateCategoryFilter();
  });
}

function renderAdminPosts() {
  const container = document.getElementById('existing-posts');
  if (!container) return;

  const posts = getPosts();
  container.innerHTML = '';

  posts.forEach((p, index) => {
    const el = document.createElement('div');
    el.style.marginBottom = '1rem';
    el.innerHTML = `
      <strong>${p.title}</strong> (${p.categories.join(', ')})<br>
      <button onclick="loadPostForEdit(${index})">Editar</button>
      <button onclick="deletePost(${index})" style="margin-left: 0.5rem; background-color: #cc4444; color: white;">Eliminar</button>
    `;
    container.appendChild(el);
  });
}


function loadPostForEdit(index) {
  const posts = getPosts();
  const post = posts[index];
  document.getElementById('title').value = post.title;
  document.getElementById('summary').value = post.summary;
  document.getElementById('content').value = post.content;
  document.getElementById('cover').value = post.cover;
  document.getElementById('gallery').value = post.gallery.join(', ');
  document.getElementById('categories').value = post.categories.join(', ');

  editMode = true;
  editIndex = index;
}

function deletePost(index) {
  if (confirm('Tens a certeza que queres eliminar este post?')) {
    const posts = getPosts();
    posts.splice(index, 1);
    savePosts(posts);
    renderAdminPosts();
    renderPosts();
  }
}


// Inicializar
window.onload = () => {
  renderPosts();
  renderAdminPosts();
  populateCategoryFilter();

  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');

  if (searchInput) {
    searchInput.addEventListener('input', renderPosts);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', renderPosts);
  }
};