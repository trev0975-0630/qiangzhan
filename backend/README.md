# 槍戰後端

這是第一版的帳號、房間與即時小隊服務：

- `POST /api/auth/login`：建立／登入玩家，初始為 LV.0、0 金幣、0 勝場
- `POST /api/rooms`：建立公開或私人房間
- `POST /api/rooms/:code/join`：用房間代碼加入
- `POST /api/rooms/:code/start`：開始對戰，真人不足時自動補 AI
- `POST /api/rooms/:code/finish`：結算首場對戰，獎勵 300 金幣並升到 LV.1
- `GET /health`：健康檢查
- `ws://localhost:3000/ws?room=QZ-1234`：房間即時更新

目前資料存在記憶體，伺服器重啟後會清空；正式版需要接 PostgreSQL／Redis，並加入 JWT、好友關係與防作弊驗證。

## 啟動

```bash
npm install
npm start
```
