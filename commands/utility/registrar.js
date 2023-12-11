const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const roles = {
	ALUNO: '1151240188991918100',
	MENTOR: '1151239910968283156',
	EMPRESA: '1183132473543106695',
};

async function checkUser(email, squad, atribuicao) {
	const db = await open({
		filename: 'portodigitaldiscord.db',
		driver: sqlite3.Database,
	});

	try {
		let query = '';
		if (atribuicao === 'ALUNO') {
			query = 'SELECT * FROM aluno WHERE email = ? AND squadId = ?';
		}
		else if (atribuicao === 'MENTOR') {
			query = 'SELECT * FROM squad WHERE mentorEmail = ? AND id = ?';
		}
		else if (atribuicao === 'EMPRESA') {
			query = 'SELECT * FROM squad WHERE empresaEmail = ? AND id = ?';
		}
		console.log(query);
		const user = await db.get(query, [email, squad]);
		console.log(user);
		return user !== undefined;
	}
	catch (error) {
		console.log(error);
	}
	finally {
		await db.close();
	}
}

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('registrar')
		.setDescription('Registra um usuário com o seu e-mail e squad.')
		.addStringOption(option =>
			option.setName('email')
				.setDescription('O e-mail do usuário')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('squad')
				.setDescription('O número do squad')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('atribuicao')
				.setDescription('A atribuição do usuário (Mentor, Aluno, Empresa)')
				.setRequired(true)),

	async execute(interaction) {
		const email = interaction.options.getString('email');
		const squad = interaction.options.getInteger('squad');
		const atribuicao = interaction.options.getString('atribuicao').toUpperCase();

		if (!['MENTOR', 'ALUNO', 'EMPRESA'].includes(atribuicao)) {
			await interaction.reply({ content: 'Você precisa escolher uma atribuição entre Mentor, Aluno ou Empresa.', ephemeral: true });
			return;
		}

		const isUserRegistered = await checkUser(email, squad, atribuicao);

		if (isUserRegistered) {
			try {
				// Obter o usuário do Discord a partir da interação
				const member = await interaction.guild.members.fetch(interaction.user.id);

				// Obter o ID do role baseado na atribuição
				const roleId = roles[atribuicao];
				if (roleId) {
					// Adicionar o role ao usuário
					await member.roles.add(roleId);
					await interaction.reply({ content:`Usuário cadastrado com a atribuição de ${atribuicao}.`, ephemeral: true });
				}
				else {
					await interaction.reply({ content: 'Atribuição não reconhecida.', ephemeral: true });
				}
			}
			catch (error) {
				console.error(error);
				await interaction.reply({ content:'Houve um erro ao atribuir o role.', ephemeral: true });
			}
		}
		else {
			await interaction.reply({ content: 'Usuário não encontrado ou dados não correspondem.', ephemeral: true });
		}
	},
};