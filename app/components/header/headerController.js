define(['app/app'], function (app)
{
    app.controller('headerController',
            [
                '$scope', '$rootScope', '$cookies', '$location', '$http', '$timeout', 'languageService', 'AuthenticationService',
                function ($scope, $rootScope, $cookies, $location, $http, $timeout, languageService, AuthenticationService)
                {
                    $scope.logout = function () {


                        AuthenticationService.ClearCredentials();

                    } // EO function $scope.logout

                    var modulename = $rootScope.module;

                    $(document).ready(function () {
                        //user menu
                        $("#user_name_login").click(function () {
                            $("#cbp-tm-submenu_login").fadeToggle();
                        });
                        //Mouseup textarea false
                        $("#cbp-tm-submenu_login").mouseup(function () {
                            return false
                        });
                        $("#user_name_login").mouseup(function () {
                            return false
                        });
                        //Textarea without editing.
                        $(document).mouseup(function () {
                            $("#cbp-tm-submenu_login").hide();
                            $("#user_name_login").attr('id', '');
                        });
                        //arrow up down 
                        $('#user_dtl_login').click(function (event) {
                            $("#arowdown,#arowup").toggle();
                        });
                        $(document).mouseup(function () {
                            $("#arowup").hide();
                            $("#arowdown").show();
                        });
                        //arrow up down end
                    });
                    //user menu end
                    $scope.redirect = function () { 
                        window.location = $rootScope.config.domainPath + "/doc";
                    }

                    // Toggle menu on click
                    $scope.toggleAppMenu = function () {
                    	if ($rootScope.noappmenumodules.indexOf(modulename) != -1) {
                    		return;
                    	}
                        //console.log('$rootScope.showappmenu',$rootScope.showappmenu);
                    	if ($rootScope.showappmenu) {
                    		hideVerticalCanvas("#appmenu-dropdown");
                    		$timeout(function(){
                    			$rootScope.showappmenu = false;
                    		},700);
                    	} else {
                    		$rootScope.showappmenu = true;
                    		$timeout(function(){
                    			showVerticalCanvas("#appmenu-dropdown", true);
                    		},100);
                    	}
                    };
                    $scope.toggleSourceMenu = function () {
                    	if ($rootScope.sourcemenumodules.indexOf(modulename) == -1) {
                    		return;
                    	}
                        //console.log('$rootScope.showsourcemenu',$rootScope.showsourcemenu);
                    	if ($rootScope.showsourcemenu) {
                    		hideVerticalCanvas("#sourcemenu-dropdown");
                    		$timeout(function(){
                    			$rootScope.showsourcemenu = false;
                    		},400);
                    	} else {
                    		$rootScope.showsourcemenu = true;
                    		$timeout(function(){
                    			showVerticalCanvas("#sourcemenu-dropdown", true);
                    		},100);
                    	}
                    };
                    
                }
            ]);

    app.controller('menuController',
            [
                '$scope', '$rootScope', '$cookies', '$location', 'languageService', 'AuthenticationService',
                function ($scope, $rootScope, $cookies, $location, languageService, AuthenticationService)
                {
                    var modulename = $rootScope.module;

                    $rootScope.showsourcemenu = false;
                    $rootScope.showappmenu = false;
                    $(document).ready(function () {
                        // Slide menu on page load
                        var tm;
                        if ($rootScope.noappmenumodules.indexOf(modulename) == -1) {
                            if (!$rootScope.showappmenu) {
                            	$rootScope.showappmenu = true;
                        		showVerticalCanvas("#appmenu-dropdown", true);
                        	}
                            if (modulename == 'homeapplication') {
                            	$rootScope.showappmenu = true;
                                setTimeout(function () {
                                    showVerticalCanvas("#appmenu-dropdown", true);
                                }, 100);
                            }
                        } else if ($rootScope.sourcemenumodules.indexOf(modulename) != -1) {
                            if (!$rootScope.showsourcemenu) {
                            	$rootScope.showsourcemenu = true;
                        		showVerticalCanvas("#sourcemenu-dropdown", true);
                        	}
                            if(modulename == 'sources') {
                            	$rootScope.showsourcemenu = true;
                                setTimeout(function(){
                                	showVerticalCanvas("#sourcemenu-dropdown",true);
                                }, 100);
                            }
                        }

/*                      
						// Slide Application menu start
                        $(document).on('mouseenter', '.menu_trigger, #appmenu-dropdown', function () {
                            clearTimeout(tm);
                            $scope.$applyAsync(function () {
                                $scope.showsourcemenu = false;
                                $scope.showappmenu = true;
                            });
                            showVerticalCanvas("#appmenu-dropdown", true);

                        }).on('mouseleave', '.menu_trigger, #appmenu-dropdown', function () {
                            if ($rootScope.module != 'homeapplication') {
                                hideVerticalCanvas("#appmenu-dropdown");
                            }
                        });
                        // Slide Application menu end

                        // Slide Source menu start
                        $(document).on('mouseenter', '.sourcemenu_trigger, #sourcemenu-dropdown', function () {
                            $scope.$applyAsync(function () {
                                $scope.showsourcemenu = true;
                                $scope.showappmenu = false;
                            });
                            showVerticalCanvas("#sourcemenu-dropdown", true);

                        }).on('mouseleave', '.sourcemenu_trigger, #sourcemenu-dropdown', function () {
                            //if($rootScope.module!='sources') {
                            hideVerticalCanvas("#sourcemenu-dropdown");
                            //}
                        });
                        // Slide Source menu end

                        $(document).on('click', 'menu_trigger > a, a.main_content', function () {
                            clearTimeout();
                        });
*/                        
                        
                    });
                }
            ]);

    app.controller('headerMobController',
            [
                '$scope',
                function ($scope)
                {

                    $scope.hidefunc = function () {
                        $scope.displayname = false;
                    };
                    $scope.tool = true;
                    $scope.dropdownfunc = function () {
                        $scope.tool = !$scope.tool;
                    };

                    $scope.fontinfo = true;
                    $scope.fontfunc = function () {
                        $scope.mysearchbox = true;
                        $scope.sourceinfo = true;
                        $scope.fontinfo = !$scope.fontinfo;
                    };
                    $scope.sourceinfo = true;
                    $scope.sourcefunc = function () {
                        $scope.fontinfo = true;
                        $scope.mysearchbox = true;
                        $scope.sourceinfo = !$scope.sourceinfo;
                    };

                    $scope.mysearchbox = true;
                    $scope.toggle = function () {
                        $scope.mysearchbox = !$scope.mysearchbox;
                    };
                    $scope.role = true;
                    $scope.rolefunc = function () {
                        $scope.displayname = true;
                        $scope.principal = true;
                        $scope.name = true;
                        $scope.target = true;
                        $scope.role = !$scope.role;
                    };

                    $scope.displayname = true;
                    $scope.displaynamefunc = function () {
                        $scope.role = true;
                        $scope.principal = true;
                        $scope.name = true;
                        $scope.target = true;

                        $scope.displayname = !$scope.displayname;
                    };

                    $scope.principal = true;
                    $scope.principalfunc = function () {
                        $scope.role = true;
                        $scope.displayname = true;
                        $scope.name = true;
                        $scope.target = true;

                        $scope.principal = !$scope.principal;
                    };
                    $scope.name = true;
                    $scope.namefunc = function () {
                        $scope.role = true;
                        $scope.displayname = true;
                        $scope.principal = true;
                        $scope.target = true;
                        $scope.name = !$scope.name;
                    };
                    $scope.target = true;
                    $scope.targetfunc = function () {
                        $scope.role = true;
                        $scope.displayname = true;
                        $scope.principal = true;
                        $scope.name = true;
                        $scope.target = !$scope.target;
                    };

                    //For hiding input_wrapper
                    $scope.rolehidefunc = function () {

                        $scope.role = true;
                    };
                    $scope.displayhidefunc = function () {

                        $scope.displayname = true;
                    };
                    $scope.principalhidefunc = function () {

                        $scope.principal = true;
                    };
                    $scope.namehidefunc = function () {

                        $scope.name = true;
                    };
                    $scope.targethidefunc = function () {

                        $scope.target = true;
                    };


                }
            ]);
});


function showVerticalCanvas(n, animate) {
    $(n).addClass("front");
    //$(n).show();
    var a = $(n).height();

    if (animate == false) {
        $(".site-canvas").addClass('no-animate');
    } else {
        $(".site-canvas").removeClass('no-animate');
    }
    if (n == '#sourcemenu-dropdown') {
        $(".site-canvas").addClass('animate-fast');
    } else {
        $(".site-canvas").removeClass('animate-fast');
    }
    $(".site-canvas").css({
        "-ms-transform": "translate3d(0, " + a + "px, 0)",
        "-moz-transform": "translate3d(0, " + a + "px, 0)",
        "-o-transform": "translate3d(0, " + a + "px, 0)",
        "-webkit-transform": "translate3d(0, " + a + "px, 0)",
        transform: "translate3d(0, " + a + "px, 0)"
    });
    $(".expand_menu").show();
}

function hideVerticalCanvas(n) {
    $(".site-canvas")
            .removeClass('no-animate')
            .css({
                "-ms-transform": "none",
                "-moz-transform": "none",
                "-o-transform": "none",
                "-webkit-transform": "none",
                transform: "none"
            });
    $(n).removeClass("front");
    //$(n).hide();
    $(".expand_menu").hide();
}
