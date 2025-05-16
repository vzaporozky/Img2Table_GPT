const { OpenAI } = require('openai');
const fs = require('fs');
const xl = require('excel4node');

const openai = new OpenAI({
	apiKey: process.env.API_KEY,
});

function imageToBase64(imagePath) {
	const image = fs.readFileSync(imagePath);
	return Buffer.from(image).toString('base64');
}

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
							text: 'Извлеки весь текст и таблицу из изображения. Верни таблицу в структурированном формате (например, JSON или Markdown) и остальной текст отдельно.',
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

// function createExcelFile(tableData, outputPath) {
// 	const wb = new xl.Workbook();
// 	const ws = wb.addWorksheet('Sheet 1');

// 	tableData.forEach((row, rowIndex) => {
// 		row.forEach((cell, colIndex) => {
// 			ws.cell(rowIndex + 1, colIndex + 1).string(cell.toString());
// 		});
// 	});

// 	wb.writeFile(outputPath)
// 		.then(() => console.log(`Excel-файл сохранен: ${outputPath}`))
// 		.catch(err => console.error('Ошибка сохранения Excel:', err));
// }

// function parseResponse(response) {
// 	const lines = response.split('\n');
// 	let tableData = [];
// 	let textContent = [];
// 	let isTable = false;

// 	lines.forEach(line => {
// 		if (line.includes('|') && line.includes('-')) {
// 			isTable = true;
// 		} else if (isTable && line.includes('|')) {
// 			const row = line
// 				.split('|')
// 				.map(cell => cell.trim())
// 				.filter(cell => cell);
// 			tableData.push(row);
// 		} else {
// 			textContent.push(line);
// 		}
// 	});

// 	// Удаляем заголовки разделителей таблицы (например, |---|---|)
// 	tableData = tableData.filter(row => !row.every(cell => cell.match(/^-+$/)));

// 	return { text: textContent.join('\n'), table: tableData };
// }

async function main(imagePath, outputExcelPath) {
	try {
		const response = await extractTextAndTable(imagePath);
		console.log(response);
		// const { text, table } = parseResponse(response);

		// console.log('Извлеченный текст:\n', text);

		// if (table.length > 0) {
		// 	createExcelFile(table, outputExcelPath);
		// } else {
		// 	console.log('Таблица не найдена.');
		// }
	} catch (error) {
		console.error('Ошибка:', error.message);
	}
}

main('./images/image.jpg', 'output.xlsx');
