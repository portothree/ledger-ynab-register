const fs = require('fs');
const parse = require('csv-parse');

function createStatus(status) {
	return status === 'Cleared' ? '*' : '!';
}

function createOutflow(metadata = {}) {
	const { account, date, payee, category, memo, currency, amount, status } =
		metadata;

	return `
${date}	${createStatus(status)}	${payee}
	Expenses:${category}	${currency} ${amount}	${memo ? '; ' + memo : ''}
	Assets:${account}	${currency}	-${amount}
	`;
}

function createInflow(metadata = {}) {
	const { account, date, payee, category, memo, currency, amount, status } =
		metadata;

	return `
${date}	${createStatus(status)}	${payee}
	Assets:${account}	${currency} ${amount}	${memo ? '; ' + memo : ''}
	Income	${currency}	-${amount}
	`;
}

async function main() {
	const [currency, filePath] = process.argv.slice(2);

	if (!filePath) {
		throw new Error('Path to register file not provided');
	}

	const parser = fs.createReadStream(filePath).pipe(
		parse({
			delimiter: ',',
			quote: '"',
			ltrim: true,
			rtrim: true,
			bom: true,
		})
	);
	const writeStream = fs.createWriteStream('./output.ledger');
	writeStream.write('; -*- ledger -*-\n');

	const registerRows = await (async () => {
		const records = [];

		for await (const record of parser) {
			records.push(record);
		}

		return records;
	})().then((records) => records.slice(1));

	for (const [
		account,
		_,
		date,
		payee,
		__,
		___,
		category,
		memo,
		outflow,
		inflow,
		status,
	] of registerRows) {
		const metadata = {
			account,
			date,
			payee,
			category,
			memo,
			currency,
			status,
		};

		if (!!Number(outflow)) {
			writeStream.write(createOutflow({ ...metadata, amount: outflow }));
		}

		if (!!Number(inflow)) {
			writeStream.write(createInflow({ ...metadata, amount: inflow }));
		}
	}

	writeStream.end();
}

main().catch(console.log);
