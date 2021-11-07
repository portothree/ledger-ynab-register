const fs = require('fs').promises;
const tsv = require('tsv');

async function main() {
	const [filePath] = process.argv.slice(2);

	if (!filePath) {
		throw new Error('Path to register file not provided');
	}

	const fileContent = await fs.readFile(filePath, 'utf8');

	const registerData = tsv.parse(fileContent);
}

main().catch(console.log);
