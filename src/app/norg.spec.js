describe( 'N-Org editing control', function() {
  var NOrgCtrl, $location, $scope;

  beforeEach( module( 'nOrg' ) );

  beforeEach( inject( function( $controller, _$location_, $rootScope ) {
    $location = _$location_;
    $scope = $rootScope.$new();
    NOrgCtrl = $controller( 'NOrgCtrl', { $location: $location, $scope: $scope });
  }));

  it( 'should exist', inject( function() {
    expect( NOrgCtrl ).toBeTruthy();
  }));

  it( 'should provide N-Org nodes', inject( function() {
    expect( $scope.projects.length ).toBeTruthy();
  }));

  // node children
  it( 'nodes may have children ', inject( function() {
    expect( $scope.projects.filter(function(node) {
      return node.children;
    }).length).toBeTruthy();
  }));
  it( 'nodes may not have children ', inject( function() {
    expect( $scope.projects.filter(function(node) {
      return ! node.children;
    }).length).toBeTruthy();
  }));

  // node ids
  it( 'generates an element id for nodes', inject( function() {
    $scope.projects.forEach($scope.sanitizeNode);
    expect( $scope.projects.filter(function(node) {
      return node.id;
    }).length).toEqual($scope.projects.length);
  }));
  it( 'generates valid, CSS select-able ids for nodes', inject( function() {
    $scope.projects.forEach($scope.sanitizeNode);
    expect( $scope.projects.filter(function(node) {
      return (/[<@\.>]/).test(node.id);
    }).length).toBeFalsy();
  }));

  // node headers
  it( 'generates a list of headers to display for nodes', inject( function() {
    $scope.projects.forEach($scope.sanitizeNode);
    expect( $scope.projects.filter(function(node) {
      return typeof node.header_keys != "undefined";
    }).length).toEqual($scope.projects.length);
  }));
  it( 'nodes may have visible headers', inject( function() {
    $scope.projects.forEach($scope.sanitizeNode);
    expect( $scope.projects.filter(function(node) {
      return node.header_keys.length;
    }).length).toBeTruthy();
  }));
  it( 'nodes may not have visible headers', inject( function() {
    $scope.projects.forEach($scope.sanitizeNode);
    expect( $scope.projects.filter(function(node) {
      return ! node.header_keys.length;
    }).length).toBeTruthy();
  }));
});
