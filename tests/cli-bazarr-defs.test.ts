import { describe, expect, it } from 'bun:test';
import { resources as bazarrResources } from '../src/cli/commands/bazarr.js';

describe('Bazarr command definitions', () => {
  it('defines series resource with list action', () => {
    const series = bazarrResources.find(r => r.name === 'series');
    expect(series).toBeDefined();
    expect(series!.actions.map(a => a.name)).toEqual(['list']);
  });

  it('defines movie resource with list action', () => {
    const movie = bazarrResources.find(r => r.name === 'movie');
    expect(movie).toBeDefined();
    expect(movie!.actions.map(a => a.name)).toEqual(['list']);
  });

  it('defines episode resource with wanted action', () => {
    const episode = bazarrResources.find(r => r.name === 'episode');
    expect(episode).toBeDefined();
    expect(episode!.actions.map(a => a.name)).toEqual(['wanted']);
  });

  it('defines provider resource with list action', () => {
    const provider = bazarrResources.find(r => r.name === 'provider');
    expect(provider).toBeDefined();
    expect(provider!.actions.map(a => a.name)).toEqual(['list']);
  });

  it('defines language resource with list and profiles actions', () => {
    const language = bazarrResources.find(r => r.name === 'language');
    expect(language).toBeDefined();
    expect(language!.actions.map(a => a.name)).toEqual(['list', 'profiles']);
  });

  it('defines system resource with status, health, badges actions', () => {
    const system = bazarrResources.find(r => r.name === 'system');
    expect(system).toBeDefined();
    expect(system!.actions.map(a => a.name)).toEqual(['status', 'health', 'badges']);
  });

  it('series list has expected columns', () => {
    const series = bazarrResources.find(r => r.name === 'series');
    const listAction = series!.actions.find(a => a.name === 'list');
    expect(listAction!.columns).toEqual(['sonarrSeriesId', 'title', 'profileId']);
  });

  it('movie list has expected columns', () => {
    const movie = bazarrResources.find(r => r.name === 'movie');
    const listAction = movie!.actions.find(a => a.name === 'list');
    expect(listAction!.columns).toEqual(['radarrId', 'title', 'profileId']);
  });

  it('episode wanted has expected columns', () => {
    const episode = bazarrResources.find(r => r.name === 'episode');
    const wantedAction = episode!.actions.find(a => a.name === 'wanted');
    expect(wantedAction!.columns).toEqual(['sonarrEpisodeId', 'title', 'seriesTitle']);
  });

  it('language list has expected columns', () => {
    const language = bazarrResources.find(r => r.name === 'language');
    const listAction = language!.actions.find(a => a.name === 'list');
    expect(listAction!.columns).toEqual(['code2', 'name', 'enabled']);
  });

  it('covers all expected resources', () => {
    const names = bazarrResources.map(r => r.name).sort();
    expect(names).toEqual(['episode', 'language', 'movie', 'provider', 'series', 'system']);
  });
});
