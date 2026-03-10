angular.module('rowinApp')
.controller('ContactRequestsController', ['$scope', 'ContactService', function($scope, ContactService) {

    $scope.allRequests    = [];
    $scope.filtered       = [];
    $scope.loading        = true;
    $scope.priorityFilter = 'all';
    $scope.search         = '';
    $scope.showModal      = false;
    $scope.selectedRequest = null;

    var PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

    var SUBJECT_LABELS = {
        order:        'Order Inquiry',
        prescription: 'Prescription Help',
        product:      'Product Information',
        delivery:     'Delivery Issue',
        refund:       'Refund / Return',
        technical:    'Technical Support',
        other:        'Other'
    };

    $scope.subjectLabel = function(key) {
        return SUBJECT_LABELS[key] || key || '—';
    };

    // ── Stats ────────────────────────────────────────────────────────
    function calcStats(list) {
        $scope.stats = {
            total:  list.length,
            high:   list.filter(function(r){ return r.priority === 'high';   }).length,
            medium: list.filter(function(r){ return r.priority === 'medium'; }).length,
            low:    list.filter(function(r){ return r.priority === 'low';    }).length
        };
    }
    $scope.loadRequests = function() {
        $scope.loading = true;
        ContactService.retrieveAllRequests().then(function(data) {
            $scope.allRequests = data || [];
            calcStats($scope.allRequests);
            $scope.applyFilters();
            $scope.loading = false;
            $scope.$applyAsync();
        }).catch(function(err) {
            console.error('Error loading contact requests:', err);
            $scope.loading = false;
            $scope.$applyAsync();
        });
    };

    // ── Filter + Sort ────────────────────────────────────────────────
    $scope.applyFilters = function() {
        var term = ($scope.search || '').toLowerCase().trim();
        var pf   = $scope.priorityFilter;

        var result = $scope.allRequests.filter(function(r) {
            var matchPriority = (pf === 'all') || (r.priority === pf);
            var matchSearch   = !term ||
                (r.name        && r.name.toLowerCase().includes(term))  ||
                (r.email       && r.email.toLowerCase().includes(term)) ||
                (r.subject     && $scope.subjectLabel(r.subject).toLowerCase().includes(term)) ||
                (r.description && r.description.toLowerCase().includes(term));
            return matchPriority && matchSearch;
        });

        // Sort: priority asc (high first), then created_at desc (newest first)
        result.sort(function(a, b) {
            var po = (PRIORITY_ORDER[a.priority] || 99) - (PRIORITY_ORDER[b.priority] || 99);
            if (po !== 0) return po;
            return new Date(b.created_at) - new Date(a.created_at);
        });

        $scope.filtered = result;
    };

    $scope.setPriority = function(p) {
        $scope.priorityFilter = p;
        $scope.applyFilters();
    };


    $scope.openRequest = function(req) {
        $scope.selectedRequest = req;
        $scope.showModal = true;
    };

    $scope.closeModal = function(event) {
        if (event.target === event.currentTarget) {
            $scope.showModal = false;
        }
    };

    // ── Init ─────────────────────────────────────────────────────────
    $scope.loadRequests();
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
}]);
