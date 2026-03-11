angular.module("rowinApp")
  .service("AuthService", ['SupabaseService', '$rootScope', '$location', '$route',
    function(SupabaseService, $rootScope, $location, $route) {

      const client = SupabaseService.client;

      this.getUser = async function () {
        const { data } = await client.auth.getUser();
        return data.user;
      };

      this.getProfile = async function (userId) {
        const { data } = await client
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        return data;
      };

      this.login = async function (email, password) {
        const { data, error } = await client.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (data.user && !data.user.email_confirmed_at) {
          await client.auth.signOut();
          return { error: { message: "Please confirm your email first." } };
        }

        return { data, error };
      };

      this.resetPassword = async function (email) {
        const { data, error } = await client.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/reset-password-confirm.html`,
          }
        );
        return { data, error };
      };

      // --- SPA-friendly logout ---
      this.logout = async function () {
        try {
          await client.auth.signOut();
          // Broadcast event for controllers to clear user state if needed
          $rootScope.$broadcast('user:loggedOut');
          $rootScope.authReady = false;
          $rootScope.currentUser = null;
          // Navigate client-side without full page reload
          $route.reload();
          // Trigger digest cycle to update views
          $rootScope.$applyAsync();
        } catch (error) {
          console.error('Logout failed:', error);
        }
      };

      this.verifySession = async function () {
        const { data, error } = await client.auth.getSession();
        return { session: data?.session, error };
      };

      this.updatePassword = async function (newPassword) {
        const { data, error } = await client.auth.updateUser({
          password: newPassword
        });
        return { data, error };
      };

  }]);