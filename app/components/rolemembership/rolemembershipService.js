define(['app/app'], function (app)
{
    app.service('roleService',
            [
                '$http','$q',
                function ($http,$q)
                {
                    this.getroles = function () {
                        var myData = [];
                        var i = 0;
                        var def = $q.defer();
                        $http.get('http://localhost/entitlement/app/components/roles/role.json')
                        //$http.get('http://118.200.235.200:8090/ESAdmin/v1/applications?q=app&limit=10&offset=0&sort_by=name&sort_how=asc')
                        .success(function (data) {
                            data.roles.forEach(function (row) {
                                row.name = row.name + ' iter ' + i;
                                row.id = i;
                                i++;
                                //$scope.myData.push(row);
                                myData.push(row);
                            });
                            return(myData);
                        })
                        .error(function () {
                            def.reject('There was an error');
                        });
                        return def.promise;
                    }

                }
            ]);
});






