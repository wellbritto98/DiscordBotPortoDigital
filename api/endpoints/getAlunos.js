// api/endpoints/getAlunos.js

const openDb = require('../../db/database');

async function getAlunos(req, res) {
	try {
		const db = await openDb();
		const alunos = await db.all('SELECT * FROM aluno');
		res.status(200).json(alunos);
	}
	catch (error) {
		res.status(500).send('Erro ao acessar o banco de dados: ' + error.message);
	}
}

module.exports = getAlunos;
