// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-Gu1VOwoOlcK2sUYCI6kkszDY75XsGKs",
  authDomain: "aetherymodandservercommunity.firebaseapp.com",
  projectId: "aetherymodandservercommunity",
  storageBucket: "aetherymodandservercommunity.firebasestorage.app",
  messagingSenderId: "142558402838",
  appId: "1:142558402838:web:a50cd7a7316f7aff44d837",
  measurementId: "G-X6HW7JXZF6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    console.log("Aethery Hub Firebase ile Bağlandı.");

    // Sayfa açıldığında sunucu ve modları veritabanından çek
    loadServersFromFirebase();
    loadModsFromFirebase();

    // --- SUNUCU EKLEME FORMU ---
    const serverForm = document.getElementById("add-server-form");
    if (serverForm) {
        serverForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("server-name").value;
            const ip = document.getElementById("server-ip").value;
            const desc = document.getElementById("server-desc").value;

            try {
                await addDoc(collection(db, "servers"), {
                    name: escapeHtml(name),
                    ip: escapeHtml(ip),
                    desc: escapeHtml(desc),
                    createdAt: new Date()
                });

                alert("Sunucunuz başarıyla tüm dünyayla paylaşıldı!");
                serverForm.reset();
                location.reload();
            } catch (error) {
                console.error("Sunucu eklenirken hata oluştu: ", error);
                alert("Sunucu eklenemedi!");
            }
        });
    }

    // --- MOD YÜKLEME FORMU ---
    const modForm = document.getElementById("add-mod-form");
    if (modForm) {
        modForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("mod-name").value;
            const category = document.getElementById("mod-category").value;
            const desc = document.getElementById("mod-desc").value;
            const link = document.getElementById("mod-link").value;

            try {
                await addDoc(collection(db, "mods"), {
                    name: escapeHtml(name),
                    category: escapeHtml(category),
                    desc: escapeHtml(desc),
                    link: escapeHtml(link),
                    createdAt: new Date()
                });

                alert("Modunuz başarıyla tüm dünyayla paylaşıldı!");
                modForm.reset();
                location.reload();
            } catch (error) {
                console.error("Mod eklenirken hata oluştu: ", error);
                alert("Mod eklenemedi!");
            }
        });
    }
});

// Firebase'den Sunucuları Çekme
async function loadServersFromFirebase() {
    const serverList = document.getElementById("server-list");
    if (!serverList) return;

    try {
        const querySnapshot = await getDocs(collection(db, "servers"));
        querySnapshot.forEach((doc) => {
            const server = doc.data();
            const newCard = document.createElement("div");
            newCard.classList.add("server-card");
            newCard.innerHTML = `
                <h3>${server.name}</h3>
                <p class="ip">IP: ${server.ip}</p>
                <p class="mod-desc">${server.desc}</p>
                <span class="badge" style="background: #e91e63;">Topluluk</span>
            `;
            serverList.prepend(newCard);
        });
    } catch (e) {
        console.error("Sunucular yüklenirken hata:", e);
    }
}

// Firebase'den Modları Çekme
async function loadModsFromFirebase() {
    const modList = document.getElementById("mod-list");
    if (!modList) return;

    try {
        const querySnapshot = await getDocs(collection(db, "mods"));
        querySnapshot.forEach((doc) => {
            const mod = doc.data();
            const newCard = document.createElement("div");
            newCard.classList.add("mod-card");
            newCard.innerHTML = `
                <h3>${mod.name}</h3>
                <p class="mod-desc">${mod.desc}</p>
                <span class="mod-category">${mod.category}</span>
                <a href="${mod.link}" class="btn-download" target="_blank">İndir (.jar / .zip)</a>
            `;
            modList.prepend(newCard);
        });
    } catch (e) {
        console.error("Modlar yüklenirken hata:", e);
    }
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}