// Globals
var describe = describe;
var beforeEach = beforeEach;
var it = it;
var expect = expect;

var nOrg = nOrg;
describe('nOrg', function() {
  var node;
  var json;

  beforeEach(function () {
    json = {
      "children": [
        {"basename": "foo",
         "headers": {"Subject": "Foo Subject",
                     "Message-ID": "<1@foo.com>"}},
        {"basename": "bar",
         "headers": {"Subject": "Bar Subject",
                     "Message-ID": "<2@foo.com>",
                     "NOrg-User-Headers": ["Bar-Property"],
                     "Bar-Property": "Bar Property"},
         "children": [
           {"basename": "corge",
            "headers": {"Subject": "Corge Node",
                        "Message-ID": "<3@foo.com>",
                        "NOrg-User-Headers": ["Corge-Property"],
                        "Corge-Property": "Corge Property"}},
           {"basename": "grault",
            "headers": {"Subject": "Grault Node",
                        "Message-ID": "<4@foo.com>"}},
           {"basename": "garply",
            "headers": {"Subject": "Garply Node",
                        "Message-ID": "<5@foo.com>"}}]},
        {"basename": "qux",
         "headers": {"Subject": "Qux Subject",
                     "Message-ID": "<6@foo.com>"}}
      ]};
    nOrg.root = nOrg.newRoot(json);
    node = nOrg.root.$childHead.$nextSibling;
  });

  it('exports module contents', function () {
    expect(nOrg.Node).toBeTruthy();
    expect(Boolean(nOrg.root)).toBeTruthy();
  });

  describe('node headers:', function () {
    it('child nodes have headers', function () {
      expect(node.hasOwnProperty("headers")).toBeTruthy();
    });
    it('lists headers to include in UI', function () {
      expect(node.headers['NOrg-User-Headers'])
        .toEqual(json.children[1].headers['NOrg-User-Headers']);
    });
    it('generates valid, CSS select-able ids for nodes', function () {
      expect((/[<@\.>]/).test(node.toId())).toBeFalsy();
    });
  });

  describe('node inheritance:', function () {
    it('has a parent', function () {
      expect(Boolean(node)).toBeTruthy();
      expect(node.$parent).toBe(nOrg.root);
    });
    it('inherits attrs and headers from parent', function () {
      var child = node.newChild();
      expect(child.basename).toBe(json.children[1].basename);
      expect(child.headers['Subject'])
        .toBe(json.children[1].headers['Subject']);
    });
    it('child may override parent attrs and headers', function () {
      var child = node.newChild();
      child.basename = 'baz';
      child.headers['Subject'] = 'Baz Subject';

      expect(child.basename).toBe('baz');
      expect(child.headers['Subject']).toBe('Baz Subject');
    });
    it('can inherit root node', function () {
      expect(node.hasOwnProperty("$root")).toBeFalsy();
      expect(node.$root.hasOwnProperty("$root")).toBeTruthy();
    });
  });

  describe('node children:', function () {
    it('nodes may have children', function () {
      expect(nOrg.root.$childHead.$nextSibling.basename).toBe(node.basename);
      expect(nOrg.root.$childTail.$prevSibling.basename).toBe(node.basename);
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
      child.basename = 'baz';
      node.pushChild(child);

      expect(node.$childTail.basename).toBe(child.basename);
      expect(child.$prevSibling.basename)
        .toBe(node.$childHead.$nextSibling.$nextSibling.basename);
      expect(Boolean(child.$nextSibling)).toBeFalsy();
      expect(node.$length).toBe(4);

      node = node.$prevSibling;
      var only = new nOrg.Node();
      only.basename = 'baz';
      node.pushChild(only);

      expect(node.$childTail.basename).toBe(only.basename);
      expect(node.$childHead.basename).toBe(only.basename);
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
      expect(node.$childTail.$prevSibling.basename).toBe(node.$childHead.basename);
      expect(node.$childHead.$nextSibling.basename).toBe(node.$childTail.basename);

      var first = node.$childHead;
      first.popFromParent();

      expect(node.$length).toBe(1);
      expect(node.children().length).toBe(1);
      expect(node.$childTail.basename).toBe(node.$childHead.basename);
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
      expect(children[0].basename).toBe(node.$childHead.basename);
    });
  });

  describe('nodes from objects:', function () {
    it('nodes may be created from objects', function () {
      var object = {"basename": "bar",
                    "headers": {"Subject": "Bar Subject"}};
      var child = node.newChild();

      child.extend(object);
      expect(child.basename).toBe(object.basename);
      expect(child.headers['Subject']).toBe(object.headers['Subject']);

      object.basename = 'qux';
      object.headers['Subject'] = "Qux Subject";
      child = node.newChild(object);
      expect(child.basename).toBe(object.basename);
      expect(child.headers['Subject']).toBe(object.headers['Subject']);
    });
    it('object children are converted to nodes', function () {
      var object = {"basename": "bar",
                    "headers": {"Subject": "Bar Subject"},
                    "children": [
                      {"headers": {"Subject": "Corge Subject"}},
                      {"basename": "grault"},
                      {"basename": "garply",
                       "headers": {"Subject": "Garply Subject"}}]};
      var child = node.newChild(object);

      expect(child.$childHead.basename).toBe('bar');
      expect(child.$childHead.headers["Subject"]).toBe("Corge Subject");

      expect(child.$childHead.$nextSibling.basename).toBe('grault');
      expect(child.$childHead.$nextSibling.headers["Subject"]).toBe(
        "Bar Subject");

      expect(child.$childTail.basename).toBe('garply');
      expect(child.$childTail.headers["Subject"]).toBe("Garply Subject");
    });
  });

  describe('moving nodes:', function () {
    it('nodes with previous siblings may be demoted', function () {
      expect(node.$prevSibling.$collapsed).toBeTruthy();
      node.demote();
      expect(nOrg.root.$childHead.$childHead.basename).toBe(node.basename);
      expect(node.$parent.$length).toBe(1);
      expect(node.$parent.$parent.$length).toBe(2);
      expect(node.$parent.$collapsed).toBeFalsy();
    });
    it('first sibling nodes may not be demoted', function () {
      // Switch to a scope with no previous siblings
      node = node.$childHead;

      expect(function () {
        node.demote();
      }).toThrow(new Error("Cannot demote first sibling!"));
    });

    it('nodes with parents may be promoted', function() {
      // Switch to a scope beneath the previous
      node = node.$childHead.$nextSibling;

      node.promote();
      expect(nOrg.root.$childTail.$prevSibling.basename).toBe(node.basename);
      expect(node.$parent.$length).toBe(4);
      expect(node.$prevSibling.$length).toBe(2);
    });
    it('nodes without parents may not be promoted', function () {
      expect(function () {
        node.promote();
      }).toThrow(new Error("Cannot promote nodes without parents!"));
    });
    it('first children may be promoted', function () {
      // Switch to a first child
      node = node.$childHead;

      node.promote();
      expect(nOrg.root.$childHead.$nextSibling.$length).toBe(2);
      expect(nOrg.root.$childHead.$nextSibling.children().length).toBe(2);
      expect(nOrg.root.$childTail.$prevSibling.basename).toBe(node.basename);
      expect(nOrg.root.$childHead.$nextSibling.$nextSibling.basename).toBe(node.basename);
      expect(nOrg.root.$childHead.$nextSibling.basename).toBe(node.$prevSibling.basename);
      expect(nOrg.root.$childTail.basename).toBe(node.$nextSibling.basename);
    });
    it('last children may be promoted', function () {
      // Switch to a first child
      node = node.$childTail;

      node.promote();
      expect(nOrg.root.$childTail.$prevSibling.basename).toBe(node.basename);
      expect(nOrg.root.$childHead.$nextSibling.$nextSibling.basename).toBe(node.basename);
      expect(nOrg.root.$childHead.$nextSibling.basename).toBe(node.$prevSibling.basename);
      expect(nOrg.root.$childTail.basename).toBe(node.$nextSibling.basename);
    });

    it('nodes with previous siblings may be moved up', function () {
      var new_next = node.$prevSibling;
      node.moveUp();

      expect(new_next.$prevSibling.basename).toBe(node.basename);
      expect(node.$nextSibling.basename).toBe(new_next.basename);
      expect(Boolean(node.$prevSibling)).toBeFalsy();

      expect(nOrg.root.$childHead.basename).toBe(node.basename);
      expect(nOrg.root.$childTail.$prevSibling.basename)
        .toBe(nOrg.root.$childHead.$nextSibling.basename);

      expect(nOrg.root.$length).toEqual(3);
      expect(nOrg.root.children().length).toEqual(3);

      // last node
      node = nOrg.root.$childHead.$childTail;
      node.moveUp();

      expect(node.$parent.$childTail.basename).toBe(node.$nextSibling.basename);

      expect(node.$parent.$childHead.$nextSibling.basename).toBe(node.basename);
      expect(node.$parent.$childTail.$prevSibling.basename).toBe(node.basename);

      expect(node.$parent.$length).toEqual(3);
      expect(node.$parent.children().length).toEqual(3);
    });
    it('first nodes may not be moved up', function() {
      // Switch to a scope with no previous siblings
      node = node.$childHead;

      expect(function () {
        node.moveUp();
      }).toThrow(new Error("Cannot move first nodes up!"));
    });

    it('nodes with next siblings may be moved down', function () {
      var new_previous = node.$nextSibling;
      node.moveDown();

      expect(new_previous.$nextSibling.basename).toBe(node.basename);
      expect(node.$prevSibling.basename).toBe(new_previous.basename);
      expect(Boolean(node.$nextSibling)).toBeFalsy();
      expect(node.$parent.$childTail.basename).toBe(node.basename);
      expect(node.$parent.$childHead.$nextSibling.basename)
        .toBe(new_previous.basename);

      node = node.$parent.$childHead;
      node.moveDown();

      expect(node.$parent.$childTail.$prevSibling.basename)
        .toBe(node.basename);
      expect(Boolean(node.$parent.$childHead.$prevSibling)).toBeFalsy();

      expect(node.$parent.$length).toEqual(3);
      expect(node.$parent.children().length).toEqual(3);
    });
    it('last nodes may not be moved down', function() {
      // Switch to a scope with no next siblings
      node = node.$childTail;

      expect(function () {
        node.moveDown();
      }).toThrow(new Error("Cannot move last nodes down!"));
    });

    it('may be moved around and back', function () {
      node.moveDown();
      node.demote();
      node.promote();
      node.moveUp();
      node.moveUp();
      node.moveDown();

      expect(node.$prevSibling.basename).toBe(nOrg.root.$childHead.basename);
      expect(node.$nextSibling.basename).toBe(nOrg.root.$childTail.basename);

      expect(nOrg.root.$childHead.$nextSibling.basename).toBe(node.basename);
      expect(nOrg.root.$childTail.$prevSibling.basename).toBe(node.basename);
    });
  });

  describe('adding nodes:', function () {
    it('adds a sibling', function () {
      var nextSibling = node.$nextSibling;
      var added = node.newSibling();
      var last;

      expect(added.$parent.basename).toBe(node.$parent.basename);
      expect(node.$nextSibling.basename).toBe(added.basename);
      expect(added.$prevSibling.basename).toBe(node.basename);
      expect(added.$nextSibling.basename).toBe(nextSibling.basename);
      expect(nextSibling.$prevSibling.basename).toBe(node.basename);

      node = node.$childTail;
      last = node.newSibling();

      expect(last.$parent.basename).toBe(node.$parent.basename);
      expect(node.$nextSibling.basename).toBe(last.basename);
      expect(last.$prevSibling.basename).toBe(node.basename);
      expect(Boolean(last.$nextSibling)).toBeFalsy();
      expect(node.$parent.$childTail.basename).toBe(last.basename);
    });
  });

  describe('cursor:', function () {
    beforeEach(function() {
      // Switch to the first node
      node = node.$parent.$childHead;
    });

    it('is initially at the first node', function() {
      expect(node.$cursorObject.basename).toBe(node.basename);
      expect(node.$cursor).toBeTruthy();

      // Switch to the next node
      node = node.$nextSibling;

      expect(node.$cursorObject).not.toBe(node);
      expect(node.$cursor).toBeFalsy();
    });
    it('may be changed to any other node', function() {
      var old_cursor = node.$cursorObject;
      // Switch to the next node
      node = node.$nextSibling;

      nOrg.root.cursorTo(node);
      expect(node.$cursorObject.basename).toBe(node.basename);
      expect(node.$cursor).toBeTruthy();
      expect(old_cursor.$cursor).toBeFalsy();
    });
    it('can be moved down to next sibling', function() {
      var old_cursor = node.$cursorObject;
      // Switch to the next node
      node = node.$nextSibling;

      nOrg.root.cursorDown();
      expect(node.$cursorObject.basename).toBe(node.basename);
      expect(node.$cursor).toBeTruthy();
      expect(old_cursor.$cursor).toBeFalsy();
    });
    it('cannot be moved down beyond last sibling', function() {
      // Switch to the last node
      node = node.$parent.$childTail;

      nOrg.root.cursorTo(node);
      nOrg.root.cursorDown();
      expect(node.$cursorObject.basename).toBe(node.basename);
      expect(node.$cursor).toBeTruthy();
    });
    it('can move down to next expanded child', function() {
      // Switch to node with children
      node = node.$nextSibling;
      nOrg.root.cursorTo(node);
      expect(node.$cursorObject.$collapsed).toBeTruthy();
      node.$cursorObject.$collapsed = false;

      nOrg.root.cursorDown();
      expect(node.$cursorObject.basename).toBe(node.$childHead.basename);
      expect(node.$cursor).toBeFalsy();
      expect(node.$childHead.$cursor).toBeTruthy();
    });
    it('can move down to next parent from last child', function() {
      // Switch to last child node
      node = node.$nextSibling.$childTail;
      nOrg.root.cursorTo(node);
      nOrg.root.cursorDown();
      expect(node.$cursorObject.basename).toBe(node.$parent.$nextSibling.basename);
      expect(node.$cursor).toBeFalsy();
      expect(node.$parent.$nextSibling.$cursor).toBeTruthy();
    });
    it('can move up to previous sibling', function() {
      var old_cursor = node.$cursorObject;
      // Switch to the next node
      node = node.$nextSibling;

      nOrg.root.cursorTo(node);
      nOrg.root.cursorUp();
      expect(node.$cursorObject.basename).toBe(old_cursor.basename);
      expect(node.$cursor).toBeFalsy();
      expect(old_cursor.$cursor).toBeTruthy();
    });
    it("cursor can move up into previous expanded sibling's last child",
       function() {
         // Switch to node after one with children
         node = node.$parent.$childTail;
         nOrg.root.cursorTo(node);
         expect(node.$cursorObject.$prevSibling.$collapsed).toBeTruthy();
         node.$cursorObject.$prevSibling.$collapsed = false;

         nOrg.root.cursorUp();
         expect(node.$cursorObject.basename)
           .toBe(node.$prevSibling.$childTail.basename);
         expect(node.$cursor).toBeFalsy();
         expect(node.$prevSibling.$childTail.$cursor).toBeTruthy();
       });
    it('cannot be moved up above first sibling', function() {
      nOrg.root.cursorUp();
      expect(node.$cursorObject.basename).toBe(node.basename);
      expect(node.$cursor).toBeTruthy();
    });
    it('can move to previous parent from first child',
       function() {
         // Switch to first child node
         node = node.$nextSibling.$childHead;
         nOrg.root.cursorTo(node);
         nOrg.root.cursorUp();
         expect(node.$cursorObject.basename).toBe(node.$parent.basename);
         expect(node.$cursor).toBeFalsy();
         expect(node.$parent.$cursor).toBeTruthy();
       });

    it('can be moved right to the first child', function() {
      var old_cursor;
      // Create a child
      node = node.$nextSibling;
      nOrg.root.cursorTo(node);
      old_cursor = node.$cursorObject;

      node = node.$childHead;

      nOrg.root.cursorRight();
      expect(node.$cursorObject.basename).toBe(node.basename);
      expect(node.$cursor).toBeTruthy();
      expect(old_cursor.$cursor).toBeFalsy();
    });
    it('cannot be moved right without children', function() {
      nOrg.root.cursorRight();
      expect(node.$cursorObject.basename).toBe(node.basename);
      expect(node.$cursor).toBeTruthy();
    });
    it('can expand and move into collapsed first child',
       function() {
         // Switch to the next node
         node = node.$nextSibling;
         nOrg.root.cursorTo(node);
         expect(node.$collapsed).toBeTruthy();

         nOrg.root.cursorRight();
         expect(node.$cursorObject.basename).toBe(node.$childHead.basename);
         expect(node.$cursor).toBeFalsy();
         expect(node.$childHead.$cursor).toBeTruthy();
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
      expect(node.$cursorObject.basename).toBe(old_cursor.basename);
      expect(node.$cursor).toBeFalsy();
      expect(old_cursor.$cursor).toBeTruthy();
    });
    it('cannot be moved up above first sibling', function() {
      nOrg.root.cursorLeft();
      expect(node.$cursorObject.basename).toBe(node.basename);
      expect(node.$cursor).toBeTruthy();
    });
  });

  describe("headers cursor:", function () {
    beforeEach(function() {
      node.headers.$collapsed = false;
      node.headers.push('Bah-Property', 'Bah Property');
    });

    it('is not initially at a header', function () {
      expect(node.$cursorObject['NOrg-User-Headers']).toBeUndefined();
      expect(node.$cursorObject.headers.$cursor).toBeFalsy();
    });
    it('can move right into expanded headers', function () {
      nOrg.root.cursorTo(node);
      nOrg.root.cursorRight();

      expect(node.$cursorObject[node.$cursorObject['NOrg-User-Headers'][
        node.$cursorIndex]]).toBe("Bar Property");
      expect(node.headers.$cursor).toBeTruthy();
      expect(node.$cursorObject.basename).toBeUndefined();
      expect(node.$cursor).toBeFalsy();
    });
    it('can move down into expanded headers', function () {
      nOrg.root.cursorTo(node);
      nOrg.root.cursorDown();

      expect(node.$cursorObject[node.$cursorObject['NOrg-User-Headers'][
        node.$cursorIndex]]).toBe("Bar Property");
      expect(node.headers.$cursor).toBeTruthy();
      expect(node.$cursorObject.basename).toBeUndefined();
      expect(node.$cursor).toBeFalsy();
    });
    it('can move left out of headers', function () {
      nOrg.root.cursorTo(node.headers, 1);

      nOrg.root.cursorLeft();

      expect(node.$cursorObject.basename).toBe("bar");
      expect(node.$cursor).toBeTruthy();
      expect(node.$cursorObject['NOrg-User-Headers']).toBeUndefined();
      expect(node.headers.$cursor).toBeFalsy();
    });
    it('can move down within headers', function () {
      nOrg.root.cursorTo(node.headers, 0);

      nOrg.root.cursorDown();

      expect(node.headers.$cursor).toBeTruthy();
      expect(node.$cursorObject[node.$cursorObject['NOrg-User-Headers'][
        node.$cursorIndex]]).toBe("Bah Property");
    });
    it('can move up within headers', function () {
      nOrg.root.cursorTo(node.headers, 1);

      nOrg.root.cursorUp();

      expect(node.$cursorObject[node.$cursorObject['NOrg-User-Headers'][
        node.$cursorIndex]]).toBe("Bar Property");
      expect(node.headers.$cursor).toBeTruthy();
      expect(node.$cursorObject[1]).toBeUndefined();
    });
    it('can move down to next node past last header', function () {
      node.$collapsed = false;
      nOrg.root.cursorTo(node.headers, 1);

      nOrg.root.cursorDown();

      expect(node.$childHead.$cursor).toBeTruthy();
      expect(node.headers.$cursor).toBeFalsy();
      expect(node.$cursorObject['NOrg-User-Headers']).toBeUndefined();

      node.$childHead.headers.$collapsed = false;
      nOrg.root.cursorTo(node.$childHead.headers, 0);

      nOrg.root.cursorDown();

      expect(node.$childHead.$nextSibling.$cursor).toBeTruthy();
      expect(node.$childHead.headers.$cursor).toBeFalsy();
      expect(node.$cursorObject['NOrg-User-Headers']).toBeUndefined();
    });
    it('can move up to node past first header', function () {
      node.$collapsed = false;
      node.headers.$collapsed = false;
      nOrg.root.cursorTo(node.headers, 0);

      nOrg.root.cursorUp();

      expect(node.$cursor).toBeTruthy();
      expect(node.headers.$cursor).toBeFalsy();
      expect(node.$cursorObject['NOrg-User-Headers']).toBeUndefined();

      node.$childHead.headers.$collapsed = false;
      nOrg.root.cursorTo(node.$childHead.headers, 0);

      nOrg.root.cursorUp();

      expect(node.$childHead.$cursor).toBeTruthy();
      expect(node.$childHead.headers.$cursor).toBeFalsy();
      expect(node.$cursorObject['NOrg-User-Headers']).toBeUndefined();
    });
    it('can move up into expanded header', function () {
      node.$collapsed = false;
      node.headers.$collapsed = false;
      nOrg.root.cursorTo(node.$childHead);

      nOrg.root.cursorUp();

      expect(node.headers.$cursor).toBeTruthy();
      expect(node.$childHead.$cursor).toBeFalsy();
      expect(node.$cursor).toBeFalsy();
      expect(node.$cursorObject['NOrg-User-Headers'])
        .toBe(node.headers['NOrg-User-Headers']);
    });
    it('can not move right within headers', function () {
      nOrg.root.cursorTo(node.headers, 0);

      nOrg.root.cursorRight();

      expect(node.$cursorObject[node.$cursorObject['NOrg-User-Headers'][
        node.$cursorIndex]]).toBe("Bar Property");
      expect(node.headers.$cursor).toBeTruthy();
      expect(node.$cursorObject.basename).toBeUndefined();
      expect(node.$cursor).toBeFalsy();
    });
    it('can not move right into collapsed headers', function () {
      node.headers.$collapsed = true;
      nOrg.root.cursorTo(node);

      nOrg.root.cursorRight();
      
      expect(node.$cursorObject.basename).toBe(node.$childHead.basename);
      expect(node.$childHead.$cursor).toBeTruthy();
      expect(node.$cursorObject['NOrg-User-Headers']).toBeUndefined();
      expect(node.headers.$cursor).toBeFalsy();
    });
    it('can not move down into collapsed headers', function () {
      node.headers.$collapsed = true;
      nOrg.root.cursorTo(node);

      nOrg.root.cursorDown();
      
      expect(node.$cursorObject.basename).toBe(node.$nextSibling.basename);
      expect(node.$nextSibling.$cursor).toBeTruthy();
      expect(node.$cursorObject['NOrg-User-Headers']).toBeUndefined();
      expect(node.headers.$cursor).toBeFalsy();
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
    it('headers are initially collapsed', function() {
      expect(node.headers.$collapsed).toBeTruthy();
    });
    it('can toggle nodes with headers', function() {
      nOrg.root.cursorTo(node);
      node.toggleHeaders();
      expect(node.headers.$collapsed).toBeFalsy();
      node.toggleHeaders();
      expect(node.headers.$collapsed).toBeTruthy();
    });
    it('cannot toggle nodes without headers', function() {
      node = node.$prevSibling;
      nOrg.root.cursorTo(node);
      expect(node.headers.$collapsed).toBeTruthy();
      node.toggleHeaders();
      expect(node.headers.$collapsed).toBeTruthy();
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
