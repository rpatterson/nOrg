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
    function Node() {
      this.init();
    }
    var child;
    Node.prototype = this;
    child = new Node();
    child.parent = this;
    child.headers = this.headers.newChild();
    child.headers.node = this;

    if (object) {
      child.extend(object);
    }

    return child;
  };
  Node.prototype.extend = function extend(object) {
    for (var key in object) {
      if (key === 'headers') {
        this.headers.extend(object.headers);
      } else if (key === 'children') {
        this.children = [];
        object.children.forEach(extendChild, this);
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
    function Headers(node) {
      this.init(node);
    }
    var child;
    Headers.prototype = this;
    child = new Headers(node);
    return child;
  };
  Headers.prototype.extend = function extend(object) {
    for (var key in object) {
      this[key] = object[key];
    }
  };

  root = new Node();

  function extendChild(child) {
    this.children.push( this.newChild(child));
  }

  return {
    Node: Node,
    Headers: Headers,
    root: root
  };
}());
