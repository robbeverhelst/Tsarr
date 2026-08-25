import { describe, expect, it } from 'bun:test';
import { resources as jellyfinResources } from '../src/cli/commands/jellyfin.js';
import { resources as qbitResources } from '../src/cli/commands/qbit.js';
import { resources as radarrResources } from '../src/cli/commands/radarr.js';
import { resources as seerrResources } from '../src/cli/commands/seerr.js';
import { COMMAND_OUTPUT_COLUMNS, limitResults } from '../src/cli/commands/service.js';
import { resources as sonarrResources } from '../src/cli/commands/sonarr.js';

function getAction(
  resources: Array<{
    name: string;
    actions: Array<{ name: string; args?: Array<{ name: string }>; columns?: string[] }>;
  }>,
  resourceName: string,
  actionName: string
) {
  const resource = resources.find(item => item.name === resourceName);
  expect(resource).toBeDefined();

  const action = resource?.actions.find(item => item.name === actionName);
  expect(action).toBeDefined();

  return action!;
}

describe('CLI command definitions', () => {
  it('adds a limit arg to Radarr and Sonarr lookup searches', () => {
    const radarrSearch = getAction(radarrResources, 'movie', 'search');
    const sonarrSearch = getAction(sonarrResources, 'series', 'search');

    expect(radarrSearch.args?.some(arg => arg.name === 'limit')).toBe(true);
    expect(sonarrSearch.args?.some(arg => arg.name === 'limit')).toBe(true);
  });

  it('uses shared command columns for refresh table output', () => {
    const radarrRefresh = getAction(radarrResources, 'movie', 'refresh');
    const sonarrRefresh = getAction(sonarrResources, 'series', 'refresh');

    expect(radarrRefresh.columns).toEqual(COMMAND_OUTPUT_COLUMNS);
    expect(sonarrRefresh.columns).toEqual(COMMAND_OUTPUT_COLUMNS);
  });
});

describe('CLI file resource definitions', () => {
  it('defines moviefile resource with list, get, delete actions for Radarr', () => {
    const moviefile = radarrResources.find(r => r.name === 'moviefile');
    expect(moviefile).toBeDefined();
    expect(moviefile!.actions.map(a => a.name)).toEqual(['list', 'get', 'delete']);
  });

  it('defines episodefile resource with list, get, delete actions for Sonarr', () => {
    const episodefile = sonarrResources.find(r => r.name === 'episodefile');
    expect(episodefile).toBeDefined();
    expect(episodefile!.actions.map(a => a.name)).toEqual(['list', 'get', 'delete']);
  });

  it('moviefile delete requires confirmation', () => {
    const deleteAction = getAction(radarrResources, 'moviefile', 'delete');
    expect(deleteAction.confirmMessage).toBeDefined();
  });

  it('episodefile delete requires confirmation', () => {
    const deleteAction = getAction(sonarrResources, 'episodefile', 'delete');
    expect(deleteAction.confirmMessage).toBeDefined();
  });
});

describe('qBittorrent command definitions', () => {
  it('defines torrents resource with list, pause, resume, delete actions', () => {
    const torrents = qbitResources.find(r => r.name === 'torrents');
    expect(torrents).toBeDefined();
    expect(torrents!.actions.map(a => a.name)).toEqual(['list', 'pause', 'resume', 'delete']);
  });

  it('defines status resource with show action', () => {
    const status = qbitResources.find(r => r.name === 'status');
    expect(status).toBeDefined();
    expect(status!.actions.map(a => a.name)).toEqual(['show']);
  });

  it('torrents delete requires confirmation', () => {
    const deleteAction = getAction(qbitResources, 'torrents', 'delete');
    expect(deleteAction.confirmMessage).toBeDefined();
  });

  it('torrents list has expected columns', () => {
    const listAction = getAction(qbitResources, 'torrents', 'list');
    expect(listAction.columns).toEqual([
      'hash',
      'name',
      'state',
      'progress',
      'size',
      'dlspeed',
      'upspeed',
    ]);
  });
});

describe('Seerr command definitions', () => {
  it('defines requests resource with list, count, approve, decline actions', () => {
    const requests = seerrResources.find(r => r.name === 'requests');
    expect(requests).toBeDefined();
    expect(requests!.actions.map(a => a.name)).toEqual(['list', 'count', 'approve', 'decline']);
  });

  it('defines search resource with query action', () => {
    const search = seerrResources.find(r => r.name === 'search');
    expect(search).toBeDefined();
    expect(search!.actions.map(a => a.name)).toEqual(['query']);
  });

  it('defines users resource with list action', () => {
    const users = seerrResources.find(r => r.name === 'users');
    expect(users).toBeDefined();
    expect(users!.actions.map(a => a.name)).toEqual(['list']);
  });

  it('defines status resource with show action', () => {
    const status = seerrResources.find(r => r.name === 'status');
    expect(status).toBeDefined();
    expect(status!.actions.map(a => a.name)).toEqual(['show']);
  });

  it('requests decline requires confirmation', () => {
    const declineAction = getAction(seerrResources, 'requests', 'decline');
    expect(declineAction.confirmMessage).toBeDefined();
  });
});

describe('Jellyfin command definitions', () => {
  it('defines the library resource with scan and folder management', () => {
    const library = jellyfinResources.find(r => r.name === 'library');
    expect(library).toBeDefined();
    expect(library!.actions.map(a => a.name)).toEqual(['refresh', 'folders', 'add', 'remove']);
  });

  it('defines the item resource with browse and maintenance actions', () => {
    const item = jellyfinResources.find(r => r.name === 'item');
    expect(item).toBeDefined();
    expect(item!.actions.map(a => a.name)).toEqual([
      'list',
      'get',
      'refresh',
      'delete',
      'counts',
      'latest',
      'nextup',
      'resume',
    ]);
  });

  it('defines the watched resource for reading and writing play state', () => {
    const watched = jellyfinResources.find(r => r.name === 'watched');
    expect(watched).toBeDefined();
    expect(watched!.actions.map(a => a.name)).toEqual([
      'status',
      'mark',
      'unmark',
      'favorite',
      'unfavorite',
    ]);
  });

  it('defines session, playlist, collection, user, task, search and system resources', () => {
    expect(jellyfinResources.map(r => r.name)).toEqual([
      'library',
      'item',
      'watched',
      'session',
      'playlist',
      'collection',
      'user',
      'task',
      'search',
      'system',
    ]);
  });

  it('exposes session remote control alongside session listing', () => {
    const session = jellyfinResources.find(r => r.name === 'session');
    expect(session).toBeDefined();
    expect(session!.actions.map(a => a.name)).toEqual([
      'list',
      'play',
      'pause',
      'unpause',
      'stop',
      'seek',
      'message',
      'command',
      'system',
      'display',
      'add-user',
      'remove-user',
    ]);
  });

  it('defines playlist and collection resources', () => {
    const playlist = jellyfinResources.find(r => r.name === 'playlist');
    // `get` and `move` are intentionally absent: GetPlaylist and MoveItem require
    // a user-context token and expose no userId parameter, so they cannot work
    // with the API key auth tsarr uses.
    expect(playlist!.actions.map(a => a.name)).toEqual(['create', 'items', 'add', 'remove']);

    const collection = jellyfinResources.find(r => r.name === 'collection');
    expect(collection!.actions.map(a => a.name)).toEqual(['create', 'add', 'remove']);
  });

  it('requires a user id for user-owned playlist operations', () => {
    for (const action of ['create', 'items', 'add']) {
      const args = getAction(jellyfinResources, 'playlist', action).args ?? [];
      expect(args.some(a => a.name === 'user' && (a as { required?: boolean }).required)).toBe(
        true
      );
    }
  });

  it('requires confirmation before disrupting playback or dropping entries', () => {
    expect(getAction(jellyfinResources, 'session', 'stop').confirmMessage).toBeDefined();
    expect(getAction(jellyfinResources, 'playlist', 'remove').confirmMessage).toBeDefined();
    expect(getAction(jellyfinResources, 'collection', 'remove').confirmMessage).toBeDefined();
  });

  it('requires confirmation for destructive actions', () => {
    expect(getAction(jellyfinResources, 'item', 'delete').confirmMessage).toBeDefined();
    expect(getAction(jellyfinResources, 'library', 'remove').confirmMessage).toBeDefined();
  });

  it('uses PascalCase columns to match Jellyfin JSON', () => {
    expect(getAction(jellyfinResources, 'item', 'list').columns).toEqual([
      'Id',
      'Name',
      'Type',
      'ProductionYear',
    ]);
    expect(getAction(jellyfinResources, 'system', 'status').columns).toContain('Version');
  });

  it('supports limiting list output', () => {
    expect(getAction(jellyfinResources, 'item', 'list').args?.some(a => a.name === 'limit')).toBe(
      true
    );
    expect(
      getAction(jellyfinResources, 'search', 'query').args?.some(a => a.name === 'limit')
    ).toBe(true);
  });
});

describe('limitResults', () => {
  it('caps array results to the provided limit', () => {
    expect(limitResults([1, 2, 3], 2)).toEqual([1, 2]);
  });

  it('returns all results when no limit is provided', () => {
    expect(limitResults([1, 2, 3], undefined)).toEqual([1, 2, 3]);
  });

  it('rejects non-positive limits', () => {
    expect(() => limitResults([1, 2, 3], 0)).toThrow('--limit must be a positive integer.');
  });
});
