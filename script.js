const joueurs = ['Flo', 'Matt', 'Oliv', 'PL'];
const pars = [72, 70, 71, 73]; // Les pars des 4 tours
function createRow(joueur) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${joueur}</td>
    ${[1,2,3,4].map(tour => 
      `<td><input type="number" min="0" data-joueur="${joueur}" data-tour="${tour}" /></td>`
    ).join('')}
    <td id="total-${joueur}">0</td>
  `;
  return tr;
}

function calculerTotaux() {
  joueurs.forEach(joueur => {
    let total = 0;
    for (let tour = 1; tour <= 4; tour++) {
      const input = document.querySelector(`input[data-joueur="${joueur}"][data-tour="${tour}"]`);
      const val = parseInt(input.value) || 0;
      total += val;
    }
    document.getElementById(`total-${joueur}`).textContent = total;
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

document.addEventListener('DOMContentLoaded', () => {
  const table = document.getElementById('score-table');
  joueurs.forEach(joueur => {
    table.appendChild(createRow(joueur));
  });

  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', calculerTotaux);
  });

  chargerScores();
});
