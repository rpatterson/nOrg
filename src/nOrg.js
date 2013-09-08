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
  Node.prototype.newNode = function newNode(object) {
    function Node() {
      this.init();
    }
    var child;
    Node.prototype = this;
    child = new Node();
    child.$parent = this;
    child.headers = this.headers.newChild(child);

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
  };
  Node.prototype.newChild = function newChild(object, event) {
    var child = this.newNode(object);
    this.pushChild(child);
    if (event) {
      this.cursorTo(child);
    }
    return child;
  };
  Node.prototype.newChildEach = function newChild(object, index, array) {
    this.newChild(object);
  };
  Node.prototype.newSibling = function newSibling(object, event) {
    var child = this.$parent.newNode(object);

    child.$nextSibling = this.$nextSibling;
    this.$nextSibling = child;
    child.$prevSibling = this;
    if (! child.$nextSibling) {
      this.$parent.$childTail = child;
    }
    this.$parent.$length++;

    if (event) {
      this.cursorTo(child);
    }
    return child;
  };
  Node.prototype.popFromParent = function popFromParent() {
    // Remove this node from it's parent
    this.$parent.$length--;

    if (this.$prevSibling) {
      this.$prevSibling.$nextSibling = this.$nextSibling;
    } else {
      this.$parent.$childHead = this.$nextSibling;
    }
    if (this.$nextSibling) {
      this.$nextSibling.$prevSibling = this.$prevSibling;
    } else {
      this.$parent.$childTail = this.$prevSibling;
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
        object.children.forEach(this.newChildEach, this);
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

    $nextSibling.$nextSibling = this.$nextSibling;
    if (this.$nextSibling) {
      // not last child
      this.$nextSibling.$prevSibling = $nextSibling;
    } else {
      // now last child
      this.$parent.$childTail = $nextSibling;
    }
    this.$nextSibling = $nextSibling;

    this.$prevSibling = $nextSibling.$prevSibling;
    if ($nextSibling.$prevSibling) {
      // not first child
      this.$prevSibling = $nextSibling.$prevSibling;
      this.$prevSibling.$nextSibling = this;
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

    $prevSibling.$prevSibling = this.$prevSibling;
    if (this.$prevSibling) {
      // not first child
      this.$prevSibling.$nextSibling = $prevSibling;
    } else {
      // now first child
      this.$parent.$childHead = $prevSibling;
    }
    this.$prevSibling = $prevSibling;

    this.$nextSibling = $prevSibling.$nextSibling;
    if (! this.$nextSibling) {
      // now last child
      this.$parent.$childTail = this;
    } else {
          this.$nextSibling.$prevSibling = this;
    }
    $prevSibling.$nextSibling = this;
  };


  // Root cursor state
  Node.prototype.cursorTo = function cursorTo(object, index) {
    if (typeof object == "undefined") {
      object = this;
    }
    if (this.$cursorObject) {
      this.$cursorObject.$cursor = false;
    }
    object.$cursor = true;
    this.$root.$cursorObject = object;
    this.$root.$cursorIndex = index;

    return object;
  };
  Node.prototype.callCursor = function callCursor(method, event) {
    return (this.$cursorObject.$node ||
            this.$cursorObject)[method].call(this, event);
  };
  Node.prototype.cursorDown = function cursorDown(event) {
    var object = this.$cursorObject;
    if (event) {
      event.preventDefault();
    }

    if ((! object.headers) && object['NOrg-User-Headers'][this.$cursorIndex + 1]) {
      // next header
      return this.cursorTo(object, this.$cursorIndex + 1);
    } else if (object.headers && object.headers['NOrg-User-Headers'].length &&
               (! object.headers.$collapsed)) {
      // first expanded header
      return this.cursorTo(object.headers, 0);
    }

    // no more header cases
    object = object.$node || object;
    if (object.$length && (! object.$collapsed)) {
      // first expanded child
      return this.cursorTo(object.$childHead);
    }
    while ((! object.$nextSibling) && object.$parent.$parent) {
      object = object.$parent;
    }
    if (object.$nextSibling) {
      // next ancestor node with a next sibling
      return this.cursorTo(object.$nextSibling);
    }
    return false;
  };

  Node.prototype.cursorUp = function cursorUp(event) {
    var object = this.$cursorObject;
    var cursor;
    if (event) {
      event.preventDefault();
    }

    if (! object.headers) {
      if (object['NOrg-User-Headers'][this.$cursorIndex - 1]) {
        // previous header
        return this.cursorTo(object, this.$cursorIndex - 1);
      } else {
        // header node
        return this.cursorTo(object.$node);
      }
    }
    // no more header cases
    object = object.$node || object;

    if (object.$prevSibling &&
        object.$prevSibling.$length &&
        (! object.$prevSibling.$collapsed)) {
      // previous expanded $parent sibling last child
      cursor = object.$prevSibling.$childTail;
    }
    if (! object.$prevSibling) {
      if (object.$parent.$parent) {
        // parent
        cursor = object.$parent;
      }
    } else if (!cursor) {
      // previous sibling
      cursor = object.$prevSibling;
    }
    if (cursor) {
      if ((! cursor.headers.$collapsed) &&
          cursor.headers['NOrg-User-Headers'].length) {
        return this.cursorTo(cursor.headers,
                             cursor.headers['NOrg-User-Headers'].length - 1);
      } else {
        return this.cursorTo(cursor);
      }
    }
    return false;
  };

  Node.prototype.cursorRight = function cursorRight(event) {
    if (event) {
      event.preventDefault();
    }

    if (this.$cursorObject.headers &&
        (! this.$cursorObject.headers.$collapsed) &&
        this.$cursorObject.headers['NOrg-User-Headers'].length) {
      // first expanded header
      return this.cursorTo(this.$cursorObject.headers, 0);
    } else if (this.$cursorObject.$length) {
      // expand and move to first child
      this.$cursorObject.$collapsed = false;
      return this.cursorTo(this.$cursorObject.$childHead);
    }
    return false;
  };

  Node.prototype.cursorLeft = function cursorLeft(event) {
    if (event) {
      event.preventDefault();
    }

    if (! this.$cursorObject.headers) {
      return this.cursorTo(this.$cursorObject.$node);
    } else if (this.$cursorObject.$parent.$parent) {
      return this.cursorTo(this.$cursorObject.$parent);
    }
    return false;
  };


  // expand/collapse node
  Node.prototype.toggle = function toggle(event) {
    if (event) {
      event.preventDefault();
    }

    if (this.$cursorObject.$length) {
      this.$cursorObject.$collapsed = ! this.$cursorObject.$collapsed;
    }};

  // expand/collapse headers
  Node.prototype.toggleHeaders = function toggleHeaders(event) {
    var headers;
    if (event) {
      event.preventDefault();
    }

    headers = this.$cursorObject.headers || this.$cursorObject;
    if (headers['NOrg-User-Headers'].length) {
      if (headers.$node) {
        this.cursorTo(headers.$node);
      }
      headers.$collapsed = (! headers.$collapsed);
    }
  };

  function Headers(node) {
    this.init(node);
  }
  Headers.prototype.init = function init(node) {
    this.$node = node;
    this.$collapsed = true;
    this.$cursor = false;
    this['NOrg-User-Headers'] = [];
  };
  Headers.prototype.newChild = function newChild(node) {
    // prototypical inheritance from parent headerss
    function Headers() {}
    var child;
    Headers.prototype = this;
    child = new Headers();
    child.init(node);
    return child;
  };
  Headers.prototype.extend = function extend(object) {
    for (var key in object) {
      this[key] = object[key];
    }
    this['NOrg-User-Headers'] = object['NOrg-User-Headers'] || [];
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
