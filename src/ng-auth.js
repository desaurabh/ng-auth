'use strict';
(function(angular, AuthService) {
    angular.module("ngAuth", [])
        .provider("authService", function() {
            this.roles = [];
            this.user = {
                email: '',
                password: '',
                rememberMe: false
            };
            this.url = {
                login: '',
                logout: '',
                authenticate: '',
                home: ''
            };
            this.globalUrl = [];
            this.$get = function($http, $rootScope, $location) {
                var authService = new AuthService(this.roles, this.url, this.user, this.globalUrl, $http, $rootScope, $location);
                authService.authenticate(authService);
                return authService;
            };
        }).directive("only", function(authService, $rootScope) {
            return {
                restrict: 'A',
                link: function(scope, elem, attr) {
                    scope.$watch('authService.authorized', function(val, old) {
                        if (val) {
                            if (!authService.canAccess(attr.only) && attr.only !== 'all')
                                elem.css('display', 'none');
                            else elem.css('display', '');
                        } else if ((!old || old) && !val) elem.css('display', 'none');

                    }, true);
                }
            };
        }).directive("public", function(authService) {
            return {
                restrict: 'A',
                link: function(scope, elem, attr) {
                    scope.$watch('authService.authorized', function(val, old) {
                        if (val) elem.css('display', 'none');
                        else elem.css('display', '');
                    });
                }
            };
        });
})(angular, authService);


function authService(roles, url, user, globalUrl, $http, $rootScope, $location) {

    function Auth(roles, url, user, $http) {
        this.roles = roles;
        this.url = url;
        this.user = user;
        this.$http = $http;
        this.authorized = false;
        this.pendingAuth = false;
    }

    Auth.prototype.authenticate = function() {
        var promise = this.$http.get(this.url.authenticate);
        $rootScope.$broadcast("authenticating", promise);
        this.pendingAuth = promise;
        return promise;
    };

    Auth.prototype.login = function() {
        var promise = this.$http.post(this.url.login, this.user);
        $rootScope.$broadcast("authenticating", promise);
        return promise;
    };
    Auth.prototype.logout = function() {
        var promise = this.$http.post(this.url.logout);
        $rootScope.$broadcast("authenticating", promise);
        return promise;
    };
    
    Auth.prototype.canAccess = function(types) {
        types = types.split(",");
        var state = false;
        for (var t in types)
            if (types[t] === this.user.type) {
                state = true;
                break;
            } else state = false;

        return state;
    };


    var auth = new Auth(roles, url, user, $http);
    var isThisRegistered = function(originalPath) {
        var state = false;
        for (var i in globalUrl) {
            state = globalUrl[i] === originalPath;
            if (state) break;
        }
        return state;
    };
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        if (!auth.pendingAuth && typeof next!=='undefined') {
            if (!auth.authorized && next.hasOwnProperty('$$route')) {
                if (!isThisRegistered(next.$$route.originalPath))
                    $location.path(url.login);
            } else if (auth.authorized && next.hasOwnProperty('$$route') && next.$$route.originalPath === url.login) $location.path(url.home);
        }
    });


    $rootScope.$on("authenticating", function(event, next, current) {
        next.then(function(res) {
            auth.pendingAuth = false;
            if (next.$$state.value.config.url === url.logout) {
                auth.authorized = false;
                $location.path(url.login);
            } else {


                auth.user = res.data;
                var to = $location.$$url === url.login ? url.home : $location.$$url;
                $location.path(to);
                auth.authorized = true;
            }
        }, function(err) {
            auth.pendingAuth = false;
            if (next.$$state.value.config.url === url.logout)
                auth.authorized = true;
            else {
                auth.authorized = false;
                if (isThisRegistered($location.$$url)) $location.path($location.$$url);
                else $location.path(url.login);

            }
        });
    });


    return auth;



}

