const SHEET_URL = "https://script.google.com/macros/s/AKfycbyqFJVq9NgzgRU4vPw3eXdWBWQv_lgeL3ncnxyWflvJByvZP0wLedrx7z1Qg0B8VxSE/exec";

const parcours = ["Lacanau", "Cabot Les Châteaux", "Cabot Les Vignes", "Seignosse"];
const dates = ["20 juin", "21 juin", "22 juin", "23 juin"];
const par = [72, 73, 70, 71];

fetch(SHEET_URL)
  .then(res => res.json())
  .then(data => {
    const joueurs = data.joueurs;
    const scores = data.scores;

    const table = document.getElementById("scoreTable");
    const thead = document.createElement("thead");
    const header1 = document.createElement("tr");
    header1.innerHTML = `<th>Joueur</th>` + parcours.map(p => `<th colspan="2">${p}</th>`).join('') + `<th>Total</th>`;
    const header2 = document.createElement("tr");
    header2.innerHTML = `<th></th>` + dates.map((d, i) => `<th>Score</th><th>+/- Par</th>`).join('') + `<th></th>`;
    thead.appendChild(header1);
    thead.appendChild(header2);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    joueurs.forEach((joueur, j) => {
      let tr = document.createElement("tr");
      let total = 0;
      let totalDiff = 0;
      tr.innerHTML = `<td>${joueur}</td>`;

      for (let t = 0; t < 4; t++) {
        const val = scores[j][t];
        const parDiff = val !== "" ? val - par[t] : "";
        tr.innerHTML += `
          <td>${val}</td>
          <td>${parDiff !== "" ? (parDiff >= 0 ? "+" : "") + parDiff : ""}</td>
        `;
        if (val !== "") {
          total += parseInt(val);
          totalDiff += parseInt(parDiff);
        }
      }

      tr.innerHTML += `<td>${totalDiff >= 0 ? "+" : ""}${totalDiff}</td>`;
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    // Tri et classement
    const rows = Array.from(tbody.querySelectorAll("tr"));
    rows.sort((a, b) => {
      const aVal = parseInt(a.lastChild.textContent) || 0;
      const bVal = parseInt(b.lastChild.textContent) || 0;
      return aVal - bVal;
    });
    rows.forEach(row => tbody.appendChild(row));

    // Podium
    const podium = document.getElementById("podium");
    const places = ["🥇", "🥈", "🥉"];
    rows.slice(0, 3).forEach((row, i) => {
      const name = row.firstChild.textContent;
      const div = document.createElement("div");
      div.classList.add("podium");
      div.innerHTML = `${places[i]} ${name}`;
      if (i === 0) div.classList.add("winner");
      podium.appendChild(div);
    });

    // Confettis
    if (parseInt(rows[0].lastChild.textContent) < 0) {
      confetti();
      const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-small-group-cheer-and-applause-518.mp3");
      audio.play();
    }
  });

function confetti() {
  for (let i = 0; i < 100; i++) {
    const conf = document.createElement("div");
    conf.style.position = "fixed";
    conf.style.left = Math.random() * 100 + "vw";
    conf.style.top = "-10px";
    conf.style.width = "10px";
    conf.style.height = "10px";
    conf.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    conf.style.animation = `fall ${2 + Math.random() * 3}s linear ${Math.random()}s forwards`;
    document.body.appendChild(conf);
    setTimeout(() => conf.remove(), 6000);
  }
}
