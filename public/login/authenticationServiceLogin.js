//define(['public/app'], function (app)
//{

app.service('appConfig', function appConfig($rootScope) {
    /**
     * Load dependent file config/conf.js in app.js that has _environment variable defined
     */
    return {
        getEnvironment: function () {
            var hostName = window.location.host;
            var hostArray = hostName.split(":");
            var host = hostArray[0];

            if (_environment) {
                return _environment;
            }

            for (var environment in _environments) {
                if (typeof _environments[environment].host && _environments[environment].host == host) {
                    _environment = environment;
                    return _environment;
                }
            }

            return null;
        },
        getEnvConfig: function () {
            return _environments[this.getEnvironment()].config;
        },
        get: function (property) {
            return _environments[this.getEnvironment()].config[property];
        }
    }

});

app.service('languageService',
        [
            '$http',
            function ($http)
            {
                this.getLanguage = function (language) {
                    var languageFilePath = 'config/languages/' + language + '.json';
                    return $http.get(languageFilePath);
                };
            }
        ]);
app.factory('userFactory',
        [
            '$http',
            function ($http)
            {
                var userFactory = {};
                userFactory.getCurrentUser = function ($scope) {
                    //var urlBase = $scope.config.apiPath + "/ESAdmin/v1/users/current";
                    var urlBase = $scope.config.apiPath + "/ESAdmin/getCurrentUser";
                    var config = {headers: {
                            'Authorization': 'Basic d2VudHdvcnRobWFuOkNoYW5nZV9tZQ==',
                            'Content-Type': 'text/plain'
                        }
                    };
                    return $http.get(urlBase, config);
                };
                return userFactory;
            }
        ]);


app.service('AuthenticationServiceLogin',
        [
            '$http', '$cookies', '$cookieStore', '$q', '$rootScope', '$timeout', 'Base64',
            function ($http, $cookies, $cookieStore, $q, $rootScope, $timeout, Base64)
            {
                var service = {};
                service.Login = function (username, password, callback) {
                    if (angular.isUndefined(username) || angular.isUndefined(password)) {
                        //callback('Username or password is incorrect');
                        return;
                    }

                    /* Dummy authentication for testing, uses $timeout to simulate api call
                     ----------------------------------------------*/
                    
//                     $timeout(function () {
//                     var response = '';
//                     response = {success: username === 'aurionpro' && password === 'password'};
//                     if (!response.success) {
//                     response.message = 'Username or password is incorrect';
//                     }
//                     callback(response);
//                     }, 500);
                     

                    $http({
                        method: "GET",
                        headers: {
                            'Authorization': 'Basic ' + Base64.encode(username + ':' + password),
                            'Content-Type': 'application/json'
                                    //'Accept': '*/*',
                                    //'X-Requested-With': 'XMLHttpRequest'
                                    //'Access-Control-Allow-Credentials': true
                        },
                        url: '/ESAdmin/doc/index.html'
                                //params: {usrname: username, passwd: password}
                    }).success(function (response, status, headers, config) {
                        var chkresponse = {success: status == '200'};
                        //console.log(headers());
                        //console.log(headers('Set-Cookie'));
                        //console.log($cookies.get('JSESSIONID'));
                        $timeout(function () {
                            //console.log($cookies);
                        });
                        if (!chkresponse.success) {
                            //console.log(chkresponse.success);
                            chkresponse.message = 'Username or password is incorrect';
                        }
                        callback(chkresponse);
                    }).error(function (response, status, headers, config) {
                        var chkresponse = {success: status == '200'};
                        //console.log(chkresponse);
                        console.log("Auth.signin.failed!")
//                            console.log("Status: " + status);
//                            console.log(headers());
                        //console.log(config);
                        if (!chkresponse.success) {
                            //console.log(chkresponse.success);
                            chkresponse.message = 'Username or password is incorrect';
                        }
                        callback(chkresponse);
                    });





                };



                service.SetCredentials = function (username) {
                    // var authdata = Base64.encode(username + ':' + password);
                    var authdata = Base64.encode(username);

                    $rootScope.authorization_token = {
                        currentUser: {
                            username: username,
                            authdata: authdata
                        }
                    };

                    $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
                    $cookieStore.put('authorization_token', $rootScope.authorization_token);
                };
                service.ClearCredentials = function ($scope) {
                    if (localStorage.getItem("selectedAppName") != null) {
                        localStorage.removeItem("selectedAppName");
                        localStorage.removeItem("selectedAppId");
                        localStorage.removeItem("selectedAppDesc");
                    }

                    // Remove session of Access list on logout * Do not remove *
                    delete sessionStorage.access;
                    delete localStorage['sources'];
                    delete localStorage['access'];
                    delete localStorage['superaccess'];
                    delete localStorage['previousUrl'];

                    //sessionStorage['logout'] = true;

                    $rootScope.authorization_token = {};
                    //$cookieStore.remove('JSESSIONID');
                    $cookieStore.remove('authorization_token');

                    //$.cookie('JSESSIONID',Â null,Â {path:Â '/'});
                    /*var expireDate = new Date();
                     expireDate.setDate(expireDate.getDate() - 1);
                     // Setting a cookie
                     $cookies.put('JSESSIONID', null, {'expires': expireDate;'path':'/ESAdmin/'});*/
                    $http.defaults.headers.common.Authorization = 'Basic ';

                    //AuthenticationService.ClearCredentials();
                    var config = {headers: {
                            'Authorization': 'Basic d2VudHdvcnRobWFuOkNoYW5nZV9tZQ==',
                            'Content-Type': 'text/plain'
                        }
                    };
                    $http.get($scope.config.apiPath + '/ESAdmin/v1/users/logout', config).
                            then(function (response) {
                                //console.log(response);
                            }, function (error) {
                                //console.log(error);
                            });

                };

                return service;

            }
        ]);

app.service('Base64',
        [
            function ()
            {

                var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                return {
                    encode: function (input) {
                        var output = "";
                        var chr1, chr2, chr3 = "";
                        var enc1, enc2, enc3, enc4 = "";
                        var i = 0;
                        do {
                            chr1 = input.charCodeAt(i++);
                            chr2 = input.charCodeAt(i++);
                            chr3 = input.charCodeAt(i++);
                            enc1 = chr1 >> 2;
                            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                            enc4 = chr3 & 63;
                            if (isNaN(chr2)) {
                                enc3 = enc4 = 64;
                            } else if (isNaN(chr3)) {
                                enc4 = 64;
                            }

                            output = output +
                                    keyStr.charAt(enc1) +
                                    keyStr.charAt(enc2) +
                                    keyStr.charAt(enc3) +
                                    keyStr.charAt(enc4);
                            chr1 = chr2 = chr3 = "";
                            enc1 = enc2 = enc3 = enc4 = "";
                        } while (i < input.length);
                        return output;
                    },
                    decode: function (input) {
                        var output = "";
                        var chr1, chr2, chr3 = "";
                        var enc1, enc2, enc3, enc4 = "";
                        var i = 0;
                        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
                        var base64test = /[^A-Za-z0-9\+\/\=]/g;
                        if (base64test.exec(input)) {
                            window.alert("There were invalid base64 characters in the input text.\n" +
                                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                                    "Expect errors in decoding.");
                        }
                        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                        do {
                            enc1 = keyStr.indexOf(input.charAt(i++));
                            enc2 = keyStr.indexOf(input.charAt(i++));
                            enc3 = keyStr.indexOf(input.charAt(i++));
                            enc4 = keyStr.indexOf(input.charAt(i++));
                            chr1 = (enc1 << 2) | (enc2 >> 4);
                            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                            chr3 = ((enc3 & 3) << 6) | enc4;
                            output = output + String.fromCharCode(chr1);
                            if (enc3 != 64) {
                                output = output + String.fromCharCode(chr2);
                            }
                            if (enc4 != 64) {
                                output = output + String.fromCharCode(chr3);
                            }

                            chr1 = chr2 = chr3 = "";
                            enc1 = enc2 = enc3 = enc4 = "";
                        } while (i < input.length);
                        return output;
                    }
                };
            }
        ]);

//});






