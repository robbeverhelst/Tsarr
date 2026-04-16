import { describe, expect, it } from 'bun:test';
import { resources as readarrResources } from '../src/cli/commands/readarr.js';
import { COMMAND_OUTPUT_COLUMNS } from '../src/cli/commands/service.js';

function getAction(resourceName: string, actionName: string) {
  const resource = readarrResources.find(r => r.name === resourceName);
  expect(resource).toBeDefined();
  const action = resource!.actions.find(a => a.name === actionName);
  expect(action).toBeDefined();
  return action!;
}

describe('Readarr command definitions', () => {
  it('covers all expected resources', () => {
    const names = readarrResources.map(r => r.name).sort();
    expect(names).toEqual([
      'author',
      'blocklist',
      'book',
      'bookfile',
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
      'wanted',
    ]);
  });

  describe('author resource', () => {
    it('has all expected actions', () => {
      const author = readarrResources.find(r => r.name === 'author');
      expect(author!.actions.map(a => a.name)).toEqual([
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

    it('author list has expected columns', () => {
      const action = getAction('author', 'list');
      expect(action.columns).toEqual(['id', 'authorName', 'monitored', 'qualityProfileId']);
    });

    it('author refresh uses command output columns', () => {
      const action = getAction('author', 'refresh');
      expect(action.columns).toEqual(COMMAND_OUTPUT_COLUMNS);
    });

    it('author delete requires confirmation', () => {
      const action = getAction('author', 'delete');
      expect(action.confirmMessage).toBeDefined();
    });

    it('author edit has monitored, quality-profile-id, and tags args', () => {
      const action = getAction('author', 'edit');
      const argNames = action.args!.map(a => a.name);
      expect(argNames).toContain('id');
      expect(argNames).toContain('monitored');
      expect(argNames).toContain('quality-profile-id');
      expect(argNames).toContain('tags');
    });
  });

  describe('book resource', () => {
    it('has list, get, search, add, edit, delete actions', () => {
      const book = readarrResources.find(r => r.name === 'book');
      expect(book!.actions.map(a => a.name)).toEqual([
        'list',
        'get',
        'search',
        'add',
        'edit',
        'delete',
      ]);
    });

    it('book delete requires confirmation', () => {
      const action = getAction('book', 'delete');
      expect(action.confirmMessage).toBeDefined();
    });
  });

  describe('bookfile resource', () => {
    it('has list, get, delete actions', () => {
      const bf = readarrResources.find(r => r.name === 'bookfile');
      expect(bf!.actions.map(a => a.name)).toEqual(['list', 'get', 'delete']);
    });

    it('bookfile delete requires confirmation', () => {
      const action = getAction('bookfile', 'delete');
      expect(action.confirmMessage).toBeDefined();
    });
  });

  describe('tag resource', () => {
    it('has create, delete, list actions', () => {
      const tag = readarrResources.find(r => r.name === 'tag');
      expect(tag!.actions.map(a => a.name)).toEqual(['create', 'delete', 'list']);
    });

    it('tag create requires label arg', () => {
      const action = getAction('tag', 'create');
      expect(action.args![0].name).toBe('label');
      expect(action.args![0].required).toBe(true);
    });

    it('tag delete requires confirmation', () => {
      const action = getAction('tag', 'delete');
      expect(action.confirmMessage).toBeDefined();
    });
  });

  describe('notification resource', () => {
    it('has list, get, add, edit, delete, test actions', () => {
      const notification = readarrResources.find(r => r.name === 'notification');
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
  });

  describe('downloadclient resource', () => {
    it('has list, get, add, edit, delete, test actions', () => {
      const dc = readarrResources.find(r => r.name === 'downloadclient');
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
      const il = readarrResources.find(r => r.name === 'importlist');
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

  describe('other resources', () => {
    it('queue has list, status, delete, grab actions', () => {
      const queue = readarrResources.find(r => r.name === 'queue');
      expect(queue!.actions.map(a => a.name)).toEqual(['list', 'status', 'delete', 'grab']);
    });

    it('blocklist has list and delete actions', () => {
      const bl = readarrResources.find(r => r.name === 'blocklist');
      expect(bl!.actions.map(a => a.name)).toEqual(['list', 'delete']);
    });

    it('wanted has missing and cutoff actions', () => {
      const wanted = readarrResources.find(r => r.name === 'wanted');
      expect(wanted!.actions.map(a => a.name)).toEqual(['missing', 'cutoff']);
    });

    it('rootfolder has list, add, delete actions', () => {
      const rf = readarrResources.find(r => r.name === 'rootfolder');
      expect(rf!.actions.map(a => a.name)).toEqual(['list', 'add', 'delete']);
    });

    it('system has status and health actions', () => {
      const system = readarrResources.find(r => r.name === 'system');
      expect(system!.actions.map(a => a.name)).toEqual(['status', 'health']);
    });
  });
});
