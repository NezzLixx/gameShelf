const grid = document.getElementById("grid");
const statusText = document.getElementById("status");
const searchInput = document.getElementById("search");
const statusFilter = document.getElementById("status-filter");
const sortSelect = document.getElementById("sort");


function cardHTML(game) {
  let options = "";
  for (let key in STATUSES) {
    const selected = game.status === key ? "selected" : "";
    options += `<option value="${key}" ${selected}>${STATUSES[key]}</option>`;
  }

  const genres = game.genres.slice(0, 3).join(", ") || "Без жанру";

  return `<article class="card">
    ${coverHTML(game)}
    <div class="card-body">
      <h2><a href="game.html?id=${game.id}">${game.name}</a></h2>
      <p class="meta">${genres}</p>
      <label class="field">Статус
        <select onchange="onStatusChange(${game.id}, this.value)">${options}</select>
      </label>
      <button type="button" class="btn danger" onclick="onDeleteClick(${game.id})">Видалити</button>
    </div>
  </article>`;
}


function showLibrary() {
  const all = getLibrary();

  const query = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;

  const list = [];
  for (let i = 0; i < all.length; i++) {
    const game = all[i];
    const statusOk = status === "all" || game.status === status;
    const nameOk = game.name.toLowerCase().includes(query);
    if (statusOk && nameOk) {
      list.push(game);
    }
  }

  if (sortSelect.value === "name") {
    list.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
  } else if (sortSelect.value === "rating") {
    list.sort(function (a, b) {
      return b.rating - a.rating;
    });
  } else {
    list.sort(function (a, b) {
      return b.addedAt - a.addedAt;
    });
  }

  let html = "";
  for (let i = 0; i < list.length; i++) {
    html += cardHTML(list[i]);
  }
  grid.innerHTML = html;

  if (all.length === 0) {
    statusText.innerHTML = 'Бібліотека порожня. Додайте перші ігри з <a href="index.html">каталогу</a>.';
  } else if (list.length === 0) {
    statusText.textContent = "За цими фільтрами або назвою нічого немає.";
  } else {
    statusText.textContent = "Ігор у бібліотеці: " + list.length;
  }
}


function onDeleteClick(id) {
  const all = getLibrary();

  for (let i = 0; i < all.length; i++) {
    if (all[i].id === id) {
      if (confirm("Видалити «" + all[i].name + "» з бібліотеки?")) {
        removeFromLibrary(id);
        updateLibCount();
        showLibrary();
      }
    }
  }
}


function onStatusChange(id, status) {
  changeStatus(id, status);
  showLibrary();
}


document.getElementById("filters").addEventListener("submit", function (event) {
  event.preventDefault();
});

searchInput.addEventListener("input", showLibrary);
statusFilter.addEventListener("change", showLibrary);
sortSelect.addEventListener("change", showLibrary);


showLibrary();
