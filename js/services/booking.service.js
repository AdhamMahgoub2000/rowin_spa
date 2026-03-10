angular.module('rowinApp')
  .service('BookingService', ['SupabaseService', function (SupabaseService) {
    const client = SupabaseService.client;

    this.getUser = async function () {
      const { data: { user } } = await client.auth.getUser();
      return user || null;
    };

    this.getProfile = async function (userId) {
      const { data: profile, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return profile;
    };

    this.createBooking = async function (booking) {
      const { error } = await client.from('Bookings').insert([booking]);
      if (error) throw error;
      return true;
    };

    this.sendBookingEmail = async function (payload) {
      try {
        await client.functions.invoke('send-booking-email', { body: payload });
      } catch (err) {
        console.warn('Email failed:', err);
      }
    };

    this.getSessionsByEmail = async function (email) {
      const { data: sessions, error } = await client
        .from('Bookings')
        .select('*')
        .eq('email_address', email);
      if (error) throw error;
      const today = new Date();
      const myUpcoming = sessions.filter(b => new Date(b.session_date) >= today);
      return { all: sessions, upcoming: myUpcoming };
    };

    this.getAllSessions = async function () {
      const { data: bookings, error } = await client
        .from('Bookings')
        .select('*');
      if (error) throw error;
      return bookings;
    };
  }]);