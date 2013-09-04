var nOrg = (function nOrg() {
  var root;
  var reservedAttrs = ['childHead', 'childTail', 'nextSibling', 'prevSibling'];

  function Node() {
    this.init();
  }
  Node.prototype.init = function init() {
    this.headers = new Headers(this);
    this.length = 0;

    // ensure that internally used attrs are not inherited
    reservedAttrs.forEach(function (attr) {
      this[attr] = undefined;
    }, this);
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
    this.pushChild(child);
    child.headers = this.headers.newChild(child);
    child.headers.node = this;

    if (object) {
      child.extend(object);
    }

    return child;
  };
  Node.prototype.pushChild = function pushChild(child) {
    this.length++;
    if (this.childHead) {
      child.prevSibling = this.childTail;
      this.childTail.nextSibling = child;
    } else {
      this.childHead = child;
    }
    this.childTail = child;
  };
  Node.prototype.extend = function extend(object) {
    for (var key in object) {
      if (key === 'headers') {
        this.headers.extend(object.headers);
      } else if (key === 'children') {
        object.children.forEach(this.newChild, this);
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

  return {
    Node: Node,
    Headers: Headers,
    root: root
  };
}());
