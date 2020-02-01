// Globals
/* eslint-disable no-use-before-define,no-var */
var jasmine = jasmine;
var describe = describe;
var beforeEach = beforeEach;
var afterEach = afterEach;
var it = it;
var expect = expect;
var getJSONFixture = getJSONFixture;

var nOrg = nOrg;
/* eslint-enable no-use-before-define,no-var */

describe('nOrg', () => {
  let root;
  let node;
  let json;

  beforeEach(() => {
    jasmine.getJSONFixtures().fixturesPath = '..';
    json = getJSONFixture('nOrg-nodes.json');
    root = nOrg.defaults.newRoot(json);
    node = root.$childHead.$nextSibling;
  });

  afterEach(() => {
    if (root.$cursorObject) {
      root.$cursorObject.cursor = undefined;
    }
    root.$cursorObject = undefined;
  });

  it('exports module contents', () => {
    expect(nOrg.Node).toBeTruthy();
    expect(Boolean(root)).toBeTruthy();
  });

  describe('node properties:', () => {
    it('child nodes have properties', () => {
      expect({}.hasOwnProperty.call(node, 'Subject')).toBeTruthy();
    });
    it('sorts properties by key', () => {
      // added after bar but sorts before
      node['Bah-Property'] = 'Bah Property';
      expect(node.$properties()).toEqual(['Bah-Property', 'Bar-Property']);
    });
    it('generates valid, CSS select-able ids for nodes', () => {
      expect(/[<@\\.>]/.test(node.toId())).toBeFalsy();
    });
    it('adds a property', () => {
      expect(node.isCursor()).toBeFalsy();
      expect(node.isCursor(node, 0)).toBeFalsy();

      node.$newProperty('Baz-Property');

      expect(node.$properties()[1]).toBe('Baz-Property');
      expect(node.$propertiesCollapsed).toBeFalsy();
      expect(root.isCursor(node, 1)).toBeTruthy();
    });
  });

  describe('node inheritance:', () => {
    it('has a parent', () => {
      expect(Boolean(node)).toBeTruthy();
      expect(node.$parent).toBe(root);
    });
    it('inherits properties from parent', () => {
      const child = node.newChild();
      expect(child.$basename).toBeUndefined();
      expect(child['Bar-Property']).toBe(json.$children[1]['Bar-Property']);
    });
    it('child may override parent attrs and properties', () => {
      const child = node.newChild();
      child.$basename = 'baz';
      child.Subject = 'Baz Subject';

      expect(child.$basename).toBe('baz');
      expect(child.Subject).toBe('Baz Subject');
    });
    it('can inherit root node', () => {
      expect({}.hasOwnProperty.call(node, '$root')).toBeFalsy();
      expect({}.hasOwnProperty.call(node.$root, '$root')).toBeTruthy();
    });
  });

  describe('node children:', () => {
    it('nodes may have children', () => {
      expect(root.$childHead.$nextSibling.$basename).toBe(node.$basename);
      expect(root.$childTail.$prevSibling.$basename).toBe(node.$basename);
      expect(root.$length).toBe(3);
      expect(Boolean(root.$nextSibling)).toBeFalsy();
      expect(Boolean(root.$prevSibling)).toBeFalsy();
      expect(node.$childHead.$length).toBe(0);
      expect(node.$length).toBe(3);
      expect(Boolean(node.$nextSibling.$nextSibling)).toBeFalsy();
      expect(Boolean(node.$prevSibling.$childHead)).toBeFalsy();
      expect(Boolean(node.$prevSibling.$childTail)).toBeFalsy();
      expect(Boolean(node.$prevSibling.$prevSibling)).toBeFalsy();
    });
    it('accepts a node to append as a child', () => {
      const child = new nOrg.Node();
      child.$basename = 'baz';
      node.pushChild(child);

      expect(node.$childTail.$basename).toBe(child.$basename);
      expect(child.$prevSibling.$basename).toBe(
        node.$childHead.$nextSibling.$nextSibling.$basename,
      );
      expect(Boolean(child.$nextSibling)).toBeFalsy();
      expect(node.$length).toBe(4);

      node = node.$prevSibling;
      const only = new nOrg.Node();
      only.$basename = 'baz';
      node.pushChild(only);

      expect(node.$childTail.$basename).toBe(only.$basename);
      expect(node.$childHead.$basename).toBe(only.$basename);
      expect(Boolean(only.$nextSibling)).toBeFalsy();
      expect(Boolean(only.$prevSibling)).toBeFalsy();
      expect(node.$length).toBe(1);
    });
    it('removes itself from its parent', () => {
      const child = node.$childHead.$nextSibling;
      child.popFromParent();

      expect(Boolean(child.parent)).toBeFalsy();
      expect(Boolean(child.$prevSibling)).toBeFalsy();
      expect(Boolean(child.$nextSibling)).toBeFalsy();

      expect(node.$length).toBe(2);
      expect(node.children().length).toBe(2);
      expect(node.$childTail.$prevSibling.$basename).toBe(node.$childHead.$basename);
      expect(node.$childHead.$nextSibling.$basename).toBe(node.$childTail.$basename);

      const first = node.$childHead;
      first.popFromParent();

      expect(node.$length).toBe(1);
      expect(node.children().length).toBe(1);
      expect(node.$childTail.$basename).toBe(node.$childHead.$basename);
      expect(Boolean(node.$childHead.$prevSibling)).toBeFalsy();
      expect(Boolean(node.$childHead.$nextSibling)).toBeFalsy();

      const only = node.$childTail;
      only.popFromParent();

      expect(Boolean(only.parent)).toBeFalsy();
      expect(Boolean(only.$prevSibling)).toBeFalsy();
      expect(Boolean(only.$nextSibling)).toBeFalsy();

      expect(node.$length).toBe(0);
      expect(node.children().length).toBe(0);
      expect(Boolean(node.$childHead)).toBeFalsy();
      expect(Boolean(node.$childTail)).toBeFalsy();
    });
    it('assembles children into an array', () => {
      const children = node.children();
      expect(children.length).toBe(3);
      expect(children[0].$basename).toBe(node.$childHead.$basename);
    });
  });

  describe('node state:', () => {
    it("doesn't inherit node state", () => {
      // node without state
      node = root.$childHead.$nextSibling;
      expect(node.$childHead['Node-State']).toBeUndefined();
    });
    it('has default states', () => {
      expect(node['Node-State']).toBe('TODO');
      expect(node.$nextStates()).toEqual(['DONE', 'CANCELED']);
    });
  });

  describe('nodes from objects:', () => {
    it('nodes may be created from objects', () => {
      const object = { $basename: 'bar', Subject: 'Bar Subject' };
      let child = node.newChild(object);

      expect(child.$basename).toBe(object.$basename);
      expect(child.Subject).toBe(object.Subject);

      object.$basename = 'qux';
      object.Subject = 'Qux Subject';
      child = node.newChild(object);
      expect(child.$basename).toBe(object.$basename);
      expect(child.Subject).toBe(object.Subject);
    });
    it('object children are converted to nodes', () => {
      const object = {
        $basename: 'bar',
        Subject: 'Bar Subject',
        'Bar-Property': 'Bar Property',
        $children: [
          { Subject: 'Corge Subject' },
          { $basename: 'grault' },
          { $basename: 'garply', Subject: 'Garply Subject' },
        ],
      };
      const child = node.$childTail.newChild(object);

      expect(child.$childHead['Bar-Property']).toBe('Bar Property');
      expect(child.$childHead.Subject).toBe('Corge Subject');

      expect(child.$childHead.$nextSibling.$basename).toBe('grault');
      expect(child.$childHead.$nextSibling['Bar-Property']).toBe('Bar Property');

      expect(child.$childTail.$basename).toBe('garply');
      expect(child.$childTail.Subject).toBe('Garply Subject');
    });
  });

  describe('moving nodes:', () => {
    it('demotes a node with previous siblings', () => {
      const parent = root.$childHead;
      node.demote();

      expect(parent.$childHead.$basename).toBe(node.$basename);
      expect(node.$parent.$basename).toBe(parent.$basename);
      expect(parent.$parent.$childHead.$basename).toBe(parent.$basename);
      expect(parent.$parent.$childTail.$basename).toBe(parent.$nextSibling.$basename);

      expect(Boolean(node.$nextSibling)).toBeFalsy();
      expect(Boolean(node.$prevSibling)).toBeFalsy();

      expect(parent.$parent.$length).toBe(2);
      expect(parent.$length).toBe(1);

      expect(parent.children().indexOf(node)).toBe(0);
      expect(parent.$parent.children().length).toBe(2);
      expect(parent.children().length).toBe(1);
    });
    it('demotes a last node with previous siblings', () => {
      const parent = root.$childHead.$nextSibling.$childHead.$nextSibling;
      node = root.$childHead.$nextSibling.$childTail;
      node.demote();

      expect(parent.$childHead.$basename).toBe(node.$basename);
      expect(node.$parent.$basename).toBe(parent.$basename);
      expect(parent.$parent.$childTail.$basename).toBe(parent.$basename);

      expect(Boolean(node.$nextSibling)).toBeFalsy();
      expect(Boolean(node.$prevSibling)).toBeFalsy();

      expect(parent.$parent.$length).toBe(2);
      expect(parent.$length).toBe(1);

      expect(parent.children().indexOf(node)).toBe(0);
      expect(parent.$parent.children().length).toBe(2);
      expect(parent.children().length).toBe(1);
    });
    it('demotes node into a node with children', () => {
      const parent = node;
      node = root.$childTail;
      node.demote();

      expect(parent.$childTail.$basename).toBe(node.$basename);
      expect(node.$parent.$basename).toBe(parent.$basename);
      expect(parent.$parent.$childTail.$basename).toBe(parent.$basename);

      expect(Boolean(node.$nextSibling)).toBeFalsy();
      expect(node.$prevSibling.$basename).toBe(
        parent.$childHead.$nextSibling.$nextSibling.$basename,
      );
      expect(parent.$childHead.$nextSibling.$nextSibling.$nextSibling.$basename).toBe(
        node.$basename,
      );

      expect(parent.$parent.$length).toBe(2);
      expect(parent.$length).toBe(4);

      expect(parent.children().indexOf(node)).toBe(3);
      expect(parent.$parent.children().length).toBe(2);
      expect(parent.children().length).toBe(4);
    });
    it('first nodes may not be demoted', () => {
      // Switch to a scope with no previous siblings
      node = node.$childHead;

      expect(() => {
        node.demote();
      }).toThrow(new Error('Cannot demote first sibling!'));
    });
    it('expands new parent when demoted', () => {
      expect(node.$prevSibling.$collapsed).toBeTruthy();
      node.demote();
      expect(node.$parent.$collapsed).toBeFalsy();
    });

    it('promotes a node with to the middle', () => {
      // Switch to a scope beneath the previous
      const parent = root;
      const prevSibling = node;
      const nextSibling = prevSibling.$nextSibling;
      node = node.$childHead.$nextSibling;
      node.promote();

      expect(node.$parent.$basename).toBe(parent.$basename);

      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);
      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).toBe(node.$basename);

      expect(prevSibling.$childHead.$nextSibling.$basename).toBe(prevSibling.$childTail.$basename);
      expect(prevSibling.$childTail.$prevSibling.$basename).toBe(prevSibling.$childHead.$basename);

      expect(Boolean(node.$childHead)).toBeFalsy();
      expect(Boolean(node.$childTail)).toBeFalsy();

      expect(parent.$length).toBe(4);
      expect(prevSibling.$length).toBe(2);

      expect(parent.children().indexOf(node)).toBe(2);
      expect(parent.children().length).toBe(4);
      expect(prevSibling.children().length).toBe(2);
    });
    it('promotes a first child to the middle', () => {
      // Switch to a first child
      const parent = node.$parent;
      const prevSibling = node;
      const nextSibling = prevSibling.$nextSibling;
      node = node.$childHead;
      node.promote();

      expect(node.$parent.$basename).toBe(parent.$basename);

      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);
      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).toBe(node.$basename);

      expect(prevSibling.$childHead.$nextSibling.$basename).toBe(prevSibling.$childTail.$basename);
      expect(prevSibling.$childTail.$prevSibling.$basename).toBe(prevSibling.$childHead.$basename);

      expect(Boolean(node.$childHead)).toBeFalsy();
      expect(Boolean(node.$childTail)).toBeFalsy();

      expect(parent.$length).toBe(4);
      expect(prevSibling.$length).toBe(2);

      expect(parent.children().indexOf(node)).toBe(2);
      expect(parent.children().length).toBe(4);
      expect(prevSibling.children().length).toBe(2);
    });
    it('promotes a last child to middle', () => {
      // Switch to a first child
      const parent = node.$parent;
      const prevSibling = node;
      const nextSibling = prevSibling.$nextSibling;
      node = node.$childTail;
      node.promote();

      expect(node.$parent.$basename).toBe(parent.$basename);

      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);
      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).toBe(node.$basename);

      expect(prevSibling.$childHead.$nextSibling.$basename).toBe(prevSibling.$childTail.$basename);
      expect(prevSibling.$childTail.$prevSibling.$basename).toBe(prevSibling.$childHead.$basename);

      expect(Boolean(node.$childHead)).toBeFalsy();
      expect(Boolean(node.$childTail)).toBeFalsy();

      expect(parent.$length).toBe(4);
      expect(prevSibling.$length).toBe(2);

      expect(parent.children().indexOf(node)).toBe(2);
      expect(parent.children().length).toBe(4);
      expect(prevSibling.children().length).toBe(2);
    });
    it('promotes a child to the end', () => {
      node.moveDown();
      const prevSibling = node;
      const parent = node.$parent;
      node = node.$childHead.$nextSibling;
      node.promote();

      expect(node.$parent.$basename).toBe(parent.$basename);
      expect(parent.$childTail.$basename).toBe(node.$basename);

      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);
      expect(Boolean(node.$nextSibling)).toBeFalsy();

      expect(prevSibling.$childHead.$nextSibling.$basename).toBe(prevSibling.$childTail.$basename);
      expect(prevSibling.$childTail.$prevSibling.$basename).toBe(prevSibling.$childHead.$basename);

      expect(Boolean(node.$childHead)).toBeFalsy();
      expect(Boolean(node.$childTail)).toBeFalsy();

      expect(parent.$length).toBe(4);
      expect(prevSibling.$length).toBe(2);

      expect(parent.children().indexOf(node)).toBe(3);
      expect(parent.children().length).toBe(4);
      expect(prevSibling.children().length).toBe(2);
    });
    it('does not promote a node without parents', () => {
      expect(() => {
        node.promote();
      }).toThrow(new Error('Cannot promote nodes without parents!'));
    });

    it('moves up a middle node to first node', () => {
      const nextSibling = node.$prevSibling;
      node.moveUp();

      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(Boolean(node.$prevSibling)).toBeFalsy();

      expect(node.$parent.$childHead.$basename).toBe(node.$basename);

      expect(nextSibling.$prevSibling.$basename).toBe(node.$basename);
      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(Boolean(node.$prevSibling)).toBeFalsy();

      expect(root.$childHead.$basename).toBe(node.$basename);
      expect(root.$childTail.$prevSibling.$basename).toBe(root.$childHead.$nextSibling.$basename);

      expect(node.$parent.children().indexOf(node)).toBe(0);
    });
    it('moves up a last node to the middle', () => {
      const prevSibling = node.$childHead;
      node = node.$childTail;
      const nextSibling = node.$prevSibling;
      node.moveUp();

      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).toBe(node.$basename);
      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);

      expect(node.$parent.$childTail.$basename).toBe(nextSibling.$basename);

      expect(node.$parent.children().indexOf(node)).toBe(1);
    });
    it('does not move up a first node', () => {
      // Switch to a scope with no previous siblings
      node = node.$childHead;

      expect(() => {
        node.moveUp();
      }).toThrow(new Error('Cannot move first nodes up!'));
    });

    it('moves down a middle node to last sibling', () => {
      const prevSibling = node.$nextSibling;
      node.moveDown();

      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);
      expect(Boolean(node.$nextSibling)).toBeFalsy();

      expect(node.$parent.$childTail.$basename).toBe(node.$basename);

      expect(node.$parent.children().indexOf(node)).toBe(2);
    });
    it('moves down a first node to middle', () => {
      node = node.$childHead;
      const prevSibling = node.$nextSibling;
      const nextSibling = prevSibling.$nextSibling;
      node.moveDown();

      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);
      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).toBe(node.$basename);

      expect(node.$parent.$childHead.$basename).toBe(prevSibling.$basename);

      expect(node.$parent.children().indexOf(node)).toBe(1);
    });
    it('last nodes may not be moved down', () => {
      // Switch to a scope with no next siblings
      node = node.$childTail;

      expect(() => {
        node.moveDown();
      }).toThrow(new Error('Cannot move last nodes down!'));
    });

    it('moves around and back', () => {
      const parent = node.$parent;
      const prevSibling = node.$prevSibling;
      const nextSibling = node.$nextSibling;

      node.moveDown();
      node.demote();
      node.promote();
      node.moveUp();
      node.moveUp();
      node.moveDown();

      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);

      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).toBe(node.$basename);

      expect(parent.$childHead.$basename).toBe(prevSibling.$basename);
      expect(parent.$childTail.$basename).toBe(nextSibling.$basename);

      expect(Boolean(node.$nextSibling.$childHead)).toBeFalsy();
      expect(Boolean(node.$nextSibling.$childTail)).toBeFalsy();
    });
  });

  describe('adding nodes:', () => {
    it('adds a sibling to the middle', () => {
      const length = node.$parent.$length;
      const nextSibling = node.$nextSibling;
      const prevSibling = node;
      node = prevSibling.newSibling({ $basename: 'baz' }, new KeyboardEvent('keydown'));

      expect(node.$parent.$basename).toBe(prevSibling.$parent.$basename);
      expect(node.$parent.$length).toBe(length + 1);

      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).toBe(node.$basename);

      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);

      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
      expect(prevSibling.$parent.$childHead.isCursor()).toBeFalsy();
    });
    it('adds a sibling to the end', () => {
      const prevSibling = node.$parent.$childTail;
      node = prevSibling.newSibling({ $basename: 'baz' }, new KeyboardEvent('keydown'));

      expect(node.$parent.$basename).toBe(prevSibling.$parent.$basename);

      expect(Boolean(node.$nextSibling)).toBeFalsy();

      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);

      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
      expect(prevSibling.$parent.$childHead.isCursor()).toBeFalsy();
    });
    it('does not inherit certain properties when adding a node', () => {
      expect(node.$childHead['Node-State']).toBeUndefined();

      const sibling = node.$childHead.newSibling();
      expect(sibling.$basename).toBeUndefined();
      expect(sibling.Subject).toBeUndefined();
      expect(sibling['Message-ID']).toBeDefined();
      expect(sibling['Message-ID']).toMatch(/<[^@]+@[^@]+>/);
      expect(sibling['Node-State']).toBeUndefined();

      const child = node.newChild();
      expect(child.$basename).toBeUndefined();
      expect(child.Subject).toBeUndefined();
      expect(child['Message-ID']).toBeDefined();
      expect(child['Message-ID']).toMatch(/<[^@]+@[^@]+>/);
      expect(child['Node-State']).toBeUndefined();
    });
  });

  describe('cursor:', () => {
    beforeEach(() => {
      // Switch to the first node
      node = node.$parent.$childHead;
    });

    it('is initially at the first node', () => {
      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();

      // Switch to the next node
      node = node.$nextSibling;

      expect(node.$cursorObject).not.toBe(node);
      expect(node.isCursor()).toBeFalsy();
    });
    it('may be changed to any other node', () => {
      const oldCursor = node.$cursorObject;
      // Switch to the next node
      node = node.$nextSibling;

      root.cursorTo(node);
      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
      expect(oldCursor.isCursor()).toBeFalsy();
    });
    it('can be moved down to next sibling', () => {
      const oldCursor = node.$cursorObject;
      // Switch to the next node
      node = node.$nextSibling;

      root.cursorDown();
      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
      expect(oldCursor.isCursor()).toBeFalsy();
    });
    it('cannot be moved down beyond last sibling', () => {
      // Switch to the last node
      node = node.$parent.$childTail;

      root.cursorTo(node);
      root.cursorDown();
      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
    });
    it('can move down to next expanded child', () => {
      // Switch to node with children
      node = node.$nextSibling;
      root.cursorTo(node);
      expect(node.$cursorObject.$collapsed).toBeTruthy();
      node.$cursorObject.$collapsed = false;

      root.cursorDown();
      expect(node.$cursorObject.$basename).toBe(node.$childHead.$basename);
      expect(node.isCursor()).toBeFalsy();
      expect(node.$childHead.isCursor()).toBeTruthy();
    });
    it('can move down to next parent from last child', () => {
      // Switch to last child node
      node = node.$nextSibling.$childTail;
      root.cursorTo(node);
      root.cursorDown();
      expect(node.$cursorObject.$basename).toBe(node.$parent.$nextSibling.$basename);
      expect(node.isCursor()).toBeFalsy();
      expect(node.$parent.$nextSibling.isCursor()).toBeTruthy();
    });
    it('can move up to previous sibling', () => {
      const oldCursor = node.$cursorObject;
      // Switch to the next node
      node = node.$nextSibling;

      root.cursorTo(node);
      root.cursorUp();
      expect(node.$cursorObject.$basename).toBe(oldCursor.$basename);
      expect(node.isCursor()).toBeFalsy();
      expect(oldCursor.isCursor()).toBeTruthy();
    });
    it("moves cursor up into previous sibling's last expanded descendant", () => {
      // Switch to node nested several levels into expanded parents
      node = node.$nextSibling.$childTail;
      node.$parent.$collapsed = false;
      node.demote();
      node.$parent.demote();
      root.cursorTo(root.$childTail);

      root.cursorUp();
      expect(root.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
      expect(root.$childTail.isCursor()).toBeFalsy();
    });
    it('cannot be moved up above first sibling', () => {
      root.cursorUp();
      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
    });
    it('can move to previous parent from first child', () => {
      // Switch to first child node
      node = node.$nextSibling.$childHead;
      root.cursorTo(node);
      root.cursorUp();
      expect(node.$cursorObject.$basename).toBe(node.$parent.$basename);
      expect(node.isCursor()).toBeFalsy();
      expect(node.$parent.isCursor()).toBeTruthy();
    });

    it('can be moved right to the first child', () => {
      // Create a child
      node = node.$nextSibling;
      root.cursorTo(node);
      const oldCursor = node.$cursorObject;

      node = node.$childHead;

      root.cursorRight();
      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
      expect(oldCursor.isCursor()).toBeFalsy();
    });
    it('cannot be moved right without children', () => {
      root.cursorRight();
      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
    });
    it('can expand and move into collapsed first child', () => {
      // Switch to the next node
      node = node.$nextSibling;
      root.cursorTo(node);
      expect(node.$collapsed).toBeTruthy();

      root.cursorRight();
      expect(node.$cursorObject.$basename).toBe(node.$childHead.$basename);
      expect(node.isCursor()).toBeFalsy();
      expect(node.$childHead.isCursor()).toBeTruthy();
      expect(node.$collapsed).toBeFalsy();
    });
    it('can be moved up to previous sibling', () => {
      // Create a child
      node = node.$nextSibling;

      root.cursorTo(node);
      const oldCursor = node.$cursorObject;

      node = node.$childHead;
      root.cursorTo(node);

      root.cursorLeft();
      expect(node.$cursorObject.$basename).toBe(oldCursor.$basename);
      expect(node.isCursor()).toBeFalsy();
      expect(oldCursor.isCursor()).toBeTruthy();
    });
    it('cannot be moved up above first sibling', () => {
      root.cursorLeft();
      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
    });
  });

  describe('properties cursor:', () => {
    beforeEach(() => {
      node.$propertiesCollapsed = false;
      node['Bah-Property'] = 'Bah Property';
    });

    it('is not initially at a property', () => {
      expect(node.$cursorIndex).toBeUndefined();
    });
    it('can move right into expanded properties', () => {
      root.cursorTo(node);
      root.cursorRight();

      expect(node.$cursorObject[node.$cursorObject.$properties()[node.$cursorIndex]]).toBe(
        'Bah Property',
      );
      expect(node.isCursor(node, 0)).toBeTruthy();
    });
    it('can move down into expanded properties', () => {
      root.cursorTo(node);
      root.cursorDown();

      expect(node.$cursorObject[node.$cursorObject.$properties()[node.$cursorIndex]]).toBe(
        'Bah Property',
      );
      expect(node.isCursor(node, 0)).toBeTruthy();
    });
    it('can move left out of properties', () => {
      root.cursorTo(node, 1);

      root.cursorLeft();

      expect(node.$cursorObject.$basename).toBe('bar');
      expect(node.isCursor()).toBeTruthy();
      expect(node.$cursorIndex).toBeUndefined();
    });
    it('can move down within properties', () => {
      root.cursorTo(node, 0);

      root.cursorDown();

      expect(node.isCursor(node, 1)).toBeTruthy();
      expect(node.$cursorObject[node.$cursorObject.$properties()[node.$cursorIndex]]).toBe(
        'Bar Property',
      );
    });
    it('can move up within properties', () => {
      root.cursorTo(node, 1);

      root.cursorUp();

      expect(node.$cursorObject[node.$cursorObject.$properties()[node.$cursorIndex]]).toBe(
        'Bah Property',
      );
      expect(node.isCursor(node, 0)).toBeTruthy();
      expect(node.$cursorObject[1]).toBeUndefined();
    });
    it('can move down to next node past last property', () => {
      node.$collapsed = false;
      root.cursorTo(node, 1);

      root.cursorDown();

      expect(node.$childHead.isCursor()).toBeTruthy();
      expect(node.$cursorIndex).toBeUndefined();

      node.$childHead.$propertiesCollapsed = false;
      root.cursorTo(node.$childHead, 0);

      root.cursorDown();

      expect(node.$childHead.$nextSibling.isCursor()).toBeTruthy();
      expect(node.$cursorIndex).toBeUndefined();
    });
    it('can move up to node past first property', () => {
      node.$collapsed = false;
      node.$propertiesCollapsed = false;
      root.cursorTo(node, 0);

      root.cursorUp();

      expect(node.isCursor()).toBeTruthy();
      expect(node.$cursorIndex).toBeUndefined();

      node.$childHead.$propertiesCollapsed = false;
      root.cursorTo(node.$childHead, 0);

      root.cursorUp();

      expect(node.$childHead.isCursor()).toBeTruthy();
      expect(node.$cursorIndex).toBeUndefined();
    });
    it('can move up into expanded property', () => {
      node.$collapsed = false;
      node.$propertiesCollapsed = false;
      root.cursorTo(node.$childHead);

      root.cursorUp();

      expect(node.isCursor(node, 1)).toBeTruthy();
      expect(node.$childHead.isCursor()).toBeFalsy();
      expect(node.$cursorObject.$properties()).toEqual(node.$properties());
    });
    it('can not move right within properties', () => {
      root.cursorTo(node, 0);

      root.cursorRight();

      expect(node.$cursorObject[node.$cursorObject.$properties()[node.$cursorIndex]]).toBe(
        'Bah Property',
      );
      expect(node.isCursor(node, 0)).toBeTruthy();
      expect(node.$cursorIndex).toBeDefined();
    });
    it('can not move right into collapsed properties', () => {
      node.$propertiesCollapsed = true;
      root.cursorTo(node);

      root.cursorRight();

      expect(node.$cursorObject.$basename).toBe(node.$childHead.$basename);
      expect(node.$childHead.isCursor()).toBeTruthy();
      expect(node.$cursorIndex).toBeUndefined();
      expect(node.isCursor()).toBeFalsy();
    });
    it('can not move down into collapsed properties', () => {
      node.$propertiesCollapsed = true;
      root.cursorTo(node);

      root.cursorDown();

      expect(node.$cursorObject.$basename).toBe(node.$nextSibling.$basename);
      expect(node.$nextSibling.isCursor()).toBeTruthy();
      expect(node.$cursorIndex).toBeUndefined();
      expect(node.isCursor()).toBeFalsy();
    });
  });

  describe('collapse/expand:', () => {
    it('nodes are initially collapsed', () => {
      expect(node.$collapsed).toBeTruthy();
    });
    it('can toggle nodes with children', () => {
      root.cursorTo(node);
      node.toggle();
      expect(node.$collapsed).toBeFalsy();
      node.toggle();
      expect(node.$collapsed).toBeTruthy();
    });
    it('cannot toggle nodes without children', () => {
      node = node.$prevSibling;
      root.cursorTo(node);
      node.toggle();
      expect(node.$collapsed).toBeTruthy();
    });
    it('properties are initially collapsed', () => {
      expect(node.$propertiesCollapsed).toBeTruthy();
    });
    it('can toggle nodes with properties', () => {
      root.cursorTo(node);
      node.toggleProperties();
      expect(node.$propertiesCollapsed).toBeFalsy();
      node.toggleProperties();
      expect(node.$propertiesCollapsed).toBeTruthy();
    });
  });
});
