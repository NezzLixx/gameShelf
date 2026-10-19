const statsBox = document.getElementById("stats");

function barsHTML(rows, max) {
  let html = '<ul class="bars">';

  for (let i = 0; i < rows.length; i++) {
    const width = max > 0 ? (rows[i].value / max) * 100 : 0;

    html += `<li>
      <span class="bar-label">${rows[i].label}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${width}%"></span></span>
      <span class="bar-value">${rows[i].value}</span>
    </li>`;
  }

  return html + "</ul>";
}


function showStats() {
  const library = getLibrary();

  if (library.length === 0) {
    statsBox.innerHTML = '<p class="status">Статистика з\'явиться, коли ви додасте ігри. Почніть з <a href="index.html">каталогу</a>.</p>';
    return;
  }

  let sum = 0;
  let ratedCount = 0;
  for (let i = 0; i < library.length; i++) {
    if (library[i].rating > 0) {
      sum += library[i].rating;
      ratedCount++;
    }
  }
  const average = ratedCount > 0 ? (sum / ratedCount).toFixed(2) : "—";

  const statusRows = [];
  let doneCount = 0;
  for (let key in STATUSES) {
    let count = 0;
    for (let i = 0; i < library.length; i++) {
      if (library[i].status === key) {
        count++;
      }
    }
    statusRows.push({ label: STATUSES[key], value: count });
    if (key === "done") {
      doneCount = count;
    }
  }

  const genreCount = {};
  for (let i = 0; i < library.length; i++) {
    for (let j = 0; j < library[i].genres.length; j++) {
      const name = library[i].genres[j];
      genreCount[name] = (genreCount[name] || 0) + 1;
    }
  }

  const genreRows = [];
  for (let name in genreCount) {
    genreRows.push({ label: name, value: genreCount[name] });
  }

  genreRows.sort(function (a, b) {
    return b.value - a.value;
  });
  const topGenres = genreRows.slice(0, 5);

  let genresHTML = "<p class='meta'>Жанри не вказані.</p>";
  if (topGenres.length > 0) {
    genresHTML = barsHTML(topGenres, topGenres[0].value);
  }

  statsBox.innerHTML = `
    <dl class="summary">
      <div><dt>Ігор у бібліотеці</dt><dd>${library.length}</dd></div>
      <div><dt>Середній рейтинг</dt><dd>${average}</dd></div>
      <div><dt>Пройдено</dt><dd>${doneCount}</dd></div>
    </dl>
    <section><h2>За статусом</h2>${barsHTML(statusRows, library.length)}</section>
    <section><h2>Топ-5 улюблених жанрів</h2>${genresHTML}</section>`;
}


showStats();
