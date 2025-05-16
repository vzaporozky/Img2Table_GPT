const { OpenAI } = require('openai');
const fs = require('fs');
const xl = require('excel4node');
 
const openai = new OpenAI({
  apiKey: 'ваш_api_ключ', // Замените на ваш API-ключ
});

// Функция для конвертации изображения в Base64
function imageToBase64(imagePath) {
  const image = fs.readFileSync(imagePath);
  return Buffer.from(image).toString('base64');
}

// Функция для извлечения текста и таблицы
async function extractTextAndTable(imagePath) {
  try {
    const base64Image = imageToBase64(imagePath);

    // Запрос к OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Извлеки весь текст и таблицу из изображения. Верни таблицу в структурированном формате (например, JSON или Markdown) и остальной текст отдельно.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Ошибка OpenAI:', error.message);
    throw error;
  }
}

// Функция для создания Excel-файла
function createExcelFile(tableData, outputPath) {
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Sheet 1');

  // Предполагаем, что tableData — это массив строк таблицы
  tableData.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      ws.cell(rowIndex + 1, colIndex + 1).string(cell.toString());
    });
  });

  wb.writeFile(outputPath)
    .then(() => console.log(`Excel-файл сохранен: ${outputPath}`))
    .catch(err => console.error('Ошибка сохранения Excel:', err));
}

// Функция для парсинга ответа OpenAI
function parseResponse(response) {
  // Разделяем текст и таблицу (предполагаем, что таблица в Markdown или JSON)
  const lines = response.split('\n');
  let tableData = [];
  let textContent = [];
  let isTable = false;

  lines.forEach(line => {
    if (line.includes('|') && line.includes('-')) {
      isTable = true; // Начало таблицы в Markdown
    } else if (isTable && line.includes('|')) {
      // Парсим строки таблицы
      const row = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      tableData.push(row);
    } else {
      textContent.push(line);
    }
  });

  // Удаляем заголовки разделителей таблицы (например, |---|---|)
  tableData = tableData.filter(row => !row.every(cell => cell.match(/^-+$/)));

  return { text: textContent.join('\n'), table: tableData };
}

// Основная функция
async function main(imagePath, outputExcelPath) {
  try {
    // Извлекаем данные
    const response = await extractTextAndTable(imagePath);
    const { text, table } = parseResponse(response);

    // Выводим текст
    console.log('Извлеченный текст:\n', text);

    // Создаем Excel-файл из таблицы
    if (table.length > 0) {
      createExcelFile(table, outputExcelPath);
    } else {
      console.log('Таблица не найдена.');
    }
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

// Запуск
main('путь_к_изображению.jpg', 'output.xlsx');