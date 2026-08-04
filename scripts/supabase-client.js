(function () {
    var SUPABASE_URL = 'https://icthrorazvomxfhrzibb.supabase.co';
    var SUPABASE_ANON =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljdGhyb3JhenZvbXhmaHJ6aWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3OTg2NjcsImV4cCI6MjEwMTM3NDY2N30.VRS_T5yq6kGlklTJqoyAq54g4kIGG2nfU8iMjGCQmxg';
  
    if (!window.supabase || !window.supabase.createClient) {
      console.error('Load @supabase/supabase-js@2 before supabase-client.js');
      return;
    }
  
    window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  
    window.DA_pushNotify = async function (title, body, url) {
      try {
        await fetch('/api/send-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || 'DA United',
            body: body || 'New update from DA United',
            url: url || '/pages/dashboard.html',
            tag: 'da-united'
          })
        });
      } catch (e) {
        console.warn('push failed', e);
      }
    };
  })();