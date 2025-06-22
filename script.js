const SHEET_URL = "https://script.google.com/macros/s/AKfycbzS5ljYjr3BjqlLHX_WR6bx8MjiT-91UGFb2F4bakXehLr9gKhxfEQQlKs_qIjQmxXR/exec";

fetch(SHEET_URL)
  .then(response => response.json())
  .then(data => {
    displayScores(data);
    displayClassement(data);
  })
  .catch(error => {
    console.error("Erreur lors de la récupération des scores :", error);
  });

function displayScores(data) {
  const table = document.getElementById("scores-table");
  table.innerHTML = ""; // Reset table

  // 1ère ligne header : dates
  const headerDates = document.createElement("tr");
  headerDates.innerHTML = `<th></th>` + data.dates.map(date => `<th>${date}</th>`).join("") + `<th>Total</th><th>Écart</th>`;
  table.appendChild(headerDates);

  // 2ème ligne header : golfs
  const headerGolfs = document.createElement("tr");
  headerGolfs.innerHTML = `<th>Parcours</th>` + data.golfs.map(golf => `<th>${golf}</th>`).join("") + `<th></th><th></th>`;
  table.appendChild(headerGolfs);

  // Lignes joueurs + scores
  data.joueurs.forEach((joueur, idx) => {
    const scores = data.scores[idx];
    let total = 0;
    let ecart = 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${joueur}</td>`;

    scores.forEach((score, i) => {
      const val = score !== "" ? parseInt(score) : "";
      const diff = val !== "" ? val - data.pars[i] : "";
      total += val || 0;
      ecart += diff || 0;
      tr.innerHTML += `<td>${val !== "" ? `${val} (${diff >= 0 ? '+' : ''}${diff})` : ''}</td>`;
    });

    tr.innerHTML += `<td>${total}</td><td>${ecart >= 0 ? '+' + ecart : ecart}</td>`;
    tr.dataset.total = total;
    tr.dataset.ecart = ecart;
    table.appendChild(tr);
  });

  sortTable();
}

function sortTable() {
  const table = document.getElementById("scores-table");
  const rows = Array.from(table.querySelectorAll("tr")).slice(2); // ignore 2 header rows
  rows.sort((a, b) => parseInt(a.dataset.ecart) - parseInt(b.dataset.ecart));
  rows.forEach(row => table.appendChild(row));
}

function displayClassement(data) {
  const classement = document.getElementById("podium");
  const joueurs = data.joueurs;
  const ecarts = data.scores.map((s, i) =>
    s.reduce((sum, val, idx) => val !== "" ? sum + (parseInt(val) - data.pars[idx]) : sum, 0)
  );
  const classementFinal = joueurs.map((j, i) => ({ nom: j, ecart: ecarts[i] }))
    .sort((a, b) => a.ecart - b.ecart);

  classement.innerHTML = classementFinal.map((p, i) => `
    <div class="${i === 0 ? 'glow' : ''}">
      🏅 ${i + 1} - ${p.nom} (${p.ecart >= 0 ? '+' + p.ecart : p.ecart})
    </div>
  `).join("");
}
