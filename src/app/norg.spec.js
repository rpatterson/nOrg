describe('N-Org', function() {
  var $scope;
  var NOrgNodeCtrl;
  var json;

  beforeEach(module('nOrg'));

  function nodesFromJSON($controller, children) {
    var parent_scope = $scope;
    children.forEach(function (child, idx) {
      $scope = parent_scope.$new();
      $scope.node = child;
      for (var i = 1; i < idx + 1; i++) {
        // simulate arbitrary scope depth
        $scope = $scope.$new();
      }

      $scope.$index = idx;
      $scope.$first = (idx === 0);
      $scope.$last = (idx == (children.length - 1));
      $scope.node.scope = $scope;
      NOrgNodeCtrl = $controller("NOrgNodeCtrl", {$scope: $scope});

      nodesFromJSON($controller, $scope.node.children);
    });
  }

  beforeEach(inject(function($rootScope, $controller, $log) {
    json = {
      "children": [
        {"path": "/foo.nod",
         "headers": {"Subject": "Foo Project",
                     "Message-ID": "<1@foo.com>"}},
        {"path": "/bar/.nod",
         "headers": {"Subject": "Bar Project",
                     "Message-ID": "<2@foo.com>",
                     "Bar-Property": "Bar Property"},
         "children": [
           {"path": "/bar/corge.nod",
            "headers": {"Subject": "Corge Node",
                        "Message-ID": "<3@foo.com>",
                        "Corge-Property": "Corge Property"}},
           {"path": "/bar/grault.nod",
            "headers": {"Subject": "Grault Node",
                        "Message-ID": "<4@foo.com>"}},
           {"path": "/bar/garply.nod",
            "headers": {"Subject": "Garply Node",
                        "Message-ID": "<5@foo.com>"}}]},
        {"path": "/qux/.nod/.nod",
         "headers": {"Subject": "Qux Project",
                     "Message-ID": "<6@foo.com>"}}
      ]};
    $scope = $rootScope.$new();
    $scope.node = json;
    $scope.node.scope = $scope.node;  // For retrieving particular scope
    $controller("NOrgCtrl", {$scope: $scope});
    
    nodesFromJSON($controller, $scope.node.children);
    $scope = json.children[1].scope;  // default to middle node with children

    $log.debug = $log.info;
  }));

  it('should exist', inject(function () {
    expect(NOrgNodeCtrl).toBeTruthy();
  }));

  it('should provide N-Org nodes', inject(function () {
    expect($scope.node.children.length).toBeTruthy();
  }));

  describe('node children:', function () {
    it('nodes may have children ', inject(function () {
      expect($scope.node.children.length).toBeTruthy();
    }));
    it('nodes without children get an empty array', inject(function () {
      expect($scope.node.children.filter(function(node) {
        return ! node.children.length;
      }).length).toBeTruthy();
    }));
    it('child nodes have a reference to their parent', inject(function () {
      expect($scope.parentNode.node.path).toBeUndefined();
      $scope = json.children[1].children[1].scope;
      expect($scope.parentNode.node.path).toBe(json.children[1].path);
    }));
  });

  describe('node ids:', function () {
    it('generates an element id for nodes', inject(function () {
      expect($scope.id).toBeTruthy();
    }));
    it('generates valid, CSS select-able ids for nodes', inject(function () {
      expect((/[<@\.>]/).test($scope.id)).toBeFalsy();
    }));
  });

  describe('node headers:', function () {
    beforeEach(function () {
    });

    it('generates a list of headers to display for nodes', inject(function () {
      expect($scope.header_keys.length).toBeTruthy();
    }));
  });

  describe('editing:', function () {
    it('nodes with previous siblings may be demoted', inject(function () {
      var new_parent = $scope.siblings[$scope.$index - 1];
      new_parent.children = [];
      expect($scope.demotable).toBeTruthy();
      $scope.demote();
      expect(new_parent.children[0].path).toBe($scope.node.path);
    }));
    it('first sibling nodes may not be demoted', inject(function () {
      // Switch to a scope with no previous siblings
      $scope = json.children[1].children[0].scope;

      expect($scope.demotable).toBeFalsy();
      expect(function () {
        $scope.demote();
      }).toThrow(new Error("Cannot demote first sibling!"));
    }));

    it('nodes with parents may be promoted', inject(function() {
      // Switch to a scope beneath the previous
      $scope = json.children[1].children[1].scope;

      expect($scope.promotable).toBeTruthy();
      $scope.promote();
      expect($scope.parentNode.parentNode.node.children[2].path).toBe(
        $scope.node.path);
    }));
    it('nodes without parents may not be promoted', inject(function () {
      expect($scope.promotable).toBeFalsy();
      expect(function () {
        $scope.promote();
      }).toThrow(new Error("Cannot promote nodes without parents!"));
    }));

    it('nodes with previous siblings may be moved up', inject(function () {
      var new_next = $scope.siblings[0];
      expect($scope.movableUp).toBeTruthy();
      $scope.moveUp();
      expect($scope.siblings[0].path).toBe($scope.node.path);
      expect($scope.siblings[1].path).toBe(new_next.path);
      expect($scope.siblings.length).toEqual(3);
    }));
    it('first nodes may not be moved up', inject(function() {
      // Switch to a scope with no previous siblings
      $scope = json.children[1].children[0].scope;

      expect($scope.node.movableUp).toBeFalsy();
      expect(function () {
        $scope.moveUp();
      }).toThrow(new Error("Cannot move first nodes up!"));
    }));

    it('nodes with next siblings may be moved down', inject(function () {
      var new_previous = $scope.siblings[2];
      expect($scope.movableDown).toBeTruthy();
      $scope.moveDown();
      expect($scope.siblings[2].path).toBe($scope.node.path);
      expect($scope.siblings[1].path).toBe(new_previous.path);
      expect($scope.siblings.length).toEqual(3);
    }));
    it('last nodes may not be moved down', inject(function() {
      // Switch to a scope with no next siblings
      $scope = json.children[1].children[2].scope;

      expect($scope.movableDown).toBeFalsy();
      expect(function () {
        $scope.moveDown();
      }).toThrow(new Error("Cannot move last nodes down!"));
    }));
  });

  describe('cursor:', function () {
    beforeEach(inject(function() {
      // Switch to the first node
      $scope = json.children[0].scope;
    }));

    it('cursor is initially at the first node', inject(function($controller) {
      expect($scope.cursorScope.node.path).toBe($scope.node.path);
      expect($scope.cursor).toBeTruthy();

      // Switch to the next node
      $scope = json.children[1].scope;

      expect($scope.cursorScope).not.toBe($scope);
      expect($scope.cursor).toBeFalsy();
    }));
    it('cursor may be changed to any other node', inject(function() {
      var old_cursor = $scope.cursorScope;
      // Switch to the next node
      $scope = json.children[1].scope;

      $scope.cursorTo($scope);
      expect($scope.cursorScope.node.path).toBe($scope.node.path);
      expect($scope.cursor).toBeTruthy();
      expect(old_cursor.cursor).toBeFalsy();
    }));
    it('cursor can be moved down to next sibling', inject(function() {
      var old_cursor = $scope.cursorScope;
      // Switch to the next node
      $scope = json.children[1].scope;

      $scope.cursorDown();
      expect($scope.cursorScope.node.path).toBe($scope.node.path);
      expect($scope.cursor).toBeTruthy();
      expect(old_cursor.cursor).toBeFalsy();
    }));
    it('cursor cannot be moved down beyond last sibling', inject(function() {
      // Switch to the next node
      $scope = json.children[2].scope;

      $scope.cursorTo($scope);
      $scope.cursorDown();
      expect($scope.cursorScope.node.path).toBe($scope.node.path);
      expect($scope.cursor).toBeTruthy();
    }));
    it('cursor can move to next parent from last child', inject(function() {
      // TODO
    }));
    it('cursor can be moved up to previous sibling', inject(function() {
      var old_cursor = $scope.cursorScope;
      // Switch to the next node
      $scope = json.children[1].scope;

      $scope.cursorTo($scope);
      $scope.cursorUp();
      expect($scope.cursorScope.node.path).toBe(old_cursor.node.path);
      expect($scope.cursor).toBeFalsy();
      expect(old_cursor.cursor).toBeTruthy();
    }));
    it('cursor cannot be moved up above first sibling', inject(function() {
      $scope.cursorUp();
      expect($scope.cursorScope.node.path).toBe($scope.node.path);
      expect($scope.cursor).toBeTruthy();
    }));
    it('cursor can move to previous parent from first child',
       inject(function() {
         // TODO
       }));

    it('cursor can be moved right to the first child', inject(function() {
      var old_cursor;
      // Create a child scope
      $scope = json.children[1].scope;
      $scope.cursorTo($scope);
      old_cursor = $scope.cursorScope;

      $scope = $scope.node.children[0].scope;

      $scope.cursorRight();
      expect($scope.cursorScope.node.path).toBe($scope.node.path);
      expect($scope.cursor).toBeTruthy();
      expect(old_cursor.cursor).toBeFalsy();
    }));
    it('cursor cannot be moved right without children', inject(function() {
      $scope.cursorRight();
      expect($scope.cursorScope.node.path).toBe($scope.node.path);
      expect($scope.cursor).toBeTruthy();
    }));
    it('cursor can be moved up to previous sibling', inject(function() {
      var old_cursor;
      // Create a child scope
      $scope = json.children[1].scope;
      $scope.cursorTo($scope);
      old_cursor = $scope.cursorScope;

      $scope = $scope.node.children[0].scope;
      $scope.cursorTo($scope);

      $scope.cursorLeft();
      expect($scope.cursorScope.node.path).toBe(old_cursor.node.path);
      expect($scope.cursor).toBeFalsy();
      expect(old_cursor.cursor).toBeTruthy();
    }));
    it('cursor cannot be moved up above first sibling', inject(function() {
      $scope.cursorLeft();
      expect($scope.cursorScope.node.path).toBe($scope.node.path);
      expect($scope.cursor).toBeTruthy();
    }));
  });
});
