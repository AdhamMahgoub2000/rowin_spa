angular.module('rowinApp')
.controller('bookingsAdminController', [
  'SupabaseService', '$scope', '$location', '$window',
  function (SupabaseService, $scope, $location, $window) {

    const client = SupabaseService.client;

    /* ── State ── */
    $scope.loading         = true;
    $scope.bookings        = [];

    $scope.bookings6am     = [];
    $scope.bookings715am   = [];
    $scope.bookings830am   = [];
    $scope.bookings945am   = [];
    $scope.bookings1100am  = [];

    $scope.totalBookings    = 0;
    $scope.activeMembers    = 0;
    $scope.upcomingSessions = 0;
    $scope.tomorrowCount    = 0;
    $scope.showingTomorrow  = false;

    $scope.searchText     = '';
    $scope.filterDate     = '';
    $scope.filterTimeSlot = '';

    $scope.showDeleteModal = false;
    $scope.bookingToDelete = null;
    $scope.deleting        = false;

    $scope.toasts = [];

    function toYMD(raw) {
      if (!raw) return '';

      // Already a plain YYYY-MM-DD string?
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(raw).trim())) {
        return String(raw).trim();
      }

      // ISO timestamp — just take the date part before T or space
      if (/^\d{4}-\d{2}-\d{2}[T ]/.test(String(raw).trim())) {
        return String(raw).trim().slice(0, 10);
      }

      // Slash-separated  M/D/YYYY  or  D/M/YYYY  or  YYYY/MM/DD
      const slashMatch = String(raw).trim().match(/^(\d{1,4})\/(\d{1,2})\/(\d{2,4})$/);
      if (slashMatch) {
        const [, a, b, c] = slashMatch;
        if (a.length === 4) {
          // YYYY/MM/DD
          return `${a}-${b.padStart(2,'0')}-${c.padStart(2,'0')}`;
        }
        // Assume M/D/YYYY (change to b,a if your DB uses D/M/YYYY)
        return `${c}-${a.padStart(2,'0')}-${b.padStart(2,'0')}`;
      }

      // Fallback: let JS parse it, then format as YYYY-MM-DD in LOCAL time
      // (avoid toISOString() which converts to UTC and can shift the day)
      const d = new Date(raw);
      if (isNaN(d)) return '';
      const yyyy = d.getFullYear();
      const mm   = String(d.getMonth() + 1).padStart(2, '0');
      const dd   = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    /* ── Extract time string from a booking row ── */
    function extractTime(booking) {
      let t = booking.session_time || '';
      if (!t && booking.session_date) {
        t = String(booking.session_date).split(' ')[1] || '';
      }
      return t.trim();
    }

    /* ── Bucket bookings into their time-slot arrays ── */
    function categorise(list) {
      $scope.bookings6am    = [];
      $scope.bookings715am  = [];
      $scope.bookings830am  = [];
      $scope.bookings945am  = [];
      $scope.bookings1100am = [];

      list.forEach(function (b) {
        const t = extractTime(b);
        if      (t.startsWith('6:00')  || t.startsWith('06:00'))  $scope.bookings6am.push(b);
        else if (t.startsWith('7:15')  || t.startsWith('07:15'))  $scope.bookings715am.push(b);
        else if (t.startsWith('8:30')  || t.startsWith('08:30'))  $scope.bookings830am.push(b);
        else if (t.startsWith('9:45')  || t.startsWith('09:45'))  $scope.bookings945am.push(b);
        else if (t.startsWith('11:00'))                            $scope.bookings1100am.push(b);
      });
    }

    /* ── Apply all active filters then re-categorise ── */
    $scope.applyFilters = function () {
      let filtered = $scope.bookings;

      // Text search
      if ($scope.searchText && $scope.searchText.trim()) {
        const q = $scope.searchText.toLowerCase().trim();
        filtered = filtered.filter(function (b) {
          return (b.name           || '').toLowerCase().includes(q) ||
                 (b.email_address  || '').toLowerCase().includes(q) ||
                 (b.mobile_number  || '').toLowerCase().includes(q);
        });
      }

      // Date filter — normalise both sides to YYYY-MM-DD
function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

if ($scope.filterDate instanceof Date) {
  filtered = filtered.filter(b => {
    const bookingDate = new Date(b.session_date);
    return isSameDay(bookingDate, $scope.filterDate);
  });
}
      // Time-slot filter
      if ($scope.filterTimeSlot) {
        filtered = filtered.filter(function (b) {
          return extractTime(b).startsWith($scope.filterTimeSlot);
        });
      }

      categorise(filtered);
    };

    /* ── Tomorrow quick-filter ── */
$scope.toggleTomorrowSessions = function () {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // reset time

  if ($scope.showingTomorrow) {
    $scope.clearFilters();
  } else {
    $scope.showingTomorrow = true;
    $scope.filterDate = tomorrow; // keep as Date object
    $scope.filterTimeSlot = '';
    $scope.searchText = '';
    $scope.applyFilters();
  }
};

    /* ── Clear all filters ── */
$scope.clearFilters = function () {
  $scope.searchText = '';
  $scope.filterDate = null; // reset to null instead of empty string
  $scope.filterTimeSlot = '';
  $scope.showingTomorrow = false;
  $scope.applyFilters();
};

    /* ── Recalculate hero stats ── */
    function recalcStats() {
      const list = $scope.bookings;
      $scope.totalBookings = list.length;

      $scope.activeMembers = new Set(
        list.map(function (b) { return b.email_address; })
      ).size;

      const todayYMD = toYMD(new Date());
      $scope.upcomingSessions = list.filter(function (b) {
        return toYMD(b.session_date) >= todayYMD;
      }).length;

      const d = new Date();
      d.setDate(d.getDate() + 1);
      const tomorrowYMD = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

      $scope.tomorrowCount = list.filter(function (b) {
        return toYMD(b.session_date) === tomorrowYMD;
      }).length;
    }

    /* ── Delete flow ── */
    $scope.removeStudent = function (booking) {
      $scope.bookingToDelete = booking;
      $scope.showDeleteModal  = true;
    };

    $scope.cancelDelete = function () {
      $scope.showDeleteModal  = false;
      $scope.bookingToDelete  = null;
    };

    $scope.confirmDelete = async function () {
      if (!$scope.bookingToDelete) return;
      $scope.deleting = true;

      const booking = $scope.bookingToDelete;
      const { error } = await client.from('Bookings').delete().eq('id', booking.id);

      $scope.$apply(function () {
        $scope.deleting = false;
        if (error) {
          showToast('Failed to remove booking: ' + error.message, 'error');
        } else {
          $scope.bookings = $scope.bookings.filter(function (b) { return b.id !== booking.id; });
          recalcStats();
          $scope.applyFilters();
          $scope.cancelDelete();
          showToast('Booking removed successfully.', 'success');
        }
      });
    };

    /* ── Toast helper ── */
    function showToast(message, type) {
      const t = { message: message, type: type };
      $scope.toasts.push(t);
      setTimeout(function () {
        $scope.$apply(function () {
          const i = $scope.toasts.indexOf(t);
          if (i !== -1) $scope.toasts.splice(i, 1);
        });
      }, 3500);
    }

    /* ── Load bookings from Supabase ── */
    async function loadBookings() {
      const { data, error } = await client
        .from('Bookings')
        .select('*')
        .order('session_date', { ascending: true });

      $scope.$apply(function () {
        $scope.loading = false;
        if (error) {
          showToast('Failed to load bookings: ' + error.message, 'error');
          return;
        }
        $scope.bookings = data || [];
        recalcStats();
        categorise($scope.bookings);
      });
    }

    /* ── Auth guard + init ── */
    async function init() {
      const { data: { user } } = await client.auth.getUser();
      if (!user) {
        $scope.$apply(function () { $location.path('/login'); });
        return;
      }

      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        $scope.$apply(function () {
          alert('Access Denied: Admin privileges required.');
          $location.path('/profile');
        });
        return;
      }

      await loadBookings();
    }

    init();
  }
]);
