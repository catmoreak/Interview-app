import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MeetingDashboard from './components/MeetingDashboard';
import MeetingRoom from './components/MeetingRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MeetingDashboard />} />
        <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
      </Routes>
    </Router>
  );
}

export default App;

