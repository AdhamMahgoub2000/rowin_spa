angular.module('rowinApp')
  .directive('appSidebar', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/sideBar.html',
      controller: 'sideBarController'
    };
  });