angular.module("rowinApp")
.controller("loginController", [
    '$scope',
    '$timeout',
    '$rootScope',
    '$location',
    'AuthService',
    '$route',
function ($scope, $timeout, $rootScope, $location, AuthService, $route) {

  $scope.user = {};
  $scope.resetData = {};
  $scope.loginError = null;
  $scope.resetError = null;
  $scope.resetSuccess = null;
  $scope.loading = false;
  $scope.resetLoading = false;
  $scope.showResetForm = false;

  // Support redirect param in hash: #!/login?redirect=/profile
  const hashSearch = window.location.hash.split("?")[1] || "";
  const params = new URLSearchParams(hashSearch);
  const redirectPath = params.get("redirect") || "/";

 $scope.login = async function () {

  if ($scope.loginForm.$invalid) return;

  $scope.loading = true;
  $scope.loginError = null;

  try {

    const { data, error } = await AuthService.login(
      $scope.user.email,
      $scope.user.password
    );

    $scope.loading = false;

    if (error) {
      $scope.loginError = error.message || "Login failed. Please try again.";
      $scope.$applyAsync();
      return;
    }

    // Fetch profile (for role, fname, etc.)
    const profile = await AuthService.getProfile(data.user.id);

    $rootScope.currentUser = {
      id: data.user.id,
      email: data.user.email,
      fname: profile?.fname,
      lname: profile?.lname,
      role: profile?.role
    };

    $rootScope.authReady = true;

    // Redirect based on role
    if (profile?.role === "admin") {
      $location.path("/dashboard");
    } else {
      $location.path("/");
    }

    $route.reload();

    $scope.$applyAsync();

  } catch (err) {

    $scope.loading = false;
    $scope.loginError = "Unexpected error occurred.";
    $scope.$applyAsync();

  }

};

  $scope.resetPassword = async function () {
    if ($scope.resetForm.$invalid) return;

    $scope.resetLoading = true;
    $scope.resetError = null;
    $scope.resetSuccess = null;

    const { data, error } = await AuthService.resetPassword($scope.resetData.email);

    $scope.$apply(() => {
      $scope.resetLoading = false;

      if (error) {
        $scope.resetError = error.message || "Failed to send reset link. Please try again.";
        return;
      }

      $scope.resetSuccess = "Reset link sent successfully! Check your email.";
      $scope.resetForm.$setPristine();
      $scope.resetData = {};

      $timeout(() => {
        $scope.showResetForm = false;
        $scope.resetSuccess = null;
      }, 5000);
    });
  };

}]);
