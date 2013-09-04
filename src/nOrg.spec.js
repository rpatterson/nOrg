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
    nOrg.root = nOrg.newRoot();
    nOrg.root.extend(json);
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
    it('lists of headers to include in UI', inject(function () {
      expect(node.headers.keys()).toEqual(['Bar-Property']);
    }));
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
});

