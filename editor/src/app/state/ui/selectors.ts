import { createFeatureSelector, createSelector } from '@ngrx/store';
import { flatMap, sortBy } from 'lodash';
import { isPlatformMatching, isVersionMatching, search } from '../../utils';
import { Attribute, Command, Game, Platform, Version } from '../../models';
import { extensions } from '../extensions/selectors';
import { game } from '../game/selectors';
import { UiState, GameState } from './reducer';
import { selectedPlatforms, selectedVersions } from '../version/selectors';

export const state = createFeatureSelector<UiState>('ui');

const gameState = createSelector(
  state,
  game,
  (state: UiState, game: Game | undefined) =>
    game ? state.games[game] : undefined
);

export const selectedAttributesOnly = createSelector(
  state,
  (state: UiState) => state.selectedAttributesOnly
);

export const selectedAttributesExcept = createSelector(
  state,
  (state: UiState) => state.selectedAttributesExcept
);

export const selectedExtensions = createSelector(
  gameState,
  (state: GameState | undefined) => state?.selectedExtensions
);

export const isExtensionSelected = createSelector(
  selectedExtensions,
  (selectedExtensions: string[] | undefined, props: { extension: string }) =>
    selectedExtensions?.includes(props.extension)
);

export const selectedClasses = createSelector(
  gameState,
  (state: GameState | undefined) => state?.selectedClasses
);

export const isClassSelected = createSelector(
  selectedClasses,
  (
    selectedClasses: string[] | undefined,
    props: { className: string | 'any' | 'none' }
  ) => selectedClasses?.includes(props.className)
);

export const isAttributeSelectedOnly = createSelector(
  selectedAttributesOnly,
  (selectedAttributes: string[], props: { attribute: string }) =>
    selectedAttributes.includes(props.attribute)
);

export const isAttributeSelectedExcept = createSelector(
  selectedAttributesExcept,
  (selectedAttributes: string[], props: { attribute: string }) =>
    selectedAttributes.includes(props.attribute)
);

export const searchTerm = createSelector(
  state,
  (state: UiState) => state.searchTerm
);

export const displaySearchBar = createSelector(
  state,
  (state: UiState) => state.displaySearchBar
);

export const displayLastUpdated = createSelector(
  state,
  (state: UiState) => state.displayLastUpdated
);

export const displayInlineMethodDescription = createSelector(
  state,
  (state: UiState) => state.displayInlineMethodDescription
);

export const displayOpcodePresentation = createSelector(
  state,
  (state: UiState) => state.displayOpcodePresentation
);

export const commandToDisplayOrEdit = createSelector(
  state,
  (state: UiState) => state.commandToDisplayOrEdit
);

export const extensionToDisplayOrEdit = createSelector(
  state,
  (state: UiState) => state.extensionToDisplayOrEdit
);

export const enumToDisplayOrEdit = createSelector(
  state,
  (state: UiState) => state.enumToDisplayOrEdit
);

export const viewMode = createSelector(
  state,
  (state: UiState) => state.viewMode
);

export const snippetToDisplayOrEdit = createSelector(
  state,
  (state: UiState) => state.snippetToDisplayOrEdit
);

export const currentPage = createSelector(
  state,
  (state: UiState) => state.currentPage
);

export const rows = createSelector(
  extensions,
  selectedExtensions,
  selectedAttributesOnly,
  selectedAttributesExcept,
  searchTerm,
  selectedClasses,
  selectedPlatforms,
  selectedVersions,
  (
    extensions,
    selectedExtensions,
    selectedAttributesOnly,
    selectedAttributesExcept,
    searchTerm,
    selectedClasses,
    selectedPlatforms,
    selectedVersions
  ) => {
    const selected = extensions?.filter(({ name }) =>
      selectedExtensions?.includes(name)
    );

    return (
      selected &&
      flatMap(selected, ({ name: extension, commands }) => {
        const filtered = filterCommands(
          commands,
          selectedAttributesOnly,
          selectedAttributesExcept,
          selectedClasses,
          selectedPlatforms,
          selectedVersions
        );
        return search(filtered, searchTerm).map((command) => ({
          extension,
          command,
        }));
      })
    );
  }
);

function filterCommands(
  commands: Command[],
  only: Attribute[],
  except: Attribute[],
  classes: string[] | undefined,
  selectedPlatforms: Platform[] | undefined,
  selectedVersions: Version[] | undefined
) {
  return commands.filter(
    (command) =>
      only.every((attr) => command.attrs?.[attr]) &&
      !except.some((attr) => command.attrs?.[attr]) &&
      isClassMatching(command, classes ?? []) &&
      isPlatformMatching(command, selectedPlatforms ?? [Platform.Any]) &&
      isVersionMatching(command, selectedVersions ?? [Version.Any])
  );
}

function isClassMatching(
  command: Command,
  classes: Array<string | 'any' | 'none'>
): boolean {
  if (classes.includes('any')) {
    return true;
  }
  const needle = command.class ?? 'none';
  return classes.includes(needle);
}

export const classToDisplay = createSelector(
  state,
  (state: UiState) => state.classToDisplay
);

export const classToDisplayCommands = createSelector(
  extensions,
  classToDisplay,
  selectedPlatforms,
  selectedVersions,
  (extensions, classToDisplay, selectedPlatforms, selectedVersions) => {
    if (!classToDisplay) {
      return undefined;
    }

    const extensionCommands = flatMap(extensions, (extension) => {
      return extension.commands
        .filter(
          (command) =>
            command.class === classToDisplay &&
            isPlatformMatching(command, selectedPlatforms ?? [Platform.Any]) &&
            isVersionMatching(command, selectedVersions ?? [Version.Any])
        )
        .map((command) => ({ command, extension: extension.name }));
    });

    return sortBy(extensionCommands, [
      'command.attrs.is_constructor',
      'command.attrs.is_destructor',
      'command.attrs.is_static',
      'command.member',
      'command.attrs.is_nop',
      'command.attrs.is_unsupported',
    ]);
  }
);

export const displaySearchHelp = createSelector(
  state,
  (state: UiState) => state.displaySearchHelp
);

export const isSearchHelpDismissed = createSelector(
  state,
  (state: UiState) => state.isSearchHelpDismissed
);

export const isSidebarCollapsed = createSelector(
  state,
  (state: UiState) => state.isSidebarCollapsed
);
