import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get current user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      console.error('Role check error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { batch, department } = await req.json();

    if (!batch || !department) {
      return new Response(
        JSON.stringify({ error: 'Batch and department are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Deleting all applications for batch: ${batch}, department: ${department}`);

    // Get all application IDs for this batch and department
    const { data: applications, error: fetchError } = await supabase
      .from('applications')
      .select('id')
      .eq('batch', batch)
      .eq('department', department);

    if (fetchError) {
      console.error('Error fetching applications:', fetchError);
      throw fetchError;
    }

    if (!applications || applications.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No applications found',
          deletedApplications: 0,
          deletedFacultyAssignments: 0,
          deletedNotifications: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const applicationIds = applications.map(app => app.id);
    console.log(`Found ${applicationIds.length} applications to delete`);

    // Delete faculty assignments
    const { error: facultyDeleteError, count: facultyCount } = await supabase
      .from('application_subject_faculty')
      .delete({ count: 'exact' })
      .in('application_id', applicationIds);

    if (facultyDeleteError) {
      console.error('Error deleting faculty assignments:', facultyDeleteError);
      throw facultyDeleteError;
    }

    console.log(`Deleted ${facultyCount || 0} faculty assignments`);

    // Delete notifications
    const { error: notificationDeleteError, count: notificationCount } = await supabase
      .from('notifications')
      .delete({ count: 'exact' })
      .eq('related_entity_type', 'application')
      .in('related_entity_id', applicationIds);

    if (notificationDeleteError) {
      console.error('Error deleting notifications:', notificationDeleteError);
      throw notificationDeleteError;
    }

    console.log(`Deleted ${notificationCount || 0} notifications`);

    // Delete applications
    const { error: appDeleteError, count: appCount } = await supabase
      .from('applications')
      .delete({ count: 'exact' })
      .in('id', applicationIds);

    if (appDeleteError) {
      console.error('Error deleting applications:', appDeleteError);
      throw appDeleteError;
    }

    console.log(`Deleted ${appCount || 0} applications`);

    // Create audit log
    await supabase.rpc('create_audit_log', {
      p_action: 'DELETE_ALL_APPLICATIONS',
      p_table_name: 'applications',
      p_metadata: {
        batch,
        department,
        deleted_applications: appCount || 0,
        deleted_faculty_assignments: facultyCount || 0,
        deleted_notifications: notificationCount || 0,
        performed_by: user.id
      }
    });

    console.log('Bulk deletion completed successfully');

    return new Response(
      JSON.stringify({
        message: 'All applications deleted successfully',
        deletedApplications: appCount || 0,
        deletedFacultyAssignments: facultyCount || 0,
        deletedNotifications: notificationCount || 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in delete-all-applications function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
