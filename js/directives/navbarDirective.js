angular.module("rowinApp")
  .directive("navbarDirective", ["$location", "$rootScope", "AuthService",
    function ($location, $rootScope, AuthService) {
      return {
        restrict: "E",

        // ── FIX 1: NO isolated scope ─────────────────────────────────────────
        // Using scope: false (share parent scope) was wrong too.
        // We use a NEW child scope (scope: true) so it inherits $rootScope
        // but keeps its own state — and $location IS reactive in child scopes.
        scope: true,

        controller: function ($scope) {

  $scope.isLoggedIn  = false;
  $scope.userName    = "";
  $scope.isAdmin     = false;
  $scope.authChecked = false;
  $scope.menuOpen    = false;

  // Check active route
  $scope.isActive = function (path) {
    return $location.path() === path;
  };

  // Toggle mobile menu
  $scope.toggleMenu = function () {
    $scope.menuOpen = !$scope.menuOpen;
  };
  $scope.closeMenu = function () {
    $scope.menuOpen = false;
  };

  // Load authentication state
  async function loadAuth() {
    try {
      const user = await AuthService.getUser();
      if (user) {
        const profile = await AuthService.getProfile(user.id);
        $scope.$applyAsync(() => {
          $scope.isLoggedIn  = true;
          $scope.userName    = profile?.fname || user.email;
          $scope.isAdmin     = profile?.role === "admin";
          $scope.authChecked = true;
        });
      } else {
        $scope.$applyAsync(() => {
          $scope.isLoggedIn  = false;
          $scope.authChecked = true;
        });
      }
    } catch (err) {
      console.error("Navbar auth error:", err);
      $scope.$applyAsync(() => {
        $scope.authChecked = true;
      });
    }
  }

  // SPA-friendly logout
  $scope.logout = async function () {
    try {
      await AuthService.logout(); // Signs out & updates $location.path('/')
      $scope.$applyAsync(() => {
        $scope.isLoggedIn = false;
        $scope.userName = "";
        $scope.isAdmin = false;
        $scope.menuOpen = false; // close mobile menu if open
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Refresh auth state on route changes
  let lastPath = $location.path();
  $rootScope.$on("$routeChangeSuccess", () => {
    const newPath = $location.path();
    const authRoutes = ["/login", "/register"];
    if (authRoutes.includes(lastPath) || authRoutes.includes(newPath)) {
      loadAuth();
    }
    lastPath = newPath;
    $scope.menuOpen = false; // close mobile menu on navigation
  });

  // Initialize
  loadAuth();
},

        template: `
<header class="rw-nav" ng-class="{'rw-nav--open': menuOpen}">
  <div class="rw-nav__inner">

    <!-- Logo -->
    <a class="rw-nav__logo" href="#!/" ng-click="closeMenu()">
      <img src="images/recolored-logo.png" alt="Rowin Academy" />
    </a>

    <!-- Desktop Links -->
    <nav class="rw-nav__links" role="navigation" aria-label="Main navigation">
      <a href="#!/"         class="rw-nav__link" ng-class="{'rw-nav__link--active': isActive('/')}">Home</a>
      <a href="#!/services" class="rw-nav__link" ng-class="{'rw-nav__link--active': isActive('/services')}">Services</a>
      <a href="#!/events"   class="rw-nav__link" ng-class="{'rw-nav__link--active': isActive('/events')}">Events</a>
      <a href="#!/booking" class="rw-nav__link" ng-class="{'rw-nav__link--active': isActive('/bookings')}">Bookings</a>
      <a href="#!/about"    class="rw-nav__link" ng-class="{'rw-nav__link--active': isActive('/about')}">About</a>
      <a href="#!/contact"  class="rw-nav__link" ng-class="{'rw-nav__link--active': isActive('/contact')}">Contact</a>
    </nav>

    <!-- Desktop Auth -->
    <div class="rw-nav__auth" ng-if="authChecked">

      <!-- Logged in: user dropdown -->
      <div class="rw-nav__user" ng-if="isLoggedIn">
        <button class="rw-nav__user-btn" ng-click="userMenuOpen = !userMenuOpen" ng-blur="userMenuOpen = false">
          <span class="rw-nav__user-avatar">{{userName.charAt(0).toUpperCase()}}</span>
          <span class="rw-nav__user-name">{{userName}}</span>
          <i class="fa-solid fa-chevron-down rw-nav__chevron" ng-class="{'rw-nav__chevron--open': userMenuOpen}"></i>
        </button>
        <div class="rw-nav__dropdown" ng-show="userMenuOpen" ng-mousedown="$event.preventDefault()">
          <a class="rw-nav__dropdown-item" ng-href="{{isAdmin ? '#!/dashboard' : '#!/profile'}}" ng-click="userMenuOpen = false">
            <i class="fa-solid" ng-class="isAdmin ? 'fa-gauge' : 'fa-user'"></i>
            {{isAdmin ? 'Dashboard' : 'My Profile'}}
          </a>
          <div class="rw-nav__dropdown-divider"></div>
          <button class="rw-nav__dropdown-item rw-nav__dropdown-item--danger" ng-click="logout()">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            Sign Out
          </button>
        </div>
      </div>

      <!-- Not logged in -->
      <div class="rw-nav__guest" ng-if="!isLoggedIn">
        <a href="#!/login"    class="rw-nav__login">Sign In</a>
        <a href="#!/register" class="rw-nav__join">Join Now</a>
      </div>

    </div>

    <!-- Auth skeleton while loading -->
    <div class="rw-nav__auth-skeleton" ng-if="!authChecked">
      <div class="rw-nav__skel"></div>
      <div class="rw-nav__skel rw-nav__skel--wide"></div>
    </div>

    <!-- Hamburger -->
    <button class="rw-nav__hamburger" ng-click="toggleMenu()" aria-label="Toggle menu">
      <span class="rw-nav__ham-line" ng-class="{'rw-nav__ham-line--top': true}"></span>
      <span class="rw-nav__ham-line" ng-class="{'rw-nav__ham-line--mid': true}"></span>
      <span class="rw-nav__ham-line" ng-class="{'rw-nav__ham-line--bot': true}"></span>
    </button>

  </div>

  <!-- Mobile drawer -->
  <div class="rw-nav__mobile" ng-class="{'rw-nav__mobile--open': menuOpen}" aria-hidden="{{!menuOpen}}">
    <nav class="rw-nav__mobile-links">
      <a href="#!/"         class="rw-nav__mobile-link" ng-class="{'rw-nav__mobile-link--active': isActive('/')}"         ng-click="closeMenu()">Home</a>
      <a href="#!/services" class="rw-nav__mobile-link" ng-class="{'rw-nav__mobile-link--active': isActive('/services')}" ng-click="closeMenu()">Services</a>
      <a href="#!/events"   class="rw-nav__mobile-link" ng-class="{'rw-nav__mobile-link--active': isActive('/events')}"   ng-click="closeMenu()">Events</a>
      <a href="#!/bookings" class="rw-nav__mobile-link" ng-class="{'rw-nav__mobile-link--active': isActive('/bookings')}" ng-click="closeMenu()">Bookings</a>
      <a href="#!/about"    class="rw-nav__mobile-link" ng-class="{'rw-nav__mobile-link--active': isActive('/about')}"    ng-click="closeMenu()">About</a>
      <a href="#!/contact"  class="rw-nav__mobile-link" ng-class="{'rw-nav__mobile-link--active': isActive('/contact')}"  ng-click="closeMenu()">Contact</a>
    </nav>
    <div class="rw-nav__mobile-auth" ng-if="authChecked">
      <div ng-if="isLoggedIn">
        <a ng-href="{{isAdmin ? '#!/dashboard' : '#!/profile'}}" class="rw-nav__mobile-profile" ng-click="closeMenu()">
          <span class="rw-nav__user-avatar">{{userName.charAt(0).toUpperCase()}}</span>
          <div>
            <strong>{{userName}}</strong>
            <span>{{isAdmin ? 'View Dashboard' : 'View Profile'}}</span>
          </div>
        </a>
        <button class="rw-nav__mobile-logout" ng-click="logout()">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
        </button>
      </div>
      <div ng-if="!isLoggedIn" class="rw-nav__mobile-guest">
        <a href="#!/login"    class="rw-nav__login"  ng-click="closeMenu()">Sign In</a>
        <a href="#!/register" class="rw-nav__join"   ng-click="closeMenu()">Join Now</a>
      </div>
    </div>
  </div>

  <!-- Mobile backdrop -->
  <div class="rw-nav__backdrop" ng-show="menuOpen" ng-click="closeMenu()"></div>
</header>
        `
      };
    }
  ]);
