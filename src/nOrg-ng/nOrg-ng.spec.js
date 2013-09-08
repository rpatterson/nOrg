// Globals
var describe = describe;
var beforeEach = beforeEach;
var it = it;
var expect = expect;
var module = module;
var inject = inject;
describe('N-Org', function() {
  var $scope;
  var NOrgNodeCtrl;
  var json;

  beforeEach(module('nOrg'));

  beforeEach(inject(function($rootScope, $controller, $log) {
    $scope = $rootScope.$new();
    NOrgNodeCtrl = $controller("NOrgCtrl", {$scope: $scope});
  }));

  it('should exist', inject(function () {
    expect(NOrgNodeCtrl).toBeTruthy();
  }));

  describe('cursor:', function () {

  });
});
