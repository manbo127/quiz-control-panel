import { gameState } from './gameState.js';

export function updateScore(teamId, value){

  const team = gameState.teams.find(t=>t.id===teamId);

  if(team){
    team.score += value;
  }

}
