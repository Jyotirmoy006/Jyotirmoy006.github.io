import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Explore from './pages/Explore'; // The Matrix grid
import LocationDetail from './pages/LocationDetail'; // Individual wards
import Matrix from './pages/Matrix'; // Sector comparison
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/matrix" element={<Matrix />} />
        <Route path="/location/:id" element={<LocationDetail />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;