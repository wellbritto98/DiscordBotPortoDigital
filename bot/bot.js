const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const openDb = require('../db/database');

const roles = {
	ALUNO: '1151240188991918100',
	MENTOR: '1151239910968283156',
	EMPRESA: '1183132473543106695',
};

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
async function checkUser(email, squad, atribuicao) {
	const db = await openDb();

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

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isStringSelectMenu()) return;

	if (interaction.customId === 'atribuicao') {
		await interaction.deferReply({ ephemeral: true });
		const userResponses = await getUserResponses(interaction.user.id);


		if (userResponses) {
			const { email, squad } = userResponses;
			const atribuicao = interaction.values[0];
			console.log(userResponses);
			console.log(atribuicao);

			// Aqui você insere a lógica para verificar o usuário e adicionar o cargo
			const usuarioExiste = await checkUser(email, squad, atribuicao);


			if (usuarioExiste) {
				const role = interaction.guild.roles.cache.get(roles[atribuicao]);
				await interaction.member.roles.add(role);
				await interaction.followUp({ content: 'Registro completado com sucesso! Este tópico será deletado em 20 segundos.' });
				setTimeout(async () => {
					if (interaction.channel) {
						await deleteUserResponse(interaction.user.id);
						await interaction.channel.delete()
							.then(console.log)
							.catch(console.error);
					}
				}, 20000);


			}
			else {
				await interaction.followUp({ content: 'Usuário não registrado ou informações incorretas. Revise os dados do cadastro, ou consulte o suporte. Este tópico será deletado em 20 segundos.', ephemeral: true });
				setTimeout(async () => {
					if (interaction.channel) {
						await deleteUserResponse(interaction.user.id);
						await interaction.channel.delete()
							.then(console.log)
							.catch(console.error);
					}
				}, 5000);
			}
		}
		else {
			await interaction.followUp({ content: 'Não foi possível encontrar suas respostas anteriores.', ephemeral: true });
		}
	}
});

async function getUserResponses(userId) {
	const db = await openDb();

	let responses;
	try {
		responses = await db.get('SELECT email, squad FROM user_responses WHERE userId = ?', [userId]);
	}
	catch (error) {
		console.log(error);
	}
	finally {
		await db.close();
	}

	return responses;
}
async function deleteUserResponse(userId) {
	const db = await openDb();

	try {
		await db.run('DELETE FROM user_responses WHERE userId = ?', [userId]);
	}
	catch (error) {
		console.log(error);
	}
	finally {
		await db.close();
	}
}


client.login(token);
client.cooldowns = new Collection();