# 槍戰後端

這是第一版的帳號、房間、商店與即時小隊服務。服務以 Node.js + WebSocket 執行，適合先在本機或一台長駐 Node 主機上測試。

- `POST /api/auth/login`：建立／登入玩家，初始為 LV.0、0 金幣、0 勝場
- `POST /api/rooms`：建立公開或私人房間
- `POST /api/rooms/:code/join`：用房間代碼加入
- `POST /api/rooms/:code/start`：開始對戰，真人不足時自動補 AI
- `POST /api/rooms/:code/finish`：結算首場對戰，獎勵 300 金幣並升到 LV.1
- `GET /api/catalog`：取得商店造型目錄
- `POST /api/shop/purchase`：以玩家金幣購買造型；未完成第一場對戰前會拒絕
- `GET /health`：健康檢查
- `ws://localhost:3000/ws?room=QZ-1234`：房間即時更新

所有 API 的 JSON 請帶 `content-type: application/json`。登入回傳的 `user.id` 要帶給後續 API 的 `playerId`。

目前資料存在記憶體，伺服器重啟後會清空；正式版需要接 PostgreSQL／Redis，並加入密碼或 OAuth、JWT、好友關係、HTTPS 與防作弊驗證。WebSocket 需要長駐 Node 服務，不能直接把這個版本當成無狀態函式部署。

## 啟動

```bash
npm install
npm start
```

Android 測試版預設會嘗試連線 `http://10.0.2.2:3000`（Android Emulator 代表開發電腦）。實機測試時，請讓手機與電腦在同一個 Wi‑Fi，並在網址列加入 `?api=http://電腦區網IP:3000`，正式上線則改成 HTTPS 後端網址。
