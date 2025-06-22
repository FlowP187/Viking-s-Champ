const SHEET_URL = "https://script.google.com/macros/s/AKfycbyN73Y42iU3BAkLKXlv9W7Ln0nEImfXjUDBlbBhcoPoxMLsFBsltdBv4h_Ba9eA5LYr/exec";

fetch(SHEET_URL)
  .then(response => response.json())
  .then(data => {
    console.log("Données reçues :", data);
    displayScores(data);
    displayClassement(data);
  })
  .catch(error => {
    console.error("Erreur lors de la récupération des scores :", error);
  });


function displayScores(data) {
  const table = document.getElementById("scores-table");
  table.innerHTML = ""; // vide le tableau avant remplissage

  const dates = data.dates;
  const parcours = data.golfs;
  const pars = data.pars;

  // En-têtes
  const header = document.createElement("tr");
  header.innerHTML = `<th>Joueur</th>` + 
    dates.map((date, i) => `<th>${date}<br><small>${parcours[i]}</small></th>`).join("") + 
    `<th>Total</th><th>Écart</th>`;
  table.appendChild(header);

  // Lignes par joueur
  data.joueurs.forEach((joueur, idx) => {
    const scores = data.scores[idx];
    let total = 0;
    let ecart = 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${joueur}</td>`;

    scores.forEach((score, i) => {
      const val = score !== "" ? parseInt(score) : "";
      const diff = val !== "" ? val - pars[i] : "";
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
