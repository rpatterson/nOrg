var nOrg = (function nOrg() {
  var root;

  function Node() {
    this.init();
  }
  Node.prototype.init =  function init() {
    this.headers = new Headers(this);
  };
  Node.prototype.newChild =  function newChild() {
    // prototypical inheritance from parent nodes
    var child;
    function Node() {}
    Node.prototype = this;
    child = new Node();
    child.parent = this;
    child.headers = this.headers.newChild();
    child.headers.node = this;
    return child;
  };

  function Headers(node) {
    this.init(node);
  }
  Headers.prototype.init =  function init(node) {
    this.node = node;
  };
  Headers.prototype.newChild =  function newChild(node) {
    // prototypical inheritance from parent headerss
    var child;
    function Headers() {}
    Headers.prototype = this;
    child = new Headers();
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
