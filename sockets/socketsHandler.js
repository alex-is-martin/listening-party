const lobbyFunctions = require('./lobbyFunctions');
const spotifyFunctions = require('./spotifyFunctions');
const appleFunctions = require('./appleFunctions');
const helperFunctions = require('./helperFunctions');
const {
	createNewLobby,
	joinLobby,
	lobbyExists,
	getUserById,
	getMemberUsernames,
	addMessageToLobby,
	getLobbyMessages,
	getLobbyById,
} = lobbyFunctions;
const { playSong, search } = spotifyFunctions;
const { appleSearch } = appleFunctions;
const { formatSearchResults } = helperFunctions;

function socketsHandler(io) {
	io.sockets.on('connection', function (socket) {
		console.log('----- connection -----');

		// Handle when someone creates lobby or joins lobby
		socket.on('joinLobby', (data) => {
			const { lobby_id, username } = data;
			data.user_id = socket.id;
			socket.join(lobby_id);

			if (!lobbyExists(lobby_id)) {
				createNewLobby(data);
				io.to(lobby_id).emit('setLobbyInfo', {
					members: [username],
					lobbyMessages: [],
				});
			} else {
				joinLobby(data);
				io.to(lobby_id).emit('setLobbyInfo', {
					members: getMemberUsernames(lobby_id),
					lobbyMessages: getLobbyMessages(lobby_id),
				});
			}
		});

		socket.on('disconnect', () => {
			console.log('----- disconnected -----');
		});

		// Handle when someone send a message in their lobby
		socket.on('message', ({ lobby_id, message }) => {
			const user = getUserById(lobby_id, socket.id);
			addMessageToLobby(lobby_id, message, user.username);
			io.to(lobby_id).emit(
				'lobbyMessage',
				getLobbyMessages(lobby_id)
			);
		});

		// Handle Apple search request
		socket.on('appleSearch', async (song, lobby_id) => {
			const user = getUserById(lobby_id, socket.id);
			let searchResults = await appleSearch(song, user.token);
			io.to(socket.id).emit('appleSearchResults', searchResults);
		});

		// Handle Spotify search request
		socket.on(
			'uniSearch',
			async (searchValue, token, { music_provider }) => {
				let searchResults;
				if (music_provider === 'spotify') {
					searchResults = await search(searchValue, token);
				} else {
					searchResults = await appleSearch(searchValue, token);
				}

				const formattedSearchResults = formatSearchResults(
					searchResults,
					music_provider
				);

				io.to(socket.id).emit(
					'uniSearchResults',
					formattedSearchResults
				);
			}
		);

		// [{ id, type: 'album or song'}]
		socket.on('addSongToQueue', (song) => {
			console.log(song);
			// handle spotify or apple

			// send dispaly queue
		});

		// Handle when someone clicks play
		socket.on('playSong', (lobby_id) => {
			const members = getLobbyById(lobby_id).users;
			members.forEach(({ music_provider, token, user_id }) => {
				if (music_provider === 'spotify') {
					playSong(token);
				} else {
					io.to(user_id).emit('playApple');
				}
			});
		});
	});
}

module.exports = socketsHandler;
exports = module.exports;
