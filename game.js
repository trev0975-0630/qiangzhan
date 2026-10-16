const state = {
  loggedIn: false, username: '', level: 0, coins: 0, kills: 0, wins: 0, screen: 'home', owned: [],
  roomCreated: false, roomPrivacy: 'public', roomCode: '', tutorialStep: 0, tutorialComplete: false,
  battlePlayed: false, storeUnlocked: false,
  friends: [
    { name: '泡麵超人', level: 0, status: '在大廳', avatar: 'P', color: 'pink', online: true },
    { name: 'Kira_07', level: 0, status: '進行中', avatar: 'K', color: 'yellow', online: true },
    { name: '阿波羅', level: 0, status: '離線', avatar: 'A', color: 'cyan', online: false },
    { name: 'Mochi貓', level: 0, status: '在大廳', avatar: 'M', color: 'pink', online: true }
  ], party: []
};

const cosmetics = [
  { name: '量子幽靈', desc: '角色造型 · 傳奇', price: 1200, icon: '◈', skin: 'skin-1' },
  { name: '櫻火女王', desc: '角色造型 · 史詩', price: 950, icon: '✦', skin: 'skin-2' },
  { name: '黃金獵手', desc: '武器塗裝 · 稀有', price: 780, icon: '◒', skin: 'skin-3' },
  { name: '虛空裂痕', desc: '武器塗裝 · 史詩', price: 1100, icon: '⌁', skin: 'skin-4' }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
function avatar(member) { return `<div class="avatar avatar-${member.color}">${member.avatar}</div>`; }
function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2800); }

function updateProfile() {
  const name = state.username || '新兵';
  const profile = $('.profile-mini');
  if (profile) profile.innerHTML = `${avatar({ avatar: name.slice(0, 1).toUpperCase(), color: 'cyan' })}<div><strong>${name}</strong><small>LV. ${state.level}　<span class="online-dot"></span> 在線</small></div><button class="icon-button" aria-label="設定">⚙</button>`;
  $('#level-stat').textContent = state.level; $('#kills-stat').textContent = state.kills; $('#wins-stat').textContent = state.wins;
}
function updateCoins() { ['#coin-balance', '#coin-balance-armory'].forEach((selector) => { const el = $(selector); if (el) el.textContent = state.coins.toLocaleString(); }); }
function updateRoomUI() {
  const status = $('#room-status'); const code = $('#room-code');
  if (status) status.textContent = state.roomCreated ? (state.roomPrivacy === 'public' ? '公開房間' : '私人房間') : '尚未建立';
  if (code) code.textContent = state.roomCreated ? state.roomCode : '尚未建立';
  $$('.privacy-btn').forEach((button) => button.classList.toggle('active', button.dataset.privacy === state.roomPrivacy));
}
function updateStoreUI() {
  $('#locked-shop')?.classList.toggle('hidden', state.storeUnlocked); $('#shop-tabs')?.classList.toggle('hidden', !state.storeUnlocked); $('#shop-grid')?.classList.toggle('hidden', !state.storeUnlocked); $('.locked-nav')?.classList.toggle('store-open', state.storeUnlocked);
}
function renderSquad() {
  const list = $('#squad-row'); if (!list) return;
  list.innerHTML = state.party.map((member) => `<div class="squad-member">${avatar(member)}<div><strong>${member.name}</strong><small>${member.owner ? '隊長' : (member.ai ? '電腦隊友' : '已準備')}</small></div><i class="member-status ${member.ai ? 'ai' : ''}"></i></div>`).join('');
  const count = $('#squad-count'); if (count) count.textContent = `${state.party.filter((member) => !member.ai).length} / 5 真人`;
}
function renderShop() {
  const grid = $('#shop-grid'); if (!grid) return;
  grid.innerHTML = cosmetics.map((item, index) => { const owned = state.owned.includes(index); return `<article class="shop-card"><div class="shop-visual ${item.skin}"><span class="skin-icon">${item.icon}</span></div><div class="shop-info"><h3>${item.name}</h3><p>${item.desc}</p><div class="buy-row"><span class="price">◈ ${item.price.toLocaleString()}</span><button class="buy-button ${owned ? 'owned' : ''}" data-buy="${index}">${owned ? '已擁有' : '購買'}</button></div></div></article>`; }).join('');
  $$('[data-buy]').forEach((button) => button.addEventListener('click', () => buy(Number(button.dataset.buy))));
}
function renderFriends() {
  const list = $('#friends-list'); if (!list) return;
  list.innerHTML = state.friends.map((friend, index) => `<div class="friend-item">${avatar(friend)}<div><strong>${friend.name}</strong><small>LV. ${friend.level}　${friend.status}</small></div><button class="friend-action ${!friend.online ? 'muted' : ''}" data-invite="${index}">${friend.online ? '邀請' : '查看'}</button></div>`).join('');
  $$('[data-invite]').forEach((button) => button.addEventListener('click', () => { const friend = state.friends[Number(button.dataset.invite)]; if (friend.online) { showToast(`已邀請 ${friend.name} 加入小隊`); addParty(friend); } else showToast(`${friend.name} 目前不在線`); }));
}
function renderParty() {
  const list = $('#party-slots'); if (!list) return;
  list.innerHTML = [...state.party, { empty: true }, { empty: true }, { empty: true }].slice(0, 5).map((member) => member.empty ? '<div class="party-slot empty-slot">＋ 等待隊友加入</div>' : `<div class="party-slot">${avatar(member)}<strong>${member.name}</strong><small>${member.ai ? '電腦隊友' : '● 已準備'}</small></div>`).join('');
}
function addParty(friend) {
  if (state.party.some((member) => member.name === friend.name)) { showToast(`${friend.name} 已經在小隊裡`); return; }
  if (state.party.filter((member) => !member.ai).length >= 5) { showToast('小隊已滿，最多 5 位真人'); return; }
  state.party.push(friend); renderSquad(); renderParty();
}
function switchScreen(name) {
  if (name === 'armory' && !state.storeUnlocked) { showToast('商店目前鎖定：完成新手教學並打完第一場對戰後開放'); return; }
  state.screen = name; $$('.screen').forEach((screen) => screen.classList.remove('active-screen')); $(`#${name}-screen`)?.classList.add('active-screen');
  $$('.nav-item[data-screen]').forEach((nav) => nav.classList.toggle('active', nav.dataset.screen === name)); $('#section-title').textContent = name === 'home' ? '選擇你的戰場' : name === 'armory' ? '造型與裝備' : '建立你的作戰房間';
  if (name === 'armory') renderShop(); if (name === 'friends') { renderFriends(); renderParty(); updateRoomUI(); } window.scrollTo({ top: 0, behavior: 'smooth' });
}
function createRoom() { state.roomCreated = true; state.roomCode = `QZ-${Math.floor(1000 + Math.random() * 9000)}`; updateRoomUI(); showToast(`${state.roomPrivacy === 'public' ? '公開' : '私人'}房間已建立：${state.roomCode}`); switchScreen('friends'); }

function openTutorial() { state.tutorialStep = 0; $('#tutorial-screen').classList.remove('hidden'); renderTutorial(); }
function renderTutorial() {
  const steps = [
    { kicker: 'TRAINING 01 // PROFILE', title: '從 0 級新兵開始', copy: '你的新帳號沒有任何資料：0 級、0 金幣、0 勝場。每一場對戰都會留下你的成長紀錄。', visual: '0' },
    { kicker: 'TRAINING 02 // PARTY', title: '建立你的作戰房間', copy: '你可以建立公開或私人房間，邀請好友一起打。沒有真人隊友時，系統會自動補上 AI。', visual: '♧' },
    { kicker: 'TRAINING 03 // FIRST MATCH', title: '完成第一場對戰', copy: '先進入靶場熟悉準心，再開始第一場霓虹攻防戰。完成首場對戰後，商店才會解鎖。', visual: '✦' }
  ];
  const step = steps[state.tutorialStep]; $('#tutorial-kicker').textContent = step.kicker; $('#tutorial-title').textContent = step.title; $('#tutorial-copy').textContent = step.copy; $('#tutorial-visual').textContent = step.visual;
  $$('.tutorial-progress i').forEach((dot, index) => dot.classList.toggle('active', index <= state.tutorialStep)); $('#tutorial-next').textContent = state.tutorialStep === steps.length - 1 ? '完成教學　→' : '下一步　→';
}
function finishTutorial() { state.tutorialComplete = true; $('#tutorial-screen').classList.add('hidden'); showToast('新手教學完成！商店會在第一場對戰後解鎖'); }
function login() {
  const input = $('#login-name'); const username = input.value.trim(); if (!username) { showToast('請先輸入玩家名稱'); input.focus(); return; }
  state.loggedIn = true; state.username = username; state.level = 0; state.coins = 0; state.kills = 0; state.wins = 0; state.owned = []; state.party = [{ name: username, avatar: username.slice(0, 1).toUpperCase(), color: 'cyan', owner: true }];
  $('#login-screen').classList.add('hidden'); updateProfile(); updateCoins(); renderSquad(); openTutorial();
}
function addBotsAndStart() {
  if (!state.roomCreated) createRoom();
  const humans = state.party.filter((member) => !member.ai).length; const roster = [...state.party];
  if (humans < 2) { roster.push({ name: 'AI-偵察兵', avatar: 'A', color: 'yellow', ai: true }); roster.push({ name: 'AI-狙擊手', avatar: 'S', color: 'pink', ai: true }); roster.push({ name: 'AI-突擊手', avatar: 'R', color: 'cyan', ai: true }); }
  openBattleModal(roster);
}
function openBattleModal(roster) {
  const humanCount = roster.filter((member) => !member.ai).length; const botCount = roster.filter((member) => member.ai).length;
  openModal(`<p class="eyebrow">MATCH FOUND // ${state.roomPrivacy.toUpperCase()}</p><h2>霓虹攻防戰</h2><p>真人玩家 ${humanCount} 位，系統已補上 ${botCount} 位 AI 隊友。</p><div class="battle-teams"><div><span class="team-label">YOUR SQUAD</span>${roster.map((member) => `<div class="battle-member">${avatar(member)}<strong>${member.name}</strong><small>${member.ai ? 'AI' : '真人'}</small></div>`).join('')}</div><div class="battle-enemy"><span class="team-label">ENEMY SQUAD</span><div class="enemy-card">◈<strong>敵方 AI 小隊</strong><small>已配對 4 名電腦對手</small></div></div></div><button class="primary-button full" id="finish-battle">進入戰場　→</button>`);
  $('#finish-battle').addEventListener('click', () => { state.battlePlayed = true; state.storeUnlocked = true; state.level = 1; state.coins = 300; state.wins = 1; updateProfile(); updateCoins(); updateStoreUI(); closeModal(); showToast('首場對戰完成！獲得 300 金幣，商店已解鎖'); });
}
function openTraining() {
  openModal(`<p class="eyebrow">SOLO RANGE // PRACTICE</p><h2>自由訓練靶場</h2><p>點擊畫面中的目標來練習你的準度。命中 3 個目標即可完成訓練。</p><div class="training-screen"><canvas id="training-canvas" width="760" height="285"></canvas><div class="training-hud"><span>命中數：<b id="hits">0</b> / 3</span><span>提示：點擊紅色目標</span></div></div>`); setTimeout(startTraining, 30);
}
function startTraining() {
  const canvas = $('#training-canvas'); if (!canvas) return; const context = canvas.getContext('2d'); let hits = 0; let target = { x: 100, y: 100, r: 24 };
  function draw() { context.clearRect(0, 0, canvas.width, canvas.height); context.strokeStyle = '#1c3540'; for (let x = 0; x < canvas.width; x += 38) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, canvas.height); context.stroke(); } for (let y = 0; y < canvas.height; y += 38) { context.beginPath(); context.moveTo(0, y); context.lineTo(canvas.width, y); context.stroke(); } context.fillStyle = '#ff5e9d'; context.beginPath(); context.arc(target.x, target.y, target.r, 0, Math.PI * 2); context.fill(); context.strokeStyle = '#ffd0df'; context.lineWidth = 2; context.beginPath(); context.arc(target.x, target.y, target.r - 8, 0, Math.PI * 2); context.stroke(); }
  function next() { target = { x: 50 + Math.random() * (canvas.width - 100), y: 45 + Math.random() * (canvas.height - 90), r: 19 + Math.random() * 10 }; draw(); }
  canvas.addEventListener('click', (event) => { const rect = canvas.getBoundingClientRect(); const x = (event.clientX - rect.left) * canvas.width / rect.width; const y = (event.clientY - rect.top) * canvas.height / rect.height; if (Math.hypot(x - target.x, y - target.y) < target.r + 8) { hits += 1; $('#hits').textContent = hits; if (hits >= 3) { closeModal(); showToast('訓練完成！第一場對戰準備好了'); return; } next(); } }); draw();
}
function buy(index) { const item = cosmetics[index]; if (state.owned.includes(index)) { showToast('這件造型已經在你的收藏中'); return; } if (state.coins < item.price) { showToast('金幣不足，先完成更多對戰吧'); return; } state.coins -= item.price; state.owned.push(index); updateCoins(); renderShop(); showToast(`已購買「${item.name}」`); }
function openModal(html) { $('#modal-content').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); }

function init() {
  $$('.nav-item[data-screen]').forEach((button) => button.addEventListener('click', () => switchScreen(button.dataset.screen)));
  $('#login-btn').addEventListener('click', login); $('#login-name').addEventListener('keydown', (event) => { if (event.key === 'Enter') login(); });
  $('#play-now').addEventListener('click', addBotsAndStart); $('#room-start').addEventListener('click', addBotsAndStart); $('#training-btn').addEventListener('click', openTraining); $('#ranked-btn').addEventListener('click', () => showToast('排位模式會在完成新手教學後開放')); $('#invite-btn').addEventListener('click', () => switchScreen('friends')); $('#create-room').addEventListener('click', createRoom);
  $('#copy-code').addEventListener('click', () => { if (!state.roomCreated) { showToast('請先建立房間'); return; } navigator.clipboard?.writeText(state.roomCode); showToast('房間代碼已複製'); });
  $$('.privacy-btn').forEach((button) => button.addEventListener('click', () => { state.roomPrivacy = button.dataset.privacy; updateRoomUI(); showToast(`已切換為${state.roomPrivacy === 'public' ? '公開' : '私人'}房間`); }));
  $('#tutorial-next').addEventListener('click', () => { if (state.tutorialStep >= 2) finishTutorial(); else { state.tutorialStep += 1; renderTutorial(); } }); $('#tutorial-skip').addEventListener('click', finishTutorial); $('#close-modal').addEventListener('click', closeModal); $('#modal').addEventListener('click', (event) => { if (event.target.id === 'modal') closeModal(); });
  updateStoreUI(); updateRoomUI(); updateCoins();
}
document.addEventListener('DOMContentLoaded', init);
