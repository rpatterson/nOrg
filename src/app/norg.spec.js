describe('N-Org', function() {
  var $scope;
  var NOrgNodeCtrl;
  var json;

  beforeEach(module('nOrg'));

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
    $controller("NOrgCtrl", {$scope: $scope});
    $scope = $scope.$new().$new().$new();
    $scope.$index = 1;
    $scope.$first = false;
    $scope.$last = false;
    $scope.node = $scope.$parent.$parent.$parent.node.children[$scope.$index];
    NOrgNodeCtrl = $controller("NOrgNodeCtrl", {$scope: $scope});

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
    it('nodes may not have children ', inject(function () {
      expect($scope.node.children.filter(function(node) {
        return ! node.children;
      }).length).toBeTruthy();
    }));
    it('child nodes have a reference to their parent', inject(function () {
      expect($scope.parentNode.node.path).toBe($scope.$parent.$parent.$parent.node.path);
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
    it('first sibling nodes may not be demoted',
       inject(function ($controller) {
         // Switch to a scope with no previous siblings
         $scope = $scope.parentNode.$new().$new().$new();
         $scope.$index = 0;
         $scope.$first = true;
         $scope.node = $scope.$parent.$parent.$parent.node.children[
           $scope.$index];
         NOrgNodeCtrl = $controller("NOrgNodeCtrl", {$scope: $scope});

         expect($scope.demotable).toBeFalsy();
         expect(function () {
           $scope.demote();
         }).toThrow(new Error("Cannot promote first sibling!"));
       }));

    it('nodes with parents may be promoted', inject(function($controller) {
      // Add a child scope beneath the previous
      $scope = $scope.$new().$new().$new();
      $scope.$index = 1;
      $scope.node = $scope.$parent.$parent.$parent.node.children[
        $scope.$index];
      NOrgNodeCtrl = $controller("NOrgNodeCtrl", {$scope: $scope});

      expect($scope.promotable).toBeTruthy();
      $scope.promote();
      expect($scope.parentNode.parentNode.node.children[2].path).toBe($scope.node.path);
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
    it('first nodes may not be moved up', inject(function($controller) {
      // Switch to a scope with no previous siblings
      $scope = $scope.parentNode.$new().$new().$new();
      $scope.$index = 0;
      $scope.$first = true;
      $scope.node = $scope.$parent.$parent.$parent.node.children[
        $scope.$index];
      NOrgNodeCtrl = $controller("NOrgNodeCtrl", {$scope: $scope});

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
    it('last nodes may not be moved down', inject(function($controller) {
      // Switch to a scope with no next siblings
      $scope = $scope.parentNode.$new().$new().$new();
      $scope.$index = 2;
      $scope.$last = true;
      $scope.node = $scope.$parent.$parent.$parent.node.children[
        $scope.$index];
      NOrgNodeCtrl = $controller("NOrgNodeCtrl", {$scope: $scope});

      expect($scope.movableDown).toBeFalsy();
      expect(function () {
        $scope.moveDown();
      }).toThrow(new Error("Cannot move last nodes down!"));
    }));
  });

  describe('cursor:', function () {
    beforeEach(inject(function($controller) {
      // Switch to the first node
      $scope.parentNode.cursorScope = undefined;
      $scope = $scope.parentNode.$new().$new().$new();
      $scope.$index = 0;
      $scope.$first = true;
      $scope.node = $scope.$parent.$parent.$parent.node.children[
        $scope.$index];
      NOrgNodeCtrl = $controller("NOrgNodeCtrl", {$scope: $scope});
    }));

    it('cursor is initially at the first node', inject(function($controller) {
      expect($scope.cursorScope.node.path).toBe($scope.node.path);
      expect($scope.cursor).toBeTruthy();

      // Switch to the next node
      $scope = $scope.parentNode.$new().$new().$new();
      $scope.$index = 1;
      $scope.node = $scope.$parent.$parent.$parent.node.children[
        $scope.$index];
      NOrgNodeCtrl = $controller("NOrgNodeCtrl", {$scope: $scope});

      expect($scope.cursorScope).not.toBe($scope);
      expect($scope.cursor).toBeFalsy();
    }));
    it('cursor may be changed to any other node',
       inject(function($controller) {
         var old_cursor = $scope.cursorScope;
         // Switch to the next node
         $scope = $scope.parentNode.$new().$new().$new();
         $scope.$index = 1;
         $scope.node = $scope.$parent.$parent.$parent.node.children[
           $scope.$index];
         NOrgNodeCtrl = $controller("NOrgNodeCtrl", {$scope: $scope});

         $scope.cursorTo($scope);
         expect($scope.cursorScope.node.path).toBe($scope.node.path);
         expect($scope.cursor).toBeTruthy();
         expect(old_cursor.cursor).toBeFalsy();
       }));
    it('cursor can be moved down to next sibling',
       inject(function($controller) {
         var old_cursor = $scope.cursorScope;
         // Switch to the next node
         $scope = $scope.parentNode.$new().$new().$new();
         $scope.$index = 1;
         $scope.node = $scope.$parent.$parent.$parent.node.children[
           $scope.$index];
         NOrgNodeCtrl = $controller("NOrgNodeCtrl", {$scope: $scope});

         $scope.cursorDown();
         expect($scope.cursorScope.node.path).toBe($scope.node.path);
         expect($scope.cursor).toBeTruthy();
         expect(old_cursor.cursor).toBeFalsy();
       }));
    it('cursor cannot be moved down beyond last sibling',
       inject(function($controller) {
         // Switch to the next node
         $scope = $scope.parentNode.$new().$new().$new();
         $scope.$index = 2;
         $scope.$last = true;
         $scope.node = $scope.$parent.$parent.$parent.node.children[
           $scope.$index];
         NOrgNodeCtrl = $controller("NOrgNodeCtrl", {$scope: $scope});

         $scope.cursorTo($scope);
         $scope.cursorDown();
         expect($scope.cursorScope.node.path).toBe($scope.node.path);
         expect($scope.cursor).toBeTruthy();
       }));
    it('cursor can be moved up to previous sibling',
       inject(function($controller) {
         var old_cursor = $scope.cursorScope;
         // Switch to the next node
         $scope = $scope.parentNode.$new().$new().$new();
         $scope.$index = 1;
         $scope.node = $scope.$parent.$parent.$parent.node.children[
           $scope.$index];
         NOrgNodeCtrl = $controller("NOrgNodeCtrl", {$scope: $scope});

         $scope.cursorTo($scope);
         $scope.cursorUp();
         expect($scope.cursorScope.node.path).toBe(old_cursor.node.path);
         expect($scope.cursor).toBeFalsy();
         expect(old_cursor.cursor).toBeTruthy();
    }));
    it('cursor cannot be moved up above first sibling',
       inject(function($controller) {
         $scope.cursorUp();
         expect($scope.cursorScope.node.path).toBe($scope.node.path);
         expect($scope.cursor).toBeTruthy();
    }));

    it('cursor can be moved right to the first child',
       inject(function($controller) {
         var old_cursor;
         // Create a child scope
         $scope = $scope.parentNode.$new().$new().$new();
         $scope.$index = 1;
         $scope.node = $scope.$parent.$parent.$parent.node.children[
           $scope.$index];
         NOrgNodeCtrl = $controller("NOrgNodeCtrl", {$scope: $scope});
         $scope.cursorTo($scope);
         old_cursor = $scope.cursorScope;

         $scope = $scope.$new().$new().$new();
         $scope.$index = 0;
         $scope.$first = true;
         $scope.node = $scope.$parent.$parent.$parent.node.children[
           $scope.$index];
         NOrgNodeCtrl = $controller("NOrgNodeCtrl", {$scope: $scope});

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
    it('cursor can be moved up to previous sibling',
       inject(function($controller) {
         var old_cursor;
         // Create a child scope
         $scope = $scope.parentNode.$new().$new().$new();
         $scope.$index = 1;
         $scope.node = $scope.$parent.$parent.$parent.node.children[
           $scope.$index];
         NOrgNodeCtrl = $controller("NOrgNodeCtrl", {$scope: $scope});
         $scope.cursorTo($scope);
         old_cursor = $scope.cursorScope;

         $scope = $scope.$new().$new().$new();
         $scope.$index = 0;
         $scope.$first = true;
         $scope.node = $scope.$parent.$parent.$parent.node.children[
           $scope.$index];
         NOrgNodeCtrl = $controller("NOrgNodeCtrl", {$scope: $scope});
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
