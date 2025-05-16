import { PythonShell } from 'python-shell';
import * as path from 'path';
import { textExtractMain } from './image_ocr';

import 'dotenv/config';

const imagePath = path.resolve(__dirname, 'images', 'image.jpg');
const scriptPath = path.resolve(__dirname, 'image_contrast.py');

let options = {
	pythonPath: './venv/bin/python3',
	args: [imagePath],
	mode: 'text' as const,
};

const pyshell = new PythonShell(scriptPath, options);

pyshell.on('message', message => {
	console.log('Python stdout:', message);
});

pyshell.on('stderr', stderr => {
	console.error('Python stderr:', stderr);
});

pyshell.on('close', () => {
	console.log('Python process closed');
});

pyshell.on('error', error => {
	console.error('PythonShell error:', error);
});

PythonShell.run(scriptPath, options)
	.then(results => {
		console.log('PythonShell callback triggered');
		console.log('Python results:', results);

		textExtractMain(results[0], './src/images/output.xlsx');
	})
	.catch(err => {
		console.error('Python error:', err);
	});
