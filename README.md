# ledger-ynab-register

Transform a YNAB `.csv` register file into a [ledger](https://github.com/ledger/ledger) journal

## Usage

Before exporting your budget file, follow these steps in the budget settings:

-   Change the number format to: `123,456.78`
-   Change the currency placement to `Don't display symbol(123,456.78)`
-   Change the date format to `2015-12-30`

`node <SCRIPT_PATH> <CURRENCY> <REGISTER_PATH>`

Example
`node main.js EUR YNAB_register.csv`
