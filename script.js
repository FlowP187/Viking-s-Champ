const joueurs = ["Flo", "Matt", "PL", "Viking"];
const pars = [72, 70, 71, 73];

function initialiserTableau() {
  const tbody = document.getElementById("scoreTable");
  tbody.innerHTML = "";
  joueurs.forEach(joueur => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-joueur", joueur);
    tr.innerHTML = `
      <td class="nom">${joueur}</td>
      <td>-</td>
      ${pars.map((_, i) => `<td><input type="number" data-joueur="${joueur}" data-tour="${i + 1}"></td>`).join('')}
      <td id="total-${joueur}">0</td>
      <td id="ecart-${joueur}">E</td>
    `;
    tbody.appendChild(tr);
  });
}

function validerScores() {
  document.querySelectorAll("input").forEach(input => {
    input.disabled = true;
  });
  calculerTotaux();
}

function modifierScores() {
  document.querySelectorAll("input").forEach(input => {
    input.disabled = false;
  });
}

function reinitialiserScores() {
  if (confirm("Voulez-vous vraiment réinitialiser tous les scores ?")) {
    document.querySelectorAll("input").forEach(input => {
      input.value = "";
      input.disabled = false;
    });

    localStorage.removeItem("scoresGolf");

    joueurs.forEach(joueur => {
      document.getElementById(`total-${joueur}`).textContent = "0";
      document.getElementById(`ecart-${joueur}`).textContent = "E";
    });

    document.getElementById("classement-liste").innerHTML = "";
    document.getElementById("total-global").textContent = "";
  }
}

function calculerTotaux() {
  const scores = [];

  joueurs.forEach(joueur => {
    let total = 0;
    let ecartTotal = 0;
    let scoresRenseignés = 0;

    for (let tour = 1; tour <= 4; tour++) {
      const input = document.querySelector(`input[data-joueur="${joueur}"][data-tour="${tour}"]`);
      const val = input.value ? parseInt(input.value) : null;
      if (val !== null && !isNaN(val)) {
        total += val;
        ecartTotal += val - pars[tour - 1];
        scoresRenseignés++;
      }
    }

    const totalCell = document.getElementById(`total-${joueur}`);
    const ecartCell = document.getElementById(`ecart-${joueur}`);

    totalCell.textContent = scoresRenseignés > 0 ? total : "-";
    ecartCell.textContent =
      scoresRenseignés > 0
        ? ecartTotal === 0
          ? "E"
          : (ecartTotal > 0 ? `+${ecartTotal}` : ecartTotal)
        : "E";

    scores.push({ joueur, total, ecart: scoresRenseignés > 0 ? ecartTotal : 9999 });
  });

  enregistrerScores();
  trierEtMettreAJourTableau(scores);
  mettreAJourClassement(scores);
}

function trierEtMettreAJourTableau(scores) {
  scores.sort((a, b) => a.ecart - b.ecart);
  const tbody = document.getElementById("scoreTable");
  scores.forEach(score => {
    const ligne = document.querySelector(`tr[data-joueur="${score.joueur}"]`);
    tbody.appendChild(ligne);
  });
}

function enregistrerScores() {
  const scores = {};
  document.querySelectorAll("input").forEach(input => {
    const joueur = input.dataset.joueur;
    const tour = input.dataset.tour;
    scores[`${joueur}-${tour}`] = input.value;
  });
  localStorage.setItem("scoresGolf", JSON.stringify(scores));
}

function restaurerScores() {
  const scores = JSON.parse(localStorage.getItem("scoresGolf"));
  if (scores) {
    Object.entries(scores).forEach(([key, val]) => {
      const [joueur, tour] = key.split("-");
      const input = document.querySelector(`input[data-joueur="${joueur}"][data-tour="${tour}"]`);
      if (input) input.value = val;
    });
    calculerTotaux();
  }
}

function mettreAJourClassement(scores) {
  const liste = document.getElementById("classement-liste");
  liste.innerHTML = "";

  scores.sort((a, b) => a.ecart - b.ecart);

  scores.forEach((s, index) => {
    const li = document.createElement("li");
    const affichage = s.ecart === 0 ? "E" : (s.ecart === 9999 ? "-" : (s.ecart > 0 ? `+${s.ecart}` : s.ecart));

    let badge = "";
    let classe = "";

    if (s.ecart === 9999) return;

    if (index === 0) {
      badge = "🥇";
      classe = "podium-1 glow";
      if (s.ecart < 0) {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        const audio = document.getElementById("victoire-audio");
        audio.currentTime = 0;
        audio.play();
      }
    } else if (index === 1) {
      badge = "🥈";
      classe = "podium-2";
    } else if (index === 2) {
      badge = "🥉";
      classe = "podium-3";
    }

    li.textContent = `${badge} ${s.joueur} (${affichage})`;
    if (classe) li.className = classe;
    liste.appendChild(li);
  });

  const totalEcart = scores.reduce((acc, s) => acc + (s.ecart === 9999 ? 0 : s.ecart), 0);
  const texteGlobal = totalEcart === 0
    ? "⛳ Total cumulé : Égal au par"
    : `⛳ Total cumulé : ${totalEcart > 0 ? "+" : ""}${totalEcart} au-dessus du par`;
  document.getElementById("total-global").textContent = texteGlobal;
}

// Initialisation
initialiserTableau();
restaurerScores();
