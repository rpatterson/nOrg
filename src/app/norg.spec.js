describe('N-Org', function() {
  var $scope, NOrgCtrl, $httpBackend;

  beforeEach(module('nOrg'));

  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('app/nodes.json').respond([
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
    ]);

    $scope = $rootScope.$new();
    NOrgCtrl = $controller("NOrgCtrl", {$scope: $scope});
    $scope.$digest();
    $httpBackend.flush();
  }));

  it('should exist', inject(function () {
    expect(NOrgCtrl).toBeTruthy();
  }));

  it('should provide N-Org nodes', inject(function () {
    expect($scope.children.length).toBeTruthy();
  }));

  describe('node children:', function () {
    it('nodes may have children ', inject(function () {
      expect($scope.children.filter(function(node) {
        return node.children;
      }).length).toBeTruthy();
    }));
    it('nodes may not have children ', inject(function () {
      expect($scope.children.filter(function(node) {
        return ! node.children;
      }).length).toBeTruthy();
    }));
    it('child nodes have a reference to their parent', inject(function () {
      var parent = $scope.children[1];
      var child = parent.children[1];
      $scope.listChildren(parent);
      expect(child.parent).toBe(parent);
    }));
  });

  describe('node ids:', function () {
    it('generates an element id for nodes', inject(function () {
      $scope.listChildren();
      expect($scope.children.filter(function(node) {
        return node.id;
      }).length).toEqual($scope.children.length);
    }));
    it('generates valid, CSS select-able ids for nodes', inject(function () {
      $scope.listChildren();
      expect($scope.children.filter(function(node) {
        return (/[<@\.>]/).test(node.id);
      }).length).toBeFalsy();
    }));
  });

  describe('node headers:', function () {
    beforeEach(function () {
      $scope.listChildren();
    });

    it('generates a list of headers to display for nodes', inject(function () {
      expect($scope.children.filter(function(node) {
        return typeof node.header_keys != "undefined";
      }).length).toEqual($scope.children.length);
    }));
    it('nodes may have visible headers', inject(function () {
      expect($scope.children.filter(function(node) {
        return node.header_keys.length;
      }).length).toBeTruthy();
    }));
    it('nodes may not have visible headers', inject(function () {
      expect($scope.children.filter(function(node) {
        return ! node.header_keys.length;
      }).length).toBeTruthy();
    }));
  });

  describe('editing:', function () {
    beforeEach(function () {
      $scope.listChildren();
    });

    it('nodes with previous siblings may be demoted', inject(function () {
      var node = $scope.children[1];
      expect(node.demotable).toBeTruthy();
      $scope.demote(node);
      expect($scope.children[0].children[0]).toBe(node);
      expect($scope.children[0]).toBe(node.parent);
      expect(node.demotable).toBeFalsy();
      expect(node.index).toBe(0);
    }));
    it('first sibling nodes may not be demoted', inject(function () {
      var node = $scope.children[0];
      expect(node.demotable).toBeFalsy();
      expect(function () {
        $scope.demote(node);
      }).toThrow(new Error("Cannot promote first sibling!"));
    }));
    it('last child with siblings may be demoted', inject(function () {
      $scope.listChildren($scope.children[1]);
      var parent = $scope.children[1].children[
        $scope.children[1].children.length - 2];
      var node = $scope.children[1].children[
        $scope.children[1].children.length - 1];
      expect(node.demotable).toBeTruthy();
      $scope.demote(node);
      expect(parent.children.length).toEqual(1);
      expect(parent.children[0]).toBe(node);
      expect(node.demotable).toBeFalsy();
      expect(node.index).toBe(0);
    }));

    it('nodes with parents may be promoted', inject(function () {
      var parent = $scope.children[1];
      var node = parent.children[1];
      $scope.listChildren(parent);
      expect(node.promotable).toBeTruthy();
      $scope.promote(node);
      expect($scope.children[2]).toBe(node);
      expect(node.parent).toBeUndefined();
      expect(node.promotable).toBeFalsy();
      expect(node.index).toBe(2);
    }));
    it('nodes without parents may not be promoted', inject(function () {
      var node = $scope.children[1];
      expect(node.promotable).toBeFalsy();
      expect(function () {
        $scope.promote(node);
      }).toThrow(new Error("Cannot promote nodes without parents!"));
    }));
  });
});
