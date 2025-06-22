// URL de ton script Apps Script
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxWVI19MMedDEXWhKC5LJSs2J6vTWbZL5EgCdXTAm9Ix0Pp21Gu9wGP_2p4cwmL-O93/exec";

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

function formatDate(dateString) {
  if (!dateString) return "";
  const parts = dateString.split("T")[0].split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateString;
}

function displayScores(data) {
  const table = document.getElementById("scores-table");
  table.innerHTML = ""; // Reset table

  console.log("Dates brutes :", data.dates);

  const parcours = data.golfs || [];   // noms des golfs (ligne 2)
  const dates = (data.dates || []).map(formatDate); // dates formatées
  const pars = data.pars || [];

  const header = document.createElement("tr");
  header.innerHTML = `<th>Joueur</th>` +
    dates.map((date, i) => `<th>${date}<br><small>${parcours[i] || ""}</small></th>`).join("") +
    `<th>Total</th><th>Écart</th>`;
  table.appendChild(header);

  data.joueurs.forEach((joueur, idx) => {
    const scores = data.scores[idx] || [];
    let total = 0;
    let ecart = 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${joueur}</td>`;

    scores.forEach((score, i) => {
      const val = score !== "" && !isNaN(score) ? parseInt(score) : "";
      const diff = val !== "" ? val - (pars[i] || 0) : "";
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
  const rows = Array.from(table.querySelectorAll("tr")).slice(1);
  rows.sort((a, b) => parseInt(a.dataset.ecart) - parseInt(b.dataset.ecart));
  rows.forEach(row => table.appendChild(row));
}

function displayClassement(data) {
  const classement = document.getElementById("podium");
  const joueurs = data.joueurs;
  const ecarts = data.scores.map((s, i) =>
    s.reduce((sum, val, idx) => val !== "" && !isNaN(val) ? sum + (parseInt(val) - (data.pars[idx] || 0)) : sum, 0)
  );
  const classementFinal = joueurs.map((j, i) => ({ nom: j, ecart: ecarts[i] }))
    .sort((a, b) => a.ecart - b.ecart);

  classement.innerHTML = classementFinal.map((p, i) => {
    let medal = '';
    if (i === 0) medal = '🥇';
    else if (i === 1) medal = '🥈';
    else if (i === 2) medal = '🥉';
    else if (i === classementFinal.length - 1) medal = '💩';
    return `
      <div class="${i === 0 ? 'glow' : ''}">
        ${medal} ${i + 1} - ${p.nom} (${p.ecart >= 0 ? '+' + p.ecart : p.ecart})
      </div>
    `;
  }).join("");
}
