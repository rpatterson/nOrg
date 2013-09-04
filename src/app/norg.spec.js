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

  });
});
