angular.module('rowinApp')
.controller('ContactController',
['$scope','$timeout','ContactService',
function($scope,$timeout,ContactService){

  // ───────────────── FORM MODEL ─────────────────
  $scope.form = {
    name: '',
    email: '',
    number: '',
    subject: '',
    orderNumber: '',
    message: '',
    priority: 'medium'
  };

  $scope.formErrors = {};
  $scope.submitting = false;
  $scope.submitted  = false;
  $scope.openFaq    = null;

  // ───────────────── EMAIL VALIDATION ─────────────────
  function validateEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ───────────────── CLEAR FIELD ERROR ─────────────────
  $scope.clearError = function(field){
    delete $scope.formErrors[field];
  };

  // ───────────────── VALIDATION ─────────────────
  function validate(){

    $scope.formErrors = {};
    var f = $scope.form;

    if(!f.name || f.name.trim().length < 2){
      $scope.formErrors.name = "Please enter your full name.";
    }

    if(!f.email || !validateEmail(f.email.trim())){
      $scope.formErrors.email = "Please enter a valid email.";
    }

    if(!f.subject){
      $scope.formErrors.subject = "Please select a subject.";
    }

    if(!f.message || f.message.trim().length < 10){
      $scope.formErrors.message = "Message must be at least 10 characters.";
    }

    return Object.keys($scope.formErrors).length === 0;
  }

  // ───────────────── SUBMIT FORM ─────────────────
  $scope.submitForm = async function(){

    if(!validate()) return;

    $scope.submitting = true;

    const request = {
      name: $scope.form.name.trim(),
      email: $scope.form.email.trim(),
      number: $scope.form.number,
      subject: $scope.form.subject,
      description: $scope.form.message.trim(),
      priority: $scope.form.priority
    };

    try{

      await ContactService.sendRequest(request);
        console.log("Contact request sent successfully:", request);
      $scope.$applyAsync(function(){

        $scope.submitting = false;
        $scope.submitted  = true;

        $timeout(function(){
          $scope.resetForm();
        },5000);

      });

    }catch(err){

      console.error("Contact request failed:",err);

      $scope.$applyAsync(function(){
        $scope.submitting = false;
        alert("Something went wrong. Please try again.");
      });

    }

  };

  // ───────────────── RESET FORM ─────────────────
  $scope.resetForm = function(){

    $scope.form = {
      name: '',
      email: '',
      number: '',
      subject: '',
      message: '',
      priority: 'medium'
    };

    $scope.formErrors = {};
    $scope.submitted  = false;
  };

  // ───────────────── FAQ TOGGLE ─────────────────
  $scope.toggleFaq = function(index){
    $scope.openFaq = ($scope.openFaq === index) ? null : index;
  };

}]);