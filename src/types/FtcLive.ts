
export interface Event {
  eventCode: string;
  name: string;
  division: number;
  finals: boolean;
  start: Date;
  end: Date;
  type: string; // make enum
  status: string; // make enum
}


export type UpdateType =
    'MATCH_LOAD'
    | 'MATCH_START'
    | 'MATCH_ABORT'
    | 'MATCH_COMMIT'
    | 'MATCH_POST'
    | 'SHOW_PREVIEW'
    | 'SHOW_RANDOM'
    | 'SHOW_MATCH'
    | 'SHOW_AWARD'

type awardData = {
  name: string
}

type AwardParams = {
  award: awardData;
  place: number;

}
type TeamData = {
  name: string;
  number: number;
}
type MatchParams = {
  matchName: string;
  elims: boolean;
  number: number;
  displayNumber: number;
  series: number;

  red: {teams: TeamData[]};
  blue: {teams: TeamData[]};
}


export interface FtcLiveSteamData {
  type: UpdateType
  ts: number;
  field: number;
  init: boolean;
  params: (AwardParams|MatchParams);
  index: number;
}

export function isMatch(data: (AwardParams|MatchParams)): data is MatchParams {
  return (data as MatchParams).matchName !== undefined
}

export function isAward(data: (AwardParams|MatchParams)): data is AwardParams {
  return (data as AwardParams).award !== undefined
}

export const UpdateTypes: UpdateType[] = [
  //TODO Support for Redirect
  'MATCH_LOAD',
  'MATCH_START',
  'MATCH_ABORT',
  'MATCH_COMMIT',
  'MATCH_POST',
  'SHOW_PREVIEW',
  'SHOW_RANDOM',
  'SHOW_MATCH',
  'SHOW_AWARD'
]

export interface FtcMatch {
  matchName: string;
  matchNumber: number;
  field: number;
  red: {
    team1: number;
    team2: number;
    team3?: number;
    isTeam1Surrogate: boolean;
    isTeam2Surrogate: boolean;
    isTeam3Surrogate?: boolean;
  };
  blue: {
    team1: number;
    team2: number;
    team3?: number;
    isTeam1Surrogate: boolean;
    isTeam2Surrogate: boolean;
    isTeam3Surrogate?: boolean;
  };
  finished: boolean;
  matchState: string;
  time: number;
}