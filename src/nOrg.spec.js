describe('nOrg', function() {
  var node;

  beforeEach(function () {
    nOrg.root = new nOrg.Node();
    node = nOrg.root.newChild({"path": "foo",
                               "headers": {"Subject": "Foo Subject"}});
  });

  it('exports module contents', function () {
    expect(nOrg.Node).toBeTruthy();
    expect(nOrg.root).toBeTruthy();
  });

  it('child nodes have headers', function () {
    expect(node.hasOwnProperty("headers")).toBeTruthy();
    expect(node.headers.hasOwnProperty("node")).toBeTruthy();
  });

  describe('node inheritance:', function () {
    it('has a parent', function () {
      expect(node).toBeTruthy();
      expect(node.parent).toBe(nOrg.root);
    });
    it('inherits attrs and headers from parent', function () {
      var child = node.newChild();
      expect(child.path).toBe('foo');
      expect(child.headers.node.path).toBe('foo');
      expect(child.headers['Subject']).toBe("Foo Subject");
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
      expect(nOrg.root.childHead.path).toBe(node.path);
      expect(nOrg.root.childTail.path).toBe(node.path);
      expect(nOrg.root.prevSibling).toBeUndefined();
      expect(nOrg.root.nextSibling).toBeUndefined();
      expect(node.prevSibling).toBeUndefined();
      expect(node.nextSibling).toBeUndefined();

      var last = nOrg.root.newChild({"path": "bar"});

      expect(nOrg.root.length).toBe(2);

      expect(nOrg.root.childHead.path).toBe(node.path);
      expect(nOrg.root.childTail.path).toBe(last.path);
      expect(node.length).toBe(0);
      expect(node.childHead).toBeUndefined();
      expect(node.childTail).toBeUndefined();

      expect(node.nextSibling.path).toBe(last.path);
      expect(node.prevSibling).toBeUndefined();
      expect(last.prevSibling.path).toBe(node.path);
      expect(last.nextSibling).toBeUndefined();
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

