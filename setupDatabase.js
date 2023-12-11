const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./portodigitaldiscord.db', (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log('Conectado ao banco de dados SQLite.');
	createTables();
});

const createTables = () => {
	db.run('CREATE TABLE empresa (email TEXT PRIMARY KEY)', (err) => {
		if (err) throw err;
		db.run('CREATE TABLE mentor (email TEXT PRIMARY KEY)', (err) => {
			if (err) throw err;
			db.run('CREATE TABLE squad (id INTEGER PRIMARY KEY, mentorEmail TEXT, empresaEmail TEXT, FOREIGN KEY (mentorEmail) REFERENCES mentor(email), FOREIGN KEY (empresaEmail) REFERENCES empresa(email))', (err) => {
				if (err) throw err;
				db.run('CREATE TABLE aluno (email TEXT PRIMARY KEY, squadId INTEGER, FOREIGN KEY (squadId) REFERENCES squad(id))', (err) => {
					if (err) throw err;
					insertData();
				});
			});
		});
	});
};
const insertData = () => {
	// Inserir empresas
	db.run('INSERT INTO empresa (email) VALUES (\'empresa1@example.com\')');
	db.run('INSERT INTO empresa (email) VALUES (\'empresa2@example.com\')');
	db.run('INSERT INTO empresa (email) VALUES (\'empresa3@example.com\')');

	// Inserir mentores
	db.run('INSERT INTO mentor (email) VALUES (\'mentor1@example.com\')');
	db.run('INSERT INTO mentor (email) VALUES (\'mentor2@example.com\')');
	db.run('INSERT INTO mentor (email) VALUES (\'mentor3@example.com\')');

	// Inserir squads
	db.run('INSERT INTO squad (mentorEmail, empresaEmail) VALUES (\'mentor1@example.com\', \'empresa1@example.com\')');
	db.run('INSERT INTO squad (mentorEmail, empresaEmail) VALUES (\'mentor2@example.com\', \'empresa2@example.com\')');
	db.run('INSERT INTO squad (mentorEmail, empresaEmail) VALUES (\'mentor3@example.com\', \'empresa3@example.com\')');

	for (let i = 1; i <= 3; i++) {
		for (let j = 1; j <= 3; j++) {
			db.run(`INSERT INTO aluno (email, squadId) VALUES ('aluno${j}@squad${i}.com', ${i})`);
			console.log(`Aluno inserido ${j} do squad ${i}`);
		}
	}
	db.close((err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log('Conexão com o banco de dados SQLite fechada.');
	});
};

