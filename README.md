![version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![license](https://img.shields.io/badge/license-MIT-green.svg)
![node](https://img.shields.io/badge/node-%3E%3D14.0.0-blue.svg)
![status](https://img.shields.io/badge/status-active-brightgreen.svg)

# JLPT QDB Crawler 📘

一個用來爬取 JLPT 練習題與正確解答的自動化工具。此工具使用 Node.js 搭配 Axios 與 Cheerio，從指定網站抓取日文檢定題目與答案，並產生結構化的 JSON 題庫檔案。

---

## 📦 安裝方式

```bash
git clone https://github.com/natsuki221/jlpt_qdb.git
cd jlpt_qdb
npm install
```

---

## ⚙️ 設定與執行

### 1. 設定環境變數

請在專案根目錄建立 `.env` 檔案，並填入：

```env
URL=你的題庫目標網址
```

### 2. 執行爬蟲

執行主程式會依序執行「題目爬取」與「答案更新」流程：

```bash
node index.js
```

成功執行後會產生 `JLPT_QDB.json` 檔案，包含完整題庫內容。

---

## 🧪 輸出 JSON 格式說明

每一筆題目資料的結構如下：

```json
{
  "Context": "題目內容",
  "Options": ["選項A", "選項B", "選項C", "選項D"],
  "Ans": "正確答案（如：選項A）",
  "Explain": "解說文字（預設空）",
  "level": 2
}
```

---

## 📁 專案結構

```
natsuki221-jlpt_qdb/
├── index.js                  # 主執行檔
├── package.json
├── components/
│   ├── webCrawlerQ.js        # 題目擷取爬蟲
│   └── webCrawlerA.js        # 正確答案擷取爬蟲
└── models/
    └── Question.js           # 題目模型類別
```

---

## 🪪 授權 License

此專案使用 MIT 授權條款。  
作者：[@natsuki221](https://github.com/natsuki221)