# Pearla 網站原始碼

這是目前預覽版本的靜態網站原始碼與所需圖片資產。

## 本機預覽

在此資料夾執行：

```bash
python3 -m http.server 3000 --directory public
```

然後開啟 `http://localhost:3000/`。

- `public/index.html`：網站介面與互動程式
- `public/assets/`：主頁按鈕圖示
- `public/daily_message_label.png`、`public/music_player.png`：每日留言與音樂播放器圖像
- `public/manus-routes.json`：網站路由清單
- `app.config.ts`：Manus 專案平台標誌設定
