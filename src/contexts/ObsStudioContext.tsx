import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import OBSWebSocket from 'obs-websocket-js';
import { usePersistentState } from '../helpers/persistant';
import type {OBSEventTypes} from "obs-websocket-js/dist/types";

type ObsStudioProviderProps = {
  children: ReactNode;
};

type sourceData = {
  name: string;
  url: string;
}

const obs = new OBSWebSocket();

// Define the context data types
interface ObsStudioContextData {
  obsUrl: string;
  setObsUrl: React.Dispatch<React.SetStateAction<string>>;
  obsPort: number;
  setObsPort: React.Dispatch<React.SetStateAction<number>>;
  obsPassword: string;
  setObsPassword: React.Dispatch<React.SetStateAction<string>>;
  isConnected: boolean;
  error: string | undefined;
  connectToObs: () => void;
  disconnectFromObs: () => void;
  fetchScenes: () => Promise<string[]>;
  switchScenes: (scene: string) => void;
  setActiveField: (field: number) => void;
  updateEventCode: (url: string, eventCode: string) => void;
  fetchBrowserSources: () => Promise<sourceData[]>;
  field1Scene?: string;
  setField1Scene: React.Dispatch<React.SetStateAction<string | undefined>>;
  field2Scene?: string;
  setField2Scene: React.Dispatch<React.SetStateAction<string | undefined>>;
  startStreamTime: number;
}

// Create the context
export const ObsStudioContext = createContext<ObsStudioContextData>({} as ObsStudioContextData);

// Create a custom hook to use the OBS context
export const useObsStudio = () => {
  return useContext(ObsStudioContext);
};

// ObsStudioProvider component that will wrap your application or part of it
export const ObsStudioProvider: React.FC<ObsStudioProviderProps> = ({ children }) => {
  const [obsUrl, setObsUrl] = usePersistentState('OBS_URL', 'localhost');
  const [obsPort, setObsPort] = usePersistentState('OBS_Port', 4455);
  const [obsPassword, setObsPassword] = usePersistentState('OBS_Password', '');
  const [isConnected, setIsConnected] = useState(false);
  const [field1Scene, setField1Scene] = usePersistentState<string | undefined>('Field1_Scene', undefined)
  const [field2Scene, setField2Scene] = usePersistentState<string | undefined>('Field2_Scene', undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [startStreamTime, setStartStreamTime] = usePersistentState<number>('Stream_Start', 0);
  const connectToObs = useCallback(async () => {
    try {
      const hello = await obs.connect(`ws://${obsUrl}:${obsPort}`, obsPassword);
      console.log('Hello message:', hello)

      // Watch for streaming started, and save the time
      obs.on('StreamStateChanged',(data: OBSEventTypes["StreamStateChanged"] ) => {
        if (data.outputState === "OBS_WEBSOCKET_OUTPUT_STARTED"){
          console.log("Stream started at ", Date.now())
          setStartStreamTime(Date.now())
        }})

      setIsConnected(true);
      setError(undefined)
      // ... additional setup if needed
    } catch (error: any) {
      console.error('Failed to connect to OBS:', error);
      setIsConnected(false);
      if (error.code) {
        console.log('Error code:', error.code)
        if (error.code === 1006)
          setError("Unable to connect. Check the URL and OBS Websocket settings.")
        else if (error.code === 4009)
          setError("Unable to connect. Check the OBS Websocket password.")
        else
          setError(`Unknown Error: ${JSON.stringify(error)}`);
      } else {
        setError(`Unknown Error: ${JSON.stringify(error)}`);
      }
    }
  }, [obsUrl, obsPort, obsPassword, setStartStreamTime]);

  const disconnectFromObs = useCallback(() => {
    obs.disconnect();
    setIsConnected(false);
    setError(undefined)
  }, []);

  const fetchScenes = useCallback(async (): Promise<string[]> => {
    try {
      const { scenes } = await obs.call('GetSceneList');
      const sceneList = scenes.map((s: any): string => s.sceneName).reverse()
      console.log("scenes:", sceneList)
      return sceneList;
    } catch (error) {
      console.error('Error fetching scenes:', error);
      return [];
    }
  }, []);

  const field1SceneRef = useRef(field1Scene)
  const field2SceneRef = useRef(field2Scene)
  const isConnectedRef = useRef(isConnected);
  useEffect(() => {
    field1SceneRef.current = field1Scene;
    field2SceneRef.current = field2Scene;
    isConnectedRef.current = isConnected;
  }, [field1Scene, field2Scene, isConnected])

  const switchScenes = async (scene: string) => {
    if (obs && isConnectedRef.current) {
      console.log('Switch Scenes to', scene)
      obs.call('SetCurrentProgramScene', { sceneName: scene });
    } else {
      console.error("Unable to switch scene. Not connected");
    }
  }
  const fetchBrowserSources = useCallback(async (): Promise<sourceData[] > => {
    try {
      let inputList: sourceData[] = []
      const {inputs} = await obs.call('GetInputList', {inputKind: 'browser_source'});

      for (const inp of inputs) {
        const inputName = inp?.inputName?.toString() ?? ""
        const {inputSettings} = await obs.call('GetInputSettings', {inputName: inputName});

        let decoded_url = new URL(inputSettings?.url?.toString() ?? "")
        let split_path = decoded_url.pathname.split('/')
        if (split_path[1] === 'event') {
          const data: sourceData= {name:inputName, url:inputSettings?.url?.toString() ?? ""}
          inputList.push(data)
        }
      }
      console.log("inputs:", inputList)
      return inputList;
    } catch (error) {
      console.error('Error fetching scenes:', error);
      return [];
    }
  }, []);

  const updateEventCode = async (url: string, eventCode: string) => {
    const {inputs} = await obs.call('GetInputList', {inputKind: 'browser_source'});
    console.log("Changing URLs to", url," and code ", eventCode)
    console.log(inputs)
    for (const inp of inputs) {
      const inputName = inp?.inputName?.toString() ?? ""
      const {inputSettings} = await obs.call('GetInputSettings', {inputName: inputName});

      let decoded_url = new URL(inputSettings?.url?.toString() ?? "")
      let split_path = decoded_url.pathname.split('/')
      if (split_path[1] === 'event') {
        split_path[2] = eventCode
        decoded_url.pathname = split_path.join('/')
        decoded_url.hostname = url

        console.log("Updated Source", inp.inputName, " to url ", decoded_url.href)

      } else {
        console.log("Path does not match filter on source",inp.inputName, " url ", decoded_url.pathname)
      }

      await obs.call('SetInputSettings', {inputName: inputName, overlay: true, inputSettings: {'url': decoded_url.href}})
    }
  }

  const setActiveField = async (field: number) => {
    const field1Scene = field1SceneRef.current
    const field2Scene = field2SceneRef.current
    if (field === 1 && field1Scene) {
      await switchScenes(field1Scene)
    } else if (field === 2 && field2Scene) {
      await switchScenes(field2Scene)
    } else if (field === 0) {
      console.log("Finals Match, manual switching required")
    } else {
      console.error("Unable to switch stream to field ", field)
      console.log('field 1:', field1Scene)
      console.log('field 2:', field2Scene)
    }
  }

  return (
    <ObsStudioContext.Provider value={{ obsUrl, setObsUrl, obsPort, setObsPort, obsPassword, setObsPassword, isConnected, connectToObs, disconnectFromObs, fetchScenes, switchScenes, field1Scene, field2Scene, setField1Scene, setField2Scene, setActiveField, error, startStreamTime, updateEventCode, fetchBrowserSources}}>
      {children}
    </ObsStudioContext.Provider>
  );
};
