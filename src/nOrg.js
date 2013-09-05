var nOrg = (function nOrg() {
  // Properties prefixed with '$' are considered internal to the
  // UI/porcelain and will not be written back to the server.

  function Node() {
    this.init();
  }
  Node.prototype.init = function init() {
    this.headers = new Headers(this);
    this.$length = 0;

    // ensure that internally used attrs are not inherited

    this.$childHead = undefined;
    this.$childTail = undefined;
    this.$nextSibling = undefined;
    this.$prevSibling = undefined;

    this.$collapsed = true;

    // Cursor initialization
    // child nodes must override parent to avoid scope inheritance
    // leaking the cursor down
    this.$cursor = false;
    if (this.$root && (! this.$cursorObject)) {
      // Cursor defaults to first node
      this.cursorTo(this);
    }
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
    child.$parent = this;
    this.pushChild(child);
    child.headers = this.headers.newChild(child);

    if (object) {
      child.extend(object);
    }

    return child;
  };
  Node.prototype.pushChild = function pushChild(child) {
    this.$length++;
    if (this.$childHead) {
      child.$prevSibling = this.$childTail;
      this.$childTail.$nextSibling = child;
    } else {
      this.$childHead = child;
    }
    this.$childTail = child;
  };
  Node.prototype.children = function children() {
    var results = [];
    var child = this.$childHead;
    while (child) {
      results.push(child);
      child = child.$nextSibling;
    }
    return results;
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


  // Moving nodes

  Node.prototype.demote = function demote() {
    // Demote a node if appropriate
    if (! this.$prevSibling) {
      throw new Error("Cannot demote first sibling!");
    }

    // Hook sibling nodes to eachother
    this.$prevSibling.$nextSibling = this.$nextSibling;
    this.$nextSibling.$prevSibling = this.$prevSibling;

    if (! this.$nextSibling) {
      // update parent last child
      this.$parent.$childTail = this.$prevSibling;
    }

    this.$prevSibling.$collapsed = false;
    this.$prevSibling.pushChild(this);
  };

  Node.prototype.promote = function promote() {
    // Promote a node if appropriate
    if (typeof this.$parent.$parent == "undefined") {
      throw new Error("Cannot promote nodes without parents!");
    }

    // Hook sibling nodes to eachother
    this.$prevSibling.$nextSibling = this.$nextSibling;
    this.$nextSibling.$prevSibling = this.$prevSibling;

    if (! this.$prevSibling) {
      // update parent first child
      this.$parent.$childHead = this.$nextSibling;
    }
    if (! this.$nextSibling) {
      // update parent last child
      this.$parent.$childTail = this.$prevSibling;
    }

    if (! this.$parent.$nextSibling) {
      // last sibling
      this.$parent.$parent.$childTail = this;
    } else if (this.$parent.$nextSibling) {
      // insert between
      this.$parent.$nextSibling.$prevSibling = this;
    }
    this.$parent.$nextSibling = this;
    this.$parent = this.$parent.$parent;
  };

  Node.prototype.moveUp = function moveUp() {
    // Move a node up relative to it's siblings if appropriate
    if (! this.$prevSibling) {
      throw new Error("Cannot move first nodes up!");
    }

    this.$nextSibling = this.$prevSibling;
    this.$prevSibling = this.$prevSibling.$prevSibling;
    if (this.$prevSibling) {
      this.$prevSibling.$nextSibling = this;
    } else {
      this.$parent.$childTail = this;
    }
    if (this.$nextSibling) {
      this.$nextSibling.$prevSibling = this;
    } else {
      this.$parent.$childTail = this;
    }
  };

  Node.prototype.moveDown = function moveDown() {
    // Move a node down relative to it's siblings if appropriate
    if (! this.$nextSibling) {
      throw new Error("Cannot move last nodes down!");
    }

    this.$prevSibling = this.$nextSibling;
    this.$nextSibling = this.$nextSibling.$nextSibling;
    if (this.$nextSibling) {
      this.$nextSibling.$prevSibling = this;
    } else {
      this.$parent.$childTail = this;
    }
    if (this.$prevSibling) {
      this.$prevSibling.$nextSibling = this;
    } else {
      this.$parent.$childHead = this;
    }
  };


  // Root cursor state
  Node.prototype.cursorTo = function cursorTo(node) {
    if (typeof node == "undefined") {
      node = this;
    }
    if (this.$cursorObject) {
      this.$cursorObject.$cursor = false;
    }
    node.$cursor = true;
    this.$root.$cursorNode = node;
  };
  
  Node.prototype.cursorDown = function cursorDown(event) {
    var node = this.$cursorNode;
    if (event) {
      event.preventDefault();
    }

    if (node.$length && (! node.$collapsed)) {
      return this.cursorTo(node.$childHead);
    }
    while ((! node.$nextSibling) && node.$parent.$parent) {
      node = node.$parent;
    }
    if (node.$nextSibling) {
      this.cursorTo(node.$nextSibling);
    }};

  Node.prototype.cursorUp = function cursorUp(event) {
    if (event) {
      event.preventDefault();
    }

    var node = this.$cursorNode;
    if (node.$prevSibling &&
        node.$prevSibling.$length &&
        (! node.$prevSibling.$collapsed)) {
      return this.cursorTo(node.$prevSibling.$childTail);
    }
    if (! node.$prevSibling) {
      if (node.$parent.$parent) {
        this.cursorTo(node.$parent);
      }
    } else {
      this.cursorTo(node.$prevSibling);
    }};

  Node.prototype.cursorRight = function cursorRight(event) {
    if (event) {
      event.preventDefault();
    }

    if (this.cursorNode.$length) {
      this.cursorNode.$collapsed = false;
      this.cursorTo(this.cursorNode.$childHead);
    }};

  Node.prototype.cursorLeft = function cursorLeft(event) {
    if (event) {
      event.preventDefault();
    }

    if (this.cursorNode.$parent.$parent) {
      this.cursorTo(this.cursorNode.$parent);
    }};


  // expand/collapse node
  Node.prototype.toggle = function toggle(event) {
    if (event) {
      event.preventDefault();
    }

    if (this.cursorNode.$length) {
      this.cursorNode.$collapsed = ! this.cursorNode.$collapsed;
    }};

  // expand/collapse headers
  Node.prototype.toggleHeaders = function toggleHeaders(event) {
    var headers;
    if (event) {
      event.preventDefault();
    }

    if (this.headers.keys().length) {
      this.cursorNode.headers.$collapsed = (
        ! this.cursorNode.headers.$collapsed);
    }
  };

  function Headers() {
    this.init();
  }
  Headers.prototype.init = function init() {
    this.$collapsed = true;
  };
  Headers.prototype.newChild = function newChild() {
    // prototypical inheritance from parent headerss
    function Headers() {}
    var child;
    Headers.prototype = this;
    child = new Headers();
    child.init();
    return child;
  };
  Headers.prototype.extend = function extend(object) {
    for (var key in object) {
      this[key] = object[key];
    }
  };
  Headers.prototype.push = function push(key, value) {
    this[key] = value;
    this['NOrg-User-Headers'].push(key);
  };

  function newRoot(object) {
    var root = new Node();
    root.$root = root;  // for looking up the root node
    root.headers.hiddenKeys = {"Subject": true, "Message-ID": true,
                               "collapsed": true};
    root.extend(object);
    return root;
  }


  return {
    Node: Node,
    Headers: Headers,
    newRoot: newRoot,
    root: newRoot()
  };
}());
