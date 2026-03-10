angular.module('rowinApp')
.controller('dashboardController', [
  'SupabaseService', '$scope', '$location', '$window',
  function (SupabaseService, $scope, $location, $window) {

    const client = SupabaseService.client;

    /* ── Loading state ── */
    $scope.loading = true;
    $scope.adminName = 'Admin';

    /* ── Raw data ── */
    $scope.bookings  = [];
    $scope.members   = [];

    /* ── Top-level KPI cards ── */
    $scope.totalBookings     = 0;
    $scope.activeMembers     = 0;
    $scope.upcomingSessions  = 0;
    $scope.todayCount        = 0;
    $scope.tomorrowCount     = 0;
    $scope.thisMonthCount    = 0;
    $scope.lastMonthCount    = 0;
    $scope.monthlyDelta      = 0;   // % change vs last month
    $scope.monthlyDeltaUp    = true;

    /* ── Level breakdown ── */
    $scope.inductionCount    = 0;
    $scope.beginnerCount     = 0;
    $scope.intermediateCount = 0;
    $scope.advancedCount     = 0;

    /* ── Time-slot popularity ── */
    $scope.slotStats = [
      { time: '6:00 AM',  key: '6:00',  color: 'blue',  count: 0, pct: 0 },
      { time: '7:15 AM',  key: '7:15',  color: 'green', count: 0, pct: 0 },
      { time: '8:30 AM',  key: '8:30',  color: 'amber', count: 0, pct: 0 },
      { time: '9:45 AM',  key: '9:45',  color: 'red',   count: 0, pct: 0 },
      { time: '11:00 AM', key: '11:00', color: 'teal',  count: 0, pct: 0 },
    ];

    /* ── Last 7 days sparkline (array of {label, count}) ── */
    $scope.last7Days = [];

    /* ── Recent bookings feed ── */
    $scope.recentBookings = [];

    /* ── Quick nav ── */
    $scope.goTo = function (path) { $location.path(path); };

    /* ════════════════════════════════════════════
       HELPERS
    ════════════════════════════════════════════ */

    function toYMD(raw) {
      if (!raw) return '';
      const s = String(raw).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s))       return s;
      if (/^\d{4}-\d{2}-\d{2}[T ]/.test(s))    return s.slice(0, 10);
      const d = new Date(raw);
      if (isNaN(d)) return '';
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }

    function localYMD(date) {
      return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    }

    function extractTime(b) {
      let t = b.session_time || '';
      if (!t && b.session_date) t = String(b.session_date).split(' ')[1] || '';
      return t.trim();
    }

    /* ════════════════════════════════════════════
       COMPUTE STATS
    ════════════════════════════════════════════ */

    function computeStats(bookings, members) {

      /* Basic counts */
      const now       = new Date();
      const todayYMD  = localYMD(now);

      const tom       = new Date(now); tom.setDate(tom.getDate() + 1);
      const tomYMD    = localYMD(tom);

      const thisMonth = now.getMonth();
      const thisYear  = now.getFullYear();
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const lastYear  = thisMonth === 0 ? thisYear - 1 : thisYear;

      $scope.totalBookings = bookings.length;
      $scope.activeMembers = new Set(bookings.map(b => b.email_address)).size;

      $scope.upcomingSessions = bookings.filter(b => toYMD(b.session_date) >= todayYMD).length;
      $scope.todayCount       = bookings.filter(b => toYMD(b.session_date) === todayYMD).length;
      $scope.tomorrowCount    = bookings.filter(b => toYMD(b.session_date) === tomYMD).length;

      $scope.thisMonthCount = bookings.filter(b => {
        const d = new Date(b.session_date);
        return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
      }).length;

      $scope.lastMonthCount = bookings.filter(b => {
        const d = new Date(b.session_date);
        return d.getFullYear() === lastYear && d.getMonth() === lastMonth;
      }).length;

      if ($scope.lastMonthCount > 0) {
        const delta = (($scope.thisMonthCount - $scope.lastMonthCount) / $scope.lastMonthCount) * 100;
        $scope.monthlyDelta   = Math.abs(Math.round(delta));
        $scope.monthlyDeltaUp = delta >= 0;
      } else {
        $scope.monthlyDelta   = 100;
        $scope.monthlyDeltaUp = true;
      }

      /* Level breakdown */
      $scope.inductionCount    = bookings.filter(b => b.level === 'induction').length;
      $scope.beginnerCount     = bookings.filter(b => b.level === 'beginner').length;
      $scope.intermediateCount = bookings.filter(b => b.level === 'intermediate').length;
      $scope.advancedCount     = bookings.filter(b => b.level === 'advanced').length;

      /* Member level breakdown (from profiles) */
      $scope.memberInduction    = members.filter(m => m.level === 'induction').length;
      $scope.memberBeginner     = members.filter(m => m.level === 'beginner').length;
      $scope.memberIntermediate = members.filter(m => m.level === 'intermediate').length;
      $scope.memberAdvanced     = members.filter(m => m.level === 'advanced').length;
      $scope.totalMembers       = members.length;

      /* Time-slot popularity */
      const slotKeys = ['6:00','7:15','8:30','9:45','11:00'];
      slotKeys.forEach((key, i) => {
        $scope.slotStats[i].count = bookings.filter(b => extractTime(b).startsWith(key)).length;
      });
      const maxSlot = Math.max(...$scope.slotStats.map(s => s.count), 1);
      $scope.slotStats.forEach(s => s.pct = Math.round((s.count / maxSlot) * 100));

      /* Last 7 days */
      $scope.last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const ymd = localYMD(d);
        const count = bookings.filter(b => toYMD(b.session_date) === ymd).length;
        const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        $scope.last7Days.push({ label: labels[d.getDay()], date: ymd, count, isToday: ymd === todayYMD });
      }
      const maxDay = Math.max(...$scope.last7Days.map(d => d.count), 1);
      $scope.last7Days.forEach(d => d.pct = Math.round((d.count / maxDay) * 100));

      /* Recent bookings — last 5 by created_at or session_date */
      $scope.recentBookings = bookings
        .slice()
        .sort((a, b) => new Date(b.created_at || b.session_date) - new Date(a.created_at || a.session_date))
        .slice(0, 6);

      /* Busiest slot */
      const busiest = $scope.slotStats.reduce((a, b) => b.count > a.count ? b : a, $scope.slotStats[0]);
      $scope.busiestSlot = busiest.count > 0 ? busiest.time : '—';

      /* Session type breakdown */
      const typeCounts = {};
      bookings.forEach(b => {
        const t = b.session_type || 'Unknown';
        typeCounts[t] = (typeCounts[t] || 0) + 1;
      });
      $scope.sessionTypes = Object.entries(typeCounts)
        .map(([type, count]) => ({ type, count, pct: Math.round((count / bookings.length) * 100) || 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);
    }

    /* ════════════════════════════════════════════
       LOAD DATA
    ════════════════════════════════════════════ */

    async function init() {
      try {
        const { data: { user } } = await client.auth.getUser();
        if (!user) {
          $scope.$apply(() => $location.path('/login'));
          return;
        }

        const { data: profile } = await client
          .from('profiles').select('*').eq('id', user.id).single();

        if (!profile || profile.role !== 'admin') {
          $scope.$apply(() => {
            alert('Access Denied: Admin privileges required.');
            $location.path('/profile');
          });
          return;
        }

        /* Load bookings + members in parallel */
        const [bookingsRes, membersRes] = await Promise.all([
          client.from('Bookings').select('*').order('session_date', { ascending: false }),
          client.from('profiles').select('*')
        ]);

        $scope.$apply(() => {
          $scope.loading = false;
          $scope.adminName = profile.fname || profile.full_name || user.email?.split('@')[0] || 'Admin';
          $scope.bookings = bookingsRes.data || [];
          $scope.members  = membersRes.data  || [];
          computeStats($scope.bookings, $scope.members);
        });

      } catch (err) {
        console.error('Dashboard init error:', err);
        $scope.$apply(() => { $scope.loading = false; });
      }
    }

    init();
  }
]);