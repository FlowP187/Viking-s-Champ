const joueurs = ['Flo', 'Viking', 'Matt', 'PL'];
const pars = [72, 72, 72, 72]; // Pars pour les 4 tours

function createRow(joueur) {
  const tr = document.createElement('tr');
  let html = `<td>${joueur}</td>`;
  for (let tour = 1; tour <= 4; tour++) {
    html += `
      <td><input type="number" min="0" data-joueur="${joueur}" data-tour="${tour}" /></td>
      <td id="ecart-${joueur}-t${tour}">E</td>
    `;
  }
  html += `
    <td id="total-${joueur}">0</td>
    <td id="ecart-${joueur}">E</td>
  `;
  tr.innerHTML = html;
  return tr;
}

function ajouterLignePar() {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><strong>Par</strong></td>` +
    pars.map(par => `<td colspan="2"><strong>${par}</strong></td>`).join('') +
    `<td>—</td><td>—</td>`;
  document.getElementById('score-table').appendChild(tr);
}

function calculerTotaux() {
  joueurs.forEach(joueur => {
    let total = 0;
    let ecartTotal = 0;

    for (let tour = 1; tour <= 4; tour++) {
      const input = document.querySelector(`input[data-joueur="${joueur}"][data-tour="${tour}"]`);
      const val = parseInt(input.value) || 0;
      total += val;

      const ecart = val - pars[tour - 1];
      ecartTotal += ecart;

      const ecartTour = ecart === 0 ? 'E' : (ecart > 0 ? `+${ecart}` : ecart);
      document.getElementById(`ecart-${joueur}-t${tour}`).textContent = ecartTour;
    }

    document.getElementById(`total-${joueur}`).textContent = total;
    const ecartFinal = ecartTotal === 0 ? 'E' : (ecartTotal > 0 ? `+${ecartTotal}` : ecartTotal);
    document.getElementById(`ecart-${joueur}`).textContent = ecartFinal;
  });

  enregistrerScores();
}

function enregistrerScores() {
  const scores = {};
  joueurs.forEach(joueur => {
    scores[joueur] = {};
    for (let tour = 1; tour <= 4; tour++) {
      const input = document.querySelector(`input[data-joueur="${joueur}"][data-tour="${tour}"]`);
      scores[joueur][`tour${tour}`] = input.value;
    }
  });
  localStorage.setItem('golfScores', JSON.stringify(scores));
}

function chargerScores() {
  const data = JSON.parse(localStorage.getItem('golfScores'));
  if (data) {
    joueurs.forEach(joueur => {
      for (let tour = 1; tour <= 4; tour++) {
        const input = document.querySelector(`input[data-joueur="${joueur}"][data-tour="${tour}"]`);
        input.value = data[joueur][`tour${tour}`] || '';
      }
    });
    calculerTotaux();
  }
}

function resetScores() {
  localStorage.removeItem('golfScores');
  location.reload();
}

function validerScores() {
  document.querySelectorAll('input').forEach(input => {
    input.disabled = true;
  });
}

function modifierScores() {
  document.querySelectorAll('input').forEach(input => {
    input.disabled = false;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const table = document.getElementById('score-table');
  ajouterLignePar();
  joueurs.forEach(joueur => {
    table.appendChild(createRow(joueur));
  });

  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', calculerTotaux);
  });

  chargerScores();
});
