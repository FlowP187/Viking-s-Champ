const SHEET_URL = "https://script.google.com/macros/s/AKfycbzS5ljYjr3BjqlLHX_WR6bx8MjiT-91UGFb2F4bakXehLr9gKhxfEQQlKs_qIjQmxXR/exec";

document.addEventListener('DOMContentLoaded', () => {
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
});

function displayScores(data) {
  if (!data.joueurs || !Array.isArray(data.joueurs)) {
    console.error("La donnée 'joueurs' est manquante ou invalide :", data.joueurs);
    return;
  }
  if (!data.scores || !Array.isArray(data.scores)) {
    console.error("La donnée 'scores' est manquante ou invalide :", data.scores);
    return;
  }
  if (!data.pars || !Array.isArray(data.pars)) {
    console.error("La donnée 'pars' est manquante ou invalide :", data.pars);
    return;
  }

  const table = document.getElementById("scores-table");
  if (!table) {
    console.error("Élément #scores-table non trouvé dans le DOM.");
    return;
  }

  const parcours = ["Lacanau", "Cabot Golf Les Châteaux", "Cabot Golf Les Vignes", "Seignosse"];
  const dates = ["20/06", "21/06", "22/06", "23/06"];
  const pars = data.pars;

  table.innerHTML = ""; // On vide le tableau avant de remplir

  // En-têtes
  const header = document.createElement("tr");
  header.innerHTML = `<th>Joueur</th>` + dates.map((date, i) => `<th>${date}<br><small>${parcours[i]}</small></th>`).join("") + `<th>Total</th><th>Écart</th>`;
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
  const rows = Array.from(table.querySelectorAll("tr")).slice(1);
  rows.sort((a, b) => parseInt(a.dataset.ecart) - parseInt(b.dataset.ecart));
  rows.forEach(row => table.appendChild(row));
}

function displayClassement(data) {
  const classement = document.getElementById("podium");
  if (!classement) {
    console.error("Élément #podium non trouvé dans le DOM.");
    return;
  }
  if (!data.joueurs || !Array.isArray(data.joueurs)) {
    console.error("La donnée 'joueurs' est manquante ou invalide :", data.joueurs);
    return;
  }
  if (!data.scores || !Array.isArray(data.scores)) {
    console.error("La donnée 'scores' est manquante ou invalide :", data.scores);
    return;
  }
  if (!data.pars || !Array.isArray(data.pars)) {
    console.error("La donnée 'pars' est manquante ou invalide :", data.pars);
    return;
  }

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

  if (classementFinal[0] && classementFinal[0].ecart < 0) {
    playVictory();
  }
}

function playVictory() {
  const sound = document.getElementById("victory-sound");
  if (sound) {
    sound.play();
  } else {
    console.warn("Élément #victory-sound non trouvé dans le DOM.");
  }

  const confetti = document.createElement("div");
  confetti.innerHTML = "🎉🎉🎉";
  confetti.style.position = "fixed";
  confetti.style.top = "20px";
  confetti.style.left = "50%";
  confetti.style.transform = "translateX(-50%)";
  confetti.style.fontSize = "3em";
  document.body.appendChild(confetti);
  setTimeout(() => confetti.remove(), 3000);
}
