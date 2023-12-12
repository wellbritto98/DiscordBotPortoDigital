// api/endpoints/insertAlunos.js

const openDb = require('../../db/database');

async function insertAluno(req, res) {
	try {
		const db = await openDb();
		const { email, squadId, Nome, Sobrenome, Curso } = req.body;

		// A ordem dos parâmetros deve corresponder à ordem das colunas na instrução INSERT
		const result = await db.run(
			'INSERT INTO aluno (email, squadId, Nome, Sobrenome, Curso) VALUES (?, ?, ?, ?, ?)',
			[email, squadId, Nome, Sobrenome, Curso],
		);

		// Verificar se uma nova linha foi inserida
		if (result.lastID) {
			res.status(200).json({ message: 'Aluno inserido com sucesso', id: result.lastID });
		}
		else {
			res.status(500).json({ message: 'Não foi possível inserir o aluno' });
		}
	}
	catch (error) {
		res.status(500).send('Erro ao acessar o banco de dados: ' + error.message);
	}
}

module.exports = insertAluno;
