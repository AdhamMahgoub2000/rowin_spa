// Rowin Academy — AngularJS SPA
// Single entry point: index.html  |  Views: views/*.html

let app = angular.module("rowinApp", ["ngRoute"]);

// ─── Route Configuration ──────────────────────────────────────────────────────
app.config(["$routeProvider", function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "views/home.html",
      controller: "HomeController",
      title: "Rowin Academy"
    })
    .when("/services", {
      templateUrl: "views/services.html",
      title: "Services - Rowin Academy"
    })
    .when("/events", {
      templateUrl: "views/events.html",
      controller: "HomeController",
      title: "Events - Rowin Academy"
    })
    .when("/booking", {
      templateUrl: "views/booking.html",
      controller: "BookingController",
      title: "Book a Session - Rowin Academy"
    })
    .when("/contact", {
      templateUrl: "views/contact.html",
      controller: "ContactController",
      title: "Contact Us - Rowin Academy"
    })
    .when("/about", {
      templateUrl: "views/about.html",
      controller: "HomeController",
      title: "About Us - Rowin Academy"
    })
    .when("/login", {
      templateUrl: "views/login.html",
      controller: "loginController",
      title: "Login - Rowin Academy"
    })
    .when("/register", {
      templateUrl: "views/register.html",
      controller: "registerController",
      title: "Register - Rowin Academy"
    })
    .when("/profile", {
      templateUrl: "views/profile.html",
      title: "My Profile - Rowin Academy",
      controller: "ProfileController"
    })
    .when('/profile/:id', {
  templateUrl: 'views/profile.html',
  controller:  'ProfileController',
  title:       'Member Profile'
})
    .when("/dashboard", {
      templateUrl: "views/dashboard.html",
      controller: "dashboardController",
      title: "Admin Dashboard - Rowin Academy"
    })
    .when("/medicines", {
      templateUrl: "views/medicines.html",
      controller: "medicinesController",
      title: "Medicines - Rowin Academy"
    })
    .when("/customers", {
      templateUrl: "views/customers.html",
      controller: "customersController",
      title: "Customers - Rowin Academy"
    })
    .when("/bookingsAdmin", {
      templateUrl: "views/bookings_admin.html",
      controller: "bookingsAdminController",
      title: "Bookings - Rowin Academy"
    })
    .when("/invoices", {
      templateUrl: "views/invoices.html",
      controller: "invoicesController",
      title: "Sales Invoices - Rowin Academy"
    })
    .when("/contact-requests", {
      templateUrl: "views/contact-requests.html",
      controller: "ContactRequestsController",
      title: "Contact Requests - Rowin Academy"
    })
    .when("/reset-password", {
      templateUrl: "views/reset-password-confirm.html",
      controller: "ResetPasswordController",
      title: "Reset Password - Rowin Academy"
    })
    .otherwise({ redirectTo: "/" });
}]);

// ─── Update page title + scroll to top on every route change ─────────────────
app.run(["$rootScope", "$route", function ($rootScope, $route) {
  $rootScope.$on("$routeChangeSuccess", function () {
    const route = $route.current;
    document.title = (route && route.title) ? route.title : "Rowin Academy";
    window.scrollTo(0, 0);

    // Hide navbar + footer on admin/dashboard routes
    const adminRoutes = [
      '/dashboard', '/medicines', '/customers', '/invoices', '/contact-requests','/bookingsAdmin','/profile/:id'
    ];
    const commonRoutes = ['/profile'];
    const path = route && route.$$route ? route.$$route.originalPath : '/';
    $rootScope.isAdminRoute = adminRoutes.includes(path);
    $rootScope.isCommonRoute = commonRoutes.includes(path);
  });
}]);

// ─── Capitalize filter ────────────────────────────────────────────────────────
app.filter('capitalize', function() {
    return function(input) {
        if (!input) return '';
        return input.charAt(0).toUpperCase() + input.slice(1);
    };
});