angular.module('nOrg', []).
    controller('NOrgCtrl', function($scope) {
        $scope.projects = [
            {"id": "/foo.nod",
             "headers": {"Subject": "Foo Project",
                         "Message-ID": "<1@foo.com>"},
            },
            {"id": "/bar/.nod",
             "headers": {"Subject": "Bar Project",
                         "Message-ID": "<2@foo.com>"},
             "children": [
                 {"id": "/bar/corge.nod",
                  "headers": {"Subject": "Corge Node",
                              "Message-ID": "<3@foo.com>"}},
                 {"id": "/bar/grault.nod",
                  "headers": {"Subject": "Grault Node",
                              "Message-ID": "<4@foo.com>"}},
                 {"id": "/bar/garply.nod",
                  "headers": {"Subject": "Garply Node",
                              "Message-ID": "<5@foo.com>"}},
             ]},
            {"id": "/qux/.nod/.nod",
             "headers": {"Subject": "Qux Project",
                         "Message-ID": "<6@foo.com>"},
            },
        ];
});
