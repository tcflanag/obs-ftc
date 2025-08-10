import { useObsStudio } from '../contexts/ObsStudioContext';
import { useFtcLive } from '../contexts/FtcLiveContext';
import React, {useState} from "react";

export type sourceData = {
    toggle: boolean;
    name: string;
    url: string;
    new: string;
    param_name: string;
    source_type: string;
}



const BrowserSourceUpdater = () => {
  const { isConnected, updateEventCode, fetchBrowserSources } = useObsStudio();
  const { isConnected: isFtcLiveConnected,selectedEvent,serverUrl } = useFtcLive();
  const [ rows,setRows ]  = useState<sourceData[]>([]);


    const handleFetchScenes = async () => {
        setRows(await fetchBrowserSources(serverUrl,selectedEvent?.eventCode ?? "NO_EVENT"))
  };
    const handleUpdateEvent = async() => {
        await updateEventCode(rows)
    }

    const handleCheckboxChange = (updateRow: sourceData) => {
        const nextRows = rows.map(row => {
            if (row.name === updateRow.name){
                row.toggle = !row.toggle
            }
            return row
        });
        setRows(nextRows);

    };

  return (
    <div className="section" style={{overflowX:"scroll"}}>
        <h2>Update Browser Source URLs </h2>
        <button onClick={() => handleFetchScenes ()} disabled={(!isConnected || !isFtcLiveConnected)}>Fetch Broswer Sources</button>
        <button onClick={() => handleUpdateEvent()} disabled={(!isConnected || !isFtcLiveConnected)}>Update Event Code</button>
        <table border={1}>
            <thead>
            <tr>
                <th>Update?</th>
                <th>Source Name</th>
                <th>Type</th>
                <th>Old Value<br/>New Value</th>

            </tr>
            </thead>
            <tbody>
            {rows.map(row => (
                <tr key={row.name} >
                    <td><input
                        type="checkbox"
                        checked={row.toggle}
                        onChange={() => handleCheckboxChange(row)}
                    /></td>

                    <td style={{textAlign: 'left', whiteSpace: "nowrap", paddingRight: "1em"}}>{row.name}</td>
                    <td style={{textAlign: 'left',whiteSpace: "nowrap"}}>{row.source_type}</td>
                    <td style={{textAlign: 'left',whiteSpace: "nowrap"}}>{row.url}<br/>{row.new}</td>


                </tr>
            ))}
            </tbody>
        </table>

    </div>
  );
};

export default BrowserSourceUpdater;
