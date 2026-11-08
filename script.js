document.addEventListener("DOMContentLoaded", () => {
    console.log("Aethery Hub Yüklendi.");

    const form = document.getElementById("add-server-form");
    const serverList = document.getElementById("server-list");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault(); // Sayfanın yenilenmesini engelle

            const name = document.getElementById("server-name").value;
            const ip = document.getElementById("server-ip").value;
            const desc = document.getElementById("server-desc").value;

            // Yeni sunucu kartı oluştur
            const newCard = document.createElement("div");
            newCard.classList.add("server-card");
            newCard.innerHTML = `
                <h3>${escapeHtml(name)}</h3>
                <p class="ip">IP: ${escapeHtml(ip)}</p>
                <p class="mod-desc">${escapeHtml(desc)}</p>
                <span class="badge" style="background: #e91e63;">Topluluk</span>
            `;

            // Listeye en üste ekle
            serverList.prepend(newCard);

            // Formu temizle
            form.reset();
            alert("Sunucunuz başarıyla eklendi!");
        });
    }
});

// Güvenlik için basit HTMLescape fonksiyonu
function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}