angular.module('rowinApp').controller('HomeController', [
  '$scope', 
  '$timeout', 
  function($scope, $timeout) {

    // Store observer so we can clean it up later if needed
    var scrollObserver = null;

    $scope.initScrollReveal = function() {
      var options = {
        root: null,
        rootMargin: "0px 0px -50px 0px",
        threshold: 0.15
      };

      scrollObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            angular.element(entry.target).addClass('rw-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, options);

      // 🔹 Use document.querySelectorAll instead of $element
      var revealElements = document.querySelectorAll('[data-rw-reveal]');

      revealElements.forEach(function(el) {
        scrollObserver.observe(el);
      });
    };

    // Run after digest/render cycle
    $timeout(function() {
      $scope.initScrollReveal();
    }, 0);

    // Cleanup
    $scope.$on('$destroy', function() {
      if (scrollObserver) {
        scrollObserver.disconnect();
      }
    });

}]);