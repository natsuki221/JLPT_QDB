const fs = require('fs');
const fetchQuestions = require('./components/webCrawlerQ');
const { updateAnswersInFile } = require('./components/webCrawlerA');

fetchQuestions('JLPT_QDB.json'); // You can specify the output file name here

// 使用 updateAnswersInFile 更新並覆蓋答案
updateAnswersInFile('JLPT_QDB.json');