angular.module('rowinApp')
.service('SupabaseService', function() {
    
    const SUPABASE_URL = 'https://mkxzgvwvftzimaugwzvn.supabase.co'; 
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1reHpndnd2ZnR6aW1hdWd3enZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMTU1NDUsImV4cCI6MjA4Njg5MTU0NX0.joEcxOQX1eav1BbSEnlqfkqktUT7nqAUy-ibXdlbj1E";

    this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
});