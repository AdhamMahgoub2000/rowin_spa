angular.module("rowinApp")
.controller("ResetPasswordController", function ($scope, $timeout, AuthService) {

  $scope.formData = {};
  $scope.loading = true;
  $scope.sessionInvalid = false;
  $scope.errorMessage = null;
  $scope.successMessage = null;
  $scope.updateLoading = false;

  // Verify session
  async function verifySession() {
    const { session, error } = await AuthService.verifySession();

    $scope.$apply(() => {
      $scope.loading = false;
      if (error || !session) {
        $scope.sessionInvalid = true;
      }
    });
  }

  verifySession();

  // Update password
  $scope.updatePassword = async function () {
    if (
      !$scope.formData.newPassword ||
      !$scope.formData.confirmPassword ||
      $scope.formData.newPassword !== $scope.formData.confirmPassword ||
      $scope.formData.newPassword.length < 8
    ) {
      return;
    }

    $scope.updateLoading = true;
    $scope.errorMessage = null;
    $scope.successMessage = null;

    const { data, error } = await AuthService.updatePassword($scope.formData.newPassword);

    $scope.$apply(() => {
      $scope.updateLoading = false;

      if (error) {
        $scope.errorMessage = error.message || "Failed to update password. Please try again.";
        return;
      }

      $scope.successMessage = "Password updated successfully! Redirecting to login...";

      if ($scope.resetForm) {
        $scope.resetForm.$setPristine();
        $scope.resetForm.$setUntouched();
      }

      $scope.formData = {};

      $timeout(() => {
        window.location.href = "index.html#!/login";
      }, 2000);
    });
  };

});