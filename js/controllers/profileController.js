angular.module('rowinApp')
.controller('ProfileController', [
  'SupabaseService', '$scope', '$location', '$routeParams',
  function (SupabaseService, $scope, $location, $routeParams) {

    const client = SupabaseService.client;
    
    /* ── State ── */
    $scope.loading                = true;
    $scope.profile                = {};
    $scope.allBookings            = [];
    $scope.upcoming               = [];
    $scope.totalSessionsThisMonth = 0;
    $scope.lastSessionDate        = '—';

    // Are we viewing someone else's profile as admin?
    const targetId = $routeParams.id || null;
    $scope.isAdminView = !!targetId;

    /* ================================================================
       DATE HELPERS
    ================================================================ */
    function toYMD(raw) {
      if (!raw) return '';
      const s = String(raw).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      if (/^\d{4}-\d{2}-\d{2}[T ]/.test(s)) return s.slice(0, 10);
      const slash = s.match(/^(\d{1,4})\/(\d{1,2})\/(\d{2,4})$/);
      if (slash) {
        const [, a, b, c] = slash;
        if (a.length === 4) return `${a}-${b.padStart(2,'0')}-${c.padStart(2,'0')}`;
        return `${c}-${a.padStart(2,'0')}-${b.padStart(2,'0')}`;
      }
      const d = new Date(raw);
      if (isNaN(d)) return '';
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }

    function todayYMD() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }

    $scope.isUpcoming = function (b) {
      return toYMD(b.session_date) >= todayYMD();
    };

    /* ── Compute derived stats ── */
    function computeStats(sessions) {
      const today     = todayYMD();
      const monthStr  = today.slice(0, 7);

      $scope.upcoming = sessions
        .filter(function (b) { return toYMD(b.session_date) >= today; })
        .sort(function (a, b) {
          return toYMD(a.session_date).localeCompare(toYMD(b.session_date));
        });

      $scope.totalSessionsThisMonth = sessions.filter(function (b) {
        return toYMD(b.session_date).startsWith(monthStr);
      }).length;

      const past = sessions
        .filter(function (b) { return toYMD(b.session_date) < today; })
        .sort(function (a, b) {
          return toYMD(b.session_date).localeCompare(toYMD(a.session_date));
        });

      if (past.length) {
        const d = new Date(past[0].session_date);
        $scope.lastSessionDate = isNaN(d)
          ? toYMD(past[0].session_date)
          : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      } else {
        $scope.lastSessionDate = '—';
      }
    }

    /* ================================================================
       LOAD — branches on whether we have a target :id param
    ================================================================ */
    async function loadProfile() {
      try {
        // Always get the logged-in user first (needed for auth guard)
        const { data: { user }, error: authError } = await client.auth.getUser();

        if (authError || !user) {
          $scope.$apply(function () { $location.path('/login'); });
          return;
        }

        let profileRow  = null;
        let emailToQuery = null;

        if (targetId) {
          // ── Admin viewing another user's profile ──────────────────
          // Verify the viewer is an admin first
          const { data: viewerProfile } = await client
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (!viewerProfile || viewerProfile.role !== 'admin') {
            $scope.$apply(function () {
              alert('Access Denied: Admin privileges required.');
              $location.path('/profile');
            });
            return;
          }

          // Fetch the target user's profile
          const { data: targetProfile, error: targetError } = await client
            .from('profiles')
            .select('*')
            .eq('id', targetId)
            .single();

          if (targetError || !targetProfile) {
            $scope.$apply(function () {
              alert('Member not found.');
              $location.path('/customers');
            });
            return;
          }

          profileRow   = targetProfile;
          emailToQuery = targetProfile.email;

        } else {
          // ── Logged-in user viewing their own profile ──────────────
          const { data: ownProfile } = await client
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          profileRow   = ownProfile;
          emailToQuery = user.email;
        }

        // Resolve display name
        let displayName = '';
        if (profileRow?.full_name && profileRow.full_name.trim()) {
          displayName = profileRow.full_name.trim();
        } else {
          const fname = (profileRow?.fname || '').trim();
          const lname = (profileRow?.lname || '').trim();
          displayName = (fname + (lname ? ' ' + lname : '')).trim();
        }

        // Fetch bookings by email
        const { data: sessions } = await client
          .from('Bookings')
          .select('*')
          .eq('email_address', emailToQuery)
          .order('session_date', { ascending: false });

        $scope.$apply(function () {
          $scope.loading = false;
          $scope.profile = {
            name:   displayName || emailToQuery,
            email:  emailToQuery,
            mobile: profileRow?.mobile_number || profileRow?.phone || '',
            role:   profileRow?.role || 'member',
            level:  profileRow?.level || 'induction'
          };
          $scope.allBookings = sessions || [];
          computeStats($scope.allBookings);
        });

      } catch (err) {
        console.error('Profile load error:', err);
        $scope.$apply(function () { $scope.loading = false; });
      }
    }

    loadProfile();
  }
]);