describe( 'NOrgCtrl', function() {
  describe( 'N-Org Editing Control', function() {
    var NOrgCtrl, $location, $scope;

    beforeEach( module( 'nOrg' ) );

    beforeEach( inject( function( $controller, _$location_, $rootScope ) {
      $location = _$location_;
      $scope = $rootScope.$new();
      NOrgCtrl = $controller( 'NOrgCtrl', { $location: $location, $scope: $scope });
    }));

    it( 'should pass a dummy test', inject( function() {
      expect( NOrgCtrl ).toBeTruthy();
    }));
  });
});
