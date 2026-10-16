# 槍戰｜NEON STRIKE

這是一個可安裝到 Android 手機的槍戰遊戲第一版，主畫面使用本機 WebView 載入遊戲介面，包含：

- 作戰中心：快速匹配、靶場、排位模式入口
- 好友小隊：好友清單、邀請好友、公開房間與房間代碼
- 軍械庫：金幣錢包、角色／武器造型商店、購買與收藏狀態
- 自由訓練：可用觸控點擊靶子，完成後取得金幣獎勵

目前的射擊場景仍是 UI 原型；登入、玩家資料、房間建立／開始、WebSocket 房間更新、對戰結算與商店購買已接上 `backend/` 第一版服務。後端目前使用記憶體資料，重啟會清空，正式上線前需要接 PostgreSQL／Redis、JWT、HTTPS 與防作弊驗證。

## Android APK

GitHub Actions 設定在 `.github/workflows/android-apk.yml`。每次推送到 `main` 或 `master`，或手動執行 workflow，都會編譯 `app-debug.apk` 並上傳成 Actions Artifact。

## 後端服務

第一版 Node.js 後端位於 `backend/`，支援登入、0 級新帳號、公開／私人房間、房間即時更新、真人不足時補 AI、對戰結算與商店購買。啟動方式請看 `backend/README.md`。Android Emulator 預設透過 `http://10.0.2.2:3000` 連到開發電腦。

## 本機預覽

直接用瀏覽器開啟 `index.html` 即可。建議用桌面瀏覽器觀看完整介面，也支援手機寬度。

## Android 專案

Android 原生包裝位於 `app/`，使用 Java WebView 載入 `app/src/main/assets/` 的遊戲介面。需要 Android SDK 35 與 Java 17。
