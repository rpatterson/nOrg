describe('nOrg', function() {
  var node;

  beforeEach(function () {
    node = nOrg.root.newChild();
  });

  it('exports module contents', function () {
    expect(nOrg.Node).toBeTruthy();
    expect(nOrg.root).toBeTruthy();
  });

  describe('node inheritance:', function () {
    it('has a parent', function () {
      expect(node).toBeTruthy();
      expect(node.parent).toBe(nOrg.root);
    });
    it('inherits attrs and headers from parent', function () {
      var child = node.newChild();
      node.path = 'foo';
      node.headers['Subject'] = "Foo Subject";

      expect(child.path).toBe('foo');
      expect(child.headers['Subject']).toBe("Foo Subject");
    });
    it('child may override parent attrs and headers', function () {
      var child = node.newChild();
      node.path = 'foo';
      node.headers['Subject'] = "Foo Subject";
      child.path = 'bar';
      child.headers['Subject'] = 'Bar Subject';

      expect(child.path).toBe('bar');
      expect(child.headers['Subject']).toBe('Bar Subject');
    });
  });

  describe('nodes from objects:', function () {
    it('nodes may be created from objects', function () {
      var object = {"path": "bar",
                    "headers": {"Subject": "Bar Subject"}};
      var child = node.newChild();
      node.path = 'foo';
      node.headers['Subject'] = "Foo Subject";

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

      expect(child.children[0].path).toBe('bar');
      expect(child.children[0].headers["Subject"]).toBe("Corge Subject");

      expect(child.children[1].path).toBe('bar/grault');
      expect(child.children[1].headers["Subject"]).toBe("Bar Subject");

      expect(child.children[2].path).toBe('bar/garply');
      expect(child.children[2].headers["Subject"]).toBe("Garply Subject");
    });
  });
});

