// Zepva veya benzeri sitelerin altyapısını oluşturan Web client URL'si
// Kendi Eaglercraft / WebMC client tarayıcı derlemeni buraya yönlendirebilirsin
const GAME_CLIENT_URL = "https://eaglercraft.com/mc/1.8.8/";

function launchGame() {
    const landing = document.getElementById('landing-page');
    const container = document.getElementById('game-container');
    const frame = document.getElementById('game-frame');

    landing.style.display = 'none';
    container.style.display = 'block';

    if (!frame.src) {
        frame.src = GAME_CLIENT_URL;
    }
}

function closeGame() {
    const landing = document.getElementById('landing-page');
    const container = document.getElementById('game-container');
    const frame = document.getElementById('game-frame');

    container.style.display = 'none';
    landing.style.display = 'flex';
    frame.src = ""; // Belleği temizle
}