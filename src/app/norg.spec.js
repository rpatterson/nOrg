describe('N-Org', function() {
  var $scope;
  var NOrgNodeCtrl;
  var json;

  beforeEach(module('nOrg'));

  beforeEach(inject(function($rootScope, $controller, $log) {
    $scope = $rootScope.$new();
    NOrgNodeCtrl = $controller("NOrgCtrl", {$scope: $scope});
    $log.debug = $log.info;
  }));

  it('should exist', inject(function () {
    expect(NOrgNodeCtrl).toBeTruthy();
  }));

  describe('cursor:', function () {

  });
});
