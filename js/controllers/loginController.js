angular.module("rowinApp")
.controller("loginController", function ($scope, $timeout, $location, AuthService) {

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

    const { data, error } = await AuthService.login($scope.user.email, $scope.user.password);

    $scope.$apply(() => {
      $scope.loading = false;

      if (error) {
        $scope.loginError = error.message || "Login failed. Please try again.";
        return;
      }

      $location.path(redirectPath);
    });
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

});
