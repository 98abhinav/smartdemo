define(['app/app', 'angularAMD','smartTable', 'ngScrollbar'], function (app, authPoliciesModule,smartTable, ngScrollbar)
{
//alert(app.appConfig.restUrl);
    authPoliciesModule.controller('authpolicyController',
            [
                '$scope','$rootScope', '$cookies', '$routeParams', '$location', 'ngProgress', 'toastr',
                function ($scope, $rootScope, $cookies, $routeParams, $location, ngProgress, toastr)
                {

                    ngProgress.start();

                    //$scope.module = $location.url();
                    $rootScope.module = 'authpolicy';
                    $scope.applicationId = $routeParams.applicationID; // application ID
                    
                    $scope.isLoading = false;
                    $scope.itemsByPage = 20;
                    $scope.paginationPageSizes = [20, 50, 100];
                    $scope.authpolicy = [
                        {
                            name: 'Policy 1',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                },
                                {
                                    id: 5,
                                    name: "Target 5"
                                },
                                {
                                    id: 6,
                                    name: "Target 6"
                                },
                                {
                                    id: 7,
                                    name: "Target 7"
                                },
                                {
                                    id: 8,
                                    name: "Target 8"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                },
                                {
                                    id: 5,
                                    name: "Principal 1"
                                },
                                {
                                    id: 6,
                                    name: "Principal 2"
                                },
                                {
                                    id: 7,
                                    name: "Principal 3"
                                },
                                {
                                    id: 8,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 2',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                },
                                {
                                    id: 5,
                                    name: "Target 5"
                                },
                                {
                                    id: 6,
                                    name: "Target 6"
                                },
                                {
                                    id: 7,
                                    name: "Target 7"
                                },
                                {
                                    id: 8,
                                    name: "Target 8"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                },
                                {
                                    id: 5,
                                    name: "Principal 1"
                                },
                                {
                                    id: 6,
                                    name: "Principal 2"
                                },
                                {
                                    id: 7,
                                    name: "Principal 3"
                                },
                                {
                                    id: 8,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'That function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 3',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                },
                                {
                                    id: 5,
                                    name: "Target 5"
                                },
                                {
                                    id: 6,
                                    name: "Target 6"
                                },
                                {
                                    id: 7,
                                    name: "Target 7"
                                },
                                {
                                    id: 8,
                                    name: "Target 8"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                },
                                {
                                    id: 5,
                                    name: "Principal 1"
                                },
                                {
                                    id: 6,
                                    name: "Principal 2"
                                },
                                {
                                    id: 7,
                                    name: "Principal 3"
                                },
                                {
                                    id: 8,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 4',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                },
                                {
                                    id: 5,
                                    name: "Target 5"
                                },
                                {
                                    id: 6,
                                    name: "Target 6"
                                },
                                {
                                    id: 7,
                                    name: "Target 7"
                                },
                                {
                                    id: 8,
                                    name: "Target 8"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                },
                                {
                                    id: 5,
                                    name: "Principal 1"
                                },
                                {
                                    id: 6,
                                    name: "Principal 2"
                                },
                                {
                                    id: 7,
                                    name: "Principal 3"
                                },
                                {
                                    id: 8,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 5',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                }, {
                                    id: 5,
                                    name: "Target 5"
                                },
                                {
                                    id: 6,
                                    name: "Target 6"
                                },
                                {
                                    id: 7,
                                    name: "Target 7"
                                },
                                {
                                    id: 8,
                                    name: "Target 8"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                },
                                {
                                    id: 5,
                                    name: "Principal 1"
                                },
                                {
                                    id: 6,
                                    name: "Principal 2"
                                },
                                {
                                    id: 7,
                                    name: "Principal 3"
                                },
                                {
                                    id: 8,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 6',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                },
                                {
                                    id: 5,
                                    name: "Target 5"
                                },
                                {
                                    id: 6,
                                    name: "Target 6"
                                },
                                {
                                    id: 7,
                                    name: "Target 7"
                                },
                                {
                                    id: 8,
                                    name: "Target 8"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                },
                                {
                                    id: 5,
                                    name: "Principal 1"
                                },
                                {
                                    id: 6,
                                    name: "Principal 2"
                                },
                                {
                                    id: 7,
                                    name: "Principal 3"
                                },
                                {
                                    id: 8,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 7',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                },
                                {
                                    id: 5,
                                    name: "Target 5"
                                },
                                {
                                    id: 6,
                                    name: "Target 6"
                                },
                                {
                                    id: 7,
                                    name: "Target 7"
                                },
                                {
                                    id: 8,
                                    name: "Target 8"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                },
                                {
                                    id: 5,
                                    name: "Principal 1"
                                },
                                {
                                    id: 6,
                                    name: "Principal 2"
                                },
                                {
                                    id: 7,
                                    name: "Principal 3"
                                },
                                {
                                    id: 8,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 8',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                },
                                {
                                    id: 5,
                                    name: "Target 5"
                                },
                                {
                                    id: 6,
                                    name: "Target 6"
                                },
                                {
                                    id: 7,
                                    name: "Target 7"
                                },
                                {
                                    id: 8,
                                    name: "Target 8"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                },
                                {
                                    id: 5,
                                    name: "Principal 1"
                                },
                                {
                                    id: 6,
                                    name: "Principal 2"
                                },
                                {
                                    id: 7,
                                    name: "Principal 3"
                                },
                                {
                                    id: 8,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 9',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                },
                                {
                                    id: 5,
                                    name: "Target 5"
                                },
                                {
                                    id: 6,
                                    name: "Target 6"
                                },
                                {
                                    id: 7,
                                    name: "Target 7"
                                },
                                {
                                    id: 8,
                                    name: "Target 8"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                },
                                {
                                    id: 5,
                                    name: "Principal 1"
                                },
                                {
                                    id: 6,
                                    name: "Principal 2"
                                },
                                {
                                    id: 7,
                                    name: "Principal 3"
                                },
                                {
                                    id: 8,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 10',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                },
                                {
                                    id: 5,
                                    name: "Target 5"
                                },
                                {
                                    id: 6,
                                    name: "Target 6"
                                },
                                {
                                    id: 7,
                                    name: "Target 7"
                                },
                                {
                                    id: 8,
                                    name: "Target 8"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 11',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                },
                                {
                                    id: 5,
                                    name: "Target 5"
                                },
                                {
                                    id: 6,
                                    name: "Target 6"
                                },
                                {
                                    id: 7,
                                    name: "Target 7"
                                },
                                {
                                    id: 8,
                                    name: "Target 8"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                },
                                {
                                    id: 5,
                                    name: "Principal 1"
                                },
                                {
                                    id: 6,
                                    name: "Principal 2"
                                },
                                {
                                    id: 7,
                                    name: "Principal 3"
                                },
                                {
                                    id: 8,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 12',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 13',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                },
                                {
                                    id: 5,
                                    name: "Principal 1"
                                },
                                {
                                    id: 6,
                                    name: "Principal 2"
                                },
                                {
                                    id: 7,
                                    name: "Principal 3"
                                },
                                {
                                    id: 8,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 14',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 15',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                },
                                {
                                    id: 5,
                                    name: "Principal 1"
                                },
                                {
                                    id: 6,
                                    name: "Principal 2"
                                },
                                {
                                    id: 7,
                                    name: "Principal 3"
                                },
                                {
                                    id: 8,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 16',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 17',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                },
                                {
                                    id: 5,
                                    name: "Principal 1"
                                },
                                {
                                    id: 6,
                                    name: "Principal 2"
                                },
                                {
                                    id: 7,
                                    name: "Principal 3"
                                },
                                {
                                    id: 8,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 18',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 19',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                },
                                {
                                    id: 5,
                                    name: "Principal 1"
                                },
                                {
                                    id: 6,
                                    name: "Principal 2"
                                },
                                {
                                    id: 7,
                                    name: "Principal 3"
                                },
                                {
                                    id: 8,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        },
                        {
                            name: 'Policy 20',
                            targets: [
                                {
                                    id: 1,
                                    name: "Target 1"
                                },
                                {
                                    id: 2,
                                    name: "Target 2"
                                },
                                {
                                    id: 3,
                                    name: "Target 3"
                                },
                                {
                                    id: 4,
                                    name: "Target 4"
                                }
                            ],
                            principals: [
                                {
                                    id: 1,
                                    name: "Principal 1"
                                },
                                {
                                    id: 2,
                                    name: "Principal 2"
                                },
                                {
                                    id: 3,
                                    name: "Principal 3"
                                },
                                {
                                    id: 4,
                                    name: "Principal 4"
                                }
                            ],
                            description: 'This function takes a bag of OpssDouble values and returns the value in the bag if bag contains only one value. Otherwise its result is Indeterminate'
                        }
                    ];


                    $scope.selectAuthpolicy = function (authpolicydetails) {
                        $scope.selectedAuthpolicy = authpolicydetails;
                        $scope.showInfo = true;
                        triggerButton('edit-overlay');
                    };

                    $scope.next = function () {
                        $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2);
                    };
                    $scope.previous = function () {
                        $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
                    };

                    $scope.searchIcon = true;
                    $scope.startSearch = function () {
                        $scope.searchBox = true;
                        $scope.focusInput = true;
                    };
                    $scope.endSearch = function () {
                        $scope.searchBox = false;
                        $scope.search = '';
                    };
                   /******Scroll bar setting start*************/                     
                    $scope.$applyAsync(function () {
                        $('#scrolltable').slimScroll({
                            height: $rootScope.listscrolltable.height,
                            color : $rootScope.listscrolltable.color                            
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#scrollrightdiv').slimScroll({
                            height: $rootScope.listscrollrightdiv.height,
                            width : $rootScope.listscrollrightdiv.width,
                            color : $rootScope.listscrolltable.color
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#scrolltarget').slimScroll({
                            height: $rootScope.listscrollrightinnerdiv.height,
                            color : $rootScope.listscrollrightinnerdiv.color  
                        });
                    });
                    $scope.$applyAsync(function () {
                        $('#scrollgroup').slimScroll({
                            height: $rootScope.listscrollrightinnerdiv.height,
                            color : $rootScope.listscrollrightinnerdiv.color  
                        });
                    });
                    /******Scroll bar setting end*************/
                    ngProgress.complete();
                }
            ]);


    authPoliciesModule.controller('authpolicyprincipalController',
            [
                '$scope', '$cookies', '$location', 'ngProgress', 'toastr',
                function ($scope, $cookies, $location, ngProgress, toastr)
                {
                    ngProgress.start();

                    $scope.items = [
                        {
                            "label": "Admin"
                        },
                        {
                            "label": "Credit Appover"
                        },
                        {
                            "label": "Admin 2"
                        },
                        {
                            "label": "Deployer 2"
                        },
                        {
                            "label": "Moniter"
                        },
                        {
                            "label": "Operator"
                        },
                        {
                            "label": "Item 16"
                        },
                        {
                            "label": "Operator 2"
                        },
                        {
                            "label": "Trade Publish"
                        },
                        {
                            "label": "Authenticated User"
                        },
                        {
                            "label": "Admin"
                        },
                        {
                            "label": "Credit Appover"
                        },
                        {
                            "label": "Admin 2"
                        },
                        {
                            "label": "Deployer 2"
                        },
                        {
                            "label": "Moniter"
                        },
                        {
                            "label": "Operator"
                        },
                        {
                            "label": "Item 16"
                        },
                        {
                            "label": "Operator 2"
                        },
                        {
                            "label": "Trade Publish"
                        },
                        {
                            "label": "Authenticated User"
                        }
                    ];
                    
                    $scope.principals = [
                        {
                            "label": "Admin"
                        },
                        {
                            "label": "Credit Appover"
                        },
                        {
                            "label": "Admin 2"
                        },
                        {
                            "label": "Deployer 2"
                        },
                        {
                            "label": "Moniter"
                        },
                        {
                            "label": "Operator"
                        },
                        {
                            "label": "Item 16"
                        },
                        {
                            "label": "Operator 2"
                        },
                        {
                            "label": "Trade Publish"
                        },
                     ];
                    $scope.module = $location.url();

                    $scope.dragoverCallback = function (event, index, external, type) {
                        $scope.logListEvent('dragged over', event, index, external, type);
                        return index > 0;
                    };

                    $scope.dropCallback = function (event, index, item, external, type, allowedType) {
                        $scope.logListEvent('dropped at', event, index, external, type);
                        if (external) {
                            if (allowedType === 'itemType' && !item.label)
                                return false;
                            if (allowedType === 'containerType' && !angular.isArray(item))
                                return false;
                        }
                        return item;
                    };

                    $scope.logEvent = function (message, event) {
                        console.log(message, '(triggered by the following', event.type, 'event)');
                        console.log(event);
                    };

                    $scope.logListEvent = function (action, event, index, external, type) {
                        var message = external ? 'External ' : '';
                        message += type + ' element is ' + action + ' position ' + index;
                        $scope.logEvent(message, event);
                    };

                    $scope.model = [];

                    // Initialize model
                    var id = 10;
                    for (var i = 0; i < 3; ++i) {
                        $scope.model.push([]);
                        for (var j = 0; j < 2; ++j) {
                            $scope.model[i].push([]);
                            for (var k = 0; k < 7; ++k) {
                                $scope.model[i][j].push({label: 'Item ' + id++});
                            }
                        }
                    }

                    $scope.$watch('model', function (model) {
                        $scope.modelAsJson = angular.toJson(model, true);
                    }, true);
                    ngProgress.complete();
                }
            ]);



});
