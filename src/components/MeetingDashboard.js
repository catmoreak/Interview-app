import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MeetingDashboard = () => {
  const [meetingCode, setMeetingCode] = useState('');
  const navigate = useNavigate();

  const handleCreateMeeting = () => {
    const newMeetingCode = Math.random().toString(36).substring(2, 8); // Generate random meeting code
    navigate(`/meeting/${newMeetingCode}`);
  };

  const handleJoinMeeting = () => {
    if (meetingCode.trim()) {
      navigate(`/meeting/${meetingCode}`);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Job Interview Meet App</h1>
      <div className="flex space-x-4">
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          onClick={handleCreateMeeting}
        >
          Create New Meeting
        </button>
        <input
          type="text"
          className="border border-gray-300 rounded px-4 py-2"
          placeholder="Enter Meeting Code"
          value={meetingCode}
          onChange={(e) => setMeetingCode(e.target.value)}
        />
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          onClick={handleJoinMeeting}
        >
          Join Meeting
        </button>
      </div>
    </div>
  );
};

export default MeetingDashboard;
