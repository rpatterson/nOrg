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
    it('cursor can move down to next expanded child', inject(function() {
      // Switch to node with children
      $scope = json.children[1].scope;
      $scope.cursorTo($scope);
      expect($scope.cursorScope.collapsed).toBeTruthy();
      $scope.cursorScope.collapsed = false;

      $scope.cursorDown();
      expect($scope.cursorScope.node.path).toBe(
        json.children[1].children[0].path);
      expect($scope.cursor).toBeFalsy();
      expect(json.children[1].children[0].scope.cursor).toBeTruthy();
    }));
    it('cursor can move down to next parent from last child', inject(function() {
      // Switch to last child node
      $scope = json.children[1].children[2].scope;
      $scope.cursorTo($scope);
      $scope.cursorDown();
      expect($scope.cursorScope.node.path).toBe(json.children[2].path);
      expect($scope.cursor).toBeFalsy();
      expect(json.children[2].scope.cursor).toBeTruthy();
    }));
    it('cursor can move up to previous sibling', inject(function() {
      var old_cursor = $scope.cursorScope;
      // Switch to the next node
      $scope = json.children[1].scope;

      $scope.cursorTo($scope);
      $scope.cursorUp();
      expect($scope.cursorScope.node.path).toBe(old_cursor.node.path);
      expect($scope.cursor).toBeFalsy();
      expect(old_cursor.cursor).toBeTruthy();
    }));
    it("cursor can move up into previous expanded sibling's last child",
       inject(function() {
         // Switch to node after one with children
         $scope = json.children[2].scope;
         $scope.cursorTo($scope);
         expect($scope.cursorScope.prevSiblingNode.collapsed).toBeTruthy();
         $scope.cursorScope.prevSiblingNode.collapsed = false;

         $scope.cursorUp();
         expect($scope.cursorScope.node.path).toBe(
           json.children[1].children[2].path);
         expect($scope.cursor).toBeFalsy();
         expect(json.children[1].children[2].scope.cursor).toBeTruthy();
       }));
    it('cursor cannot be moved up above first sibling', inject(function() {
      $scope.cursorUp();
      expect($scope.cursorScope.node.path).toBe($scope.node.path);
      expect($scope.cursor).toBeTruthy();
    }));
    it('cursor can move to previous parent from first child',
       inject(function() {
         // Switch to first child node
         $scope = json.children[1].children[0].scope;
         $scope.cursorTo($scope);
         $scope.cursorUp();
         expect($scope.cursorScope.node.path).toBe(json.children[1].path);
         expect($scope.cursor).toBeFalsy();
         expect(json.children[1].scope.cursor).toBeTruthy();
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
    it('cursor can expand and move into collapsed first child',
       inject(function() {
         // Switch to last child node
         $scope = json.children[1].scope;
         $scope.cursorTo($scope);
         expect($scope.collapsed).toBeTruthy();

         $scope.cursorRight();
         expect($scope.cursorScope.node.path).toBe(
           json.children[1].children[0].path);
         expect($scope.cursor).toBeFalsy();
         expect(json.children[1].children[0].scope.cursor).toBeTruthy();
         expect(json.children[1].scope.collapsed).toBeFalsy();
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
