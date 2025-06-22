// URL de ton script Apps Script
const sheetUrl = "https://script.google.com/macros/s/AKfycbxWVI19MMedDEXWhKC5LJSs2J6vTWbZL5EgCdXTAm9Ix0Pp21Gu9wGP_2p4cwmL-O93/exec";

fetch(sheetUrl)
  .then(response => response.json())
  .then(data => {
    console.log("Données reçues :", data);
    displayScores(data);
  })
  .catch(error => {
    console.error("Erreur lors de la récupération des scores :", error);
  });

function displayScores(data) {
  const table = document.getElementById("scores-table");
  table.innerHTML = "";

  // En-tête
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const golfRow = document.createElement("tr");

  headerRow.innerHTML = `<th>Joueur</th>`;
  golfRow.innerHTML = `<th>Golf</th>`;

  data.pars.forEach((par, index) => {
    const date = new Date(data.dates[index]);
    const formattedDate = date.toLocaleDateString("fr-FR");
    headerRow.innerHTML += `<th>${formattedDate}</th>`;
    golfRow.innerHTML += `<th>${data.golfs[index]}</th>`;
  });

  thead.appendChild(headerRow);
  thead.appendChild(golfRow);
  table.appendChild(thead);

  // Corps du tableau
  const tbody = document.createElement("tbody");

  const cumuls = data.joueurs.map((joueur, i) => {
    const scores = data.scores[i];
    const total = scores.reduce((acc, val) => acc + (parseInt(val) || 0), 0);
    return { joueur, scores, total };
  });

  // Tri des scores cumulés croissants
  cumuls.sort((a, b) => a.total - b.total);

  cumuls.forEach((entry, index) => {
    const tr = document.createElement("tr");

    let medal = "";
    if (index === 0) medal = "🥇";
    else if (index === 1) medal = "🥈";
    else if (index === 2) medal = "🥉";
    else if (index === cumuls.length - 1) medal = "💩";

    tr.innerHTML = `<td>${medal} ${entry.joueur}</td>`;

    entry.scores.forEach(score => {
      tr.innerHTML += `<td>${score}</td>`;
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
}
