// webCrawlerA.js
// 使用前請先執行：npm install axios cheerio
// 此程式採用預設答案 r_ans=1 送出所有題目，並從回傳結果中
// 以隱藏欄位 <input name="r_ans" value="..."> 擷取正確答案

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const Question = require('../models/Question');

/**
 * 組合送出答案的 URL
 * @param {number} startNum 起始題號（第一題為 1）
 * @param {number} showNum 每頁題數，預設 30 題
 * @returns {string} 完整的請求 URL
 */
function buildPageURL(startNum, showNum = 30) {
  const baseUrl = "http://www.n-lab.org/library/mondaidata/test.php";
  const params = new URLSearchParams({
    mode: "html",
    dbupdate: "1",         // 送出答案
    data_count: "1924",
    start_num: startNum.toString(),
    show_num: showNum.toString(),
    kyu: "2",
    syu: "",
    target: "all",
    word: "",
    type: "and",
    sort: "percent desc",
    test_num: "",
    checkbox: "checkbox",
    send: "チェック",
    rows: "10"
  });
  // 對每一題加入預設答案（注意：正確答案欄位名稱固定為 r_ans，不附加索引）
  for (let i = startNum; i < startNum + showNum; i++) {
    params.append(`id[${i}]`, "");
    params.append("r_ans", "1"); // 預設答案全部設為 1
    params.append(`syutsu[${i}]`, "");
    params.append(`seikai[${i}]`, "");
  }
  return `${baseUrl}?${params.toString()}`;
}

/**
 * 取得指定 URL 的 HTML 內容
 * @param {string} url 要取得的網頁 URL
 * @returns {Promise<string|null>} 回傳 HTML 內容，若失敗則回傳 null
 */
async function fetchPage(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    console.error(`取得網頁失敗：${err.message}`);
    return null;
  }
}

/**
 * 解析 HTML，擷取出正確答案
 * 假設正確答案以隱藏欄位 <input name="r_ans" value="X"> 呈現，
 * 且這些欄位位於表格內，每題一個。
 * @param {string} html 回傳的 HTML 內容
 * @returns {Array} 每題答案物件陣列，資料結構符合要求
 */
function parsePage(html) {
  const answerList = [];
  const $ = cheerio.load(html);

  // 選取表格內所有隱藏欄位 r_ans（依照原網頁，每題一個）
  $("table input[name='r_ans']").each((i, elem) => {
    let correctAns = $(elem).attr('value') || "";
    // 建立符合指定結構的答案物件，Context 與 Options 暫留空值
    answerList.push({
      "Question": {
        "Context": "",
        "Options": [],
        "Ans": correctAns,
        "Explain": "",
        "level": 2
      }
    });
  });
  if (answerList.length === 0) {
    console.error("警告：未從網頁中擷取到任何正確答案，請確認 HTML 結構是否有變動。");
  }
  return answerList;
}

/**
 * 依序送出所有頁面的預設答案，並從回傳結果中擷取正確答案
 * @returns {Promise<Array>} 所有題目的答案列表（answerList[]）
 */
async function fetchAns() {
  const totalQuestions = 1924;
  const showNum = 30;
  const totalPages = Math.ceil(totalQuestions / showNum);
  let answerList = [];

  for (let page = 0; page < totalPages; page++) {
    const startNum = page * showNum + 1;
    const url = buildPageURL(startNum, showNum);
    console.log(`正在取得第 ${page + 1} 頁 (start_num = ${startNum})...`);
    const html = await fetchPage(url);
    if (html) {
      const pageAnswers = parsePage(html);
      answerList = answerList.concat(pageAnswers);
    } else {
      console.error(`第 ${page + 1} 頁資料取得失敗，將跳過此頁。`);
    }
    // 延遲 1 秒以避免過快請求
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return answerList;
}

/**
 * 將答案列表寫入指定的 JSON 檔案中，
 * 並將資料儲存在 "Ans" 鍵內
 * @param {string} filename 要寫入的檔名
 * @param {Array} answerList 答案列表
 */
function writeJson(filename, answerList) {
  const jsonData = {
    "Ans": answerList
  };
  try {
    fs.writeFileSync(filename, JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log(`成功寫入答案至 ${filename}`);
  } catch (err) {
    console.error(`寫入 JSON 檔案失敗：${err.message}`);
  }
}

/**
 * 讀取 JSON 檔案，更新 Question 內的 "Ans" 欄位，並覆蓋原檔案
 * @param {string} filename 要讀取和覆蓋的 JSON 檔案名稱
 */
async function updateAnswersInFile(filename) {
    try {
      console.log("開始執行爬取流程...");
      const answers = await fetchAns();
  
      // 直接讀入 JSON 陣列
      const dataArray = JSON.parse(fs.readFileSync(filename, 'utf-8'));
  
      if (!Array.isArray(dataArray)) {
        throw new Error("檔案內容不是 JSON 陣列");
      }
  
      dataArray.forEach((item, idx) => {
        if (answers[idx]?.Question?.Ans) {
          item.Ans = answers[idx].Question.Ans;
        } else {
          console.warn(`⚠️ 第 ${idx + 1} 題無法取得答案，跳過`);
        }
      });
  
      fs.writeFileSync(filename, JSON.stringify(dataArray, null, 2), 'utf-8');
      console.log(`✅ 更新完成，已儲存至 ${filename}`);
    } catch (err) {
      console.error(`❌ 更新答案過程發生錯誤：${err.message}`);
    }
  }
  

// 匯出模組供其他檔案調用
module.exports = { fetchAns, writeJson, updateAnswersInFile };

// 若直接執行此檔案，則開始執行爬取流程
if (require.main === module) {
  (async () => {
    try {
      const answers = await fetchAns();
      writeJson('answers.json', answers);
    } catch (err) {
      console.error(`爬蟲執行過程中發生錯誤：${err.message}`);
    }
  })();
}

// Example of creating a question using the Question model
function createQuestion(context, options, ans, explain, level = 2) {
    return new Question(context, options, ans, explain, level);
}

// Example usage
const question = createQuestion("Another context", ["Choice1", "Choice2", "Choice3"], "Choice2", "Explanation here.");
console.log(question);
