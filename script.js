// --- Publication d’objets ---
const objetForm = document.getElementById("objetForm");
const objetNom = document.getElementById("objetNom");
const objetDesc = document.getElementById("objetDesc");
const listeObjets = document.getElementById("listeObjets");

// Charger les objets sauvegardés
let objets = JSON.parse(localStorage.getItem("objets")) || [];
renderObjets();

// Initialiser la carte
const map = L.map("map").setView([48.8566, 2.3522], 13); // Paris par défaut

// Charger tiles OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Stockage des marqueurs
let markers = [];

// Récupérer localisation de l’utilisateur
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    map.setView([lat, lon], 14);
    L.marker([lat, lon]).addTo(map).bindPopup("Vous êtes ici !");
  }, () => {
    alert("Impossible d’obtenir votre localisation.");
  });
} else {
  alert("La géolocalisation n’est pas supportée par ce navigateur.");
}

// Gestion du formulaire
objetForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newObjet = {
    nom: objetNom.value,
    desc: objetDesc.value,
    lat: map.getCenter().lat,
    lon: map.getCenter().lng
  };
  objets.push(newObjet);
  localStorage.setItem("objets", JSON.stringify(objets));
  renderObjets();
  renderMarkers();
  objetForm.reset();
});

function renderObjets() {
  listeObjets.innerHTML = "";
  objets.forEach((o) => {
    const li = document.createElement("li");
    li.textContent = `${o.nom} : ${o.desc}`;
    listeObjets.appendChild(li);
  });
}

function renderMarkers() {
  // Supprimer anciens marqueurs
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  // Ajouter nouveaux
  objets.forEach(o => {
    const marker = L.marker([o.lat, o.lon]).addTo(map)
      .bindPopup(`<b>${o.nom}</b><br>${o.desc}`);
    markers.push(marker);
  });
}

// Charger marqueurs au démarrage
renderMarkers();

// --- Chat ---
const chatBox = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

let messages = JSON.parse(localStorage.getItem("messages")) || [];
renderChat();

sendBtn.addEventListener("click", () => {
  if (chatInput.value.trim() === "") return;
  const msg = chatInput.value;
  messages.push(msg);
  localStorage.setItem("messages", JSON.stringify(messages));
  renderChat();
  chatInput.value = "";
});

function renderChat() {
  chatBox.innerHTML = "";
  messages.forEach(m => {
    const div = document.createElement("div");
    div.classList.add("message");
    div.textContent = m;
    chatBox.appendChild(div);
  });
  chatBox.scrollTop = chatBox.scrollHeight; // auto-scroll
}
