const joueurs = ["Flo", "Matt", "PL", "Viking"];
const pars = [72, 70, 71, 73];

function initialiserTableau() {
  const tbody = document.getElementById("scoreTable");
  joueurs.forEach(joueur => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${joueur}</td>
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

function calculerTotaux() {
  joueurs.forEach(joueur => {
    let total = 0;
    let ecartTotal = 0;

    for (let tour = 1; tour <= 4; tour++) {
      const input = document.querySelector(`input[data-joueur="${joueur}"][data-tour="${tour}"]`);
      const val = parseInt(input.value) || 0;
      total += val;
      ecartTotal += val - pars[tour - 1];
    }

    document.getElementById(`total-${joueur}`).textContent = total;
    const ecartFinal = ecartTotal === 0 ? "E" : (ecartTotal > 0 ? `+${ecartTotal}` : ecartTotal);
    document.getElementById(`ecart-${joueur}`).textContent = ecartFinal;
  });

  enregistrerScores();
  mettreAJourClassement();
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
      const input = document.querySelector(`input[data-joueur="${key.split('-')[0]}"][data-tour="${key.split('-')[1]}"]`);
      if (input) input.value = val;
    });
    calculerTotaux();
  }
}

function mettreAJourClassement() {
  const resultats = joueurs.map(joueur => {
    const ecartText = document.getElementById(`ecart-${joueur}`).textContent;
    const ecart = ecartText === "E" ? 0 : parseInt(ecartText);
    return { joueur, ecart };
  });

  resultats.sort((a, b) => a.ecart - b.ecart);

  const liste = document.getElementById("classement-liste");
  liste.innerHTML = "";

  resultats.forEach(({ joueur, ecart }, index) => {
    const li = document.createElement("li");
    const affichage = ecart === 0 ? "E" : (ecart > 0 ? `+${ecart}` : ecart);

    let badge = "";
    let classe = "";

    if (index === 0) {
      badge = "🥇";
      classe = "podium-1 glow";

      if (ecart < 0) {
        // Confettis 🎉
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });

        // Son 🔊
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

    li.textContent = `${badge} ${joueur} (${affichage})`;
    if (classe) li.className = classe;
    liste.appendChild(li);
  });

  const totalEcart = resultats.reduce((acc, val) => acc + val.ecart, 0);
  const texteGlobal = totalEcart === 0
    ? "⛳ Total cumulé : Égal au par"
    : `⛳ Total cumulé : ${totalEcart > 0 ? "+" : ""}${totalEcart} au-dessus du par`;
  document.getElementById("total-global").textContent = texteGlobal;
}

// Initialisation
initialiserTableau();
restaurerScores();
