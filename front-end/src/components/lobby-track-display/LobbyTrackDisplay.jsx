import React from 'react';
import './lobby-track-display.scss';

export default function LobbyTrackDisplay({ queue }) {
	const song = queue[0] || { ui: {} };
	const { trackCover, trackName, artists } = song.ui;
	console.log(song);
	return song ? (
		<div className='track-display-wrapper'>
			<div className='track-display-top'>
				<div className='track-display-left'>
					<img className='track-cover' src={trackCover} alt='' />
				</div>
				<div className='track-display-right'>
					<p className='track-title'>{trackName}</p>
					<p className='artists'>{artists}</p>
				</div>
			</div>
			<div className='queue-header'>
				<p className='header-text track-index'>#</p>
				<p className='header-text track-title'>Title</p>
				<p className='header-text track-user'>Added By</p>
				<p className='header-text track-duration'>duration</p>
			</div>
		</div>
	) : null;
}
