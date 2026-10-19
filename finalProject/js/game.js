const gameBox = document.getElementById("game");
const gameId = Number(new URLSearchParams(location.search).get("id"));
let currentEntry = null;

function namesToText(items) {
  if (!items || items.length === 0) {
    return "—";
  }

  const names = [];
  for (let i = 0; i < items.length; i++) {
    names.push(items[i].name);
  }

  return names.join(", ");
}


function showGame(game, screenshots) {
  document.title = game.name;

  currentEntry = makeEntry(game);

  const platforms = [];
  for (let i = 0; i < game.platforms.length; i++) {
    platforms.push(game.platforms[i].platform);
  }

  let cover = "";
  if (game.background_image) {
    cover = `<img class="game-cover" src="${game.background_image}" alt="">`;
  }

  let site = "—";
  if (game.website) {
    site = `<a href="${game.website}" target="_blank">${game.website}</a>`;
  }

  let rating = "—";
  if (game.rating) {
    rating = game.rating + " з 5 (оцінок: " + game.ratings_count + ")";
  }

  let shotsHTML = "";
  if (screenshots.length > 0) {
    shotsHTML = "<section><h2>Скріншоти</h2><div class='shots'>";
    for (let i = 0; i < screenshots.length && i < 4; i++) {
      const url = screenshots[i].image;
      shotsHTML += `<a href="${url}" target="_blank"><img src="${url}" alt="Скріншот гри" loading="lazy"></a>`;
    }
    shotsHTML += "</div></section>";
  }

  gameBox.innerHTML = `
    <div class="game-hero">
      ${cover}
      <div class="game-head">
        <h1>${game.name}</h1>
        <p class="meta">${namesToText(game.genres)}</p>
        <button type="button" class="btn" id="add-btn" onclick="onAddClick()"></button>
      </div>
    </div>
    <section>
      <h2>Опис</h2>
      <p class="desc" id="desc"></p>
    </section>
    <section>
      <h2>Інформація</h2>
      <dl class="facts">
        <dt>Дата виходу</dt><dd>${game.released || "—"}</dd>
        <dt>Рейтинг</dt><dd>${rating}</dd>
        <dt>Metacritic</dt><dd>${game.metacritic || "—"}</dd>
        <dt>Середній час гри</dt><dd>${game.playtime ? game.playtime + " год" : "—"}</dd>
        <dt>Платформи</dt><dd>${namesToText(platforms)}</dd>
        <dt>Розробники</dt><dd>${namesToText(game.developers)}</dd>
        <dt>Видавці</dt><dd>${namesToText(game.publishers)}</dd>
        <dt>Вікова категорія</dt><dd>${game.esrb_rating ? game.esrb_rating.name : "—"}</dd>
        <dt>Сайт</dt><dd>${site}</dd>
      </dl>
    </section>
    ${shotsHTML}`;

  document.getElementById("desc").textContent = game.description_raw || "Опис відсутній.";

  setButton(document.getElementById("add-btn"), isInLibrary(currentEntry.id));
}


function onAddClick() {
  toggleInLibrary(currentEntry);
  setButton(document.getElementById("add-btn"), isInLibrary(currentEntry.id));
}


async function loadGame() {
  if (!gameId) {
    gameBox.innerHTML = '<p class="status">Гру не вказано. Оберіть її в <a href="index.html">каталозі</a>.</p>';
    return;
  }

  try {
    const game = await getGame(gameId);

    let screenshots = [];
    try {
      const shotsData = await getScreenshots(gameId);
      screenshots = shotsData.results;
    } catch (error) {
      console.log("Не вдалося завантажити скріншоти", error);
    }

    showGame(game, screenshots);
  } catch (error) {
    gameBox.innerHTML = '<p class="status">Не вдалося завантажити гру: ' + error.message + "</p>";
  }
}


loadGame();
