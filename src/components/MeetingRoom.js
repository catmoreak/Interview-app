import React, { useRef, useEffect, useState } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';

const MeetingRoom = () => {
  const [stream, setStream] = useState(null);
  const [peers, setPeers] = useState([]);
  const userVideo = useRef();
  const peersRef = useRef([]);
  const socketRef = useRef();
  const roomId = "roomId"; // Replace this with dynamic room ID

  useEffect(() => {
    // Initialize socket connection to the signaling server
    socketRef.current = io.connect('http://localhost:5000'); // Replace with your signaling server address

    // Get the user's video and audio stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
      setStream(mediaStream);
      if (userVideo.current) {
        userVideo.current.srcObject = mediaStream;
      }

      // Join the room by sending roomId to the signaling server
      socketRef.current.emit('join room', roomId);

      // Handle receiving the list of all users already in the room
      socketRef.current.on('all users', (users) => {
        const peersArray = [];
        users.forEach((userId) => {
          const peer = createPeer(userId, socketRef.current.id, mediaStream);
          peersRef.current.push({
            peerID: userId,
            peer,
          });
          peersArray.push(peer);
        });
        setPeers(peersArray);
      });

      // Handle a new user joining the room
      socketRef.current.on('user joined', (payload) => {
        const peer = addPeer(payload.signal, payload.callerId, mediaStream);
        peersRef.current.push({
          peerID: payload.callerId,
          peer,
        });
        setPeers((prevPeers) => [...prevPeers, peer]);
      });

      // Handle receiving a returning signal
      socketRef.current.on('receiving returned signal', (payload) => {
        const item = peersRef.current.find((p) => p.peerID === payload.id);
        item.peer.signal(payload.signal);
      });

      // Handle user disconnecting
      socketRef.current.on('user left', (id) => {
        const peerObj = peersRef.current.find((p) => p.peerID === id);
        if (peerObj) {
          peerObj.peer.destroy();
        }
        const peers = peersRef.current.filter((p) => p.peerID !== id);
        peersRef.current = peers;
        setPeers(peers);
      });
    });
  }, []);

  // Create a peer to send signals to another user
  const createPeer = (userToSignal, callerId, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socketRef.current.emit('sending signal', { userToSignal, callerId, signal });
    });

    return peer;
  };

  // Add a peer when receiving a signal from another user
  const addPeer = (incomingSignal, callerId, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socketRef.current.emit('returning signal', { signal, callerId });
    });

    peer.signal(incomingSignal);

    return peer;
  };

  return (
    <div className="meeting-room">
      <div className="video-container">
        {/* Display user’s video */}
        <video muted ref={userVideo} autoPlay playsInline className="user-video" />

        {/* Display peers’ video */}
        {peers.map((peer, index) => {
          return <Video key={index} peer={peer} />;
        })}
      </div>
    </div>
  );
};

// Separate Video component to render peer's video stream
const Video = ({ peer }) => {
  const ref = useRef();

  useEffect(() => {
    peer.on('stream', (stream) => {
      ref.current.srcObject = stream;
    });
  }, [peer]);

  return <video autoPlay playsInline ref={ref} className="partner-video" />;
};

export default MeetingRoom;
