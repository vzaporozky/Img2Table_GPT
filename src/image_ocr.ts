import 'dotenv/config';
import { createExcelFile } from './crate_excel';
import { OpenAI } from 'openai';
import * as fs from 'fs';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY!,
});

function imageToBase64(imagePath) {
	const image = fs.readFileSync(imagePath);
	return Buffer.from(image).toString('base64');
}

async function extractTextAndTable(imagePath) {
	try {
		const base64Image = imageToBase64(imagePath);

		const response = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'text',
							text: `Извлеки весь текст и таблицу из изображения. 
							Верни таблицу в структурированном формате (например, JSON или Markdown) и остальной текст отдельно. 
							Если есть столбец с количеством, то в каждой ячейке обязательно должны быть только числа, без шт или кг`,
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
		console.error('Error OpenAI:', error.message);
		throw error;
	}
}

function extractJsonFromResponse(response) {
	// console.log(response);
	const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
	if (!jsonMatch) {
		throw new Error('JSON was not found');
	}
	return JSON.parse(jsonMatch[1]);
}

async function textExtractMain(imagePath, outputExcelPath) {
	try {
		const response = await extractTextAndTable(imagePath);
		const json_data = extractJsonFromResponse(response);

		createExcelFile(json_data, outputExcelPath);

		// console.log('finish. file path ' + outputExcelPath);
	} catch (error) {
		console.error('Error Main:', error.message);
	}
}

// textExtractMain('./src/images/image.jpg', './src/images/output.xlsx');

export { textExtractMain, extractJsonFromResponse, extractTextAndTable };
