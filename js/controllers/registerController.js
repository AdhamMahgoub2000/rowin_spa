angular
  .module("rowinApp")
  .controller("registerController", function ($scope) {
    $scope.user = {};
    $scope.registerError = null;
    $scope.loading = false;

    $scope.registrationSuccess = false;

    $scope.register = async function () {
      if ($scope.registerForm.$invalid) return;

      $scope.loading = true;
      $scope.registerError = null;

      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email: $scope.user.email,
          password: $scope.user.password,
          options: {
            data: {
              first_name: $scope.user.fname,
              last_name: $scope.user.lname,
              phone: $scope.user.phone,
              dob: $scope.user.dob,
            },
          },
        });
        $scope.$apply(() => {
          $scope.loading = false;

          if (error) {
            $scope.registerError = error.message;
            console.log(error);
            return;
          }
          $scope.registrationSuccess = true;
        });
      } catch (err) {
        $scope.$apply(() => {
          $scope.loading = false;
          $scope.registerError = "An unexpected error occurred.";
        });
      }
    };
  });