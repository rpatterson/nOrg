/** nOrg module */
var nOrg = (function nOrg() {

  /** Generate a globally unique Message-ID */
  function generateMessageID() {
    var email = 'TODO@TODO.org'.split('@', 2);
    var now = new Date();
    var random = Math.random();
    // From http://www.jwz.org/doc/mid.html#3
    return (
      "<" + email[0] + "+" +
        now.toISOString() + "+" + random.toString(36).slice(2) +
        "@" + email[1] + ">");
  }

  /**
   * Construct a new node, optionally initialize properties from an object.
   * 
   * Properties prefixed with '$' are considered internal to the UI/porcelain
   * and will not be written back to the server.
   */
  function Node(object) {
    this.init(object);
  }
  Node.prototype.init = function init(object) {
    // child nodes must override parent to avoid scope inheritance leaking
    this.$length = 0;
    this.$childHead = undefined;
    this.$childTail = undefined;
    this.$nextSibling = undefined;
    this.$prevSibling = undefined;
    this.$collapsed = true;
    this.$propertiesCollapsed = true;

    if (object) {
      this.extend(object);
    }

    if (! this.hasOwnProperty("Message-ID")) {
      this["Message-ID"] = generateMessageID();
    }
    if (! this.hasOwnProperty("$basename")) {
      this["$basename"] = undefined;
    }
    if (this['NOrg-Required-Properties']) {
      this['NOrg-Required-Properties'].forEach(function setRequired(property) {
        if (! this.hasOwnProperty(property)) {
          this[property] = undefined;
        }
      }, this);
    }
  };
  /** Use the globally unique ID as a node hash. */
  Node.prototype.$$hashKey = function $$hashKey() {
    // Used in AngularJS
    // Needed so that nodes don't inherit ancestor node $$hashKey
    return this["Message-ID"];
  };
  /** Create a new node as a child of this node and initialize from object */
  Node.prototype.newNode = function newNode(object) {
    if (! this.$root) {
      // root initialization
      // Trees require a root, so the first node without a root *is* root
      this.$root = this;
    }

    function Node(object) {
      this.init(object);
    }
    var child;
    Node.prototype = this;
    child = new Node(object);
    child.$parent = this;

    // Cursor initialization
    if (! this.$cursorObject) {
      // Cursor defaults to first node
      this.cursorTo(child);
    }

    return child;
  };
  /** Append the child node to this parent node as the last child */
  Node.prototype.pushChild = function pushChild(child) {
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
  /** Create a new node and append it as a child to this parent node */
  Node.prototype.newChild = function newChild(object, event) {
    var child = this.newNode(object);

    if (event) {
      event.stopPropagation();
    }

    this.pushChild(child);
    if (event) {
      this.cursorTo(child);
    }
    return child;
  };
  /** Array.forEach function for creating multiple children for this parent */
  Node.prototype.newChildEach = function newChildEach(object, index, array) {
    this.newChild(object);
  };
  /** Create a new node and add it as the next sibling to this node */
  Node.prototype.newSibling = function newSibling(object, event) {
    var child = this.$parent.newNode(object);

    if (event) {
      event.stopPropagation();
    }

    child.$nextSibling = this.$nextSibling;
    child.$prevSibling = this;
    if (this.$nextSibling) {
      child.$nextSibling.$prevSibling = child;
    } else {
      this.$parent.$childTail = child;
    }
    this.$nextSibling = child;
    this.$parent.$length++;

    if (event) {
      this.cursorTo(child);
    }
    return child;
  };
  /** Remove this node from it's parent */
  Node.prototype.popFromParent = function popFromParent() {
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
  /** 
   * Return this node's children as an array
   *
   * If possible, use the $childHead and $nextSibling directly
   * to iterate over the children in order instead of this method.
   */
  Node.prototype.children = function children() {
    var results = [];
    var child = this.$childHead;
    while (child) {
      results.push(child);
      child = child.$nextSibling;
    }
    return results;
  };
  /** Set this node's properties from the object */
  Node.prototype.extend = function extend(object) {
    for (var property in object) {
      if (property !== '$children') {
        this[property] = object[property];
      }
    }
    if (object.$children) {
      object.$children.forEach(this.newChildEach, this);
    }
  };
  /** 
   * Generate a valid HTML ID and CSS selector from the Message-ID 
   *
   * The leading and trailing "<>" characters are stripped from the Message-ID
   * and encoded using base64.
   */
  Node.prototype.toId = function toId() {
    return window.btoa(this["Message-ID"]).slice(0, -1);
  };


  /** Return an array of all this node's non-required property names */
  Node.prototype.$properties = function $properties() {
    var required = this['NOrg-Required-Properties'];
    return Object.keys(this).filter(function filterProperties(property) {
      return (property[0] !== '$') && (required.indexOf(property) === -1);
      }).sort();
  };
  /** Add a new property to this node */
  Node.prototype.$newProperty = function $newProperty(property, value, event) {
    if (! property) {
      throw new Error("Must provide a property name!");
    }
    this[property] = value;
    this.$propertiesCollapsed = false;
    this.cursorTo(this, this.$properties().indexOf(property));
  };
  /** Set this node's state and close the state menu if open */
  Node.prototype.$changeState = function $changeState(state) {
    this['Node-State'] = state;
    this.$stateOpened = false;
  };
  /** Return an array of all the states that can be set for this node */
  Node.prototype.$nextStates = function $nextStates(state) {
    if (! state) {
      state = this['Node-State'];
    }
    return this['Node-State-All'].filter(function filterState(next) {
      return next != state;
    });
  };


  // Moving nodes

  /** Demote this node to a child of the previous sibling if appropriate */
  Node.prototype.demote = function demote() {
    var parent = this.$prevSibling;
    if (! parent) {
      throw new Error("Cannot demote first sibling!");
    }

    this.popFromParent();
    parent.pushChild(this);
    parent.$collapsed = false;
  };

  /** Promote this node to the next sibling of the parent if appropriate */
  Node.prototype.promote = function promote() {
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

  /** Move this node up above it's previous sibling if appropriate */
  Node.prototype.moveUp = function moveUp() {
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

  /** Move this node below it's next sibling if appropriate */
  Node.prototype.moveDown = function moveDown() {
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

  /** Return true if the cursor is on this node */
  Node.prototype.isCursor = function isCursor(object, index) {
    if (typeof object == "undefined") {
      object = this;
    }
    return object === object.$cursorObject && index === object.$cursorIndex;
  };

  /** Move the cursor to this node */
  Node.prototype.cursorTo = function cursorTo(object, index) {
    if (typeof object == "undefined") {
      object = this;
    }
    this.$root.$cursorObject = object;
    this.$root.$cursorIndex = index;

    return object;
  };

  /** 
   * Move the cursor down to the next expanded node
   *
   * Descend into this node's first property or child if they are expanded.
   */
  Node.prototype.cursorDown = function cursorDown(event) {
    var object = this.$cursorObject;
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if ((object.$cursorIndex !== undefined) &&
        object.$properties()[this.$cursorIndex + 1] !== undefined) {
      // next property
      return this.cursorTo(object, this.$cursorIndex + 1);
    } else if ((object.$cursorIndex === undefined) &&
               object.$properties().length &&
               (! object.$propertiesCollapsed)) {
      // first expanded property
      return this.cursorTo(object, 0);
    }

    // no more property cases
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

  /** 
   * Move the cursor up to the previous node or property
   *
   * Ascend to the parent's first property or the parent
   * if this node is the first child.
   */
  Node.prototype.cursorUp = function cursorUp(event) {
    var node = this.$cursorObject;
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (this.$cursorIndex !== undefined) {
      if (this.$cursorObject.$properties()[this.$cursorIndex - 1]) {
        // previous property
        return this.cursorTo(this.$cursorObject, this.$cursorIndex - 1);
      } else {
        // property node
        return this.cursorTo(this.$cursorObject);
      }
    }

    // find the last/deepest expanded ancestor/property
    if (node.$prevSibling) {
      node = node.$prevSibling;
      while (node.$length &&
             (! node.$collapsed)) {
        node = node.$childTail;
      }
    } else if (node.$parent.$parent) {
      node = node.$parent;
    } else {
      return false;
    }
    if ((! node.$propertiesCollapsed) &&
        node.$properties().length) {
      return this.cursorTo(node,
                           node.$properties().length - 1);
    } else {
      return this.cursorTo(node);
    }

    return false;
  };

  /** Move the cursor down to the first expanded property or child */
  Node.prototype.cursorRight = function cursorRight(event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (this.$cursorObject &&
        (! this.$cursorObject.$propertiesCollapsed) &&
        this.$cursorObject.$properties().length) {
      // first expanded property
      return this.cursorTo(this.$cursorObject, 0);
    } else if (this.$cursorObject.$length) {
      // expand and move to first child
      this.$cursorObject.$collapsed = false;
      return this.cursorTo(this.$cursorObject.$childHead);
    }
    return false;
  };

  /** Move the cursor up to the parent */
  Node.prototype.cursorLeft = function cursorLeft(event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (this.$cursorIndex !== undefined) {
      return this.cursorTo(this.$cursorObject);
    } else if (this.$cursorObject.$parent.$parent) {
      return this.cursorTo(this.$cursorObject.$parent);
    }
    return false;
  };


  /** Expand or Collapse this node's children */
  Node.prototype.toggle = function toggle(event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (this.$cursorObject.$length) {
      this.$cursorObject.$collapsed = ! this.$cursorObject.$collapsed;
    }};

  /** Expand or Collapse this node's properties */
  Node.prototype.toggleProperties = function toggleProperties(event) {
    var properties;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.$cursorIndex !== undefined) {
      this.cursorTo(this.$cursorObject);
    }
    this.$cursorObject.$propertiesCollapsed = (
      ! this.$cursorObject.$propertiesCollapsed);
  };


  function newRoot(object) {
    object = object || {};
    object['NOrg-Required-Properties'] = object[
      'NOrg-Required-Properties'] || ['Message-ID',
                                      'Subject',
                                      'Node-State'];
    object['Node-State-Classes'] = object['Node-State-Classes'] || {
      'TODO': 'warning',
      'DONE': 'success',
      'CANCELED': 'info'};
    object['Node-State-All'] = object['Node-State-All'] || [
      'TODO',
      'DONE',
      'CANCELED'];
    var root = new Node(object);
    return root;
  }


  return {
    generateMessageID: generateMessageID,
    Node: Node,
    newRoot: newRoot,
    root: newRoot()
  };
}());
