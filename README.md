# 槍戰｜NEON STRIKE

這是一個可安裝到 Android 手機的槍戰遊戲第一版，主畫面使用本機 WebView 載入遊戲介面，包含：

- 作戰中心：快速匹配、靶場、排位模式入口
- 好友小隊：好友清單、邀請好友、公開房間與房間代碼
- 軍械庫：金幣錢包、角色／武器造型商店、購買與收藏狀態
- 自由訓練：可用觸控點擊靶子，完成後取得金幣獎勵

目前的連線、登入、金幣儲存與好友資料都是示範資料。要變成真正的多人遊戲，下一步可以加入帳號服務、WebSocket 房間伺服器，以及資料庫保存玩家與購買紀錄。

## Android APK

GitHub Actions 設定在 `.github/workflows/android-apk.yml`。每次推送到 `main` 或 `master`，或手動執行 workflow，都會編譯 `app-debug.apk` 並上傳成 Actions Artifact。

## 本機預覽

直接用瀏覽器開啟 `index.html` 即可。建議用桌面瀏覽器觀看完整介面，也支援手機寬度。

## Android 專案

Android 原生包裝位於 `app/`，使用 Java WebView 載入 `app/src/main/assets/` 的遊戲介面。需要 Android SDK 35 與 Java 17。
