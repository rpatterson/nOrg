// Globals
var describe = describe;
var beforeEach = beforeEach;
var afterEach = afterEach;
var it = it;
var expect = expect;

var nOrg = nOrg;
describe('nOrg', function() {
  var node;
  var json;

  beforeEach(function () {
    json = {
      "$children": [
        {"$basename": "foo",
         "Subject": "Foo Subject",
         "Message-ID": "<1@foo.com>"},
        {"$basename": "bar",
         "Subject": "Bar Subject",
         "Message-ID": "<2@foo.com>",
         "Bar-Property": "Bar Property",
         "Node-State": "TODO",
         "$children": [
           {"$basename": "corge",
            "Subject": "Corge Node",
            "Message-ID": "<3@foo.com>",
            "Corge-Property": "Corge Property"},
           {"$basename": "grault",
            "Subject": "Grault Node",
            "Message-ID": "<4@foo.com>"},
           {"$basename": "garply",
            "Subject": "Garply Node",
            "Message-ID": "<5@foo.com>"}]},
        {"$basename": "qux",
         "Subject": "Qux Subject",
         "Message-ID": "<6@foo.com>"}
      ]};
    nOrg.root = nOrg.newRoot(json);
    node = nOrg.root.$childHead.$nextSibling;
  });

  afterEach(function () {
    if (nOrg.root.$cursorObject) {
      nOrg.root.$cursorObject.cursor = undefined;
    }
    nOrg.root.$cursorObject = undefined;
  });

  it('exports module contents', function () {
    expect(nOrg.Node).toBeTruthy();
    expect(Boolean(nOrg.root)).toBeTruthy();
  });

  describe('node properties:', function () {
    it('child nodes have properties', function () {
      expect(node.hasOwnProperty("Subject")).toBeTruthy();
    });
    it('sorts properties by key', function () {
      // added after bar but sorts before
      node['Bah-Property'] = 'Bah Property';
      expect(node.$properties()).toEqual(
        ['Bah-Property', 'Bar-Property']);
    });
    it('generates valid, CSS select-able ids for nodes', function () {
      expect((/[<@\.>]/).test(node.toId())).toBeFalsy();
    });
    it('adds a property', function () {
      expect(node.isCursor()).toBeFalsy();
      expect(node.isCursor(node, 0)).toBeFalsy();

      node.$newProperty('Baz-Property');

      expect(node.$properties()[1]).toBe('Baz-Property');
      expect(node.$propertiesCollapsed).toBeFalsy();
      expect(nOrg.root.isCursor(node, 1)).toBeTruthy();
    });
  });

  describe('node inheritance:', function () {
    it('has a parent', function () {
      expect(Boolean(node)).toBeTruthy();
      expect(node.$parent).toBe(nOrg.root);
    });
    it('inherits properties from parent', function () {
      var child = node.newChild();
      expect(child.$basename).toBeUndefined();
      expect(child['Bar-Property'])
        .toBe(json.$children[1]['Bar-Property']);
    });
    it('child may override parent attrs and properties', function () {
      var child = node.newChild();
      child.$basename = 'baz';
      child['Subject'] = 'Baz Subject';

      expect(child.$basename).toBe('baz');
      expect(child['Subject']).toBe('Baz Subject');
    });
    it('can inherit root node', function () {
      expect(node.hasOwnProperty("$root")).toBeFalsy();
      expect(node.$root.hasOwnProperty("$root")).toBeTruthy();
    });
  });

  describe('node children:', function () {
    it('nodes may have children', function () {
      expect(nOrg.root.$childHead.$nextSibling.$basename).toBe(node.$basename);
      expect(nOrg.root.$childTail.$prevSibling.$basename).toBe(node.$basename);
      expect(nOrg.root.$length).toBe(3);
      expect(Boolean(nOrg.root.$nextSibling)).toBeFalsy();
      expect(Boolean(nOrg.root.$prevSibling)).toBeFalsy();
      expect(node.$childHead.$length).toBe(0);
      expect(node.$length).toBe(3);
      expect(Boolean(node.$nextSibling.$nextSibling)).toBeFalsy();
      expect(Boolean(node.$prevSibling.$childHead)).toBeFalsy();
      expect(Boolean(node.$prevSibling.$childTail)).toBeFalsy();
      expect(Boolean(node.$prevSibling.$prevSibling)).toBeFalsy();
    });
    it('accepts a node to append as a child', function () {
      var child = new nOrg.Node();
      child.$basename = 'baz';
      node.pushChild(child);

      expect(node.$childTail.$basename).toBe(child.$basename);
      expect(child.$prevSibling.$basename)
        .toBe(node.$childHead.$nextSibling.$nextSibling.$basename);
      expect(Boolean(child.$nextSibling)).toBeFalsy();
      expect(node.$length).toBe(4);

      node = node.$prevSibling;
      var only = new nOrg.Node();
      only.$basename = 'baz';
      node.pushChild(only);

      expect(node.$childTail.$basename).toBe(only.$basename);
      expect(node.$childHead.$basename).toBe(only.$basename);
      expect(Boolean(only.$nextSibling)).toBeFalsy();
      expect(Boolean(only.$prevSibling)).toBeFalsy();
      expect(node.$length).toBe(1);
    });
    it('removes itself from its parent', function () {
      var child = node.$childHead.$nextSibling;
      child.popFromParent();
      
      expect(Boolean(child.parent)).toBeFalsy();
      expect(Boolean(child.$prevSibling)).toBeFalsy();
      expect(Boolean(child.$nextSibling)).toBeFalsy();

      expect(node.$length).toBe(2);
      expect(node.children().length).toBe(2);
      expect(node.$childTail.$prevSibling.$basename).toBe(node.$childHead.$basename);
      expect(node.$childHead.$nextSibling.$basename).toBe(node.$childTail.$basename);

      var first = node.$childHead;
      first.popFromParent();

      expect(node.$length).toBe(1);
      expect(node.children().length).toBe(1);
      expect(node.$childTail.$basename).toBe(node.$childHead.$basename);
      expect(Boolean(node.$childHead.$prevSibling)).toBeFalsy();
      expect(Boolean(node.$childHead.$nextSibling)).toBeFalsy();

      var only = node.$childTail;
      only.popFromParent();
      
      expect(Boolean(only.parent)).toBeFalsy();
      expect(Boolean(only.$prevSibling)).toBeFalsy();
      expect(Boolean(only.$nextSibling)).toBeFalsy();

      expect(node.$length).toBe(0);
      expect(node.children().length).toBe(0);
      expect(Boolean(node.$childHead)).toBeFalsy();
      expect(Boolean(node.$childTail)).toBeFalsy();
    });
    it('assembles children into an array', function () {
      var children = node.children();
      expect(children.length).toBe(3);
      expect(children[0].$basename).toBe(node.$childHead.$basename);
    });
  });

  describe('node state:', function () {
    it("doesn't inherit node state", function () {
      // node without state
      node = nOrg.root.$childHead.$nextSibling; // node with state and children
      expect(node.$childHead["Node-State"]).toBeUndefined();
    });
    it("has default states", function () {
      expect(node["Node-State"]).toBe('TODO');
      expect(node.$nextStates()).toEqual(['DONE', 'CANCELED']);
    });
  });

  describe('nodes from objects:', function () {
    it('nodes may be created from objects', function () {
      var object = {"$basename": "bar",
                    "Subject": "Bar Subject"};
      var child = node.newChild(object);

      expect(child.$basename).toBe(object.$basename);
      expect(child['Subject']).toBe(object['Subject']);

      object.$basename = 'qux';
      object['Subject'] = "Qux Subject";
      child = node.newChild(object);
      expect(child.$basename).toBe(object.$basename);
      expect(child['Subject']).toBe(object['Subject']);
    });
    it('object children are converted to nodes', function () {
      var object = {"$basename": "bar",
                    "Subject": "Bar Subject",
                    "Bar-Property": "Bar Property",
                    "$children": [
                      {"Subject": "Corge Subject"},
                      {"$basename": "grault"},
                      {"$basename": "garply",
                       "Subject": "Garply Subject"}]};
      var child = node.$childTail.newChild(object);

      expect(child.$childHead["Bar-Property"]).toBe("Bar Property");
      expect(child.$childHead["Subject"]).toBe("Corge Subject");

      expect(child.$childHead.$nextSibling.$basename).toBe('grault');
      expect(child.$childHead.$nextSibling["Bar-Property"]).toBe(
        "Bar Property");

      expect(child.$childTail.$basename).toBe('garply');
      expect(child.$childTail["Subject"]).toBe("Garply Subject");
    });
  });

  describe('moving nodes:', function () {
    it('demotes a node with previous siblings', function () {
      var parent = nOrg.root.$childHead;
      node.demote();

      expect(parent.$childHead.$basename).toBe(node.$basename);
      expect(node.$parent.$basename).toBe(parent.$basename);
      expect(parent.$parent.$childHead.$basename).toBe(parent.$basename);
      expect(parent.$parent.$childTail.$basename).
        toBe(parent.$nextSibling.$basename);

      expect(Boolean(node.$nextSibling)).toBeFalsy();
      expect(Boolean(node.$prevSibling)).toBeFalsy();

      expect(parent.$parent.$length).toBe(2);
      expect(parent.$length).toBe(1);

      expect(parent.children().indexOf(node)).toBe(0);
      expect(parent.$parent.children().length).toBe(2);
      expect(parent.children().length).toBe(1);
    });
    it('demotes a last node with previous siblings', function () {
      var parent = nOrg.root.$childHead.$nextSibling.$childHead.$nextSibling;
      node = nOrg.root.$childHead.$nextSibling.$childTail;
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
    it('demotes node into a node with children', function () {
      var parent = node;
      node = nOrg.root.$childTail;
      node.demote();

      expect(parent.$childTail.$basename).toBe(node.$basename);
      expect(node.$parent.$basename).toBe(parent.$basename);
      expect(parent.$parent.$childTail.$basename).toBe(parent.$basename);

      expect(Boolean(node.$nextSibling)).toBeFalsy();
      expect(node.$prevSibling.$basename)
        .toBe(parent.$childHead.$nextSibling.$nextSibling.$basename);
      expect(parent.$childHead.$nextSibling.$nextSibling.$nextSibling.$basename)
        .toBe(node.$basename);

      expect(parent.$parent.$length).toBe(2);
      expect(parent.$length).toBe(4);

      expect(parent.children().indexOf(node)).toBe(3);
      expect(parent.$parent.children().length).toBe(2);
      expect(parent.children().length).toBe(4);
    });
    it('first nodes may not be demoted', function () {
      // Switch to a scope with no previous siblings
      node = node.$childHead;

      expect(function () {
        node.demote();
      }).toThrow(new Error("Cannot demote first sibling!"));
    });
    it('expands new parent when demoted', function () {
      expect(node.$prevSibling.$collapsed).toBeTruthy();
      node.demote();
      expect(node.$parent.$collapsed).toBeFalsy();
    });

    it('promotes a node with to the middle', function() {
      // Switch to a scope beneath the previous
      var parent = nOrg.root;
      var prevSibling = node;
      var nextSibling = prevSibling.$nextSibling;
      node = node.$childHead.$nextSibling;
      node.promote();

      expect(node.$parent.$basename).toBe(parent.$basename);

      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);
      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).toBe(node.$basename);

      expect(prevSibling.$childHead.$nextSibling.$basename)
        .toBe(prevSibling.$childTail.$basename);
      expect(prevSibling.$childTail.$prevSibling.$basename)
        .toBe(prevSibling.$childHead.$basename);

      expect(Boolean(node.$childHead)).toBeFalsy();
      expect(Boolean(node.$childTail)).toBeFalsy();

      expect(parent.$length).toBe(4);
      expect(prevSibling.$length).toBe(2);

      expect(parent.children().indexOf(node)).toBe(2);
      expect(parent.children().length).toBe(4);
      expect(prevSibling.children().length).toBe(2);
    });
    it('promotes a first child to the middle', function () {
      // Switch to a first child
      var parent = node.$parent;
      var prevSibling = node;
      var nextSibling = prevSibling.$nextSibling;
      node = node.$childHead;
      node.promote();

      expect(node.$parent.$basename).toBe(parent.$basename);

      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);
      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).toBe(node.$basename);

      expect(prevSibling.$childHead.$nextSibling.$basename)
        .toBe(prevSibling.$childTail.$basename);
      expect(prevSibling.$childTail.$prevSibling.$basename)
        .toBe(prevSibling.$childHead.$basename);

      expect(Boolean(node.$childHead)).toBeFalsy();
      expect(Boolean(node.$childTail)).toBeFalsy();

      expect(parent.$length).toBe(4);
      expect(prevSibling.$length).toBe(2);

      expect(parent.children().indexOf(node)).toBe(2);
      expect(parent.children().length).toBe(4);
      expect(prevSibling.children().length).toBe(2);
    });
    it('promotes a last child to middle', function () {
      // Switch to a first child
      var parent = node.$parent;
      var prevSibling = node;
      var nextSibling = prevSibling.$nextSibling;
      node = node.$childTail;
      node.promote();

      expect(node.$parent.$basename).toBe(parent.$basename);

      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);
      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).toBe(node.$basename);

      expect(prevSibling.$childHead.$nextSibling.$basename)
        .toBe(prevSibling.$childTail.$basename);
      expect(prevSibling.$childTail.$prevSibling.$basename)
        .toBe(prevSibling.$childHead.$basename);

      expect(Boolean(node.$childHead)).toBeFalsy();
      expect(Boolean(node.$childTail)).toBeFalsy();

      expect(parent.$length).toBe(4);
      expect(prevSibling.$length).toBe(2);

      expect(parent.children().indexOf(node)).toBe(2);
      expect(parent.children().length).toBe(4);
      expect(prevSibling.children().length).toBe(2);
    });
    it('promotes a child to the end', function () {
      node.moveDown();
      var prevSibling = node;
      var parent = node.$parent;
      node = node.$childHead.$nextSibling;
      node.promote();

      expect(node.$parent.$basename).toBe(parent.$basename);
      expect(parent.$childTail.$basename).toBe(node.$basename);

      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);
      expect(Boolean(node.$nextSibling)).toBeFalsy();

      expect(prevSibling.$childHead.$nextSibling.$basename)
        .toBe(prevSibling.$childTail.$basename);
      expect(prevSibling.$childTail.$prevSibling.$basename)
        .toBe(prevSibling.$childHead.$basename);

      expect(Boolean(node.$childHead)).toBeFalsy();
      expect(Boolean(node.$childTail)).toBeFalsy();

      expect(parent.$length).toBe(4);
      expect(prevSibling.$length).toBe(2);

      expect(parent.children().indexOf(node)).toBe(3);
      expect(parent.children().length).toBe(4);
      expect(prevSibling.children().length).toBe(2);
    });
    it('does not promote a node without parents', function () {
      expect(function () {
        node.promote();
      }).toThrow(new Error("Cannot promote nodes without parents!"));
    });

    it('moves up a middle node to first node', function () {
      var nextSibling = node.$prevSibling;
      node.moveUp();

      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(Boolean(node.$prevSibling)).toBeFalsy();

      expect(node.$parent.$childHead.$basename).toBe(node.$basename);

      expect(nextSibling.$prevSibling.$basename).toBe(node.$basename);
      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(Boolean(node.$prevSibling)).toBeFalsy();

      expect(nOrg.root.$childHead.$basename).toBe(node.$basename);
      expect(nOrg.root.$childTail.$prevSibling.$basename)
        .toBe(nOrg.root.$childHead.$nextSibling.$basename);

      expect(node.$parent.children().indexOf(node)).toBe(0);
    });
    it('moves up a last node to the middle', function () {
      var prevSibling = node.$childHead;
      node = node.$childTail;
      var nextSibling = node.$prevSibling;
      node.moveUp();
      
      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).toBe(node.$basename);
      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);

      expect(node.$parent.$childTail.$basename).toBe(nextSibling.$basename);

      expect(node.$parent.children().indexOf(node)).toBe(1);
    });
    it('does not move up a first node', function() {
      // Switch to a scope with no previous siblings
      node = node.$childHead;

      expect(function () {
        node.moveUp();
      }).toThrow(new Error("Cannot move first nodes up!"));
    });

    it('moves down a middle node to last sibling', function () {
      var prevSibling = node.$nextSibling;
      node.moveDown();
      
      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);
      expect(Boolean(node.$nextSibling)).toBeFalsy();

      expect(node.$parent.$childTail.$basename).toBe(node.$basename);

      expect(node.$parent.children().indexOf(node)).toBe(2);
    });
    it('moves down a first node to middle', function () {
      node = node.$childHead;
      var prevSibling = node.$nextSibling;
      var nextSibling = prevSibling.$nextSibling;
      node.moveDown();
      
      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);
      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).toBe(node.$basename);

      expect(node.$parent.$childHead.$basename).toBe(prevSibling.$basename);

      expect(node.$parent.children().indexOf(node)).toBe(1);
    });
    it('last nodes may not be moved down', function() {
      // Switch to a scope with no next siblings
      node = node.$childTail;

      expect(function () {
        node.moveDown();
      }).toThrow(new Error("Cannot move last nodes down!"));
    });

    it('moves around and back', function () {
      var parent = node.$parent;
      var prevSibling = node.$prevSibling;
      var nextSibling = node.$nextSibling;

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

  describe('adding nodes:', function () {
    it('adds a sibling to the middle', function () {
      var nextSibling = node.$nextSibling;
      var prevSibling = node;
      node = prevSibling.newSibling(
        {$basename: "baz"}, new KeyboardEvent("keydown"));

      expect(node.$parent.$basename).toBe(prevSibling.$parent.$basename);

      expect(node.$nextSibling.$basename).toBe(nextSibling.$basename);
      expect(nextSibling.$prevSibling.$basename).toBe(node.$basename);

      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);

      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
      expect(prevSibling.$parent.$childHead.isCursor()).toBeFalsy();
    });
    it('adds a sibling to the end', function () {
      var prevSibling = node.$parent.$childTail;
      node = prevSibling.newSibling(
        {$basename: "baz"}, new KeyboardEvent("keydown"));

      expect(node.$parent.$basename).toBe(prevSibling.$parent.$basename);

      expect(Boolean(node.$nextSibling)).toBeFalsy();

      expect(node.$prevSibling.$basename).toBe(prevSibling.$basename);
      expect(prevSibling.$nextSibling.$basename).toBe(node.$basename);

      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
      expect(prevSibling.$parent.$childHead.isCursor()).toBeFalsy();
    });
    it('does not inherit certain properties when adding a node', function () {
      expect(node.$childHead['Node-State']).toBeUndefined();

      var sibling = node.$childHead.newSibling();
      expect(sibling.$basename).toBeUndefined();
      expect(sibling['Subject']).toBeUndefined();
      expect(sibling['Message-ID']).toBeDefined();
      expect(sibling['Message-ID']).toMatch(/<[^@]+@[^@]+>/);
      expect(sibling['Node-State']).toBeUndefined();

      var child = node.newChild();
      expect(child.$basename).toBeUndefined();
      expect(child['Subject']).toBeUndefined();
      expect(child['Message-ID']).toBeDefined();
      expect(child['Message-ID']).toMatch(/<[^@]+@[^@]+>/);
      expect(child['Node-State']).toBeUndefined();
    });
  });

  describe('cursor:', function () {
    beforeEach(function() {
      // Switch to the first node
      node = node.$parent.$childHead;
    });

    it('is initially at the first node', function() {
      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();

      // Switch to the next node
      node = node.$nextSibling;

      expect(node.$cursorObject).not.toBe(node);
      expect(node.isCursor()).toBeFalsy();
    });
    it('may be changed to any other node', function() {
      var old_cursor = node.$cursorObject;
      // Switch to the next node
      node = node.$nextSibling;

      nOrg.root.cursorTo(node);
      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
      expect(old_cursor.isCursor()).toBeFalsy();
    });
    it('can be moved down to next sibling', function() {
      var old_cursor = node.$cursorObject;
      // Switch to the next node
      node = node.$nextSibling;

      nOrg.root.cursorDown();
      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
      expect(old_cursor.isCursor()).toBeFalsy();
    });
    it('cannot be moved down beyond last sibling', function() {
      // Switch to the last node
      node = node.$parent.$childTail;

      nOrg.root.cursorTo(node);
      nOrg.root.cursorDown();
      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
    });
    it('can move down to next expanded child', function() {
      // Switch to node with children
      node = node.$nextSibling;
      nOrg.root.cursorTo(node);
      expect(node.$cursorObject.$collapsed).toBeTruthy();
      node.$cursorObject.$collapsed = false;

      nOrg.root.cursorDown();
      expect(node.$cursorObject.$basename).toBe(node.$childHead.$basename);
      expect(node.isCursor()).toBeFalsy();
      expect(node.$childHead.isCursor()).toBeTruthy();
    });
    it('can move down to next parent from last child', function() {
      // Switch to last child node
      node = node.$nextSibling.$childTail;
      nOrg.root.cursorTo(node);
      nOrg.root.cursorDown();
      expect(node.$cursorObject.$basename).toBe(node.$parent.$nextSibling.$basename);
      expect(node.isCursor()).toBeFalsy();
      expect(node.$parent.$nextSibling.isCursor()).toBeTruthy();
    });
    it('can move up to previous sibling', function() {
      var old_cursor = node.$cursorObject;
      // Switch to the next node
      node = node.$nextSibling;

      nOrg.root.cursorTo(node);
      nOrg.root.cursorUp();
      expect(node.$cursorObject.$basename).toBe(old_cursor.$basename);
      expect(node.isCursor()).toBeFalsy();
      expect(old_cursor.isCursor()).toBeTruthy();
    });
    it("moves cursor up into previous sibling's last expanded descendant",
       function() {
         // Switch to node nested several levels into expanded parents
         node = node.$nextSibling.$childTail;
         node.$parent.$collapsed = false;
         node.demote();
         node.$parent.demote();
         nOrg.root.cursorTo(nOrg.root.$childTail);

         nOrg.root.cursorUp();
         expect(nOrg.root.$cursorObject.$basename).toBe(node.$basename);
         expect(node.isCursor()).toBeTruthy();
         expect(nOrg.root.$childTail.isCursor()).toBeFalsy();
       });
    it('cannot be moved up above first sibling', function() {
      nOrg.root.cursorUp();
      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
    });
    it('can move to previous parent from first child',
       function() {
         // Switch to first child node
         node = node.$nextSibling.$childHead;
         nOrg.root.cursorTo(node);
         nOrg.root.cursorUp();
         expect(node.$cursorObject.$basename).toBe(node.$parent.$basename);
         expect(node.isCursor()).toBeFalsy();
         expect(node.$parent.isCursor()).toBeTruthy();
       });

    it('can be moved right to the first child', function() {
      var old_cursor;
      // Create a child
      node = node.$nextSibling;
      nOrg.root.cursorTo(node);
      old_cursor = node.$cursorObject;

      node = node.$childHead;

      nOrg.root.cursorRight();
      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
      expect(old_cursor.isCursor()).toBeFalsy();
    });
    it('cannot be moved right without children', function() {
      nOrg.root.cursorRight();
      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
    });
    it('can expand and move into collapsed first child',
       function() {
         // Switch to the next node
         node = node.$nextSibling;
         nOrg.root.cursorTo(node);
         expect(node.$collapsed).toBeTruthy();

         nOrg.root.cursorRight();
         expect(node.$cursorObject.$basename).toBe(node.$childHead.$basename);
         expect(node.isCursor()).toBeFalsy();
         expect(node.$childHead.isCursor()).toBeTruthy();
         expect(node.$collapsed).toBeFalsy();
       });
    it('can be moved up to previous sibling', function() {
      var old_cursor;
      // Create a child
      node = node.$nextSibling;

      nOrg.root.cursorTo(node);
      old_cursor = node.$cursorObject;

      node = node.$childHead;
      nOrg.root.cursorTo(node);

      nOrg.root.cursorLeft();
      expect(node.$cursorObject.$basename).toBe(old_cursor.$basename);
      expect(node.isCursor()).toBeFalsy();
      expect(old_cursor.isCursor()).toBeTruthy();
    });
    it('cannot be moved up above first sibling', function() {
      nOrg.root.cursorLeft();
      expect(node.$cursorObject.$basename).toBe(node.$basename);
      expect(node.isCursor()).toBeTruthy();
    });
  });

  describe("properties cursor:", function () {
    beforeEach(function() {
      node.$propertiesCollapsed = false;
      node['Bah-Property'] = 'Bah Property';
    });

    it('is not initially at a property', function () {
      expect(node.$cursorIndex).toBeUndefined();
    });
    it('can move right into expanded properties', function () {
      nOrg.root.cursorTo(node);
      nOrg.root.cursorRight();

      expect(node.$cursorObject[node.$cursorObject.$properties()[
        node.$cursorIndex]]).toBe("Bah Property");
      expect(node.isCursor(node, 0)).toBeTruthy();
    });
    it('can move down into expanded properties', function () {
      nOrg.root.cursorTo(node);
      nOrg.root.cursorDown();

      expect(node.$cursorObject[node.$cursorObject.$properties()[
        node.$cursorIndex]]).toBe("Bah Property");
      expect(node.isCursor(node, 0)).toBeTruthy();
    });
    it('can move left out of properties', function () {
      nOrg.root.cursorTo(node, 1);

      nOrg.root.cursorLeft();

      expect(node.$cursorObject.$basename).toBe("bar");
      expect(node.isCursor()).toBeTruthy();
      expect(node.$cursorIndex).toBeUndefined();
    });
    it('can move down within properties', function () {
      nOrg.root.cursorTo(node, 0);

      nOrg.root.cursorDown();

      expect(node.isCursor(node, 1)).toBeTruthy();
      expect(node.$cursorObject[node.$cursorObject.$properties()[
        node.$cursorIndex]]).toBe("Bar Property");
    });
    it('can move up within properties', function () {
      nOrg.root.cursorTo(node, 1);

      nOrg.root.cursorUp();

      expect(node.$cursorObject[node.$cursorObject.$properties()[
        node.$cursorIndex]]).toBe("Bah Property");
      expect(node.isCursor(node, 0)).toBeTruthy();
      expect(node.$cursorObject[1]).toBeUndefined();
    });
    it('can move down to next node past last property', function () {
      node.$collapsed = false;
      nOrg.root.cursorTo(node, 1);

      nOrg.root.cursorDown();

      expect(node.$childHead.isCursor()).toBeTruthy();
      expect(node.$cursorIndex).toBeUndefined();

      node.$childHead.$propertiesCollapsed = false;
      nOrg.root.cursorTo(node.$childHead, 0);

      nOrg.root.cursorDown();

      expect(node.$childHead.$nextSibling.isCursor()).toBeTruthy();
      expect(node.$cursorIndex).toBeUndefined();
    });
    it('can move up to node past first property', function () {
      node.$collapsed = false;
      node.$propertiesCollapsed = false;
      nOrg.root.cursorTo(node, 0);

      nOrg.root.cursorUp();

      expect(node.isCursor()).toBeTruthy();
      expect(node.$cursorIndex).toBeUndefined();

      node.$childHead.$propertiesCollapsed = false;
      nOrg.root.cursorTo(node.$childHead, 0);

      nOrg.root.cursorUp();

      expect(node.$childHead.isCursor()).toBeTruthy();
      expect(node.$cursorIndex).toBeUndefined();
    });
    it('can move up into expanded property', function () {
      node.$collapsed = false;
      node.$propertiesCollapsed = false;
      nOrg.root.cursorTo(node.$childHead);

      nOrg.root.cursorUp();

      expect(node.isCursor(node, 1)).toBeTruthy();
      expect(node.$childHead.isCursor()).toBeFalsy();
      expect(node.$cursorObject.$properties())
        .toEqual(node.$properties());
    });
    it('can not move right within properties', function () {
      nOrg.root.cursorTo(node, 0);

      nOrg.root.cursorRight();

      expect(node.$cursorObject[node.$cursorObject.$properties()[
        node.$cursorIndex]]).toBe("Bah Property");
      expect(node.isCursor(node, 0)).toBeTruthy();
      expect(node.$cursorIndex).toBeDefined();
    });
    it('can not move right into collapsed properties', function () {
      node.$propertiesCollapsed = true;
      nOrg.root.cursorTo(node);

      nOrg.root.cursorRight();
      
      expect(node.$cursorObject.$basename).toBe(node.$childHead.$basename);
      expect(node.$childHead.isCursor()).toBeTruthy();
      expect(node.$cursorIndex).toBeUndefined();
      expect(node.isCursor()).toBeFalsy();
    });
    it('can not move down into collapsed properties', function () {
      node.$propertiesCollapsed = true;
      nOrg.root.cursorTo(node);

      nOrg.root.cursorDown();
      
      expect(node.$cursorObject.$basename).toBe(node.$nextSibling.$basename);
      expect(node.$nextSibling.isCursor()).toBeTruthy();
      expect(node.$cursorIndex).toBeUndefined();
      expect(node.isCursor()).toBeFalsy();
    });
  });

  describe('collapse/expand:', function () {
    it('nodes are initially collapsed', function() {
      expect(node.$collapsed).toBeTruthy();
    });
    it('can toggle nodes with children', function() {
      nOrg.root.cursorTo(node);
      node.toggle();
      expect(node.$collapsed).toBeFalsy();
      node.toggle();
      expect(node.$collapsed).toBeTruthy();
    });
    it('cannot toggle nodes without children', function() {
      node = node.$prevSibling;
      nOrg.root.cursorTo(node);
      node.toggle();
      expect(node.$collapsed).toBeTruthy();
    });
    it('properties are initially collapsed', function() {
      expect(node.$propertiesCollapsed).toBeTruthy();
    });
    it('can toggle nodes with properties', function() {
      nOrg.root.cursorTo(node);
      node.toggleProperties();
      expect(node.$propertiesCollapsed).toBeFalsy();
      node.toggleProperties();
      expect(node.$propertiesCollapsed).toBeTruthy();
    });
  });
});

/**
 ## The Runner and Reporter

 Jasmine is built in JavaScript and must be included into a JS environment, such as a web page, in order to run. Like this web page.

 This file is written in JavaScript and is compiled into HTML via [Rocco][rocco]. The JavaScript file is then included, via a `<script>` tag, so that all of the above specs are evaluated and recorded with Jasmine. Thus Jasmine can run all of these specs. This page is then considered a 'runner.'

 Scroll down the page to see the results of the above specs. All of the specs should pass.

 Meanwhile, here is how a runner works to execute a Jasmine suite.

 [rocco]: http://rtomayko.github.com/rocco/
 */
var jasmine = jasmine;
(function() {
  if (! jasmine.HtmlReporter) {
    // Running under Karma
    return;
  }

  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 250;

  /**
   Create the `HTMLReporter`, which Jasmine calls to provide results of each spec and each suite. The Reporter is responsible for presenting results to the user.
   */
  var htmlReporter = new jasmine.HtmlReporter();
  jasmineEnv.addReporter(htmlReporter);

  /**
   Delegate filtering of specs to the reporter. Allows for clicking on single suites or specs in the results to only run a subset of the suite.
   */
  jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };

  /**
   Run all of the tests when the page finishes loading - and make sure to run any previous `onload` handler

   ### Test Results

   Scroll down to see the results of all of these specs.
   */
  var currentWindowOnload = window.onload;
  window.onload = function() {
    if (currentWindowOnload) {
      currentWindowOnload();
    }

    execJasmine();
  };

  function execJasmine() {
    jasmineEnv.execute();
  }
})();
