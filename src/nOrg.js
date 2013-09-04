var nOrg = (function nOrg() {
  var root;

  // prototypical inheritance from parent nodes/headers
  function Parented() {
  }
  Parented.prototype = {
    newChild: function newChild(parent) {
      var Child;
      var child;

      Child = function ChildNode() {
      };
      Child.prototype = parent;
      child = new Child();
      if (child.init) {
        child.init();
      }
      child.parent = parent;
      return child;
    }
  };

  function Node() {
    this.init();
  }
  Node.prototype = new Parented();
  Node.prototype.init =  function init() {
    this.headers = new Headers(this);
  };
  Node.prototype.newChild =  function newChild() {
    var child = Parented.prototype.newChild(this);
    child.headers = this.headers.newChild();
    child.headers.node = this;
    return child;
  };

  function Headers(node) {
    this.init(node);
  }
  Headers.prototype = new Parented();
  Headers.prototype.init =  function init(node) {
    this.node = node;
  };
  Headers.prototype.newChild =  function newChild(node) {
    var child = Parented.prototype.newChild(this);
    child.node = node;
    return child;
  };

  root = new Node();

  return {
    Node: Node,
    Headers: Headers,
    root: root
  };
}());
