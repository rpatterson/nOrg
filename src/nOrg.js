/** nOrg module */

/** Generate a globally unique Message-ID */
export function generateMessageID() {
  const email = 'TODO@TODO.org'.split('@', 2);
  const now = new Date();
  const random = Math.random();
  // From http://www.jwz.org/doc/mid.html#3
  return `<${email[0]}+${now.toISOString()}+${random.toString(36).slice(2)}@${email[1]}>`;
}

/**
 * Construct a new node, optionally initialize properties from an object.
   n *
 * Properties prefixed with '$' are considered internal to the UI/porcelain
 * and will not be written back to the server.
 */
export default class Node {
  constructor(object) {
    this.init(object);
  }

  init(object) {
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

    if (!{}.hasOwnProperty.call(this, 'Message-ID')) {
      this['Message-ID'] = generateMessageID();
    }
    if (!{}.hasOwnProperty.call(this, '$basename')) {
      this.$basename = undefined;
    }
    if (this['NOrg-Required-Properties']) {
      this['NOrg-Required-Properties'].forEach(function setRequired(property) {
        if (!{}.hasOwnProperty.call(this, property)) {
          this[property] = undefined;
        }
      }, this);
    }
  }

  /** Use the globally unique ID as a node hash. */
  $$hashKey() {
    // Used in AngularJS
    // Needed so that nodes don't inherit ancestor node $$hashKey
    return this['Message-ID'];
  }

  /** Create a new node as a child of this node and initialize from object */
  newNode(object) {
    // eslint-disable-next-line no-shadow
    function Node(object) {
      this.init(object);
    }
    Node.prototype = this;
    const child = new Node(object);
    child.$parent = this;

    // Cursor initialization
    if (typeof this.$root !== 'undefined' && !this.$cursorObject) {
      // Cursor defaults to first node
      this.cursorTo(child);
    }

    return child;
  }

  /** Append the child node to this parent node as the last child */
  pushChild(child) {
    // eslint-disable-next-line no-param-reassign
    child.$parent = this;
    if (this.$childHead) {
      // eslint-disable-next-line no-param-reassign
      child.$prevSibling = this.$childTail;
      this.$childTail.$nextSibling = child;
    } else {
      this.$childHead = child;
    }
    this.$childTail = child;
    this.$length += 1;
  }

  /** Create a new node and append it as a child to this parent node */
  newChild(object, event) {
    const child = this.newNode(object);

    if (event) {
      event.stopPropagation();
    }

    this.pushChild(child);
    if (event) {
      this.cursorTo(child);
    }
    return child;
  }

  /** Array.forEach function for creating multiple children for this parent */
  newChildEach(object) {
    this.newChild(object);
  }

  /** Create a new node and add it as the next sibling to this node */
  newSibling(object, event) {
    const child = this.$parent.newNode(object);

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
    this.$parent.$length += 1;

    if (event) {
      this.cursorTo(child);
    }
    return child;
  }

  /** Root a tree of nodes that inherit from this node as defaults */
  newRoot(object) {
    const root = this.newNode(object);
    root.$root = root;
    root.cursorTo(root.$childHead);
    return root;
  }

  /** Remove this node from it's parent */
  popFromParent() {
    this.$parent.$length -= 1;

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
  }

  /**
   * Return this node's children as an array
   *
   * If possible, use the $childHead and $nextSibling directly
   * to iterate over the children in order instead of this method.
   */
  children() {
    const results = [];
    let child = this.$childHead;
    while (child) {
      results.push(child);
      child = child.$nextSibling;
    }
    return results;
  }

  /** Set this node's properties from the object */
  extend(object) {
    for (const [property, value] of Object.entries(object)) {
      if (property !== '$children') {
        this[property] = value;
      }
    }
    if (object.$children) {
      object.$children.forEach(this.newChildEach, this);
    }
  }

  /**
   * Generate a valid HTML ID and CSS selector from the Message-ID
   *
   * The leading and trailing "<>" characters are stripped from the Message-ID
   * and encoded using base64.
   */
  toId() {
    return window.btoa(this['Message-ID']).slice(0, -1);
  }

  /** Return an array of all this node's non-required property names */
  $properties() {
    const required = this['NOrg-Required-Properties'];
    return Object.keys(this)
                 .filter(property => property[0] !== '$' && required.indexOf(property) === -1)
                 .sort();
  }

  /** Add a new property to this node */
  $newProperty(property, value) {
    if (!property) {
      throw new Error('Must provide a property name!');
    }
    this[property] = value;
    this.$propertiesCollapsed = false;
    this.cursorTo(this, this.$properties().indexOf(property));
  }

  /** Set this node's state and close the state menu if open */
  $changeState(state) {
    this['Node-State'] = state;
    this.$stateOpened = false;
  }

  /** Return an array of all the states that can be set for this node */
  $nextStates(state) {
    let thisState = state;
    if (!thisState) {
      thisState = this['Node-State'];
    }
    return this['Node-State-All'].filter(next => next !== thisState);
  }

  // Moving nodes

  /** Demote this node to a child of the previous sibling if appropriate */
  demote() {
    const parent = this.$prevSibling;
    if (!parent) {
      throw new Error('Cannot demote first sibling!');
    }

    this.popFromParent();
    parent.pushChild(this);
    parent.$collapsed = false;
  }

  /** Promote this node to the next sibling of the parent if appropriate */
  promote() {
    const $prevSibling = this.$parent;
    if ($prevSibling === this.$root) {
      throw new Error('Cannot promote nodes without parents!');
    }

    this.popFromParent();
    if (!$prevSibling.$childHead) {
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
    this.$parent.$length += 1;
  }

  /** Move this node up above it's previous sibling if appropriate */
  moveUp() {
    const $nextSibling = this.$prevSibling;
    if (!$nextSibling) {
      throw new Error('Cannot move first nodes up!');
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
  }

  /** Move this node below it's next sibling if appropriate */
  moveDown() {
    const $prevSibling = this.$nextSibling;
    if (!$prevSibling) {
      throw new Error('Cannot move last nodes down!');
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
    if (!this.$nextSibling) {
      // now last child
      this.$parent.$childTail = this;
    } else {
      this.$nextSibling.$prevSibling = this;
    }
    $prevSibling.$nextSibling = this;
  }

  // Root cursor state

  /** Return true if the cursor is on this node */
  isCursor(object, index) {
    let thisObject = object;
    if (typeof thisObject === 'undefined') {
      thisObject = this;
    }
    return thisObject === thisObject.$cursorObject && index === thisObject.$cursorIndex;
  }

  /** Move the cursor to this node */
  cursorTo(object, index) {
    let thisObject = object;
    if (typeof thisObject === 'undefined') {
      thisObject = this;
    }
    this.$root.$cursorObject = thisObject;
    this.$root.$cursorIndex = index;

    return thisObject;
  }

  /**
   * Move the cursor down to the next expanded node
   *
   * Descend into this node's first property or child if they are expanded.
   */
  cursorDown(event) {
    let object = this.$cursorObject;
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (
      object.$cursorIndex !== undefined &&
      object.$properties()[this.$cursorIndex + 1] !== undefined
    ) {
      // next property
      return this.cursorTo(object, this.$cursorIndex + 1);
    }
    if (
      object.$cursorIndex === undefined &&
      object.$properties().length &&
      !object.$propertiesCollapsed
    ) {
      // first expanded property
      return this.cursorTo(object, 0);
    }

    // no more property cases
    if (object.$length && !object.$collapsed) {
      // first expanded child
      return this.cursorTo(object.$childHead);
    }
    while (!object.$nextSibling && object.$parent.$parent) {
      object = object.$parent;
    }
    if (object.$nextSibling) {
      // next ancestor node with a next sibling
      return this.cursorTo(object.$nextSibling);
    }
    return false;
  }

  /**
   * Move the cursor up to the previous node or property
   *
   * Ascend to the parent's first property or the parent
   * if this node is the first child.
   */
  cursorUp(event) {
    let node = this.$cursorObject;
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (this.$cursorIndex !== undefined) {
      if (this.$cursorObject.$properties()[this.$cursorIndex - 1]) {
        // previous property
        return this.cursorTo(this.$cursorObject, this.$cursorIndex - 1);
      }
      // property node
      return this.cursorTo(this.$cursorObject);
    }

    // find the last/deepest expanded ancestor/property
    if (node.$prevSibling) {
      node = node.$prevSibling;
      while (node.$length && !node.$collapsed) {
        node = node.$childTail;
      }
    } else if (node.$parent !== node.$root) {
      node = node.$parent;
    } else {
      return false;
    }
    if (!node.$propertiesCollapsed && node.$properties().length) {
      return this.cursorTo(node, node.$properties().length - 1);
    }
    return this.cursorTo(node);
  }

  /** Move the cursor down to the first expanded property or child */
  cursorRight(event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (
      this.$cursorObject &&
      !this.$cursorObject.$propertiesCollapsed &&
      this.$cursorObject.$properties().length
    ) {
      // first expanded property
      return this.cursorTo(this.$cursorObject, 0);
    }
    if (this.$cursorObject.$length) {
      // expand and move to first child
      this.$cursorObject.$collapsed = false;
      return this.cursorTo(this.$cursorObject.$childHead);
    }
    return false;
  }

  /** Move the cursor up to the parent */
  cursorLeft(event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (this.$cursorIndex !== undefined) {
      return this.cursorTo(this.$cursorObject);
    }
    if (this.$cursorObject.$parent !== this.$cursorObject.$root) {
      return this.cursorTo(this.$cursorObject.$parent);
    }
    return false;
  }

  /** Expand or Collapse this node's children */
  toggle(event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (this.$cursorObject.$length) {
      this.$cursorObject.$collapsed = !this.$cursorObject.$collapsed;
    }
  }

  /** Expand or Collapse this node's properties */
  toggleProperties(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.$cursorIndex !== undefined) {
      this.cursorTo(this.$cursorObject);
    }
    this.$cursorObject.$propertiesCollapsed = !this.$cursorObject.$propertiesCollapsed;
  }
}

const defaults = new Node({
  'NOrg-Required-Properties': ['Message-ID', 'Subject', 'Node-State'],
  'Node-State-Classes': {
    TODO: 'warning',
    DONE: 'success',
    CANCELED: 'info',
  },
  'Node-State-All': ['TODO', 'DONE', 'CANCELED'],
});
export { defaults };
