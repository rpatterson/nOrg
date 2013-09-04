var nOrg = (function nOrg() {
  function Node() {
    this.init();
  }
  Node.prototype.init = function init() {
    this.headers = new Headers(this);
    this.length = 0;

    // ensure that internally used attrs are not inherited
    this.childHead = undefined;
    this.childTail = undefined;
    this.nextSibling = undefined;
    this.prevSibling = undefined;
  };
  Node.prototype.toId = function toId() {
    // Generate a valid HTML ID and CSS selector from the message
    // ID using base64 encoding
    return window.btoa(this.headers["Message-ID"]).slice(0, -1);
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

  function Headers() {
  }
  Headers.prototype.newChild = function newChild() {
    // prototypical inheritance from parent headerss
    function Headers() {}
    var child;
    Headers.prototype = this;
    child = new Headers();
    return child;
  };
  Headers.prototype.extend = function extend(object) {
    for (var key in object) {
      this[key] = object[key];
    }
  };
  Headers.prototype.keys = function keys() {
    return Object.keys(this).filter(function (key) {
      return !(key in this.hiddenKeys);
      }, this);
  };

  function newRoot() {
    root = new Node();
    root.headers.hiddenKeys = {"Subject": true, "Message-ID": true};
    return root;
  }


  return {
    Node: Node,
    Headers: Headers,
    newRoot: newRoot,
    root: newRoot()
  };
}());
