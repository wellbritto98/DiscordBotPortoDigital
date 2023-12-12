/* eslint-disable no-inline-comments */
/* global gridjs */
/* global bootstrap */

const alunoGrid = new gridjs.Grid({
	pagination: { limit: 6 },
	search: true,
	sort: true,
	fixedHeader: true,
	columns: [
		{
			name: 'Email',
			width: '30%', // Ajuste conforme necessário
		},
		{
			name: 'Squad ID',
			width: '10%', // Menor, pois é um número curto
		},
		{
			name: 'Nome',
			width: '20%', // Ajuste conforme necessário
		},
		{
			name: 'Sobrenome',
			width: '20%', // Ajuste conforme necessário
		},
		{
			name: 'Curso',
			width: '10%', // Ajuste conforme necessário
		},
		{
			name: 'Ações',
			width: '10%', // Menor para o botão
			formatter: (cell, row) => {
				return gridjs.h('button', {
					className: 'btn btn-dark bg-dark p-2 text-light rounded border border-dark',
					id: 'btnRemoveAluno',
					onMouseOver: (event) => {
						event.target.classList.add('btn-light', 'bg-light', 'text-dark');
						event.target.classList.remove('btn-dark', 'bg-dark', 'text-light');
						event.target.style.border = '1px solid #000';
					},
					onMouseOut: (event) => {
						event.target.classList.remove('btn-light', 'bg-light', 'text-dark');
						event.target.classList.add('btn-dark', 'bg-dark', 'text-light');
						event.target.style.border = 'none';
					},
					onClick: () => {
						alert(`Remover aluno: ${row.cells[0].data}`);
						// Adicione aqui a lógica para remover o aluno
					},
				}, '- Aluno');
			},
		},
	],
	server: {
		url: 'http://localhost:3000/getAlunos', // Coloque aqui a URL da sua API
		then: data => data.map(aluno => [
			aluno.email,
			aluno.squadId,
			aluno.Nome || 'N/A', // Usando 'N/A' se Nome for null
			aluno.Sobrenome || 'N/A', // Usando 'N/A' se Sobrenome for null
			aluno.Curso || 'N/A', // Usando 'N/A' se Curso for null
			null, // Esta célula será substituída pelo botão de Ações
		]),
	},
}).render(document.getElementById('wrapper'));


document.addEventListener('DOMContentLoaded', function() {
	const gridjsheader = document.querySelector('.gridjs-head');
	const gridButtons = document.createElement('div');
	gridButtons.classList.add('gridjs-buttons', 'd-flex', 'justify-content-end', 'align-items-center', 'p-2');
	gridButtons.style.zIndex = 9999; // set the button z-index

	const btnAddAluno = document.createElement('button');
	btnAddAluno.id = 'btnAddAluno';
	btnAddAluno.classList.add('btn', 'btn-dark', 'bg-dark', 'p-2', 'text-light', 'rounded', 'me-2', 'ms-2', 'border', 'border-dark');
	btnAddAluno.style.zIndex = 9999; // set the button z-index
	btnAddAluno.addEventListener('mouseover', () => {
		btnAddAluno.classList.add('btn-light', 'bg-light', 'text-dark');
		btnAddAluno.classList.remove('btn-dark', 'bg-dark', 'text-light');
		btnAddAluno.style.border = '1px solid #000';
	});
	btnAddAluno.setAttribute('data-bs-toggle', 'modal');
	btnAddAluno.setAttribute('data-bs-target', '#exampleModal');
	btnAddAluno.addEventListener('mouseout', () => {
		btnAddAluno.classList.remove('btn-light', 'bg-light', 'text-dark');
		btnAddAluno.classList.add('btn-dark', 'bg-dark', 'text-light');
		btnAddAluno.style.border = 'none';
	});
	btnAddAluno.textContent = '+ Aluno'; // set the button text


	gridButtons.append(btnAddAluno); // append the button to the header
	gridjsheader.append(gridButtons); // append the header to the grid

	const addAlunoForm = document.getElementById('addAlunoForm');
	addAlunoForm.addEventListener('submit', function(event) {
		// Previne o comportamento padrão do formulário
		event.preventDefault();

		// Coleta os dados do formulário
		const alunoData = {
			email: document.getElementById('alunoEmail').value,
			squadId: document.getElementById('alunoSquadId').value,
			Nome: document.getElementById('alunoNome').value,
			Sobrenome: document.getElementById('alunoSobrenome').value,
			Curso: document.getElementById('alunoCurso').value,
		};

		fetch('http://localhost:3000/insertAluno', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(alunoData),
		})
			.then(response => {
				if (response.headers.get('Content-Type').includes('application/json')) {
					return response.json(); // processa a resposta como JSON
				}
				throw new Error('A resposta não é JSON: ' + response.statusText); // Lança um erro se não for JSON
			})
			.then(data => {
				console.log(data);
				alert(data.message); // Mostra a mensagem de sucesso
				bootstrap.Modal.getInstance(document.getElementById('exampleModal')).hide();
				reloadAlunoGrid();
			})
			.catch(error => {
				console.error('Erro ao adicionar o aluno:', error);
				alert(error.message); // Mostra o erro
			});
	});
});

function reloadAlunoGrid() {
	// Se você tiver uma função específica para buscar dados,
	// você pode chamar essa função e então usar updateConfig
	// para passar os novos dados para o grid e renderizar novamente
	fetch('http://localhost:3000/getAlunos')
		.then(response => response.json())
		.then(data => {
			alunoGrid.updateConfig({
				data: data.map(aluno => [
					aluno.email,
					aluno.squadId,
					aluno.Nome || 'N/A',
					aluno.Sobrenome || 'N/A',
					aluno.Curso || 'N/A',
					gridjs.html('<button class="btn btn-dark bg-dark p-2 text-light rounded border border-dark" onclick="removeAluno(event, this)">- Aluno</button>'),
				]),
			}).forceRender();
		})
		.catch(error => {
			console.error('Erro ao recarregar os dados do grid:', error);
		});
}

