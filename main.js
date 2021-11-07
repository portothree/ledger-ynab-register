const fs = require('fs');
const parse = require('csv-parse');

const YNAB_COLUMNS_COUNT = 11;

function createStatus(status) {
	return status === 'Cleared' ? '*' : '!';
}

function createOutflow(
	account,
	date,
	payee,
	category,
	memo,
	currency,
	amount,
	status
) {
	return `
		${date}	${createStatus(status)}	${payee}
			Expenses:${category}	${currency} ${amount}	${memo ? '; ' + memo : ''}
			Assets:${account}	${currency}	-${amount}
	`;
}

function createInflow(
	account,
	date,
	payee,
	category,
	memo,
	currency,
	amount,
	status
) {
	return `
		${date}	${createStatus(status)}	${payee}
			Assets:${account}	${currency} ${amount}	${memo ? '; ' + memo : ''}
			Income	${currency}	-${amount}
	`;
}

async function main() {
	const [currency, filePath, delimiter] = process.argv.slice(2);

	if (!filePath) {
		throw new Error('Path to register file not provided');
	}

	const parser = fs.createReadStream(filePath).pipe(
		parse({
			delimiter,
			quote: '"',
			ltrim: true,
			rtrim: true,
			bom: true,
		})
	);

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
		if (!!Number(outflow)) {
			createOutflow(
				account,
				date,
				payee,
				category,
				memo,
				currency,
				outflow,
				status
			);
		}

		if (!!Number(inflow)) {
			createInflow(
				account,
				date,
				payee,
				category,
				memo,
				currency,
				inflow,
				status
			);
		}
	}
}

main().catch(console.log);
