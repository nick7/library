import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GameState } from './reducer';

export const state = createFeatureSelector<GameState>('game');

export const game = createSelector(state, (state: GameState) => state.game);

export const gameName = createSelector(
  state,
  (state: GameState) => state.gameName
);

export const primitiveTypes = createSelector(
  state,
  (state: GameState) => state.primitiveTypes
);
