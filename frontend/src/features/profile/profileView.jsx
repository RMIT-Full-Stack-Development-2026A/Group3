import {
	Camera,
	ChevronLeft,
	ChevronRight,
	Lock,
	Search,
} from 'lucide-react';


const ProfileView = () => {
	return (
		<div className="profile-page">
			<main className="profile-shell">
				<section className="profile-grid">
					<article className="profile-card profile-card--identity">
						<div className="profile-avatar-wrap">
							<div className="profile-avatar-ring">
								<img className="profile-avatar" alt="none" />
							</div>

							<button className="avatar-upload-button" type="button" aria-label="Upload avatar">
								<Camera size={18} />
							</button>
						</div>

						<h1 className="profile-username">username</h1>
						<p className="profile-meta"> </p>
						<p className="profile-meta">Member since</p>

						<span className="premium-badge">Premium Member</span>

						<div className="profile-stats-grid">
							<div className="profile-stat-card">
								<strong>0</strong>
								<span>Total Games</span>
							</div>
							<div className="profile-stat-card">
								<strong className="color-win">0</strong>
								<span>Wins</span>
							</div>
							<div className="profile-stat-card">
								<strong className="color-loss">0</strong>
								<span>Losses</span>
							</div>
							<div className="profile-stat-card">
								<strong>0%</strong>
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
									/>
								</div>
							</label>

							<label className="field" htmlFor="result-filter">
								<span className="field-label">Result</span>
								<select
									id="result-filter"
								>
									<option value="">All Results</option>
									<option value="win">Wins</option>
									<option value="loss">Losses</option>
								</select>
							</label>

							<label className="field" htmlFor="date-filter">
								<span className="field-label">Date</span>
								<input
									id="date-filter"
									type="date"
								/>
							</label>

							<label className="field" htmlFor="sort-order">
								<span className="field-label">Sort</span>
								<select
									id="sort-order"
                                >
									<option value="date">Date</option>
									<option value="result">Result</option>
								</select>
							</label>
						</div>

						<div className="history-controls history-controls--secondary">
							<p className="field-label">Showing matches for your signed-in account.</p>

							<button className="clear-button" type="button">
								Reset Filters
							</button>
						</div>
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
                                </tbody>
                            </table>
                        </div>

                        <div className="mobile-cards mobile-only">
                        </div>

                        <footer className="history-footer">
                            <p>Summary: Showing 0 of 0 matches
                            </p>

                            <div className="pagination-controls">
                                <button
                                    type="button"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>

                                <span>Page </span>

                                <button type="button">
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </footer>
					</article>
				</section>
			</main>
		</div>
	);
};

export default ProfileView;

