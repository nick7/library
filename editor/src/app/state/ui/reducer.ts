import { Action, createReducer, on } from '@ngrx/store';
import { Command, Game, ViewMode } from '../../models';
import {
  displayOrEditCommandInfo,
  stopEditOrDisplay,
  toggleCommandListElements,
  toggleFilter,
  updateSearchTerm,
  onListEnter,
  displayOrEditSnippet,
  updateLastUpdateTime,
  loadLinksSuccess,
} from './actions';
import { without } from 'lodash';

export type Links = Record<string, Record<string, Game[]>>;

export interface UiState {
  searchTerm?: string;
  displaySearchBar: boolean;
  displayLastUpdated: boolean;
  selectedFiltersOnly: string[];
  selectedFiltersExcept: string[];
  commandToDisplayOrEdit?: Command;
  extensionToDisplayOrEdit?: string;
  snippetToDisplayOrEdit?: string;
  viewMode: ViewMode;
  game?: Game;
  opcodeOnLoad?: string;
  extensionOnLoad?: string;
  lastUpdate?: number;
  links?: Links;
}

export const initialState: UiState = {
  displayLastUpdated: false,
  displaySearchBar: false,
  viewMode: ViewMode.None,
  selectedFiltersOnly: [],
  selectedFiltersExcept: ['is_nop', 'is_unsupported'],
};

const _reducer = createReducer(
  initialState,
  on(toggleFilter, (state, { filter, modifier }) => {
    const filters =
      modifier === 'only'
        ? state.selectedFiltersOnly
        : state.selectedFiltersExcept;
    const selectedFilters = filters.includes(filter)
      ? without(filters, filter)
      : [...filters, filter];
    return {
      ...state,
      [modifier === 'only'
        ? 'selectedFiltersOnly'
        : 'selectedFiltersExcept']: selectedFilters,
    };
  }),
  on(updateSearchTerm, (state, { term: searchTerm }) => ({
    ...state,
    searchTerm,
  })),
  on(toggleCommandListElements, (state, { flag }) => ({
    ...state,
    displaySearchBar: flag,
    displayLastUpdated: flag,
  })),
  on(displayOrEditCommandInfo, (state, { command, extension, viewMode }) => ({
    ...state,
    viewMode,
    commandToDisplayOrEdit: command,
    extensionToDisplayOrEdit: extension,
  })),
  on(displayOrEditSnippet, (state, { snippet }) => ({
    ...state,
    snippetToDisplayOrEdit: snippet,
  })),
  on(stopEditOrDisplay, (state) => ({
    ...state,
    commandToDisplayOrEdit: undefined,
    extensionToDisplayOrEdit: undefined,
    snippetToDisplayOrEdit: undefined,
    viewMode: ViewMode.None,
  })),
  on(onListEnter, (state, { game, opcode, extension }) => ({
    ...state,
    game,
    opcodeOnLoad: opcode,
    extensionOnLoad: extension,
  })),
  on(updateLastUpdateTime, (state, { lastUpdate }) => ({
    ...state,
    lastUpdate,
  })),
  on(loadLinksSuccess, (state, { links }) => ({
    ...state,
    links,
  }))
);

export function uiReducer(state: UiState, action: Action) {
  return _reducer(state, action);
}
