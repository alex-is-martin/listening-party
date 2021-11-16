// Stores all lobbies
let lobbies = [];

// Generates a new lobby and admin
function generateLobby(data) {
	const newLobby = {
		lobby_id: data.lobby_id,
		users: [generateUser(data, 'admin')],
		queue: [],
		messages: [],
		players: generatePlayersTracker(data),
	};

	lobbies.push(newLobby);
}

// Generates a user with information passed in from the front end
function generateUser(data, privilege) {
	return {
		username: data.username,
		privilege: privilege,
		token: data.token,
		refresh_token: data.refresh_token,
		music_provider: data.music_provider,
		user_id: data.user_id,
		playlistId: data.playlistId,
	};
}

// Creates object that keeps track of players in the lobby
function generatePlayersTracker({ music_provider, token }) {
	// Create players object with one spotify player
	return music_provider === 'spotify'
		? {
				spotify: {
					token: token,
					count: 1,
				},
				apple: {
					token: '',
					count: 0,
				},
		  }
		: // Create players object with one apple player
		  {
				spotify: {
					token: '',
					count: 0,
				},
				apple: {
					token: token,
					count: 1,
				},
		  };
}

// Check if lobby exists
function lobbyExists(lobby_id) {
	return getLobbyById(lobby_id);
}

// join new user into lobby
function joinLobby(data) {
	const newUser = generateUser(data, 'guest');
	const i = getLobbyIndex(data.lobby_id);
	addDesignatedPlayer(i, data);
	lobbies[i].users.push(newUser);
}

// Get index of passed lobby within lobbies array
function getLobbyIndex(lobby_id) {
	return lobbies.findIndex((lobby) => lobby.lobby_id == lobby_id);
}

// Get lobby data by its id
function getLobbyById(lobby_id) {
	const lobby = lobbies.find((lobby) => lobby.lobby_id == lobby_id);
	return lobby;
}

// Find the users data by first finding the lobby by id then the user by id
function getUserById(lobby_id, user_id) {
	return getLobbyById(lobby_id).users.find((user) => user.user_id == user_id);
}

// Get all members usernames by first finding the lobb by id then iterating through the users
function getMemberUsernames(lobby_id) {
	return getLobbyById(lobby_id).users.map((user) => user.username);
}

// Get lobbies messages by first finding the lobby by id then grabbing the messages
function getLobbyMessages(lobby_id) {
	return getLobbyById(lobby_id).messages;
}

// Adds a message to the lobby by first finding the lobbies index then inserting the new message to the lobby
function addMessageToLobby(message, { user }) {
	const i = getLobbyIndex(user.lobby_id);
	lobbies[i].messages.push(message);
	return lobbies[i].messages;
}

// Adds song to lobby by first finding the index then adding the song to the lobby queue
function addSongToLobby(lobby_id, songData) {
	const i = getLobbyIndex(lobby_id);
	lobbies[i].queue.push(songData);
}

// Adds designed player to the lobby
function addDesignatedPlayer(lobbyIndex, { music_provider, token }) {
	// Get info on players in lobby
	const { spotify, apple } = lobbies[lobbyIndex].players;
	const bothPlayersUsed = spotify.count > 0 && apple.count > 0;
	const playerInUse = spotify.count > 0 ? 'spotify' : 'apple';

	// If only one player is being used and the new users player is unique
	if (!bothPlayersUsed && playerInUse !== music_provider) {
		// Update the players count and add token to be used for searches
		if (music_provider === 'spotify') {
			lobbies[lobbyIndex].players.spotify.count += 1;
			lobbies[lobbyIndex].players.spotify.token = token;
		} else {
			lobbies[lobbyIndex].players.apple.count += 1;
			lobbies[lobbyIndex].players.apple.token = token;
		}
		// Both players are already being used just update the count
	} else {
		if (music_provider === 'spotify') {
			lobbies[lobbyIndex].players.spotify.count += 1;
		} else {
			lobbies[lobbyIndex].players.apple.count += 1;
		}
	}
}

module.exports = {
	generateLobby,
	lobbyExists,
	getLobbyById,
	joinLobby,
	getUserById,
	getMemberUsernames,
	addMessageToLobby,
	getLobbyMessages,
	addSongToLobby,
};
