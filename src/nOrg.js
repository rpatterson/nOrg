var nOrg = (function nOrg() {
  // Properties prefixed with '$' are considered internal to the
  // UI/porcelain and will not be written back to the server.

  function Node() {
    this.init();
  }
  Node.prototype.init = function init() {
    // child nodes must override parent to avoid scope inheritance
    // leaking the cursor down
    this.$length = 0;
    this.$childHead = undefined;
    this.$childTail = undefined;
    this.$nextSibling = undefined;
    this.$prevSibling = undefined;
    this.$collapsed = true;
    this.$cursor = false;

    this.headers = new Headers(this);

    // Cursor initialization
    if (this.$root && (! this.$cursorObject)) {
      // Cursor defaults to first node
      this.cursorTo(this);
    }
  };
  Node.prototype.newChild = function newChild(object) {
    function Node() {
      this.init();
    }
    var child;
    Node.prototype = this;
    child = new Node();
    child.headers = this.headers.newChild(child);
    this.pushChild(child);

    if (object) {
      child.extend(object);
    }

    return child;
  };
  Node.prototype.pushChild = function pushChild(child) {
    // Take a child node and append it to this node as the last child
    child.$parent = this;
    if (this.$childHead) {
      child.$prevSibling = this.$childTail;
      this.$childTail.$nextSibling = child;
    } else {
      this.$childHead = child;
    }
    this.$childTail = child;
    this.$length++;
  }; Node.prototype.popFromParent = function popFromParent() {
    // Remove this node from it's parent
    this.$parent.$length--;

    if (this.$prevSibling) {
      this.$prevSibling.$nextSibling = this.$nextSibling;
    } else {
      this.$parent.$childHead = undefined;
    }
    if (this.$nextSibling) {
      this.$nextSibling.$prevSibling = this.$prevSibling;
    } else {
      this.$parent.$childTail = undefined;
    }

    this.$parent = undefined;
    this.$prevSibling = undefined;
    this.$nextSibling = undefined;
  };
  Node.prototype.children = function children() {
    // Avoid using this if there's a way to iterate
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
  Node.prototype.toId = function toId() {
    // Generate a valid HTML ID and CSS selector from the message
    // ID using base64 encoding
    return window.btoa(this.headers["Message-ID"]).slice(0, -1);
  };


  // Moving nodes

  Node.prototype.demote = function demote() {
    // Demote a node if appropriate
    var parent = this.$prevSibling;
    if (! parent) {
      throw new Error("Cannot demote first sibling!");
    }

    this.popFromParent();
    parent.$collapsed = false;
    parent.pushChild(this);
  };

  Node.prototype.promote = function promote() {
    // Promote a node if appropriate
    var $prevSibling = this.$parent;
    if (! $prevSibling.$parent) {
      throw new Error("Cannot promote nodes without parents!");
    }

    this.popFromParent();
    if (! $prevSibling.$childHead) {
      $prevSibling.collapsed = true;
    }

    this.$parent = $prevSibling.$parent;
    this.$prevSibling = $prevSibling;
    if ($prevSibling.$nextSibling) {
      this.$nextSibling = $prevSibling.$nextSibling;
      this.$nextSibling.$prevSibling = this;
    } else {
      this.$parent.$childTail = this;
    }
    $prevSibling.$nextSibling = this;
    this.$parent.$length++;
  };

  Node.prototype.moveUp = function moveUp() {
    // Move a node up relative to it's siblings if appropriate
    var $nextSibling = this.$prevSibling; 
    if (! $nextSibling) {
      throw new Error("Cannot move first nodes up!");
    }

    if (this.$nextSibling) {
      // not last child
      this.$nextSibling.$prevSibling = $nextSibling;
    } else {
      // now last child
      this.$parent.$childTail = $nextSibling;
    }
    this.$nextSibling = $nextSibling;

    if ($nextSibling.$prevSibling) {
      // not first child
      this.$prevSibling = $nextSibling.$prevSibling;
    } else {
      // now first child
      this.$parent.$childHead = this;
    }
    $nextSibling.$prevSibling = this;
  };

  Node.prototype.moveDown = function moveDown() {
    // Move a node down relative to it's siblings if appropriate
    var $prevSibling = this.$nextSibling; 
    if (! $prevSibling) {
      throw new Error("Cannot move last nodes down!");
    }

    if (this.$prevSibling) {
      // not first child
      this.$prevSibling.$nextSibling = $prevSibling;
    } else {
      // now first child
      this.$parent.$childHead = $prevSibling;
    }
    this.$prevSibling = $prevSibling;

    if ($prevSibling.$nextSibling) {
      // not last child
      this.$nextSibling = $prevSibling.$nextSibling;
    } else {
      // now last child
      this.$parent.$childTail = this;
    }
    $prevSibling.$nextSibling = this;
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
