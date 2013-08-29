angular.module( 'nOrg', [
])

  .controller( 'NOrgCtrl', function NOrgCtrl ( $scope, $http ) {
    var reserved_headers = {"Subject": true, "Message-ID": true};
    $scope.listChildren = function (parent) {
      if (arguments.length === 0) {
        parent = $scope;
      }
      return function( node ) {
        node.parent = parent;

        node.id = window.btoa(node.headers["Message-ID"]).slice(0, -1);

        node.header_keys = [];
        for (var key in node.headers) {
          if (!(key in reserved_headers)) {
            node.header_keys.push(key);
          }}
        
        return true;
      };
    };
    $http.get('app/nodes.json').success(function(data) {
      $scope.children = data;
    });
  });

//NOrgCtrl.$inject = ['$scope', '$http'];
