const SHEET_URL = "https://script.google.com/macros/s/AKfycbyqFJVq9NgzgRU4vPw3eXdWBWQv_lgeL3ncnxyWflvJByvZP0wLedrx7z1Qg0B8VxSE/exec";
const AUTHORIZED_EMAIL = "Florian.pierre91@gmail.com";
const parByTour = [72, 72, 71, 73];
const tourNames = ["Lacanau", "Cabot Golf Les Châteaux", "Cabot Golf Les Vignes", "Seignosse"];
let isEditor = false;
let data = [];

function fetchScores() {
  fetch(SHEET_URL)
    .then(res => res.json())
    .then(res => {
      data = res;
      checkEditor();
    });
}

function checkEditor() {
  google.script.run.withSuccessHandler(email => {
    isEditor = (email === AUTHORIZED_EMAIL);
    renderTable();
  }).getActiveUserEmail?.() ?? renderTable(); // fallback for static mode
}

function renderTable() {
  const container = document.getElementById("table-container");
  const headers = ["Joueur", ...tourNames, "Cumul", "Écart"];
  const players = data.slice(1);
  const scores = players.map(p => {
    const raw = p.slice(1).map(s => parseInt(s) || null);
    const total = raw.reduce((acc, val) => val !== null ? acc + val : acc, 0);
    const ecart = raw.reduce((acc, val, i) => val !== null ? acc + (val - parByTour[i]) : acc, 0);
    return { name: p[0], raw, total, ecart };
  });

  scores.sort((a, b) => a.ecart - b.ecart);

  let html = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>`;
  scores.forEach((p, rowIdx) => {
    html += `<tr${rowIdx === 0 ? ' class="glow"' : ''}><td>${p.name}</td>`;
    p.raw.forEach((s, i) => {
      const val = s !== null ? s : "";
      html += `<td><input type="number" data-player="${p.name}" data-tour="${i}" value="${val}" ${isEditor ? '' : 'readonly'} /></td>`;
    });
    html += `<td>${p.total}</td><td>${p.ecart > 0 ? "+" : ""}${p.ecart}</td></tr>`;
  });
  html += "</tbody></table>";

  if (isEditor) {
    html += `<button onclick="saveScores()">Valider</button>`;
  }

  container.innerHTML = html;
  updatePodium(scores);
  maybeCelebrate(scores[0].ecart);
}

function updatePodium(scores) {
  const podium = document.getElementById("podium");
  const medals = ["🥇", "🥈", "🥉"];
  podium.innerHTML = `<h2>Classement</h2><ol>${
    scores.slice(0, 3).map((p, i) => `<li>${medals[i]} ${p.name}</li>`).join("")
  }</ol>`;
}

function saveScores() {
  const inputs = document.querySelectorAll("input[type='number']");
  const players = [...new Set([...inputs].map(i => i.dataset.player))];
  const toSend = players.map(p => {
    const playerRow = [p];
    for (let t = 0; t < 4; t++) {
      const input = document.querySelector(`input[data-player="${p}"][data-tour="${t}"]`);
      playerRow.push(input?.value || "");
    }
    return playerRow;
  });

  fetch(SHEET_URL, {
    method: "POST",
    body: JSON.stringify(toSend),
    headers: { "Content-Type": "application/json" }
  }).then(() => fetchScores());
}

function maybeCelebrate(ecart) {
  if (ecart < 0) {
    const canvas = document.getElementById("confetti-canvas");
    const sound = document.getElementById("victory-sound");
    sound.play();
    confetti.create(canvas, { resize: true, useWorker: true })({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  }
}

window.onload = fetchScores;
