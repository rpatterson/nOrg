var nOrg = (function nOrg() {
  var root;

  function Node() {
    this.init();
  }
  Node.prototype.init = function init() {
    this.headers = new Headers(this);
  };
  Node.prototype.newChild = function newChild(object) {
    // prototypical inheritance from parent nodes
    function Node() {}
    var child;
    Node.prototype = this;
    child = new Node();
    child.parent = this;
    child.headers = this.headers.newChild();
    child.headers.node = this;

    if (object) {
      this.extend(object);
    }

    return child;
  };
  Node.prototype.extend = function extend(object) {
    for (var key in object) {
      if (key === 'headers') {
        this.headers.extend(object.headers);
      } else {
        this[key] = object[key];
      }
    }
  };

  function Headers(node) {
    this.init(node);
  }
  Headers.prototype.init = function init(node) {
    this.node = node;
  };
  Headers.prototype.newChild = function newChild(node) {
    // prototypical inheritance from parent headerss
    function Headers() {}
    var child;
    Headers.prototype = this;
    child = new Headers();
    child.node = node;
    return child;
  };
  Headers.prototype.extend = function extend(object) {
    for (var key in object) {
      this[key] = object[key];
    }
  };

  root = new Node();

  return {
    Node: Node,
    Headers: Headers,
    root: root
  };
}());
