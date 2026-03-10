angular.module('rowinApp')
.controller('customersController', [
  '$scope',
  '$location',
  'SupabaseService',
  function ($scope, $location, SupabaseService) {

    const supabase = SupabaseService.client;

    /* ── State ── */
    $scope.customers        = [];
    $scope.loading          = true;
    $scope.error            = null;
    $scope.searchText       = '';

    $scope.showEditModal    = false;
    $scope.selectedCustomer = {};
    $scope.saving           = false;

    $scope.showDeleteModal  = false;
    $scope.customerToDelete = {};
    $scope.deleting         = false;

    $scope.toasts           = [];

    /* ── Computed counts ── */
$scope.$watchCollection('customers', function (list) {

  list = list || [];

  $scope.inductionCount     = list.filter(c => c.level === 'induction').length;
  $scope.beginnerCount      = list.filter(c => c.level === 'beginner').length;
  $scope.intermediateCount  = list.filter(c => c.level === 'intermediate').length;
  $scope.advancedCount      = list.filter(c => c.level === 'advanced').length;

});

    /* ── Fetch customers ── */
    async function loadCustomers() {
      $scope.loading = true;
      $scope.error = null;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        $scope.$evalAsync(() => {
          $scope.loading = false;
          if (error) {
            $scope.error = 'Failed to load members: ' + error.message;
          } else {
            $scope.customers = data || [];
          }
        });
      } catch (err) {
        $scope.$evalAsync(() => {
          $scope.loading = false;
          $scope.error = 'Unexpected error: ' + err.message;
        });
      }
    }

    loadCustomers();

    /* ── Filter ── */
$scope.levelFilter = '';

$scope.setLevelFilter = function(level){
  $scope.levelFilter = level;
};

$scope.filteredCustomers = function () {
  return $scope.customers.filter(function (c) {

    if ($scope.levelFilter && c.level !== $scope.levelFilter) {
      return false;
    }

    if ($scope.searchText) {
      const s = $scope.searchText.toLowerCase();
      return (
        (c.fname && c.fname.toLowerCase().includes(s)) ||
        (c.lname && c.lname.toLowerCase().includes(s)) ||
        (c.email && c.email.toLowerCase().includes(s))
      );
    }

    return true;
  });
};

    /* ── Edit ── */
    $scope.editCustomer = function (c) {
      $scope.selectedCustomer = angular.copy(c);
      $scope.showEditModal = true;
    };

    $scope.closeEditModal = function () {
      $scope.showEditModal = false;
      $scope.selectedCustomer = {};
    };

    $scope.saveCustomer = async function () {
      $scope.saving = true;
      const c = $scope.selectedCustomer;

      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            fname: c.fname,
            lname: c.lname,
            email:     c.email,
            mobile_number:     c.mobile_number,
            role:      c.role,
            level:     c.level
          })
          .eq('id', c.id);

        $scope.$evalAsync(() => {
          $scope.saving = false;
          if (error) {
            showToast('Failed to save: ' + error.message, 'error');
          } else {
            const idx = $scope.customers.findIndex(x => x.id === c.id);
            if (idx !== -1) $scope.customers[idx] = angular.copy(c);
            $scope.closeEditModal();
            showToast('Member updated successfully.', 'success');
          }
        });
      } catch (err) {
        $scope.$evalAsync(() => {
          $scope.saving = false;
          showToast('Unexpected error: ' + err.message, 'error');
        });
      }
    };

    /* ── Delete ── */
    $scope.confirmDelete = function (c) {
      $scope.customerToDelete = c;
      $scope.showDeleteModal = true;
    };

    $scope.closeDeleteModal = function () {
      $scope.showDeleteModal = false;
      $scope.customerToDelete = {};
    };

    $scope.deleteCustomer = async function () {
      $scope.deleting = true;
      const c = $scope.customerToDelete;

      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', c.id);

        $scope.$evalAsync(() => {
          $scope.deleting = false;
          if (error) {
            showToast('Failed to delete: ' + error.message, 'error');
          } else {
            $scope.customers = $scope.customers.filter(x => x.id !== c.id);
            $scope.closeDeleteModal();
            showToast('Member removed.', 'warning');
          }
        });
      } catch (err) {
        $scope.$evalAsync(() => {
          $scope.deleting = false;
          showToast('Unexpected error: ' + err.message, 'error');
        });
      }
    };

    /* ── Toast helper ── */
    function showToast(message, type) {
      const t = { message, type };
      $scope.toasts.push(t);
      setTimeout(() => {
        $scope.$evalAsync(() => {
          const i = $scope.toasts.indexOf(t);
          if (i !== -1) $scope.toasts.splice(i, 1);
        });
      }, 3500);
    }

    $scope.removeToast = function (idx) {
      $scope.toasts.splice(idx, 1);
    };
    $scope.openWhatsapp = function(phone) {
      if (!phone) return;

      // Remove all non-digit characters
      let cleanNumber = phone.replace(/\D/g, '');

      // Egypt local numbers start with 01 — convert to +20
      if (cleanNumber.startsWith('01')) {
        cleanNumber = '20' + cleanNumber.slice(1); // replace leading 0 with 20
      }

      const url = `https://wa.me/${cleanNumber}`;
      window.open(url, '_blank');
    };
$scope.goProfile = function (id) {
  $location.path('/profile/' + id);
};
  }
]);