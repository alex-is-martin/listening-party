const axios = require('axios');

// Returns basic headers required by almost every spotify api end point
function defaultHeader(token) {
	return {
		headers: {
			Accept: 'application/json',
			'content-type': 'application/json',
			Authorization: 'Bearer ' + token,
		},
	};
}

// Perfoms a basic track and album search on spotify
async function search(searchValue, token) {
	const endPoint = '	https://api.spotify.com/v1/search';
	const config = {
		headers: defaultHeader(token).headers,
		params: {
			q: searchValue,
			type: 'album,track',
			limit: 5,
		},
	};

	try {
		const res = await axios.get(endPoint, config);
		return res.data;
	} catch (err) {
		// TODO
	}
}

// Perfoms a track search on spotify by query
async function searchForTrack(searchValue, token) {
	const endPoint = '	https://api.spotify.com/v1/search';
	const config = {
		headers: defaultHeader(token).headers,
		params: {
			q: searchValue,
			type: 'track',
			limit: 20,
		},
	};

	try {
		const res = await axios.get(endPoint, config);
		return res.data;
	} catch (err) {
		// TODO
	}
}

// Perfoms an album search on spotify by query
async function searchForAlbum(searchValue, token) {
	const endPoint = '	https://api.spotify.com/v1/search';
	const config = {
		headers: defaultHeader(token).headers,
		params: {
			q: searchValue,
			type: 'album',
			limit: 20,
		},
	};

	try {
		const res = await axios.get(endPoint, config);
		return res.data;
	} catch (err) {
		// TODO
	}
}

// Format song data for spotify player
function formatSongData(songData) {
	return songData.id;
}

// Search for a song using apple data and return the id of the result
async function getAndFormatSongData(
	{ trackName, artists, uniId },
	spotifyToken
) {
	// Raw results directly from song and artist search by query
	const rawResults = await searchForTrack(
		`${trackName} ${artists}`,
		spotifyToken
	);

	// Attempt to find a song match by isrc
	const songMatch = rawResults.tracks.items.find(
		(song) => song.external_ids.isrc === uniId
	);

	// If found return the songs id
	return songMatch.id;
}

// Search for an album using apple data and return all the uri's if found
async function albumSearchAndFormat({ albumName, artists }, token) {
	// Raw results directly from album search by query
	const rawResults = await searchForAlbum(`${albumName} ${artists}`, token);

	// Attempt to find an album match by name
	const albumMatch = rawResults.albums.items.find(
		(album) => album.name === albumName
	);

	// If we find a match get the album directly by id
	const spotifyAlbum = await spotifyAlbumSearchById(albumMatch, token);

	// Return all uris for songs in album
	return spotifyAlbum.items.map((track) => track.uri);
}

// When this is called we already have the albums id
// Just grab the album directly by id and pull out the data for all songs in the albums
// TODO we dont have to search by id, just save all songs data in the front end when inital search is made
async function formatAlbum(album, token) {
	// get album by id
	const results = await spotifyAlbumSearchById(album, token);

	// Data that will be used by player and ui
	let dataForPlayer = [];
	let dataForUi = [];

	// Iterate through each song and grab necessary data
	results.items.forEach((track) => {
		// Data player needs
		dataForPlayer.push(track.uri);
		// Data ui needs
		dataForUi.push({
			trackName: track.name,
			artists: track.artists.map(({ name }) => name).join(', '),
			trackCover: album.albumCover,
			id: track.id,
		});
	});

	// Return data required by spotify's player and data used by ui
	return { dataForPlayer, dataForUi };
}

// Get album directly by id
async function spotifyAlbumSearchById(album, token) {
	const endPoint = `	https://api.spotify.com/v1/albums/${album.id}/tracks`;
	try {
		const res = await axios.get(endPoint, defaultHeader(token));
		return res.data;
	} catch (err) {
		// TODO
	}
}

// Get the users id and create a playlist on their account and return playlist uri
async function createTempPlaylist(token) {
	const user = await getUserData(token);
	const uri = await createPlaylist(token, user.data.id);
	return uri;
}

// Get the users account data
async function getUserData(token) {
	const endPoint = 'https://api.spotify.com/v1/me';

	try {
		const user = await axios.get(endPoint, defaultHeader(token));
		return user;
	} catch (err) {
		// TODO
	}
}

// Creates a temp playlist on users account and returns the playlist uri
async function createPlaylist(token, id) {
	const endPoint = `https://api.spotify.com/v1/users/${id}/playlists`;
	const body = {
		name: 'Listening Party!',
		description: 'A temporary playlist used for our app to work',
		public: false,
	};

	try {
		const res = await axios.post(endPoint, body, defaultHeader(token));
		return res.data.id;
	} catch (err) {
		// TODO
	}
}

// Adds a song by id to the users temp playlist
async function addSongToPlaylist(songId, user) {
	const { token, playlistId } = user;
	const endPoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
	const body = {
		uris: [`spotify:track:${songId}`],
	};

	try {
		await axios.post(endPoint, body, defaultHeader(token));
	} catch (err) {
		// TODO
	}
}

// Adds an entire album to the users temp playlist by array of uris
async function addAlbumToPlaylist(uriArray, user) {
	const { token, playlistId } = user;
	const endPoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
	const body = {
		uris: uriArray,
	};

	try {
		await axios.post(endPoint, body, defaultHeader(token));
	} catch (err) {
		// TODO
	}
}

// Make request to spotify api to start the player
async function playSong(token) {
	const endPoint = 'https://api.spotify.com/v1/me/player/play';
	try {
		await axios.put(endPoint, {}, defaultHeader(token));
	} catch (err) {
		// TODO
	}
}

//TODO when play is hit for the first time set playback to the correct playlist
async function setPlaybackToNewPlaylist(device_id, uri, token) {
	const endPoint = 'https://api.spotify.com/v1/me/player/play';
	const body = {
		device_id: device_id,
		context_uri: uri,
		offset: {
			position: 0,
		},
		position_ms: 0,
	};

	try {
		const res = await axios.put(endPoint, body, defaultHeader(headers));
	} catch (err) {
		// TODO
	}
}

module.exports = {
	playSong,
	search,
	createTempPlaylist,
	addSongToPlaylist,
	formatSongData,
	getAndFormatSongData,
	formatAlbum,
	addAlbumToPlaylist,
	albumSearchAndFormat,
};
