const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');
const openDb = require('../../../db/database');

async function saveUserResponse(userId, email, squad) {
	const db = await openDb();

	try {
		const query = await db.run('INSERT INTO user_responses (userId, email, squad) VALUES (?, ?, ?)', [userId, email, squad]);
		console.log(query);
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
		.setDescription('Inicia o processo de registro.'),

	async execute(interaction) {
		await interaction.reply('Por favor acompanhe o registro no tópico abaixo!');
		const thread = await interaction.channel.threads.create({
			name: `Registro de ${interaction.user.tag}`,
			autoArchiveDuration: 60,
			reason: 'Registro do usuário',
		});


		const filter = m => m.author.id === interaction.user.id;

		await thread.send('Qual seu email?');

		const emailResponse = await thread.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
			.then(collected => collected.first()?.content)
			.catch(() => 'Sem resposta');
		console.log(emailResponse);

		await thread.send('Qual número do seu squad?');
		const squadResponse = await thread.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
			.then(collected => collected.first()?.content)
			.catch(() => 'Sem resposta');
		console.log(squadResponse);

		// Após coletar ambas as respostas, salve-as no banco de dados
		await saveUserResponse(interaction.user.id, emailResponse, squadResponse);

		// Pergunta 3
		const stringSelectMenu = new StringSelectMenuBuilder()
			.setCustomId('atribuicao')
			.setPlaceholder('Selecione sua atribuição')
			.addOptions([
				{ label: 'Mentor', value: 'MENTOR' },
				{ label: 'Aluno', value: 'ALUNO' },
				{ label: 'Empresa', value: 'EMPRESA' },
			]);
		await thread.send({
			content: 'Qual a sua atribuição no Porto Digital?',
			components: [new ActionRowBuilder().addComponents(stringSelectMenu)],
		});

	},
};