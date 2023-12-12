/* eslint-disable no-inline-comments */
// api/server.js

const express = require('express');
const cors = require('cors');
const getAlunos = require('./endpoints/getAlunos');
const insertAluno = require('./endpoints/insertAluno');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get('/getAlunos', getAlunos);
app.post('/insertAluno', insertAluno); // Supondo que você está usando o método POST para inserir alunos

app.listen(port, () => {
	console.log(`API rodando em http://localhost:${port}`);
});
