import { useObsStudio } from '../contexts/ObsStudioContext';
import { useFtcLive } from '../contexts/FtcLiveContext';
import React, {useState} from "react";

type sourceData = {
    name: string;
    url: string;
}



const BrowserSourceUpdater = () => {
  const { isConnected, updateEventCode, fetchBrowserSources } = useObsStudio();
  const { isConnected: isFtcLiveConnected,selectedEvent,serverUrl } = useFtcLive();
  const [ rows,setRows ]  = useState<sourceData[]>([]);


    const handleFetchScenes = async () => {
        setRows(await fetchBrowserSources())
  };
    const handleUpdateEvent = async() => {
        await updateEventCode(serverUrl,selectedEvent?.eventCode ?? "NO_EVENT")
        setRows(await fetchBrowserSources())
    }

  return (
    <div className="section">
        <h2>Update Browser Source URLs </h2>
        <button onClick={() => handleFetchScenes ()} disabled={!isConnected}>Fetch Broswer Sources</button>
        <button onClick={() => handleUpdateEvent()} disabled={(!isConnected || !isFtcLiveConnected)}>Update Event Code</button>
        <table>
            <thead>
            <tr>
                <th>Source Name</th>
                <th>URL</th>

            </tr>
            </thead>
            <tbody>
            {rows.map(row => (
                <tr key={row.name} >
                    <td style={{textAlign: 'left', paddingRight: "1em"}}>{row.name}</td>
                    <td style={{textAlign: 'left'}}>{row.url.substring(0,90)}...</td> {/*FIXME:  Make this smarter */}

                </tr>
            ))}
            </tbody>
        </table>

    </div>
  );
};

export default BrowserSourceUpdater;
