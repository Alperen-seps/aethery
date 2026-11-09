const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SERVERS_FILE = path.join(DATA_DIR, 'servers.json');
const MODS_FILE = path.join(DATA_DIR, 'mods.json');
const PUNISHMENTS_FILE = path.join(DATA_DIR, 'punishments.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');

function readJson(file) {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Kayıt Ol
app.post('/api/register', (req, res) => {
    let { username, password } = req.body;
    let users = readJson(USERS_FILE);
    let punishments = readJson(PUNISHMENTS_FILE);

    const isBanned = punishments.find(p => p.username === username && p.type === 'BAN' && p.expireAt > Date.now());
    if (isBanned) return res.status(400).json({ error: "Bu kullanıcı banlı! Süre dolana kadar giremez." });

    if (users.find(u => u.username === username)) return res.status(400).json({ error: "Bu kullanıcı adı zaten alınmış!" });

    // ALPEREN_226 otomatik KURUCU rolü alır
    const role = (username === "ALPEREN_226") ? "KURUCU" : "OYUNCU";
    users.push({ username, password, role });
    writeJson(USERS_FILE, users);
    res.json({ success: true, username, role });
});

// Giriş Yap
app.post('/api/login', (req, res) => {
    let { username, password } = req.body;
    let users = readJson(USERS_FILE);
    let punishments = readJson(PUNISHMENTS_FILE);

    const isBanned = punishments.find(p => p.username === username && p.type === 'BAN' && (p.expireAt === -1 || p.expireAt > Date.now()));
    if (isBanned) return res.status(400).json({ error: "Hesabınız banlıdır! Giriş yapamazsınız." });

    let user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(400).json({ error: "Kullanıcı adı veya şifre hatalı!" });

    res.json({ success: true, username: user.username, role: user.role });
});

// Sunucu Listele & Ekle
app.get('/api/servers', (req, res) => res.json(readJson(SERVERS_FILE)));
app.post('/api/servers', (req, res) => {
    let { name, ip, desc, owner } = req.body;
    let punishments = readJson(PUNISHMENTS_FILE);

    // Mute Kontrolü
    const isMuted = punishments.find(p => p.username === owner && p.type === 'MUTE' && p.expireAt > Date.now());
    if (isMuted) return res.status(400).json({ error: `Susturulduğunuz için sunucu paylaşamazsınız! Kalan süre: ${Math.ceil((isMuted.expireAt - Date.now()) / 60000)} dk.` });

    let servers = readJson(SERVERS_FILE);
    servers.push({ id: Date.now(), name, ip, desc, owner });
    writeJson(SERVERS_FILE, servers);
    res.json({ success: true });
});
app.delete('/api/servers/:id', (req, res) => {
    let servers = readJson(SERVERS_FILE);
    servers = servers.filter(s => s.id != req.params.id);
    writeJson(SERVERS_FILE, servers);
    res.json({ success: true });
});

// Mod Listele & Ekle
app.get('/api/mods', (req, res) => res.json(readJson(MODS_FILE)));
app.post('/api/mods', (req, res) => {
    let { name, category, desc, link, owner } = req.body;
    let punishments = readJson(PUNISHMENTS_FILE);

    const isMuted = punishments.find(p => p.username === owner && p.type === 'MUTE' && p.expireAt > Date.now());
    if (isMuted) return res.status(400).json({ error: `Susturulduğunuz için mod paylaşamazsınız! Kalan süre: ${Math.ceil((isMuted.expireAt - Date.now()) / 60000)} dk.` });

    let mods = readJson(MODS_FILE);
    mods.push({ id: Date.now(), name, category, desc, link, owner });
    writeJson(MODS_FILE, mods);
    res.json({ success: true });
});
app.delete('/api/mods/:id', (req, res) => {
    let mods = readJson(MODS_FILE);
    mods = mods.filter(m => m.id != req.params.id);
    writeJson(MODS_FILE, mods);
    res.json({ success: true });
});

// Başvuru API'leri
app.post('/api/apply', (req, res) => {
    let { name, age, role, experience, owner } = req.body;
    let apps = readJson(APPLICATIONS_FILE);
    apps.push({ id: Date.now(), name, age, role, experience, owner, status: "BEKLIYOR" });
    writeJson(APPLICATIONS_FILE, apps);
    res.json({ success: true });
});
app.get('/api/applications', (req, res) => res.json(readJson(APPLICATIONS_FILE)));

// Başvuru Değerlendirme (Kabul/Red) & Otomatik Yetki Verme
app.post('/api/applications/review', (req, res) => {
    let { id, action, role, username } = req.body;
    let apps = readJson(APPLICATIONS_FILE);
    let users = readJson(USERS_FILE);

    let appIndex = apps.findIndex(a => a.id == id);
    if (appIndex !== -1) {
        apps[appIndex].status = action === 'ACCEPT' ? 'KABUL EDILDI' : 'REDDEDILDI';
        writeJson(APPLICATIONS_FILE, apps);
    }

    if (action === 'ACCEPT') {
        let userIndex = users.findIndex(u => u.username === username);
        if (userIndex !== -1) {
            users[userIndex].role = role.toUpperCase();
            writeJson(USERS_FILE, users);
        }
    }

    res.json({ success: true });
});

// Manuel Rol Değiştirme
app.post('/api/admin/set-role', (req, res) => {
    let { targetUser, newRole } = req.body;
    let users = readJson(USERS_FILE);

    let userIndex = users.findIndex(u => u.username === targetUser);
    if (userIndex !== -1) {
        users[userIndex].role = newRole.toUpperCase();
        writeJson(USERS_FILE, users);
        return res.json({ success: true });
    }
    res.status(404).json({ error: "Kullanıcı bulunamadı!" });
});

// Süreli Mute & Ban Verme API
app.post('/api/admin/punish', (req, res) => {
    let { username, type, minutes } = req.body;
    let punishments = readJson(PUNISHMENTS_FILE);

    const expireAt = minutes === -1 ? -1 : Date.now() + (minutes * 60 * 1000);
    punishments = punishments.filter(p => !(p.username === username && p.type === type));

    punishments.push({ username, type, minutes, expireAt, createdAt: Date.now() });
    writeJson(PUNISHMENTS_FILE, punishments);

    res.json({ success: true });
});

// Tüm Kullanıcıları ve Cezaları Getir
app.get('/api/admin/users', (req, res) => res.json(readJson(USERS_FILE)));
app.get('/api/admin/punishments', (req, res) => res.json(readJson(PUNISHMENTS_FILE)));

app.listen(PORT, () => {
    console.log(`Aethery Gelişmiş Forum Sunucusu http://localhost:${PORT} adresinde aktif!`);
});