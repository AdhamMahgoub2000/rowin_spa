angular.module('rowinApp')
.service('ContactService', ['SupabaseService', '$rootScope', function(SupabaseService, $rootScope) {

  const client = SupabaseService.client;

    this.sendRequest = async function(request){
        const { data, error } = await client
            .from('contact')
            .insert(request)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
    this.retrieveAllRequests= async function(){
        try {
      const { data, error } = await client
        .from('contact')
        .select('*')
        .order('priority', { ascending: true });

      if (error) { console.error('getUserData error:', error.message); return null; }
      return data;
    } catch (err) {
      console.error('Unexpected error in retrieveAllRequests:', err);
      return null;
    }
    }

}])