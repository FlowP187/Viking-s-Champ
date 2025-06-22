// URL de ton script Apps Script
const url = "https://script.google.com/macros/s/AKfycbxWVI19MMedDEXWhKC5LJSs2J6vTWbZL5EgCdXTAm9Ix0Pp21Gu9wGP_2p4cwmL-O93/exec";

// Récupère les données depuis Google Sheets
fetch(url)
  .then(response => response.json())
  .then(data => {
    console.log("Données reçues :", data);
    displayScores(data);
  })
  .catch(error => {
    console.error("Erreur lors de la récupération des scores :", error);
  });

// Affiche les scores dans le tableau HTML
function displayScores(data) {
  const table = document.getElementById("scores-table");
  table.innerHTML = "";

  // Crée l'en-tête avec les dates
  const headerRow = document.createElement("tr");
  const emptyHeader = document.createElement("th");
  headerRow.appendChild(emptyHeader);

  data.dates.forEach(date => {
    const th = document.createElement("th");
    th.textContent = date;
    headerRow.appendChild(th);
  });

  table.appendChild(headerRow);

  // Crée la ligne avec les noms de golfs
  const golfRow = document.createElement("tr");
  const golfLabel = document.createElement("td");
  golfLabel.textContent = "Golf";
  golfRow.appendChild(golfLabel);

  data.golfs.forEach(golf => {
    const td = document.createElement("td");
    td.textContent = golf;
    golfRow.appendChild(td);
  });

  table.appendChild(golfRow);

  // Crée les lignes des joueurs
  data.joueurs.forEach((joueur, i) => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = joueur;
    row.appendChild(nameCell);

    data.scores.forEach(tour => {
      const td = document.createElement("td");
      td.textContent = tour[i] || "";
      row.appendChild(td);
    });

    table.appendChild(row);
  });

  // Ligne du par
  const parRow = document.createElement("tr");
  const parLabel = document.createElement("td");
  parLabel.textContent = "Par";
  parRow.appendChild(parLabel);

  data.pars.forEach(par => {
    const td = document.createElement("td");
    td.textContent = par || "";
    parRow.appendChild(td);
  });

  table.appendChild(parRow);

  updatePodium(data.joueurs, data.scores, data.pars);
}

// Classement avec médailles et 💩 pour le dernier
function updatePodium(joueurs, scores, pars) {
  const podiumDiv = document.getElementById("podium");
  podiumDiv.innerHTML = "";

  const totalScores = joueurs.map((joueur, i) => {
    const total = scores.reduce((sum, tour) => {
      const val = parseInt(tour[i]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    return { joueur, total };
  });

  totalScores.sort((a, b) => a.total - b.total);

  totalScores.forEach((entry, index) => {
    const span = document.createElement("span");
    let label = entry.joueur;

    if (index === 0) label = `🥇 ${entry.joueur}`;
    else if (index === 1) label = `🥈 ${entry.joueur}`;
    else if (index === 2) label = `🥉 ${entry.joueur}`;
    else if (index === totalScores.length - 1) label = `💩 ${entry.joueur}`;

    span.textContent = label;
    podiumDiv.appendChild(span);
  });
}
