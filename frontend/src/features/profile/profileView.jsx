import {
	Camera,
	ChevronLeft,
	ChevronRight,
	Lock,
	Search,
} from 'lucide-react';

import {
	RESULT_FILTER_OPTIONS,
	SORT_OPTIONS,
} from './profile.model';
import { useProfileLogic } from './useProfileLogic';
import './profile.css';

const formatDate = (isoDateString) => {
	if (!isoDateString) {
		return '--';
	}

	return new Date(isoDateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
};

const formatMemberSince = (value) => {
	return new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const formatGameType = (value) => {
	switch ((value || '').toUpperCase()) {
		case 'ONLINE':
			return 'Online';
		case 'LOCAL':
			return 'Local';
		case 'SINGLE':
			return 'AI';
		default:
			return 'Unknown';
	}
};

const MatchResultBadge = ({ result }) => {
	const normalizedResult = (result || 'LOSS').toLowerCase();

	return (
		<span className={`match-result-badge match-result-badge--${normalizedResult}`}>
			{result}
		</span>
	);
};

const ProfileView = () => {
	const {
		profile,
		matchItems,
		pagination,
		summary,
		stats,
		query,
		isLoading,
		errorMessage,
		updateSearch,
		updateResultFilter,
		updateDateFilter,
		updateSortOrder,
		goToNextPage,
		goToPreviousPage,
		clearFilters,
	} = useProfileLogic();

	return (
		<div className="profile-page">
			<main className="profile-shell">
				<section className="profile-grid">
					<article className="profile-card profile-card--identity">
						<div className="profile-avatar-wrap">
							<div className="profile-avatar-ring">
								{profile.avatarUrl ? (
									<img src={profile.avatarUrl} alt={profile.username} className="profile-avatar-image" />
								) : (
									<span className="profile-avatar-fallback">{profile.username.slice(0, 1).toUpperCase()}</span>
								)}
							</div>

							<button className="avatar-upload-button" type="button" aria-label="Upload avatar">
								<Camera size={18} />
							</button>
						</div>

						<h1 className="profile-username">{profile.username}</h1>
						<p className="profile-meta">{profile.countryFlag} {profile.country}</p>
						<p className="profile-meta">Member since {formatMemberSince(profile.memberSince)}</p>

						{profile.premium && <span className="premium-badge">Premium Member</span>}

						<div className="profile-stats-grid">
							<div className="profile-stat-card">
								<strong>{stats.totalGames}</strong>
								<span>Total Games</span>
							</div>
							<div className="profile-stat-card">
								<strong className="color-win">{stats.wins}</strong>
								<span>Wins</span>
							</div>
							<div className="profile-stat-card">
								<strong className="color-loss">{stats.losses}</strong>
								<span>Losses</span>
							</div>
							<div className="profile-stat-card">
								<strong>{stats.winRate}%</strong>
								<span>Win Rate</span>
							</div>
						</div>
					</article>

					<article className="profile-card profile-card--history">
						<header className="history-header">
							<div>
								<h2>Match History</h2>
								<p>Search by match ID or opponent, then filter and sort.</p>
							</div>
						</header>

						<div className="history-controls">
							<label className="field field--search" htmlFor="match-search">
								<span className="field-label">Search</span>
								<div className="search-input-wrap">
									<Search size={18} />
									<input
										id="match-search"
										type="text"
										placeholder="Search by match ID or opponent"
										value={query.search}
										onChange={(event) => updateSearch(event.target.value)}
									/>
								</div>
							</label>

							<label className="field" htmlFor="result-filter">
								<span className="field-label">Result</span>
								<select
									id="result-filter"
									value={query.result}
									onChange={(event) => updateResultFilter(event.target.value)}
								>
									{RESULT_FILTER_OPTIONS.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</label>

							<label className="field" htmlFor="date-filter">
								<span className="field-label">Date</span>
								<input
									id="date-filter"
									type="date"
									value={query.date}
									onChange={(event) => updateDateFilter(event.target.value)}
								/>
							</label>

							<label className="field" htmlFor="sort-order">
								<span className="field-label">Sort</span>
								<select
									id="sort-order"
									value={query.sortOrder}
									onChange={(event) => updateSortOrder(event.target.value)}
								>
									{SORT_OPTIONS.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</label>
						</div>

						<div className="history-controls history-controls--secondary">
							<p className="field-label">Showing matches for your signed-in account.</p>

							<button className="clear-button" onClick={clearFilters} type="button">
								Reset Filters
							</button>
						</div>

						{errorMessage && <p className="state-message state-message--error">{errorMessage}</p>}
						{isLoading && <p className="state-message">Loading matches...</p>}

						{!isLoading && !errorMessage && (
							<>
								<div className="table-wrap desktop-only">
									<table>
										<thead>
											<tr>
												<th>Match</th>
												<th>Type</th>
												<th>Opponent</th>
												<th>Result</th>
												<th>Board</th>
												<th>Date</th>
												<th>Replay</th>
											</tr>
										</thead>

										<tbody>
											{matchItems.map((match) => (
												<tr key={match.matchId}>
													<td className="mono">{match.matchId.slice(0, 8)}</td>
													<td>{formatGameType(match.gameType)}</td>
													<td>{match.opponentName}</td>
													<td><MatchResultBadge result={match.result} /></td>
													<td className="mono">{match.boardSize}x{match.boardSize}</td>
													<td>{formatDate(match.playedAt)}</td>
													<td>
														{profile.premium ? (
															<button className="replay-button" type="button">Replay</button>
														) : (
															<Lock size={16} className="lock-icon" />
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								<div className="mobile-cards mobile-only">
									{matchItems.map((match) => (
										<article className="history-mobile-card" key={match.matchId}>
											<div className="history-mobile-row">
												<strong>{match.opponentName}</strong>
												<MatchResultBadge result={match.result} />
											</div>

											<div className="history-mobile-row">
												<span>{formatGameType(match.gameType)}</span>
												<span className="mono">{match.boardSize}x{match.boardSize}</span>
												<span>{formatDate(match.playedAt)}</span>
											</div>

											<p className="match-id-label">Match: <span className="mono">{match.matchId}</span></p>
										</article>
									))}
								</div>

								{matchItems.length === 0 && (
									<p className="state-message">No matches found for current filters.</p>
								)}

								<footer className="history-footer">
									<p>
										Showing {summary.start}-{summary.end} of {summary.total} matches
									</p>

									<div className="pagination-controls">
										<button
											type="button"
											onClick={goToPreviousPage}
											disabled={!pagination.hasPreviousPage}
										>
											<ChevronLeft size={16} />
											Previous
										</button>

										<span>Page {pagination.page} of {Math.max(pagination.totalPages, 1)}</span>

										<button
											type="button"
											onClick={goToNextPage}
											disabled={!pagination.hasNextPage}
										>
											Next
											<ChevronRight size={16} />
										</button>
									</div>
								</footer>
							</>
						)}
					</article>
				</section>
			</main>
		</div>
	);
};

export default ProfileView;

