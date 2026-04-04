import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import ProfileView from './features/profile/profileView';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/profile" element={<ProfileView />} />
				<Route path="/" element={<Navigate to="/profile" replace />} />
				<Route path="*" element={<Navigate to="/profile" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;

