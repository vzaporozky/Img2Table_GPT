const ExcelJS = require('exceljs');
// const { data } = require('./utils/data');

async function createExcelFile(tableData, outputPath) {
	if (tableData.length === 0) {
		console.warn('Sheet is empty');
		return;
	}
	if (outputPath.length === 0) {
		console.warn('PATH is empty');
		return;
	}

	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Sheet 1');

	const headers = Object.keys(tableData[0]);

	worksheet.addRow(headers);

	tableData.forEach(row => {
		const rowData = headers.map(header => {
			const value = row[header] != null ? row[header].toString() : '';
			return value;
		});
		worksheet.addRow(rowData);
	});

	try {
		await workbook.xlsx.writeFile(outputPath);
		console.log(`Excel-file saved: ${outputPath}`);
	} catch (err) {
		console.error('Error saved Excel:', err);
	}
}

// createExcelFile(data, './src/output.xlsx');

export { createExcelFile };
