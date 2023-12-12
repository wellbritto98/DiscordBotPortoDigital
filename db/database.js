// db/database.js

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// Caminho relativo ao arquivo de banco de dados na pasta db
const dbPath = 'db/portodigitaldiscord.db';

async function openDb() {
	return open({
		filename: dbPath,
		driver: sqlite3.Database,
	});
}

module.exports = openDb;
