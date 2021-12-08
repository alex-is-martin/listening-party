//Adds and removes event listeners
let removeEventListener = (applePlayer) => {
	applePlayer.removeEventListener('mediaItemDidChange', () => {});
};
let addEventListener = (applePlayer, socket, lobby_id, toAdd) => {
	applePlayer.addEventListener('mediaItemDidChange', () => {
		socket.emit('mediaChange', { lobby_id });
	});
	if (toAdd) {
		applePlayer.player.addEventListener('playbackStateDidChange', () => {
			if (applePlayer.player.playbackState === 10) {
				socket.emit('mediaChange', { lobby_id });
			}
		});
	}
};

//Variables for joining lobby
let timeStampOnJoin = 0;
let joinOnPause = false;

//Helpers
//Sets musicQueue
async function setMusicKitQueue(applePlayer, id) {
	await applePlayer.authorize();
	await applePlayer.setQueue({
		song: id,
	});
}

//Start up function that sets intial values, listeners and catches up to existing
//players
export async function startUp(
	applePlayer,
	socket,
	lobby_id,
	playerStatus,
	queue,
	setPlaying
) {
	addEventListener(applePlayer, socket, lobby_id, true);
	applePlayer.player.volume = 0.1;
	if (playerStatus && queue.length > 0) {
		await setMusicKitQueue(applePlayer, queue[0].apple);
		timeStampOnJoin = playerStatus.timestamp / 1000;
		if (!playerStatus.paused) {
			await handlePlay(applePlayer, socket, lobby_id, setPlaying);
			await applePlayer.seekToTime(timeStampOnJoin);
			setPlaying(true);
		} else {
			joinOnPause = true;
		}
	}
}
//Sends other players playerData
export function handleGetPlayerData(applePlayer, memberId, lobby_id, socket) {
	socket.emit('playerData', {
		paused: !applePlayer.player.isPlaying,
		timestamp: applePlayer.player.currentPlaybackTime * 1000,
		lobby_id,
		memberId,
	});
}
//Handles play
export async function handlePlay(applePlayer, socket, lobby_id, setPlaying) {
	await applePlayer.authorize();
	removeEventListener(applePlayer);
	await applePlayer.play();
	if (joinOnPause) {
		await applePlayer.seekToTime(timeStampOnJoin);
		joinOnPause = false;
	}
	setPlaying(true);
	socket.emit('userReady', { user: { lobby_id } });
	addEventListener(applePlayer, socket, lobby_id, false);
}
//Handles pause
export async function handlePause(applePlayer, socket, lobby_id, setPlaying) {
	await applePlayer.authorize();
	removeEventListener(applePlayer);
	await applePlayer.pause();
	setPlaying(false);
	socket.emit('userReady', { user: { lobby_id } });
	addEventListener(applePlayer, socket, lobby_id, false);
}
//Handles first song add
export async function handleFirstSong(applePlayer, queue, socket, lobby_id) {
	await setMusicKitQueue(applePlayer, queue[0].apple);
	socket.emit('userReady', { user: { lobby_id } });
}
//Handles popping
export async function handlePopped(
	applePlayer,
	socket,
	queue,
	lobby_id,
	setPlaying
) {
	await setMusicKitQueue(applePlayer, queue[0].apple);
	socket.emit('userReady', { user: { lobby_id } });
	handlePlay(applePlayer, socket, lobby_id, setPlaying);
}
//Handles empty queue
export async function handleEmptyQueue(
	applePlayer,
	socket,
	lobby_id,
	setPlaying
) {
	handlePause(applePlayer, socket, lobby_id, setPlaying);
	socket.emit('userReady', { user: { lobby_id } });
}

export async function handleRemoveFirst(
	applePlayer,
	socket,
	lobby_id,
	setPlaying,
	newQueue,
	isPlaying
) {
	await setMusicKitQueue(applePlayer, newQueue[0].apple);
	if (isPlaying) {
		handlePlay(applePlayer, socket, lobby_id, setPlaying);
	} else {
		handlePause(applePlayer, socket, lobby_id, setPlaying);
	}
}
