describe('nOrg', function() {
  var node;
  var json = {
      "children": [
        {"path": "/foo.nod",
         "headers": {"Subject": "Foo Subject",
                     "Message-ID": "<1@foo.com>"}},
        {"path": "/bar/.nod",
         "headers": {"Subject": "Bar Subject",
                     "Message-ID": "<2@foo.com>",
                     "Bar-Property": "Bar Property"},
         "children": [
           {"path": "/bar/corge.nod",
            "headers": {"Subject": "Corge Node",
                        "Message-ID": "<3@foo.com>",
                        "Corge-Property": "Corge Property"}},
           {"path": "/bar/grault.nod",
            "headers": {"Subject": "Grault Node",
                        "Message-ID": "<4@foo.com>"}},
           {"path": "/bar/garply.nod",
            "headers": {"Subject": "Garply Node",
                        "Message-ID": "<5@foo.com>"}}]},
        {"path": "/qux/.nod/.nod",
         "headers": {"Subject": "Qux Subject",
                     "Message-ID": "<6@foo.com>"}}
      ]};

  beforeEach(function () {
    nOrg.root = nOrg.newRoot(json);
    node = nOrg.root.childHead.nextSibling;
  });

  it('exports module contents', function () {
    expect(nOrg.Node).toBeTruthy();
    expect(nOrg.root).toBeTruthy();
  });

  describe('node headers:', function () {
    it('child nodes have headers', function () {
      expect(node.hasOwnProperty("headers")).toBeTruthy();
    });
    it('lists of headers to include in UI', function () {
      expect(node.headers.keys()).toEqual(['Bar-Property']);
    });
  });

  describe('node inheritance:', function () {
    it('has a parent', function () {
      expect(node).toBeTruthy();
      expect(node.parent).toBe(nOrg.root);
    });
    it('inherits attrs and headers from parent', function () {
      var child = node.newChild();
      expect(child.path).toBe('/bar/.nod');
      expect(child.headers['Subject']).toBe("Bar Subject");
    });
    it('child may override parent attrs and headers', function () {
      var child = node.newChild();
      child.path = 'bar';
      child.headers['Subject'] = 'Bar Subject';

      expect(child.path).toBe('bar');
      expect(child.headers['Subject']).toBe('Bar Subject');
    });
    it('can inherit root node', function () {
      expect(node.hasOwnProperty("root")).toBeFalsy();
      expect(node.root.hasOwnProperty("root")).toBeTruthy();
    });
  });

  describe('node children:', function () {
    it('nodes may have children', function () {
      expect(nOrg.root.childHead.nextSibling.path).toBe(node.path);
      expect(nOrg.root.childTail.prevSibling.path).toBe(node.path);
      expect(typeof nOrg.root.prevSibling).toBe('undefined');
      expect(typeof nOrg.root.nextSibling).toBe('undefined');
      expect(typeof node.prevSibling.prevSibling).toBe('undefined');
      expect(typeof node.nextSibling.nextSibling).toBe('undefined');

      expect(nOrg.root.length).toBe(3);

      expect(nOrg.root.childHead.nextSibling.path).toBe(node.path);
      expect(nOrg.root.childTail.prevSibling.path).toBe(node.path);
      expect(node.childHead.length).toBe(0);
      expect(typeof node.prevSibling.childHead).toBe('undefined');
      expect(typeof node.prevSibling.childTail).toBe('undefined');

      expect(nOrg.root.childHead.nextSibling.path).toBe(node.path);
      expect(typeof node.prevSibling.prevSibling).toBe('undefined');
      expect(nOrg.root.childTail.prevSibling.path).toBe(node.path);
      expect(typeof node.nextSibling.nextSibling).toBe('undefined');
    });
    it('assembles children into an array', function () {
      var children = node.children();
      expect(children.length).toBe(3);
      expect(children[0].path).toBe(node.childHead.path);
    });
  });

  it('generates valid, CSS select-able ids for nodes', function () {
    expect((/[<@\.>]/).test(node.toId())).toBeFalsy();
  });

  describe('nodes from objects:', function () {
    it('nodes may be created from objects', function () {
      var object = {"path": "bar",
                    "headers": {"Subject": "Bar Subject"}};
      var child = node.newChild();

      child.extend(object);
      expect(child.path).toBe('bar');
      expect(child.headers['Subject']).toBe("Bar Subject");

      object.path = 'qux';
      object.headers['Subject'] = "Qux Subject";
      child = node.newChild(object);
      expect(child.path).toBe('qux');
      expect(child.headers['Subject']).toBe("Qux Subject");
    });
    it('object children are converted to nodes', function () {
      var object = {"path": "bar",
                    "headers": {"Subject": "Bar Subject"},
                    "children": [
                      {"headers": {"Subject": "Corge Subject"}},
                      {"path": "bar/grault"},
                      {"path": "bar/garply",
                       "headers": {"Subject": "Garply Subject"}}]};
      var child = node.newChild(object);

      expect(child.childHead.path).toBe('bar');
      expect(child.childHead.headers["Subject"]).toBe("Corge Subject");

      expect(child.childHead.nextSibling.path).toBe('bar/grault');
      expect(child.childHead.nextSibling.headers["Subject"]).toBe(
        "Bar Subject");

      expect(child.childTail.path).toBe('bar/garply');
      expect(child.childTail.headers["Subject"]).toBe("Garply Subject");
    });
  });

  describe('moving nodes:', function () {
    it('nodes with previous siblings may be demoted', function () {
      expect(node.prevSibling.collapsed).toBeTruthy();
      node.demote();
      expect(node.prevSibling.childHead.path).toBe(node.path);
      expect(node.prevSibling.collapsed).toBeFalsy();
    });
    it('first sibling nodes may not be demoted', function () {
      // Switch to a scope with no previous siblings
      node = node.childHead;

      expect(function () {
        node.demote();
      }).toThrow(new Error("Cannot demote first sibling!"));
    });

    it('nodes with parents may be promoted', function() {
      // Switch to a scope beneath the previous
      node = node.childHead.nextSibling;

      node.promote();
      expect(nOrg.root.childTail.prevSibling.path).toBe(node.path);
    });
    it('nodes without parents may not be promoted', function () {
      expect(function () {
        node.promote();
      }).toThrow(new Error("Cannot promote nodes without parents!"));
    });

    it('nodes with previous siblings may be moved up', function () {
      var new_next = node.prevSibling;
      node.moveUp();
      expect(new_next.prevSibling.path).toBe(node.path);
      expect(node.nextSibling.path).toBe(new_next.path);
      expect(node.length).toEqual(3);
    });
    it('first nodes may not be moved up', function() {
      // Switch to a scope with no previous siblings
      node = node.childHead;

      expect(function () {
        node.moveUp();
      }).toThrow(new Error("Cannot move first nodes up!"));
    });

    it('nodes with next siblings may be moved down', function () {
      var new_previous = node.nextSibling;
      node.moveDown();
      expect(new_previous.nextSibling.path).toBe(node.path);
      expect(node.prevSibling.path).toBe(new_previous.path);
      expect(node.length).toEqual(3);
    });
    it('last nodes may not be moved down', function() {
      // Switch to a scope with no next siblings
      node = node.childTail;

      expect(function () {
        node.moveDown();
      }).toThrow(new Error("Cannot move last nodes down!"));
    });
  });

  describe('cursor:', function () {
    beforeEach(function() {
      // Switch to the first node
      node = node.parent.childHead;
    });

    it('cursor is initially at the first node', function() {
      expect(node.cursorNode.path).toBe(node.path);
      expect(node.cursor).toBeTruthy();

      // Switch to the next node
      node = node.nextSibling;

      expect(node.cursorNode).not.toBe(node);
      expect(node.cursor).toBeFalsy();
    });
    it('cursor may be changed to any other node', function() {
      var old_cursor = node.cursorNode;
      // Switch to the next node
      node = node.nextSibling;

      node.cursorTo(node);
      expect(node.cursorNode.path).toBe(node.path);
      expect(node.cursor).toBeTruthy();
      expect(old_cursor.cursor).toBeFalsy();
    });
    it('cursor can be moved down to next sibling', function() {
      var old_cursor = node.cursorNode;
      // Switch to the next node
      node = node.nextSibling;

      node.cursorDown();
      expect(node.cursorNode.path).toBe(node.path);
      expect(node.cursor).toBeTruthy();
      expect(old_cursor.cursor).toBeFalsy();
    });
    it('cursor cannot be moved down beyond last sibling', function() {
      // Switch to the last node
      node = node.parent.childTail;

      node.cursorTo(node);
      node.cursorDown();
      expect(node.cursorNode.path).toBe(node.path);
      expect(node.cursor).toBeTruthy();
    });
    it('cursor can move down to next expanded child', function() {
      // Switch to node with children
      node = node.nextSibling;
      node.cursorTo(node);
      expect(node.cursorNode.collapsed).toBeTruthy();
      node.cursorNode.collapsed = false;

      node.cursorDown();
      expect(node.cursorNode.path).toBe(node.childHead.path);
      expect(node.cursor).toBeFalsy();
      expect(node.childHead.cursor).toBeTruthy();
    });
    it('cursor can move down to next parent from last child', function() {
      // Switch to last child node
      node = node.nextSibling.childTail;
      node.cursorTo(node);
      node.cursorDown();
      expect(node.cursorNode.path).toBe(node.parent.nextSibling.path);
      expect(node.cursor).toBeFalsy();
      expect(node.parent.nextSibling.cursor).toBeTruthy();
    });
    it('cursor can move up to previous sibling', function() {
      var old_cursor = node.cursorNode;
      // Switch to the next node
      node = node.nextSibling;

      node.cursorTo(node);
      node.cursorUp();
      expect(node.cursorNode.path).toBe(old_cursor.path);
      expect(node.cursor).toBeFalsy();
      expect(old_cursor.cursor).toBeTruthy();
    });
    it("cursor can move up into previous expanded sibling's last child",
       function() {
         // Switch to node after one with children
         node = node.parent.childTail;
         node.cursorTo(node);
         expect(node.cursorNode.prevSibling.collapsed).toBeTruthy();
         node.cursorNode.prevSibling.collapsed = false;

         node.cursorUp();
         expect(node.cursorNode.path).toBe(node.prevSibling.childTail.path);
         expect(node.cursor).toBeFalsy();
         expect(node.prevSibling.childTail.cursor).toBeTruthy();
       });
    it('cursor cannot be moved up above first sibling', function() {
      node.cursorUp();
      expect(node.cursorNode.path).toBe(node.path);
      expect(node.cursor).toBeTruthy();
    });
    it('cursor can move to previous parent from first child',
       function() {
         // Switch to first child node
         node = node.nextSibling.childHead;
         node.cursorTo(node);
         node.cursorUp();
         expect(node.cursorNode.path).toBe(node.parent.path);
         expect(node.cursor).toBeFalsy();
         expect(node.parent.cursor).toBeTruthy();
       });

    it('cursor can be moved right to the first child', function() {
      var old_cursor;
      // Create a child
      node = node.nextSibling;
      node.cursorTo(node);
      old_cursor = node.cursorNode;

      node = node.childHead;

      node.cursorRight();
      expect(node.cursorNode.path).toBe(node.path);
      expect(node.cursor).toBeTruthy();
      expect(old_cursor.cursor).toBeFalsy();
    });
    it('cursor cannot be moved right without children', function() {
      node.cursorRight();
      expect(node.cursorNode.path).toBe(node.path);
      expect(node.cursor).toBeTruthy();
    });
    it('cursor can expand and move into collapsed first child',
       function() {
         // Switch to the next node
         node = node.nextSibling;
         node.cursorTo(node);
         expect(node.collapsed).toBeTruthy();

         node.cursorRight();
         expect(node.cursorNode.path).toBe(node.childHead.path);
         expect(node.cursor).toBeFalsy();
         expect(node.childHead.cursor).toBeTruthy();
         expect(node.collapsed).toBeFalsy();
       });
    it('cursor can be moved up to previous sibling', function() {
      var old_cursor;
      // Create a child
      node = node.nextSibling;

      node.cursorTo(node);
      old_cursor = node.cursorNode;

      node = node.childHead;
      node.cursorTo(node);

      node.cursorLeft();
      expect(node.cursorNode.path).toBe(old_cursor.path);
      expect(node.cursor).toBeFalsy();
      expect(old_cursor.cursor).toBeTruthy();
    });
    it('cursor cannot be moved up above first sibling', function() {
      node.cursorLeft();
      expect(node.cursorNode.path).toBe(node.path);
      expect(node.cursor).toBeTruthy();
    });
  });
});

