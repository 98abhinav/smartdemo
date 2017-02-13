
define([], function ()
{
    return {
        defaultRoutePath: '/',
        routes: {
//            '/': {
//                templateUrl: "app/view/login/login.html",
//                dependencies: [
//                    'app/components/login/loginController'
//                ]
//            },
//            '/login': {
//                templateUrl: "app/view/login/login.html",
//                dependencies: [
//                    'app/components/login/loginController'
//                ]
//            },

            '/application/:mode/:applicationID?': {
                templateUrl: "app/view/applications/application.html",
                dependencies: [
                    'app/components/applications/applicationController',
                    'app/components/applications/applicationService',
                    'app/components/source/sourceService'
                ]
            },
            '/delegatedadmin/:applicationID?': {
                templateUrl: "app/view/applications/delegatedadmin.html",
                dependencies: [
                    'app/components/applications/applicationController',
                    'app/components/applications/applicationService',
                    'app/components/source/sourceService',
                    'app/components/source/usersService',
                    'app/components/source/groupsService'

                ]
            },
            '/home': {
                templateUrl: "app/view/home/home.html",
                dependencies: [
                    'app/components/home/homeController',
                    'app/components/applications/applicationService',
                    'app/components/source/sourceService'
                ]
            },
            '/home/:applicationID': {
                templateUrl: "app/view/home/homeapplication.html",
                dependencies: [
                    'app/components/home/homeController',
                    'app/components/applications/applicationService'
                ]
            },
            '/:applicationID/roles': {
                templateUrl: "app/view/roles/role.html",
                dependencies: [
                    'app/components/roles/roleController',
                    'app/components/roles/roleService',
                    'app/components/source/sourceService'
                ]
            },
            '/:applicationID/roles/search': {
                templateUrl: "app/view/roles/rolesearch.html",
                dependencies: [
                    'app/components/roles/roleController',
                    'app/components/roles/roleService',
                    'app/components/source/sourceService',
                    'app/components/source/usersService',
                    'app/components/source/groupsService',
                ]
            },
            '/:applicationID/roles/:mode/:roleID?': {
                templateUrl: "app/view/roles/managerole.html",
                dependencies: [
                    'app/components/roles/roleController',
                    'app/components/roles/roleService'
                ]
            },
            '/:applicationID/roles/hierarchy': {
                templateUrl: "app/view/roles/rolehierarchy.html",
                dependencies: [
                    'app/components/roles/roleController',
                    'app/components/roles/roleService'
                ]
            },
            '/:applicationID/rolemembers': {
                templateUrl: "app/view/rolemembership/rolemembership.html",
                dependencies: [
                    'app/components/rolemembership/rolemembershipController',
                    'app/components/rolemembership/rolemembershipService'
                ]
            },
            '/:applicationID/rolemembers/:mode/:roleMemberID?': {
                templateUrl: "app/view/rolemembership/managerolemembership.html",
                dependencies: [
                    'app/components/rolemembership/rolemembershipController',
                    'app/components/rolemembership/rolemembershipService',
                    'app/components/roles/roleService',
                    'app/components/source/sourceService',
                    'app/components/source/usersService',
                    'app/components/source/groupsService'
                ]
            },
            '/:applicationID/resourcegroups': {
                templateUrl: "app/view/resourcegroup/resourcegroup.html",
                dependencies: [
                    'app/components/resourcegroup/resourcegroupController',
                    'app/components/resourcegroup/resourcegroupService',
                    'app/components/resourcetype/resourcetypeService'
                ]
            },
            '/:applicationID/resourcegroups/search': {
                templateUrl: "app/view/resourcegroup/resourcegroupsearch.html",
                dependencies: [
                    'app/components/resourcegroup/resourcegroupController',
                    'app/components/resourcegroup/resourcegroupService',
                    'app/components/applications/applicationService',
                    'app/components/resourcetype/resourcetypeService',
                    'app/components/resources/resourcesService'
                ]
            },
            '/:applicationID/resourcegroups/:mode/:resourceGroupID?': {
                templateUrl: "app/view/resourcegroup/manageresourcegroup.html",
                dependencies: [
                    'app/components/resourcegroup/resourcegroupController',
                    'app/components/resourcegroup/resourcegroupService',
                    'app/components/resources/resourcesService'
                ]
            },
            '/:applicationID/resourcegroups/resources/:mode/:resourceGroupID?': {
                templateUrl: "app/view/resourcegroup/manageresourcegroupresources.html",
                dependencies: [
                    'app/components/resourcegroup/resourcegroupController',
                    'app/components/resourcegroup/resourcegroupService',
                    'app/components/resources/resourcesService'
                ]
            },
            '/sources': {
                templateUrl: "app/view/source/source.html",
                dependencies: [
                    'app/components/source/sourceController',
                    'app/components/source/sourceService'
                ]
            },
            '/sources/:mode/:sourceID?': {
                templateUrl: "app/view/source/managesource.html",
                dependencies: [
                    'app/components/source/sourceController',
                    'app/components/source/sourceService'
                ]
            },
            '/:sourceID/users': {
                templateUrl: "app/view/source/users.html",
                dependencies: [
                    'app/components/source/usersController',
                    'app/components/source/usersService',
                    'app/components/source/sourceController',
                    'app/components/source/sourceService'
                ]
            },
            '/users/:sourceID/search': {
                templateUrl: "app/view/source/usersearch.html",
                dependencies: [
                    'app/components/source/usersController',
                    'app/components/source/usersService',
                    'app/components/source/sourceController',
                    'app/components/source/sourceService'
                ]
            },
            '/users/:sourceID/view': {
                templateUrl: "app/view/source/userview.html",
                dependencies: [
                    'app/components/source/usersController'
                ]
            },
            '/:sourceID/groups': {
                templateUrl: "app/view/source/groups.html",
                dependencies: [
                    'app/components/source/groupsController',
                    'app/components/source/groupsService',
                    'app/components/source/sourceController',
                    'app/components/source/sourceService'
                ]
            },
            '/:applicationID/resourcetypes': {
                templateUrl: "app/view/resourcetype/resourcetype.html",
                dependencies: [
                    'app/components/resourcetype/resourcetypeController',
                    'app/components/resourcetype/resourcetypeService'
                ]
            },
            '/:applicationID/resourcetypes/:mode/:resourceTypeId?': {
                templateUrl: "app/view/resourcetype/manageresourcetype.html",
                dependencies: [
                    'app/components/resourcetype/resourcetypeController',
                    'app/components/resourcetype/resourcetypeService',
                    'app/components/actions/actionsService'
                ]
            },
            '/:applicationID/functions': {
                templateUrl: "app/view/functions/function.html",
                dependencies: [
                    'app/components/functions/functionController',
                    'app/components/functions/functionService'
                ]
            },
            '/:applicationID/functions/:mode/:functionId?': {
                templateUrl: "app/view/functions/managefunction.html",
                dependencies: [
                    'app/components/functions/functionController',
                    'app/components/functions/functionService'
                ]
            },
            '/:applicationID/actions': {
                templateUrl: "app/view/actions/action.html",
                dependencies: [
                    'app/components/actions/actionsController',
                    'app/components/actions/actionsService'
                ]
            },
            '/:applicationID/actions/:mode/:actionID?': {
                templateUrl: "app/view/actions/manageaction.html",
                dependencies: [
                    'app/components/actions/actionsController',
                    'app/components/actions/actionsService'
                ]
            },
            '/:applicationID/authpolicy': {
                templateUrl: "app/view/authorizationpolicy/authpolicy.html",
                dependencies: [
                    'app/components/authorizationpolicy/authpolicyController'
                ]
            },
            '/:applicationID/policies/:policyType': {
                templateUrl: "app/view/policies/policy.html",
                dependencies: [
                    'app/components/policies/policiesController',
                    'app/components/policies/policiesService',
                    'app/components/roles/roleService',
                    'app/components/source/sourceService'
                ]
            },
            '/:applicationID/policies/:policyType/:mode/:policyid?': {
                templateUrl: "app/view/policies/managepolicy.html",
                dependencies: [
                    'app/components/policies/managepoliciesController',
                    'app/components/policies/policiesService',
                    'app/components/roles/roleService',
                    'app/components/functions/functionService',
                    'app/components/resources/resourcesService',
                    'app/components/resourcetype/resourcetypeService',
                    'app/components/resourcegroup/resourcegroupService',
                    'app/components/source/usersService',
                    'app/components/source/groupsService',
                    'app/components/source/sourceService'
                ]
            },
            '/:applicationID/search/policies/roles': {
                templateUrl: "app/view/policies/rolepolicysearch.html",
                dependencies: [
                    'app/components/policies/searchPoliciesController',
                    'app/components/policies/policiesService',
                    'app/components/applications/applicationService',
                    'app/components/roles/roleService',
                    'app/components/resources/resourcesService'
                ]
            },
            '/:applicationID/search/policies/users': {
                templateUrl: "app/view/policies/userpolicysearch.html",
                dependencies: [
                    'app/components/policies/searchPoliciesController',
                    'app/components/policies/policiesService',
                    'app/components/applications/applicationService',
                    'app/components/source/sourceService',
                    'app/components/source/usersService',
                    'app/components/resources/resourcesService'
                ]
            },
            '/:applicationID/search/policies/groups': {
                templateUrl: "app/view/policies/grouppolicysearch.html",
                dependencies: [
                    'app/components/policies/searchPoliciesController',
                    'app/components/policies/policiesService',
                    'app/components/applications/applicationService',
                    'app/components/source/sourceService',
                    'app/components/source/groupsService',
                    'app/components/resources/resourcesService'
                ]
            },
            '/:applicationID/resources': {
                templateUrl: "app/view/resources/resources.html",
                dependencies: [
                    'app/components/resources/resourcesController',
                    'app/components/resources/resourcesService',
                    'app/components/resourcetype/resourcetypeService',
                    'app/components/policies/policiesService',
                ]
            },
            '/:applicationID/resources/search': {
                templateUrl: "app/view/resources/resourcesearch.html",
                dependencies: [
                    'app/components/resources/resourcesController',
                    'app/components/resources/resourcesService',
                    'app/components/applications/applicationService',
                    'app/components/resourcetype/resourcetypeService'
                ]
            },            
            '/:applicationID/resources/:mode/:resourceID?': {
                templateUrl: "app/view/resources/manageresource.html",
                dependencies: [
                    'app/components/resources/resourcesController',
                    'app/components/resources/resourcesService'
                ]
            },
            '/systemadministrators': {
                templateUrl: "app/view/systemadministrators/systemadministrators.html",
                dependencies: [
                    'app/components/systemadministrators/systemadministratorsController',
                    'app/components/systemadministrators/systemadministratorsService',
                    'app/components/source/sourceService'
                ]
            },
            '/systemadministrators/:mode': {
                templateUrl: "app/view/systemadministrators/managesystemadministrators.html",
                dependencies: [
                    'app/components/systemadministrators/systemadministratorsController',
                    'app/components/systemadministrators/systemadministratorsService',
                    'app/components/roles/roleService',
                    'app/components/source/sourceService',
                    'app/components/source/usersService',
                    'app/components/source/groupsService'
                ]
            },
            '/reports':{
                templateUrl: "app/view/reports/reports.html",
                dependencies: [
                    'app/components/reports/reportsController',
                    'app/components/reports/reportsService',
                    'app/components/applications/applicationService',
                    'app/components/source/sourceService',
                    'app/components/source/usersService'
                ]
            }
            

        }
    };
});
