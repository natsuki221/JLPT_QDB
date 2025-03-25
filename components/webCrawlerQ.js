require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const Question = require('../models/Question');

const url = process.env.URL;

if (!url) {
  console.error('環境變數 URL 未定義，請檢查 .env 檔案。');
  process.exit(1);
}

async function fetchQuestions(outputFile = 'JLPT_QBD.json') {
  try {
    const response = await axios.get(url);
    const html = response.data;

    if (!html || typeof html !== 'string') {
      console.error('取得的 HTML 無效或為空。');
      return;
    }

    const $ = cheerio.load(html);
    let results = [];

    // Adjusted selector to match the table structure
    $('table tr').each((i, row) => {
      const questionText = $(row).find('td[colspan="5"]').text().trim();
      if (!questionText) return; // Skip rows without questions

      let options = [];
      $(row).next().find('td label').each((j, label) => {
        const optionText = $(label).text().trim();
        if (optionText) {
          options.push(optionText);
        }
      });

      if (questionText && options.length > 0) {
        results.push(createQuestion(questionText, options, "", "", 2));
      }
    });

    if (results.length > 0) {
      fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf8');
      console.log(`JSON 已儲存為 ${outputFile}`);
    } else {
      console.warn('未找到任何問題資料，未生成 JSON 檔案。');
    }
  } catch (error) {
    console.error('無法取得頁面內容:', error.message);
  }
}

function createQuestion(context, options, ans, explain, level = 2) {
  return new Question(context, options, ans, explain, level);
}

module.exports = fetchQuestions;
