angular.module('rowinApp')
.controller('sideBarController', [
  '$scope',
  '$location',
  '$rootScope',
  function ($scope, $location, $rootScope) {

    $scope.navItems = [
      { key: 'dashboard',        icon: 'dashboard',       label: 'Dashboard' },
      { key: 'coaches',          icon: 'person',          label: 'Coaches' },
      { key: 'customers',        icon: 'group',           label: 'Athletes' },
      { key: 'bookings',         icon: 'event_note',      label: 'Bookings' },
      { key: 'contact-requests', icon: 'contact_support', label: 'Contact Requests' }
    ];

    $scope.sidebarOpen = false;

    // Called directly from sideBar.html button
    $scope.toggleSidebar = function () {
      $scope.sidebarOpen = !$scope.sidebarOpen;
    };

    // Also listen on $rootScope in case any page still uses $emit('toggleSidebar')
    $rootScope.$on('toggleSidebar', function () {
      $scope.$apply(function () {
        $scope.sidebarOpen = !$scope.sidebarOpen;
      });
    });

    $scope.closeSidebar = function () {
      $scope.sidebarOpen = false;
    };

    function updateActiveRoute() {
      const path = $location.path().replace('/', '');
      $scope.activeNav = path || 'dashboard';
    }

    updateActiveRoute();

    $scope.setActive = function (key) {
      $scope.sidebarOpen = false;
      if ($scope.activeNav === key) return;
      $scope.activeNav = key;
      $location.path('/' + key);
    };

    $scope.goHome = function () {
      $scope.sidebarOpen = false;
      $location.path('/');
    };

    $scope.$on('$routeChangeSuccess', function () {
      updateActiveRoute();
      $scope.sidebarOpen = false;
    });

  }
]);