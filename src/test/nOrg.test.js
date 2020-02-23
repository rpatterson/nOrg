import { expect } from '@open-wc/testing';

import Node, {defaults} from '../nOrg.js';
import json from '../nOrg-nodes.js';


describe('nOrg', () => {
  let top;
  let node;

  beforeEach(() => {
    top = defaults.newTop(json);
    node = top.$childHead.$nextSibling;
  });

  afterEach(() => {
    if (top.$cursorObject) {
      top.$cursorObject.cursor = undefined;
    }
    top.$cursorObject = undefined;
  });

  it('exports module contents', () => {
    expect(Node).to.be.an('function');
    expect(Boolean(top)).to.be.true;
  });

  describe('node properties:', () => {
    it('child nodes have properties', () => {
      expect({}.hasOwnProperty.call(node, 'Subject')).to.be.true;
    });
    it('sorts properties by key', () => {
      // added after bar but sorts before
      node['Bah-Property'] = 'Bah Property';
      expect(node.$properties()).to.deep.equal(['Bah-Property', 'Bar-Property']);
    });
    it('generates valid, CSS select-able ids for nodes', () => {
      expect(/[<@\\.>]/.test(node.toId())).to.be.false;
    });
    it('adds a property', () => {
      expect(node.isCursor()).to.be.false;
      expect(node.isCursor(node, 0)).to.be.false;

      node.$newProperty('Baz-Property');

      expect(node.$properties()[1]).to.equal('Baz-Property');
      expect(node.$propertiesCollapsed).to.be.false;
      expect(top.isCursor(node, 1)).to.be.true;
    });
    it('Throws an error for empty property names', () => {
      expect(() => node.$newProperty('')).to.throw('Must provide a property name');
    });
  });

  describe('node inheritance:', () => {
    it('has a parent', () => {
      expect(Boolean(node)).to.be.true;
      expect(node.$parent).to.equal(top);
    });
    it('inherits properties from parent', () => {
      const child = node.newChild(new Event('keydown'));
      expect(child.$basename).to.be.undefined;
      expect(child['Bar-Property']).to.equal(json.$children[1]['Bar-Property']);
    });
    it('child may override parent attrs and properties', () => {
      const child = node.newChild();
      child.$basename = 'baz';
      child.Subject = 'Baz Subject';

      expect(child.$basename).to.equal('baz');
      expect(child.Subject).to.equal('Baz Subject');
    });
    it('can inherit top node', () => {
      expect({}.hasOwnProperty.call(node, '$top')).to.be.false;
      expect({}.hasOwnProperty.call(node.$top, '$top')).to.be.true;
    });
  });

  describe('node children:', () => {
    it('nodes may have children', () => {
      expect(top.$childHead.$nextSibling.$basename).to.equal(node.$basename);
      expect(top.$childTail.$prevSibling.$basename).to.equal(node.$basename);
      expect(top.$length).to.equal(3);
      expect(Boolean(top.$nextSibling)).to.be.false;
      expect(Boolean(top.$prevSibling)).to.be.false;
      expect(node.$childHead.$childHead.$childHead.$length).to.equal(0);
      expect(node.$length).to.equal(3);
      expect(Boolean(node.$nextSibling.$nextSibling)).to.be.false;
      expect(Boolean(node.$prevSibling.$childHead)).to.be.false;
      expect(Boolean(node.$prevSibling.$childTail)).to.be.false;
      expect(Boolean(node.$prevSibling.$prevSibling)).to.be.false;
    });
    it('accepts a node to append as a child', () => {
      const child = new Node();
      child.$basename = 'baz';
      node.pushChild(child);

      expect(node.$childTail.$basename).to.equal(child.$basename);
      expect(child.$prevSibling.$basename).to.equal(
        node.$childHead.$nextSibling.$nextSibling.$basename,
      );
      expect(Boolean(child.$nextSibling)).to.be.false;
      expect(node.$length).to.equal(4);

      node = node.$prevSibling;
      const only = new Node();
      only.$basename = 'baz';
      node.pushChild(only);

      expect(node.$childTail.$basename).to.equal(only.$basename);
      expect(node.$childHead.$basename).to.equal(only.$basename);
      expect(Boolean(only.$nextSibling)).to.be.false;
      expect(Boolean(only.$prevSibling)).to.be.false;
      expect(node.$length).to.equal(1);
    });
    it('removes itself from its parent', () => {
      const child = node.$childHead.$nextSibling;
      child.popFromParent();

      expect(Boolean(child.parent)).to.be.false;
      expect(Boolean(child.$prevSibling)).to.be.false;
      expect(Boolean(child.$nextSibling)).to.be.false;

      expect(node.$length).to.equal(2);
      expect(node.children().length).to.equal(2);
      expect(node.$childTail.$prevSibling.$basename).to.equal(node.$childHead.$basename);
      expect(node.$childHead.$nextSibling.$basename).to.equal(node.$childTail.$basename);

      const first = node.$childHead;
      first.popFromParent();

      expect(node.$length).to.equal(1);
      expect(node.children().length).to.equal(1);
      expect(node.$childTail.$basename).to.equal(node.$childHead.$basename);
      expect(Boolean(node.$childHead.$prevSibling)).to.be.false;
      expect(Boolean(node.$childHead.$nextSibling)).to.be.false;

      const only = node.$childTail;
      only.popFromParent();

      expect(Boolean(only.parent)).to.be.false;
      expect(Boolean(only.$prevSibling)).to.be.false;
      expect(Boolean(only.$nextSibling)).to.be.false;

      expect(node.$length).to.equal(0);
      expect(node.children().length).to.equal(0);
      expect(Boolean(node.$childHead)).to.be.false;
      expect(Boolean(node.$childTail)).to.be.false;
    });
    it('assembles children into an array', () => {
      const children = node.children();
      expect(children.length).to.equal(3);
      expect(children[0].$basename).to.equal(node.$childHead.$basename);
    });
  });

  describe('node state:', () => {
    it("doesn't inherit node state", () => {
      // node without state
      node = top.$childHead.$nextSibling;
      expect(node.$childHead['Node-State']).to.be.undefined;
    });
    it('has default states', () => {
      expect(node['Node-State']).to.equal('TODO');
      expect(node.$nextStates()).to.deep.equal(['DONE', 'CANCELED']);
      expect(node.$nextStates('DONE')).to.deep.equal(['TODO', 'CANCELED']);
    });
    it('can be changed', () => {
      node.$changeState('DONE');
      expect(node['Node-State']).to.equal('DONE');
    });
  });

  describe('nodes from objects:', () => {
    it('nodes may be created from objects', () => {
      const object = { $basename: 'bar', Subject: 'Bar Subject' };
      top.$cursorObject = null;
      let child = node.newChild(object, new Event('keydown'));

      expect(child.$basename).to.equal(object.$basename);
      expect(child.Subject).to.equal(object.Subject);

      object.$basename = 'qux';
      object.Subject = 'Qux Subject';
      child = node.newChild(object);
      expect(child.$basename).to.equal(object.$basename);
      expect(child.Subject).to.equal(object.Subject);
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

      expect(child.$childHead['Bar-Property']).to.equal('Bar Property');
      expect(child.$childHead.Subject).to.equal('Corge Subject');

      expect(child.$childHead.$nextSibling.$basename).to.equal('grault');
      expect(child.$childHead.$nextSibling['Bar-Property']).to.equal('Bar Property');

      expect(child.$childTail.$basename).to.equal('garply');
      expect(child.$childTail.Subject).to.equal('Garply Subject');
    });
  });

  describe('moving nodes:', () => {
    it('demotes a node with previous siblings', () => {
      const parent = top.$childHead;
      node.demote();

      expect(parent.$childHead.$basename).to.equal(node.$basename);
      expect(node.$parent.$basename).to.equal(parent.$basename);
      expect(parent.$parent.$childHead.$basename).to.equal(parent.$basename);
      expect(parent.$parent.$childTail.$basename).to.equal(parent.$nextSibling.$basename);

      expect(Boolean(node.$nextSibling)).to.be.false;
      expect(Boolean(node.$prevSibling)).to.be.false;

      expect(parent.$parent.$length).to.equal(2);
      expect(parent.$length).to.equal(1);

      expect(parent.children().indexOf(node)).to.equal(0);
      expect(parent.$parent.children().length).to.equal(2);
      expect(parent.children().length).to.equal(1);

      expect(node.depth()).to.equal(2);
    });
    it('demotes a last node with previous siblings', () => {
      const parent = top.$childHead.$nextSibling.$childHead.$nextSibling;
      node = top.$childHead.$nextSibling.$childTail;
      node.demote();

      expect(parent.$childHead.$basename).to.equal(node.$basename);
      expect(node.$parent.$basename).to.equal(parent.$basename);
      expect(parent.$parent.$childTail.$basename).to.equal(parent.$basename);

      expect(Boolean(node.$nextSibling)).to.be.false;
      expect(Boolean(node.$prevSibling)).to.be.false;

      expect(parent.$parent.$length).to.equal(2);
      expect(parent.$length).to.equal(1);

      expect(parent.children().indexOf(node)).to.equal(0);
      expect(parent.$parent.children().length).to.equal(2);
      expect(parent.children().length).to.equal(1);
    });
    it('demotes node into a node with children', () => {
      const parent = node;
      node = top.$childTail;
      node.demote();

      expect(parent.$childTail.$basename).to.equal(node.$basename);
      expect(node.$parent.$basename).to.equal(parent.$basename);
      expect(parent.$parent.$childTail.$basename).to.equal(parent.$basename);

      expect(Boolean(node.$nextSibling)).to.be.false;
      expect(node.$prevSibling.$basename).to.equal(
        parent.$childHead.$nextSibling.$nextSibling.$basename,
      );
      expect(parent.$childHead.$nextSibling.$nextSibling.$nextSibling.$basename).to.equal(
        node.$basename,
      );

      expect(parent.$parent.$length).to.equal(2);
      expect(parent.$length).to.equal(4);

      expect(parent.children().indexOf(node)).to.equal(3);
      expect(parent.$parent.children().length).to.equal(2);
      expect(parent.children().length).to.equal(4);
    });
    it('first nodes may not be demoted', () => {
      // Switch to a scope with no previous siblings
      node = node.$childHead;

      expect(() => {
        node.demote();
      }).to.throw(Error, 'Cannot demote first sibling!');
    });
    it('expands new parent when demoted', () => {
      expect(node.$prevSibling.$collapsed).to.be.true;
      node.demote();
      expect(node.$parent.$collapsed).to.be.false;
    });

    it('promotes a node with to the middle', () => {
      // Switch to a scope beneath the previous
      const parent = top;
      const prevSibling = node;
      const nextSibling = prevSibling.$nextSibling;
      node = node.$childHead.$nextSibling;
      node.promote();

      expect(node.$parent.$basename).to.equal(parent.$basename);

      expect(node.$prevSibling.$basename).to.equal(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).to.equal(node.$basename);
      expect(node.$nextSibling.$basename).to.equal(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).to.equal(node.$basename);

      expect(prevSibling.$childHead.$nextSibling.$basename).to.equal(prevSibling.$childTail.$basename);
      expect(prevSibling.$childTail.$prevSibling.$basename).to.equal(prevSibling.$childHead.$basename);

      expect(Boolean(node.$childHead)).to.be.false;
      expect(Boolean(node.$childTail)).to.be.false;

      expect(parent.$length).to.equal(4);
      expect(prevSibling.$length).to.equal(2);

      expect(parent.children().indexOf(node)).to.equal(2);
      expect(parent.children().length).to.equal(4);
      expect(prevSibling.children().length).to.equal(2);

      expect(node.depth(parent)).to.equal(1);
    });
    it('promotes a first child to the middle', () => {
      // Switch to a first child
      const parent = node.$parent;
      const prevSibling = node;
      const nextSibling = prevSibling.$nextSibling;
      node = node.$childHead;
      node.promote();

      expect(node.$parent.$basename).to.equal(parent.$basename);

      expect(node.$prevSibling.$basename).to.equal(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).to.equal(node.$basename);
      expect(node.$nextSibling.$basename).to.equal(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).to.equal(node.$basename);

      expect(prevSibling.$childHead.$nextSibling.$basename).to.equal(prevSibling.$childTail.$basename);
      expect(prevSibling.$childTail.$prevSibling.$basename).to.equal(prevSibling.$childHead.$basename);

      expect(Boolean(node.$childHead.$childHead.$childHead)).to.be.false;
      expect(Boolean(node.$childTail.$childTail.$childTail)).to.be.false;

      expect(parent.$length).to.equal(4);
      expect(prevSibling.$length).to.equal(2);

      expect(parent.children().indexOf(node)).to.equal(2);
      expect(parent.children().length).to.equal(4);
      expect(prevSibling.children().length).to.equal(2);
    });
    it('promotes a last child to middle', () => {
      // Switch to a first child
      const parent = node.$parent;
      const prevSibling = node;
      const nextSibling = prevSibling.$nextSibling;
      node = node.$childTail;
      node.promote();

      expect(node.$parent.$basename).to.equal(parent.$basename);

      expect(node.$prevSibling.$basename).to.equal(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).to.equal(node.$basename);
      expect(node.$nextSibling.$basename).to.equal(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).to.equal(node.$basename);

      expect(prevSibling.$childHead.$nextSibling.$basename).to.equal(prevSibling.$childTail.$basename);
      expect(prevSibling.$childTail.$prevSibling.$basename).to.equal(prevSibling.$childHead.$basename);

      expect(Boolean(node.$childHead)).to.be.false;
      expect(Boolean(node.$childTail)).to.be.false;

      expect(parent.$length).to.equal(4);
      expect(prevSibling.$length).to.equal(2);

      expect(parent.children().indexOf(node)).to.equal(2);
      expect(parent.children().length).to.equal(4);
      expect(prevSibling.children().length).to.equal(2);
    });
    it('promotes a child to the end', () => {
      node.moveDown();
      const prevSibling = node;
      const parent = node.$parent;
      node = node.$childHead.$nextSibling;
      node.promote();

      expect(node.$parent.$basename).to.equal(parent.$basename);
      expect(parent.$childTail.$basename).to.equal(node.$basename);

      expect(node.$prevSibling.$basename).to.equal(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).to.equal(node.$basename);
      expect(Boolean(node.$nextSibling)).to.be.false;

      expect(prevSibling.$childHead.$nextSibling.$basename).to.equal(prevSibling.$childTail.$basename);
      expect(prevSibling.$childTail.$prevSibling.$basename).to.equal(prevSibling.$childHead.$basename);

      expect(Boolean(node.$childHead)).to.be.false;
      expect(Boolean(node.$childTail)).to.be.false;

      expect(parent.$length).to.equal(4);
      expect(prevSibling.$length).to.equal(2);

      expect(parent.children().indexOf(node)).to.equal(3);
      expect(parent.children().length).to.equal(4);
      expect(prevSibling.children().length).to.equal(2);
    });
    it('does not promote a node without parents', () => {
      expect(() => {
        node.promote();
      }).to.throw(Error, 'Cannot promote nodes without parents!');
    });

    it('moves up a middle node to first node', () => {
      const nextSibling = node.$prevSibling;
      node.moveUp();

      expect(node.$nextSibling.$basename).to.equal(nextSibling.$basename);
      expect(Boolean(node.$prevSibling)).to.be.false;

      expect(node.$parent.$childHead.$basename).to.equal(node.$basename);

      expect(nextSibling.$prevSibling.$basename).to.equal(node.$basename);
      expect(node.$nextSibling.$basename).to.equal(nextSibling.$basename);
      expect(Boolean(node.$prevSibling)).to.be.false;

      expect(top.$childHead.$basename).to.equal(node.$basename);
      expect(top.$childTail.$prevSibling.$basename).to.equal(top.$childHead.$nextSibling.$basename);

      expect(node.$parent.children().indexOf(node)).to.equal(0);
    });
    it('moves up a last node to the middle', () => {
      const prevSibling = node.$childHead;
      node = node.$childTail;
      const nextSibling = node.$prevSibling;
      node.moveUp();

      expect(node.$nextSibling.$basename).to.equal(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).to.equal(node.$basename);
      expect(node.$prevSibling.$basename).to.equal(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).to.equal(node.$basename);

      expect(node.$parent.$childTail.$basename).to.equal(nextSibling.$basename);

      expect(node.$parent.children().indexOf(node)).to.equal(1);
    });
    it('does not move up a first node', () => {
      // Switch to a scope with no previous siblings
      node = node.$childHead;

      expect(() => {
        node.moveUp();
      }).to.throw(Error, 'Cannot move first nodes up!');
    });

    it('moves down a middle node to last sibling', () => {
      const prevSibling = node.$nextSibling;
      node.moveDown();

      expect(node.$prevSibling.$basename).to.equal(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).to.equal(node.$basename);
      expect(Boolean(node.$nextSibling)).to.be.false;

      expect(node.$parent.$childTail.$basename).to.equal(node.$basename);

      expect(node.$parent.children().indexOf(node)).to.equal(2);
    });
    it('moves down a first node to middle', () => {
      node = node.$childHead;
      const prevSibling = node.$nextSibling;
      const nextSibling = prevSibling.$nextSibling;
      node.moveDown();

      expect(node.$prevSibling.$basename).to.equal(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).to.equal(node.$basename);
      expect(node.$nextSibling.$basename).to.equal(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).to.equal(node.$basename);

      expect(node.$parent.$childHead.$basename).to.equal(prevSibling.$basename);

      expect(node.$parent.children().indexOf(node)).to.equal(1);
    });
    it('last nodes may not be moved down', () => {
      // Switch to a scope with no next siblings
      node = node.$childTail;

      expect(() => {
        node.moveDown();
      }).to.throw(Error, 'Cannot move last nodes down!');
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

      expect(node.$prevSibling.$basename).to.equal(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).to.equal(node.$basename);

      expect(node.$nextSibling.$basename).to.equal(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).to.equal(node.$basename);

      expect(parent.$childHead.$basename).to.equal(prevSibling.$basename);
      expect(parent.$childTail.$basename).to.equal(nextSibling.$basename);

      expect(Boolean(node.$nextSibling.$childHead)).to.be.false;
      expect(Boolean(node.$nextSibling.$childTail)).to.be.false;
    });
});

  describe('adding nodes:', () => {
    it('adds a sibling to the middle', () => {
      const length = node.$parent.$length;
      const nextSibling = node.$nextSibling;
      const prevSibling = node;
      node = prevSibling.newSibling({ $basename: 'baz' }, new KeyboardEvent('keydown'));

      expect(node.$parent.$basename).to.equal(prevSibling.$parent.$basename);
      expect(node.$parent.$length).to.equal(length + 1);

      expect(node.$nextSibling.$basename).to.equal(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).to.equal(node.$basename);

      expect(node.$prevSibling.$basename).to.equal(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).to.equal(node.$basename);

      expect(node.$cursorObject.$basename).to.equal(node.$basename);
      expect(node.isCursor()).to.be.true;
      expect(prevSibling.$parent.$childHead.isCursor()).to.be.false;
    });
    it('adds a sibling to the end', () => {
      const prevSibling = node.$parent.$childTail;
      node = prevSibling.newSibling({ $basename: 'baz' }, new KeyboardEvent('keydown'));

      expect(node.$parent.$basename).to.equal(prevSibling.$parent.$basename);

      expect(Boolean(node.$nextSibling)).to.be.false;

      expect(node.$prevSibling.$basename).to.equal(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).to.equal(node.$basename);

      expect(node.$cursorObject.$basename).to.equal(node.$basename);
      expect(node.isCursor()).to.be.true;
      expect(prevSibling.$parent.$childHead.isCursor()).to.be.false;
    });
    it('does not inherit certain properties when adding a node', () => {
      expect(node.$childHead['Node-State']).to.be.undefined;

      const sibling = node.$childHead.newSibling();
      expect(sibling.$basename).to.be.undefined;
      expect(sibling.Subject).to.be.undefined;
      expect(sibling['Message-ID']).to.match(/<[^@]+@[^@]+>/);
      expect(sibling.$$hashKey()).to.equal(sibling['Message-ID']);
      expect(sibling['Node-State']).to.be.undefined;

      const child = node.newChild();
      expect(child.$basename).to.be.undefined;
      expect(child.Subject).to.be.undefined;
      expect(child['Message-ID']).to.match(/<[^@]+@[^@]+>/);
      expect(child.$$hashKey()).to.equal(child['Message-ID']);
      expect(child['Node-State']).to.be.undefined;
    });
  });

  describe('cursor:', () => {
    beforeEach(() => {
      // Switch to the first node
      node = node.$parent.$childHead;
    });

    it('is initially at the first node', () => {
      expect(node.$cursorObject.$basename).to.equal(node.$basename);
      expect(node.isCursor()).to.be.true;

      // Switch to the next node
      node = node.$nextSibling;

      expect(node.$cursorObject).not.to.equal(node);
      expect(node.isCursor()).to.be.false;
    });
    it('may be changed to any other node', () => {
      const oldCursor = node.$cursorObject;
      // Switch to the next node
      node = node.$nextSibling;

      top.cursorTo(node);
      expect(node.$cursorObject.$basename).to.equal(node.$basename);
      expect(node.isCursor()).to.be.true;
      expect(oldCursor.isCursor()).to.be.false;
    });
    it('may be changed to this node', () => {
      const oldCursor = node.$cursorObject;
      // Switch to the next node
      node = node.$nextSibling;

      node.cursorTo();
      expect(node.$cursorObject.$basename).to.equal(node.$basename);
      expect(node.isCursor()).to.be.true;
      expect(oldCursor.isCursor()).to.be.false;
    });
    it('can be moved down to next sibling', () => {
      const oldCursor = node.$cursorObject;
      // Switch to the next node
      node = node.$nextSibling;

      top.cursorDown(new Event('keydown'));
      expect(node.$cursorObject.$basename).to.equal(node.$basename);
      expect(node.isCursor()).to.be.true;
      expect(oldCursor.isCursor()).to.be.false;
    });
    it('cannot be moved down beyond last sibling', () => {
      // Switch to the last node
      node = node.$parent.$childTail;

      top.cursorTo(node);
      top.cursorDown();
      expect(node.$cursorObject.$basename).to.equal(node.$basename);
      expect(node.isCursor()).to.be.true;
    });
    it('can move down to next expanded child', () => {
      // Switch to node with children
      node = node.$nextSibling;
      top.cursorTo(node);
      expect(node.$cursorObject.$collapsed).to.be.true;
      node.$cursorObject.$collapsed = false;

      top.cursorDown();
      expect(node.$cursorObject.$basename).to.equal(node.$childHead.$basename);
      expect(node.isCursor()).to.be.false;
      expect(node.$childHead.isCursor()).to.be.true;
    });
    it('can move down to next parent from last child', () => {
      // Switch to last child node
      node = node.$nextSibling.$childTail;
      top.cursorTo(node);
      top.cursorDown();
      expect(node.$cursorObject.$basename).to.equal(node.$parent.$nextSibling.$basename);
      expect(node.isCursor()).to.be.false;
      expect(node.$parent.$nextSibling.isCursor()).to.be.true;
    });
    it('can move up to previous sibling', () => {
      const oldCursor = node.$cursorObject;
      // Switch to the next node
      node = node.$nextSibling;

      top.cursorTo(node);
      top.cursorUp(new Event('keydown'));
      expect(node.$cursorObject.$basename).to.equal(oldCursor.$basename);
      expect(node.isCursor()).to.be.false;
      expect(oldCursor.isCursor()).to.be.true;
    });
    it("moves cursor up into previous sibling's last expanded descendant", () => {
      // Switch to node nested several levels into expanded parents
      node = node.$nextSibling.$childTail;
      node.$parent.$collapsed = false;
      node.demote();
      node.$parent.demote();
      top.cursorTo(top.$childTail);

      top.cursorUp();
      expect(top.$cursorObject.$basename).to.equal(node.$basename);
      expect(node.isCursor()).to.be.true;
      expect(top.$childTail.isCursor()).to.be.false;
    });
    it('cannot be moved up above first sibling', () => {
      top.cursorUp();
      expect(node.$cursorObject.$basename).to.equal(node.$basename);
      expect(node.isCursor()).to.be.true;
    });
    it('can move to previous parent from first child', () => {
      // Switch to first child node
      node = node.$nextSibling.$childHead;
      top.cursorTo(node);
      top.cursorUp();
      expect(node.$cursorObject.$basename).to.equal(node.$parent.$basename);
      expect(node.isCursor()).to.be.false;
      expect(node.$parent.isCursor()).to.be.true;
    });

    it('can be moved right to the first child', () => {
      // Create a child
      node = node.$nextSibling;
      top.cursorTo(node);
      const oldCursor = node.$cursorObject;

      node = node.$childHead;

      top.cursorRight(new Event('keydown'));
      expect(node.$cursorObject.$basename).to.equal(node.$basename);
      expect(node.isCursor()).to.be.true;
      expect(oldCursor.isCursor()).to.be.false;
    });
    it('cannot be moved right without children', () => {
      top.cursorRight();
      expect(node.$cursorObject.$basename).to.equal(node.$basename);
      expect(node.isCursor()).to.be.true;
    });
    it('can expand and move into collapsed first child', () => {
      // Switch to the next node
      node = node.$nextSibling;
      top.cursorTo(node);
      expect(node.$collapsed).to.be.true;

      top.cursorRight();
      expect(node.$cursorObject.$basename).to.equal(node.$childHead.$basename);
      expect(node.isCursor()).to.be.false;
      expect(node.$childHead.isCursor()).to.be.true;
      expect(node.$collapsed).to.be.false;
    });
    it('can be moved up to previous sibling', () => {
      // Create a child
      node = node.$nextSibling;

      top.cursorTo(node);
      const oldCursor = node.$cursorObject;

      node = node.$childHead;
      top.cursorTo(node);

      top.cursorLeft(new Event('keydown'));
      expect(node.$cursorObject.$basename).to.equal(oldCursor.$basename);
      expect(node.isCursor()).to.be.false;
      expect(oldCursor.isCursor()).to.be.true;
    });
    it('cannot be moved up above first sibling', () => {
      top.cursorLeft();
      expect(node.$cursorObject.$basename).to.equal(node.$basename);
      expect(node.isCursor()).to.be.true;
    });
  });

  describe('properties cursor:', () => {
    beforeEach(() => {
      node.$propertiesCollapsed = false;
      node['Bah-Property'] = 'Bah Property';
    });

    it('is not initially at a property', () => {
      expect(node.$cursorIndex).to.be.undefined;
    });
    it('can move right into expanded properties', () => {
      top.cursorTo(node);
      top.cursorRight();

      expect(node.$cursorObject[node.$cursorObject.$properties()[node.$cursorIndex]]).to.equal(
        'Bah Property',
      );
      expect(node.isCursor(node, 0)).to.be.true;
    });
    it('can move down into expanded properties', () => {
      top.cursorTo(node);
      top.cursorDown();

      expect(node.$cursorObject[node.$cursorObject.$properties()[node.$cursorIndex]]).to.equal(
        'Bah Property',
      );
      expect(node.isCursor(node, 0)).to.be.true;
    });
    it('can move left out of properties', () => {
      top.cursorTo(node, 1);

      top.cursorLeft();

      expect(node.$cursorObject.$basename).to.equal('bar');
      expect(node.isCursor()).to.be.true;
      expect(node.$cursorIndex).to.be.undefined;
    });
    it('can move down within properties', () => {
      top.cursorTo(node, 0);

      top.cursorDown();

      expect(node.isCursor(node, 1)).to.be.true;
      expect(node.$cursorObject[node.$cursorObject.$properties()[node.$cursorIndex]]).to.equal(
        'Bar Property',
      );
    });
    it('can move up within properties', () => {
      top.cursorTo(node, 1);

      top.cursorUp();

      expect(node.$cursorObject[node.$cursorObject.$properties()[node.$cursorIndex]]).to.equal(
        'Bah Property',
      );
      expect(node.isCursor(node, 0)).to.be.true;
      expect(node.$cursorObject[1]).to.be.undefined;
    });
    it('can move down to next node past last property', () => {
      node.$collapsed = false;
      top.cursorTo(node, 1);

      top.cursorDown();

      expect(node.$childHead.isCursor()).to.be.true;
      expect(node.$cursorIndex).to.be.undefined;

      node.$childHead.$propertiesCollapsed = false;
      top.cursorTo(node.$childHead, 0);

      top.cursorDown();

      expect(node.$childHead.$nextSibling.isCursor()).to.be.true;
      expect(node.$cursorIndex).to.be.undefined;
    });
    it('can move up to node past first property', () => {
      node.$collapsed = false;
      node.$propertiesCollapsed = false;
      top.cursorTo(node, 0);

      top.cursorUp();

      expect(node.isCursor()).to.be.true;
      expect(node.$cursorIndex).to.be.undefined;

      node.$childHead.$propertiesCollapsed = false;
      top.cursorTo(node.$childHead, 0);

      top.cursorUp();

      expect(node.$childHead.isCursor()).to.be.true;
      expect(node.$cursorIndex).to.be.undefined;
    });
    it('can move up into expanded property', () => {
      node.$collapsed = false;
      node.$propertiesCollapsed = false;
      top.cursorTo(node.$childHead);

      top.cursorUp();

      expect(node.isCursor(node, 1)).to.be.true;
      expect(node.$childHead.isCursor()).to.be.false;
      expect(node.$cursorObject.$properties()).to.deep.equal(node.$properties());
    });
    it('can not move right within properties', () => {
      top.cursorTo(node, 0);

      top.cursorRight();

      expect(node.$cursorObject[node.$cursorObject.$properties()[node.$cursorIndex]]).to.equal(
        'Bah Property',
      );
      expect(node.isCursor(node, 0)).to.be.true;
      expect(node.$cursorIndex).to.equal(0);
    });
    it('can not move right into collapsed properties', () => {
      node.$propertiesCollapsed = true;
      top.cursorTo(node);

      top.cursorRight();

      expect(node.$cursorObject.$basename).to.equal(node.$childHead.$basename);
      expect(node.$childHead.isCursor()).to.be.true;
      expect(node.$cursorIndex).to.be.undefined;
      expect(node.isCursor()).to.be.false;
    });
    it('can not move down into collapsed properties', () => {
      node.$propertiesCollapsed = true;
      top.cursorTo(node);

      top.cursorDown();

      expect(node.$cursorObject.$basename).to.equal(node.$nextSibling.$basename);
      expect(node.$nextSibling.isCursor()).to.be.true;
      expect(node.$cursorIndex).to.be.undefined;
      expect(node.isCursor()).to.be.false;
    });
  });

  describe('collapse/expand:', () => {
    it('nodes are initially collapsed', () => {
      expect(node.$collapsed).to.be.true;
    });
    it('can toggle nodes with children', () => {
      top.cursorTo(node);
      node.toggle(new Event('keydown'));
      expect(node.$collapsed).to.be.false;
      node.toggle();
      expect(node.$collapsed).to.be.true;
    });
    it('cannot toggle nodes without children', () => {
      node = node.$prevSibling;
      top.cursorTo(node);
      node.toggle();
      expect(node.$collapsed).to.be.true;
    });
    it('properties are initially collapsed', () => {
      expect(node.$propertiesCollapsed).to.be.true;
    });
    it('can toggle nodes with properties', () => {
      top.cursorTo(node);
      node.toggleProperties(new Event('keydown'));
      expect(node.$propertiesCollapsed).to.be.false;
      top.cursorRight();
      node.toggleProperties();
      expect(node.$propertiesCollapsed).to.be.true;
    });
  });
});
