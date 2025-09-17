/******************************
 * Stockage local
 ******************************/
function getMessages() {
    return JSON.parse(localStorage.getItem("messages")) || [];
}
function saveMessages(messages) {
    localStorage.setItem("messages", JSON.stringify(messages));
}

/******************************
 * Affichage Chat
 ******************************/
function displayChat() {
    const container = document.getElementById("chatMessages");
    if (!container) return;

    container.innerHTML = "";
    getMessages().forEach(m => {
        const div = document.createElement("div");
        div.classList.add("message-card", "fadeIn");
        div.innerHTML = `
            <strong>${m.user}</strong>: ${m.text} <br>
            <small>${new Date(m.date).toLocaleTimeString()}</small>`;
        container.appendChild(div);
    });

    // Scroll en bas
    container.scrollTop = container.scrollHeight;
}

function sendChatMessage() {
    const input = document.getElementById("chatInput");
    if (!input || input.value.trim() === "") return;

    const messages = getMessages();
    messages.push({
        user: "Moi",
        text: input.value,
        date: new Date()
    });
    saveMessages(messages);

    // Afficher + notifier
    displayChat();
    sendNotification("Nouveau message", input.value);

    input.value = "";
}

/******************************
 * Notifications natives
 ******************************/
function sendNotification(title, body) {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
        new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body });
            }
        });
    }
}

/******************************
 * Carte Leaflet + Géolocalisation
 ******************************/
function initMap() {
    const mapDiv = document.getElementById("map");
    if (!mapDiv) return;

    // Créer la carte centrée sur Paris par défaut
    const map = L.map("map").setView([48.8566, 2.3522], 12);

    // Ajouter la couche OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    // Fonction pour ajouter un marker animé
    function addMarker(lat, lon, title) {
        const marker = L.marker([lat, lon]).addTo(map)
            .bindPopup(title);
        // Ajouter animation
        if (marker._icon) marker._icon.classList.add("markerAnim");
    }

    // Géolocalisation de l'utilisateur
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                map.setView([lat, lon], 14);
                addMarker(lat, lon, "📍 Vous êtes ici");
            },
            err => {
                console.warn("Erreur géolocalisation :", err.message);
                alert("Impossible d’obtenir votre position. Vérifiez que vous êtes en HTTPS ou localhost.");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        alert("Votre navigateur ne supporte pas la géolocalisation !");
    }
}

/******************************
 * Animations CSS
 ******************************/
const style = document.createElement("style");
style.innerHTML = `
.fadeIn {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInAnim 0.5s forwards;
}
@keyframes fadeInAnim {
  to { opacity: 1; transform: translateY(0); }
}

.markerAnim {
  animation: bounceMarker 0.6s ease;
}
@keyframes bounceMarker {
  0% { transform: translateY(-20px); }
  50% { transform: translateY(0); }
  100% { transform: translateY(-10px); }
}
`;
document.head.appendChild(style);

/******************************
 * Initialisation au chargement
 ******************************/
document.addEventListener("DOMContentLoaded", () => {
    initMap();
    displayChat();
    if ("Notification" in window) Notification.requestPermission();
});
