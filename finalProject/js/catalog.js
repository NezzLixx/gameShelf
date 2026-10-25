const grid = document.getElementById("grid");
const statusText = document.getElementById("status");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("search");
const genreSelect = document.getElementById("genre");
const platformSelect = document.getElementById("platform");
const orderingSelect = document.getElementById("ordering");
const categoriesBox = document.getElementById("categories");

let currentPage = 1;
let games = [];


function cardHTML(game) {
  const inLib = isInLibrary(game.id);
  const genres = game.genres.slice(0, 3).join(", ") || "Без жанру";
  const year = game.released ? game.released.slice(0, 4) : "Дата невідома";

  const buttonClass = inLib ? "btn in-lib" : "btn";
  const buttonText = inLib ? "У бібліотеці" : "Додати в бібліотеку";

  return `<article class="card">
    ${coverHTML(game)}
    <div class="card-body">
      <h2><a href="game.html?id=${game.id}">${game.name}</a></h2>
      <p class="meta">${genres}</p>
      <p class="meta">${year}</p>
      <button type="button" class="${buttonClass}" id="btn-${game.id}"
        onclick="onAddClick(${game.id})">${buttonText}</button>
    </div>
  </article>`;
}

function skeletonHTML() {
  let html = "";

  for (let i = 0; i < PAGE_SIZE; i++) {
    html += `<article class="card">
      <div class="cover skeleton"></div>
      <div class="card-body">
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-btn"></div>
      </div>
    </article>`;
  }

  return html;
}

async function loadGames() {
  statusText.textContent = "Завантаження…";
  grid.innerHTML = skeletonHTML();
  pagination.innerHTML = "";

  try {
    const data = await getGames({
      page: currentPage,
      page_size: PAGE_SIZE,
      search: searchInput.value.trim(),
      genres: genreSelect.value,
      parent_platforms: platformSelect.value,
      ordering: orderingSelect.value,
    });

    games = [];
    for (let i = 0; i < data.results.length; i++) {
      games.push(makeEntry(data.results[i]));
    }

    let html = "";
    for (let i = 0; i < games.length; i++) {
      html += cardHTML(games[i]);
    }
    grid.innerHTML = html;

    if (games.length === 0) {
      statusText.textContent = "Нічого не знайдено. Змініть запит або фільтри.";
    } else {
      statusText.textContent = "Знайдено ігор: " + data.count;
    }

    showPagination(Math.ceil(data.count / PAGE_SIZE));
  } catch (error) {
    grid.innerHTML = "";
    pagination.innerHTML = "";
    statusText.textContent =
      "Не вдалося завантажити ігри: " + error.message + ".";
  }
}


function showPagination(totalPages) {
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  const prevDisabled = currentPage === 1 ? "disabled" : "";
  const nextDisabled = currentPage === totalPages ? "disabled" : "";

  pagination.innerHTML =
    `<button type="button" onclick="goToPage(${currentPage - 1})" ${prevDisabled}>Назад</button>` +
    `<span>Сторінка ${currentPage} з ${totalPages}</span>` +
    `<button type="button" onclick="goToPage(${currentPage + 1})" ${nextDisabled}>Далі</button>`;
}


function goToPage(page) {
  currentPage = page;
  loadGames();
  window.scrollTo(0, 0);
}


function applyFilters() {
  currentPage = 1;
  markActiveCategory();
  loadGames();
}

function onAddClick(id) {
  for (let i = 0; i < games.length; i++) {
    if (games[i].id === id) {
      toggleInLibrary(games[i]);
      setButton(document.getElementById("btn-" + id), isInLibrary(id));
    }
  }
}

function categoryHTML(slug, name) {
  return `<li><button type="button" class="category" data-slug="${slug}"
    onclick="selectCategory('${slug}')">${name}</button></li>`;
}

function selectCategory(slug) {
  genreSelect.value = slug;
  applyFilters();
}

function markActiveCategory() {
  const buttons = categoriesBox.querySelectorAll(".category");
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].dataset.slug === genreSelect.value) {
      buttons[i].classList.add("active");
    } else {
      buttons[i].classList.remove("active");
    }
  }
}

async function loadGenres() {
  try {
    const data = await getGenres();

    let categoriesHTML = categoryHTML("", "Усі ігри");

    for (let i = 0; i < data.results.length; i++) {
      const genre = data.results[i];
      genreSelect.add(new Option(genre.name, genre.slug));
      categoriesHTML += categoryHTML(genre.slug, genre.name);
    }

    categoriesBox.innerHTML = categoriesHTML;
    markActiveCategory();
  } catch (error) {
    console.log("Не вдалося завантажити жанри", error);
    categoriesBox.innerHTML = "<li class='meta'>Не вдалося завантажити категорії</li>";
  }
}


document.getElementById("filters").addEventListener("submit", function (event) {
  event.preventDefault();
  applyFilters();
});

genreSelect.addEventListener("change", applyFilters);
platformSelect.addEventListener("change", applyFilters);
orderingSelect.addEventListener("change", applyFilters);


loadGenres();
loadGames();
