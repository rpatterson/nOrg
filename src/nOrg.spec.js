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
      node.foo = 'foo';
      node.headers['Foo-Header'] = 'foo';

      expect(child.foo).toBe('foo');
      expect(child.headers['Foo-Header']).toBe('foo');
    });
    it('child may override parent attrs and headers', function () {
      var child = node.newChild();
      node.foo = 'foo';
      node.headers['Foo-Header'] = 'foo';
      child.foo = 'bar';
      child.headers['Foo-Header'] = 'bar';

      expect(child.foo).toBe('bar');
      expect(child.headers['Foo-Header']).toBe('bar');
    });
  });
  
});

