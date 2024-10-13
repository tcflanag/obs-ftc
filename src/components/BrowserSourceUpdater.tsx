import { useObsStudio } from '../contexts/ObsStudioContext';
import { useFtcLive } from '../contexts/FtcLiveContext';

const BrowserSourceUpdater = () => {
  const { isConnected, updateEventCode } = useObsStudio();
  const { isConnected: isFtcLiveConnected,selectedEvent,serverUrl } = useFtcLive();


  return (
    <div className="section">
        <h2>Update Browser Source URLs </h2>
        <button onClick={() => updateEventCode(serverUrl,selectedEvent?.eventCode ?? "NO_EVENT")} disabled={(!isConnected || !isFtcLiveConnected)}>Update Event Code</button>
    </div>
  );
};

export default BrowserSourceUpdater;
