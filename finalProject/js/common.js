const API_KEY = "";
const BASE_URL = "https://api.rawg.io/api";
const PAGE_SIZE = 16;
const STATUSES = {
  want: "Хочу пройти",
  playing: "Граю",
  done: "Пройдено",
};


// ---------- Запити до API ----------

async function loadFromApi(path, params = {}) {
  let url = BASE_URL + path + "?key=" + API_KEY;

  for (let name in params) {
    if (params[name] !== "") {
      url += "&" + name + "=" + encodeURIComponent(params[name]);
    }
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Помилка API: " + response.status);
  }

  return await response.json();
}

function getGames(params) {
  return loadFromApi("/games", params);
}

function getGame(id) {
  return loadFromApi("/games/" + id);
}

function getScreenshots(id) {
  return loadFromApi("/games/" + id + "/screenshots");
}

function getGenres() {
  return loadFromApi("/genres");
}


// ---------- Бібліотека ----------

function getLibrary() {
  const text = localStorage.getItem("game-shelf-library");

  if (text === null) {
    return [];
  }

  return JSON.parse(text);
}

function saveLibrary(list) {
  localStorage.setItem("game-shelf-library", JSON.stringify(list));
}

function makeEntry(game) {
  const genreNames = [];
  if (game.genres) {
    for (let i = 0; i < game.genres.length; i++) {
      genreNames.push(game.genres[i].name);
    }
  }

  return {
    id: game.id,
    name: game.name,
    image: game.background_image || "",
    rating: game.rating || 0,
    released: game.released || "",
    genres: genreNames,
  };
}

function isInLibrary(id) {
  const list = getLibrary();
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return true;
    }
  }
  return false;
}

function addToLibrary(entry) {
  const list = getLibrary();

  list.push({
    id: entry.id,
    name: entry.name,
    image: entry.image,
    rating: entry.rating,
    released: entry.released,
    genres: entry.genres,
    status: "want",
    addedAt: Date.now(),
  });

  saveLibrary(list);
}

function removeFromLibrary(id) {
  const list = getLibrary();

  const newList = list.filter(function (game) {
    return game.id !== id;
  });

  saveLibrary(newList);
}

function changeStatus(id, status) {
  const list = getLibrary();

  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      list[i].status = status;
    }
  }

  saveLibrary(list);
}

function toggleInLibrary(entry) {
  if (isInLibrary(entry.id)) {
    removeFromLibrary(entry.id);
  } else {
    addToLibrary(entry);
  }
  updateLibCount();
}


// ---------- Інтерфейс ----------

function updateLibCount() {
  const counter = document.getElementById("lib-count");
  const count = getLibrary().length;

  if (count > 0) {
    counter.textContent = count;
  } else {
    counter.textContent = "";
  }
}

function setButton(button, inLib) {
  if (inLib) {
    button.classList.add("in-lib");
    button.textContent = "У бібліотеці";
  } else {
    button.classList.remove("in-lib");
    button.textContent = "Додати в бібліотеку";
  }
}

function coverHTML(game) {
  let image = '<span class="no-img">Немає обкладинки</span>';
  if (game.image) {
    image = `<img src="${game.image}" alt="" loading="lazy">`;
  }

  let rating = "";
  if (game.rating) {
    rating = `<span class="rating">★ ${game.rating.toFixed(1)}</span>`;
  }

  return `<a class="cover" href="game.html?id=${game.id}">${image}${rating}</a>`;
}



updateLibCount();
