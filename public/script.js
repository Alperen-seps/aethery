document.addEventListener("DOMContentLoaded", () => {
    console.log("Aethery Hub Sunucu Modunda Çalışıyor.");
    checkAuthNavbar();
    loadServers();
    loadMods();
    loadApplications();
    loadUsersList();

    // --- GİRİŞ / KAYIT ---
    const authForm = document.getElementById("auth-form");
    const toggleBtn = document.getElementById("toggle-auth-mode");
    let isLoginMode = false;

    if (toggleBtn) {
        toggleBtn.addEventListener("click", (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            document.getElementById("form-title").textContent = isLoginMode ? "Giriş Yap" : "Kayıt Ol";
            document.getElementById("auth-btn").textContent = isLoginMode ? "Giriş Yap" : "Kayıt Ol";
            document.getElementById("toggle-text").textContent = isLoginMode ? "Hesabın yok mu?" : "Zaten hesabın var mı?";
            toggleBtn.textContent = isLoginMode ? "Kayıt Ol" : "Giriş Yap";
        });
    }

    if (authForm) {
        authForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("auth-username").value.trim();
            const password = document.getElementById("auth-password").value.trim();
            const endpoint = isLoginMode ? "/api/login" : "/api/register";

            try {
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem("aethery_user", data.username);
                    localStorage.setItem("aethery_role", data.role || "OYUNCU");
                    alert(isLoginMode ? "Giriş başarılı!" : "Kayıt olundu!");
                    window.location.href = "index.html";
                } else {
                    alert(data.error);
                }
            } catch (err) {
                alert("Sunucu bağlantı hatası!");
            }
        });
    }

    // Ceza / Rol Formu Seçenek Değişimi
    const punishTypeSelect = document.getElementById("punish-type");
    if (punishTypeSelect) {
        punishTypeSelect.addEventListener("change", (e) => {
            const isRole = e.target.value === "SET_ROLE";
            document.getElementById("select-role").style.display = isRole ? "block" : "none";
            document.getElementById("punish-time").style.display = isRole ? "none" : "block";
        });
    }

    // Ceza & Rol Uygulama Formu
    const punishForm = document.getElementById("punish-form");
    if (punishForm) {
        punishForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const targetUser = document.getElementById("target-username").value.trim();
            const type = document.getElementById("punish-type").value;
            const minutes = parseInt(document.getElementById("punish-time").value);
            const role = document.getElementById("select-role").value;

            if (type === "SET_ROLE") {
                const res = await fetch("/api/admin/set-role", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ targetUser, newRole: role })
                });
                if (res.ok) alert(`${targetUser} kullanıcısının rolü ${role} yapıldı!`);
                else alert("Hata oluştu.");
            } else {
                const res = await fetch("/api/admin/punish", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: targetUser, type, minutes })
                });
                if (res.ok) alert(`${targetUser} için ${type} işlemi uygulandı!`);
                else alert("İşlem yapılamadı.");
            }
            punishForm.reset();
            loadUsersList();
        });
    }

    // --- SUNUCU EKLEME ---
    const serverForm = document.getElementById("add-server-form");
    if (serverForm) {
        serverForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const owner = localStorage.getItem("aethery_user");
            if (!owner) { alert("Önce giriş yapmalısın!"); window.location.href = "login.html"; return; }

            const res = await fetch("/api/servers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: document.getElementById("server-name").value,
                    ip: document.getElementById("server-ip").value,
                    desc: document.getElementById("server-desc").value,
                    owner
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Sunucu eklendi!");
                serverForm.reset();
                loadServers();
            } else {
                alert(data.error);
            }
        });
    }

    // --- MOD EKLEME ---
    const modForm = document.getElementById("add-mod-form");
    if (modForm) {
        modForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const owner = localStorage.getItem("aethery_user");
            if (!owner) { alert("Önce giriş yapmalısın!"); window.location.href = "login.html"; return; }

            const res = await fetch("/api/mods", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: document.getElementById("mod-name").value,
                    category: document.getElementById("mod-category").value,
                    desc: document.getElementById("mod-desc").value,
                    link: document.getElementById("mod-link").value,
                    owner
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Mod yayınlandı!");
                modForm.reset();
                loadMods();
            } else {
                alert(data.error);
            }
        });
    }

    // --- YETKİLİ BAŞVURU ---
    const applyForm = document.getElementById("apply-form");
    if (applyForm) {
        applyForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const owner = localStorage.getItem("aethery_user");
            if (!owner) { alert("Başvuru yapmak için giriş yapmalısın!"); window.location.href = "login.html"; return; }

            const res = await fetch("/api/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: document.getElementById("apply-name").value,
                    age: document.getElementById("apply-age").value,
                    role: document.getElementById("apply-role").value,
                    experience: document.getElementById("apply-experience").value,
                    owner
                })
            });

            if (res.ok) {
                alert("Başvurun başarıyla yöneticilere iletildi!");
                applyForm.reset();
            } else {
                alert("Başvuru gönderilemedi.");
            }
        });
    }
});

async function checkAuthNavbar() {
    const authLink = document.getElementById("nav-auth-link");
    const adminLink = document.getElementById("nav-admin-link");
    const user = localStorage.getItem("aethery_user");

    if (!user) return;

    let role = "OYUNCU";
    try {
        const res = await fetch("/api/admin/users");
        const users = await res.json();
        const currentUserData = users.find(u => u.username === user);

        if (currentUserData) {
            role = currentUserData.role || "OYUNCU";
            localStorage.setItem("aethery_role", role);
        }
    } catch (e) {
        role = localStorage.getItem("aethery_role") || "OYUNCU";
    }

    if (user === "ALPEREN_226" || ["KURUCU", "ADMIN", "MOD", "MODERATÖR"].includes(role)) {
        if (adminLink) adminLink.style.display = "inline";
    }

    if (authLink) {
        authLink.textContent = `[${role}] ${user} (Çıkış)`;
        authLink.href = "#";
        authLink.onclick = () => { localStorage.clear(); location.reload(); };
    }
}

async function loadServers() {
    const serverList = document.getElementById("server-list");
    if (!serverList) return;
    const res = await fetch("/api/servers");
    const servers = await res.json();
    const currentUser = localStorage.getItem("aethery_user");
    const role = localStorage.getItem("aethery_role");
    const canDelete = currentUser === "ALPEREN_226" || ["KURUCU", "ADMIN", "MOD", "MODERATÖR"].includes(role);

    serverList.innerHTML = "";
    servers.reverse().forEach(s => {
        let btns = "";
        if (canDelete || currentUser === s.owner) btns += `<button class="btn-delete" onclick="deleteServer(${s.id})">❌ Sil</button>`;
        if (canDelete) btns += `<button class="btn-ban" onclick="quickPunish('${s.owner}', 'MUTE', 30)">🔇 Mute (30dk)</button><button class="btn-ban" style="background:#d32f2f" onclick="quickPunish('${s.owner}', 'BAN', -1)">🚫 Kalıcı Ban</button>`;

        const card = document.createElement("div");
        card.classList.add("server-card");
        card.innerHTML = `<h3>${s.name}</h3><p class="ip">IP: ${s.ip}</p><p class="mod-desc">${s.desc}</p><span class="badge">Sahip: ${s.owner}</span><div style="margin-top:10px; display:flex; gap:5px; flex-wrap:wrap;">${btns}</div>`;
        serverList.appendChild(card);
    });
}

async function loadMods() {
    const modList = document.getElementById("mod-list");
    if (!modList) return;
    const res = await fetch("/api/mods");
    const mods = await res.json();
    const currentUser = localStorage.getItem("aethery_user");
    const role = localStorage.getItem("aethery_role");
    const canDelete = currentUser === "ALPEREN_226" || ["KURUCU", "ADMIN", "MOD", "MODERATÖR"].includes(role);

    modList.innerHTML = "";
    mods.reverse().forEach(m => {
        let btns = "";
        if (canDelete || currentUser === m.owner) btns += `<button class="btn-delete" onclick="deleteMod(${m.id})">❌ Sil</button>`;
        if (canDelete) btns += `<button class="btn-ban" onclick="quickPunish('${m.owner}', 'MUTE', 30)">🔇 Mute (30dk)</button><button class="btn-ban" style="background:#d32f2f" onclick="quickPunish('${m.owner}', 'BAN', -1)">🚫 Kalıcı Ban</button>`;

        const card = document.createElement("div");
        card.classList.add("mod-card");
        card.innerHTML = `<h3>${m.name}</h3><p class="mod-desc">${m.desc}</p><span class="mod-category">${m.category}</span><a href="${m.link}" class="btn-download" target="_blank">İndir</a><div style="margin-top:10px; display:flex; gap:5px; flex-wrap:wrap;">${btns}</div>`;
        modList.appendChild(card);
    });
}

async function loadApplications() {
    const appList = document.getElementById("applications-list");
    if (!appList) return;
    const currentUser = localStorage.getItem("aethery_user");
    const role = localStorage.getItem("aethery_role");

    if (currentUser !== "ALPEREN_226" && !["KURUCU", "ADMIN"].includes(role)) {
        appList.innerHTML = "<p style='color: #ff5555;'>Bu alanı görme yetkiniz yok!</p>";
        return;
    }

    const res = await fetch("/api/applications");
    const apps = await res.json();

    appList.innerHTML = "";
    if (apps.length === 0) {
        appList.innerHTML = "<p style='color: #888;'>Henüz başvuru bulunmuyor.</p>";
        return;
    }

    apps.reverse().forEach(app => {
        const card = document.createElement("div");
        card.classList.add("server-card");
        let actionBtns = app.status === "BEKLIYOR" ? `
            <button class="btn-primary" style="background:#2e7d32; margin-top:10px;" onclick="reviewApp(${app.id}, 'ACCEPT', '${app.role}', '${app.owner}')">✅ Kabul Et & Rolü Ver</button>
            <button class="btn-delete" style="margin-top:10px;" onclick="reviewApp(${app.id}, 'REJECT', '${app.role}', '${app.owner}')">❌ Reddet</button>
        ` : `<span class="badge" style="background:#444; margin-top:10px;">Durum: ${app.status}</span>`;

        card.innerHTML = `
            <h3 style="color: #55FF55;">Başvurulan Rol: ${app.role}</h3>
            <p><strong>Başvuran:</strong> ${app.owner} (Adı: ${app.name}, Yaş: ${app.age})</p>
            <p><strong>Tecrübe:</strong> ${app.experience}</p>
            <div>${actionBtns}</div>
        `;
        appList.appendChild(card);
    });
}

async function loadUsersList() {
    const usersList = document.getElementById("users-list");
    if (!usersList) return;
    const res = await fetch("/api/admin/users");
    const users = await res.json();

    usersList.innerHTML = "";
    users.forEach(u => {
        const card = document.createElement("div");
        card.classList.add("server-card");
        card.innerHTML = `
            <h4 style="color:#55FF55;">${u.username}</h4>
            <span class="badge" style="background:#222; margin-top:5px;">Rol: ${u.role || 'OYUNCU'}</span>
        `;
        usersList.appendChild(card);
    });
}

window.reviewApp = async function(id, action, role, username) {
    await fetch("/api/applications/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, role, username })
    });
    alert(action === 'ACCEPT' ? `${username} kullanıcısına ${role} rolü verildi!` : "Başvuru reddedildi.");
    loadApplications();
    loadUsersList();
};

window.quickPunish = async function(username, type, minutes) {
    if (confirm(`${username} adlı kullanıcıya ${type} cezası vermek istediğinize emin misiniz?`)) {
        await fetch('/api/admin/punish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, type, minutes })
        });
        alert("Ceza uygulandı!");
        loadServers();
        loadMods();
    }
};

window.deleteServer = async function(id) {
    if (confirm("Silmek istiyor musun?")) {
        await fetch(`/api/servers/${id}`, { method: 'DELETE' });
        loadServers();
    }
};

window.deleteMod = async function(id) {
    if (confirm("Silmek istiyor musun?")) {
        await fetch(`/api/mods/${id}`, { method: 'DELETE' });
        loadMods();
    }
};