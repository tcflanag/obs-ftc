// src/components/WebSocketManager.tsx
import React, { useState, useContext } from 'react';
import { FtcLiveContext } from '../contexts/FtcLiveContext';
import { Event } from '../types/FtcLive';


const FtcLiveConnectionManager: React.FC = () => {
  const { isConnected, serverUrl, setServerUrl, connectWebSocket, selectedEvent, setSelectedEvent } = useContext(FtcLiveContext);
  const [events, setEvents] = useState<Event[]>([]);

  // Fetch event codes from the server
  const fetchEvents = async () => {
    try {
      const response = await fetch(`http://${serverUrl}/api/v1/events/`);
      const eventCodes = (await response.json()).eventCodes;
      const events: Event[] = await Promise.all(eventCodes.map(async (code: string): Promise<Event> => {
        const response = await fetch(`http://${serverUrl}/api/v1/events/${code}/`);
        const event = await response.json() as Event;
        return event;
      }));
      setEvents(events);
    } catch (error) {
      console.error('Fetching events failed:', error);
    }
  };

  return (
    <div className="section">
      <h2>FTC Live Server</h2>
      <input
        type="text"
        placeholder="Enter server IP"
        value={serverUrl}
        disabled={isConnected}
        onChange={(e) => setServerUrl(e.target.value)}
      />
      <button onClick={fetchEvents} disabled={isConnected}>Get Event Codes</button>
      <br /><br />
      <select
        value={selectedEvent?.eventCode}
        onChange={(e) => setSelectedEvent(events.filter(evt => evt.eventCode === e.target.value)[0])}
        disabled={events.length === 0 || isConnected}
      >
        <option value="">Select an event</option>
        {events.map((event) => (
          <option key={event.eventCode} value={event.eventCode}>
            {event.eventCode} - {event.name}
          </option>
        ))}
      </select>

      <button onClick={(e) => connectWebSocket(!isConnected)} disabled={!(events.length)}>
        {isConnected ? 'Disconnnect' : 'Connect'}
      </button>
      <div><br />
        Connection Status:
        <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
};

export default FtcLiveConnectionManager;
