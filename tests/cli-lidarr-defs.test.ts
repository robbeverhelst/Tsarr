import { describe, expect, it } from 'bun:test';
import { resources as lidarrResources } from '../src/cli/commands/lidarr.js';
import { COMMAND_OUTPUT_COLUMNS } from '../src/cli/commands/service.js';

function getAction(resourceName: string, actionName: string) {
  const resource = lidarrResources.find(r => r.name === resourceName);
  expect(resource).toBeDefined();
  const action = resource!.actions.find(a => a.name === actionName);
  expect(action).toBeDefined();
  return action!;
}

describe('Lidarr command definitions', () => {
  it('covers all expected resources', () => {
    const names = lidarrResources.map(r => r.name).sort();
    expect(names).toEqual([
      'album',
      'artist',
      'blocklist',
      'calendar',
      'downloadclient',
      'history',
      'importlist',
      'notification',
      'profile',
      'queue',
      'rootfolder',
      'system',
      'tag',
      'trackfile',
      'wanted',
    ]);
  });

  describe('artist resource', () => {
    it('has all expected actions', () => {
      const artist = lidarrResources.find(r => r.name === 'artist');
      expect(artist!.actions.map(a => a.name)).toEqual([
        'list',
        'get',
        'search',
        'add',
        'edit',
        'refresh',
        'manual-search',
        'delete',
      ]);
    });

    it('artist list has expected columns', () => {
      const action = getAction('artist', 'list');
      expect(action.columns).toEqual(['id', 'artistName', 'monitored', 'qualityProfileId']);
    });

    it('artist refresh uses command output columns', () => {
      const action = getAction('artist', 'refresh');
      expect(action.columns).toEqual(COMMAND_OUTPUT_COLUMNS);
    });

    it('artist manual-search uses command output columns', () => {
      const action = getAction('artist', 'manual-search');
      expect(action.columns).toEqual(COMMAND_OUTPUT_COLUMNS);
    });

    it('artist delete requires confirmation', () => {
      const action = getAction('artist', 'delete');
      expect(action.confirmMessage).toBeDefined();
    });

    it('artist edit has monitored, quality-profile-id, and tags args', () => {
      const action = getAction('artist', 'edit');
      const argNames = action.args!.map(a => a.name);
      expect(argNames).toContain('id');
      expect(argNames).toContain('monitored');
      expect(argNames).toContain('quality-profile-id');
      expect(argNames).toContain('tags');
    });
  });

  describe('tag resource', () => {
    it('has create, delete, list actions', () => {
      const tag = lidarrResources.find(r => r.name === 'tag');
      expect(tag!.actions.map(a => a.name)).toEqual(['create', 'delete', 'list']);
    });

    it('tag create requires label arg', () => {
      const action = getAction('tag', 'create');
      expect(action.args).toBeDefined();
      expect(action.args![0].name).toBe('label');
      expect(action.args![0].required).toBe(true);
    });

    it('tag delete requires confirmation', () => {
      const action = getAction('tag', 'delete');
      expect(action.confirmMessage).toBeDefined();
    });

    it('tag list has expected columns', () => {
      const action = getAction('tag', 'list');
      expect(action.columns).toEqual(['id', 'label']);
    });
  });

  describe('notification resource', () => {
    it('has list, get, add, edit, delete, test actions', () => {
      const notification = lidarrResources.find(r => r.name === 'notification');
      expect(notification!.actions.map(a => a.name)).toEqual([
        'list',
        'get',
        'add',
        'edit',
        'delete',
        'test',
      ]);
    });

    it('notification list has expected columns', () => {
      const action = getAction('notification', 'list');
      expect(action.columns).toEqual(['id', 'name', 'implementation']);
    });

    it('notification delete requires confirmation', () => {
      const action = getAction('notification', 'delete');
      expect(action.confirmMessage).toBeDefined();
    });

    it('notification add requires file arg', () => {
      const action = getAction('notification', 'add');
      expect(action.args![0].name).toBe('file');
      expect(action.args![0].required).toBe(true);
    });

    it('notification edit requires id and file args', () => {
      const action = getAction('notification', 'edit');
      const argNames = action.args!.map(a => a.name);
      expect(argNames).toEqual(['id', 'file']);
    });
  });

  describe('downloadclient resource', () => {
    it('has list, get, add, edit, delete, test actions', () => {
      const dc = lidarrResources.find(r => r.name === 'downloadclient');
      expect(dc!.actions.map(a => a.name)).toEqual([
        'list',
        'get',
        'add',
        'edit',
        'delete',
        'test',
      ]);
    });

    it('downloadclient list has expected columns', () => {
      const action = getAction('downloadclient', 'list');
      expect(action.columns).toEqual(['id', 'name', 'implementation', 'enable']);
    });

    it('downloadclient delete requires confirmation', () => {
      const action = getAction('downloadclient', 'delete');
      expect(action.confirmMessage).toBeDefined();
    });
  });

  describe('importlist resource', () => {
    it('has list, get, add, edit, delete actions', () => {
      const il = lidarrResources.find(r => r.name === 'importlist');
      expect(il!.actions.map(a => a.name)).toEqual(['list', 'get', 'add', 'edit', 'delete']);
    });

    it('importlist list has expected columns', () => {
      const action = getAction('importlist', 'list');
      expect(action.columns).toEqual(['id', 'name', 'implementation', 'enable']);
    });

    it('importlist delete requires confirmation', () => {
      const action = getAction('importlist', 'delete');
      expect(action.confirmMessage).toBeDefined();
    });
  });

  describe('trackfile resource', () => {
    it('has list, get, delete actions', () => {
      const tf = lidarrResources.find(r => r.name === 'trackfile');
      expect(tf!.actions.map(a => a.name)).toEqual(['list', 'get', 'delete']);
    });

    it('trackfile delete requires confirmation', () => {
      const action = getAction('trackfile', 'delete');
      expect(action.confirmMessage).toBeDefined();
    });
  });

  describe('other resources', () => {
    it('queue has list, status, delete, grab actions', () => {
      const queue = lidarrResources.find(r => r.name === 'queue');
      expect(queue!.actions.map(a => a.name)).toEqual(['list', 'status', 'delete', 'grab']);
    });

    it('queue delete requires confirmation', () => {
      const action = getAction('queue', 'delete');
      expect(action.confirmMessage).toBeDefined();
    });

    it('blocklist has list and delete actions', () => {
      const bl = lidarrResources.find(r => r.name === 'blocklist');
      expect(bl!.actions.map(a => a.name)).toEqual(['list', 'delete']);
    });

    it('blocklist delete requires confirmation', () => {
      const action = getAction('blocklist', 'delete');
      expect(action.confirmMessage).toBeDefined();
    });

    it('wanted has missing and cutoff actions', () => {
      const wanted = lidarrResources.find(r => r.name === 'wanted');
      expect(wanted!.actions.map(a => a.name)).toEqual(['missing', 'cutoff']);
    });

    it('rootfolder has list, add, delete actions', () => {
      const rf = lidarrResources.find(r => r.name === 'rootfolder');
      expect(rf!.actions.map(a => a.name)).toEqual(['list', 'add', 'delete']);
    });

    it('rootfolder delete requires confirmation', () => {
      const action = getAction('rootfolder', 'delete');
      expect(action.confirmMessage).toBeDefined();
    });

    it('system has status and health actions', () => {
      const system = lidarrResources.find(r => r.name === 'system');
      expect(system!.actions.map(a => a.name)).toEqual(['status', 'health']);
    });
  });
});
