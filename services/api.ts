import { Issue, User, UserType } from '../types';

// --- Supabase Client Initialization ---
// The global 'supabase' object is loaded from the CDN script in index.html.
//
// VERY IMPORTANT: Replace these placeholder values with your actual Supabase project URL and Anon Key.
// You can find these in your Supabase project settings under "API".
const SUPABASE_URL = 'https://zfylpxmbewjnjvfepyby.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmeWxweG1iZXdqbmp2ZmVweWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2ODYzNzgsImV4cCI6MjA3NDI2MjM3OH0.xDgXijdI2nhlfc8qo2Ubx0r-6D0VaMyf5SFEzF1MLKQ';

let supabase: any; // Use 'any' to accommodate the Supabase client type or null

// FIX: Removed the check for placeholder credentials. Since the credentials
// are provided, the check was causing a TypeScript error because the constant
// values could never match the placeholder strings.
if (!(window as any).supabase) {
    console.error('Supabase client library not found. Ensure the CDN script in index.html is loaded.');
    supabase = null;
} else {
    // @ts-ignore
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}


// --- Auth ---

export const onAuthStateChange = (callback: (user: User | null) => void) => {
    if (!supabase) {
        // If Supabase is not configured, the user is always logged out.
        callback(null);
        return { unsubscribe: () => {} }; // Return a mock subscription
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
        try {
            if (event === 'SIGNED_IN' && session?.user) {
                const profile = await getUserById(session.user.id);
                callback(profile);
            } else if (event === 'SIGNED_OUT') {
                callback(null);
            }
        } catch (error) {
            console.error('Error handling auth state change:', error);
            callback(null);
        }
    });
    return subscription;
};

export const getCurrentUser = async (): Promise<User | null> => {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
        return getUserById(session.user.id);
    }
    return null;
};

// Fix: Added 'email' to RegisterData type, as it's passed from the form for authentication.
type RegisterData = Omit<User, 'id' | 'created_at'> & {password: string};
export const registerUser = async (userData: RegisterData) => {
    if (!supabase) throw new Error('Supabase is not configured. Cannot register user.');
    const { email, password, ...profileData } = userData;
    
    // We pass profile data and email in options.data for the trigger to use if it exists.
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                ...profileData,
                email, // Pass email here as well for the trigger
                avatar_url: `https://i.pravatar.cc/150?u=${profileData.username}`,
            }
        }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Registration succeeded but no user was returned.");

    // After sign-up, we explicitly upsert the profile.
    // This makes the app resilient. If the `handle_new_user` trigger in the DB
    // is missing or outdated, this will create/update the profile correctly.
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: authData.user.id,
            email, // Explicitly save the email in the profiles table
            ...profileData,
            avatar_url: `https://i.pravatar.cc/150?u=${profileData.username}`,
        });
    
    if (profileError) {
        // This is a critical error. It could mean a RLS policy is wrong or a column is missing.
        console.error("Critical: Profile upsert failed after user creation:", profileError);
        // If profile creation fails, the entire registration should fail.
        // A more advanced implementation might try to delete the auth user here to clean up.
        throw profileError;
    }

    return authData;
};

export const login = async (usernameOrEmail: string, password?: string) => {
    if (!supabase) throw new Error('Supabase is not configured. Cannot login.');
    if (!password) throw new Error("Password is required for login.");

    const identifier = usernameOrEmail.trim();

    // 1. Find the user's email from their username OR email in the public profiles table.
    // This flexible query improves the data fetching part of the login process.
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .or(`username.ilike.${identifier},email.eq.${identifier}`)
        .limit(1)
        .single();

    // If a profile isn't found, throw a generic error. This can happen if the
    // username/email is wrong or if RLS policies block the query for unauthenticated users.
    if (profileError || !profile || !profile.email) {
        console.error("Login failed: Could not find a profile for the given username or email.", { identifier, profileError });
        throw new Error('Invalid credentials. Please try again.');
    }

    // 2. With the correct email retrieved, attempt to sign in via Supabase Auth.
    const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
    });

    if (authError) {
        // Supabase auth will throw an error for incorrect passwords. We re-throw it, and the
        // UI layer will catch it and display a generic "Invalid credentials" message.
        throw authError;
    }
    
    return getUserById(data.user.id);
};

export const logout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
};

// --- Issues ---

export const ISSUES_PER_PAGE = 10;

export const getIssues = async (page = 0): Promise<Issue[]> => {
    if (!supabase) return [];
    const from = page * ISSUES_PER_PAGE;
    const to = from + ISSUES_PER_PAGE - 1;

    const { data, error } = await supabase
        .from('issues')
        .select(`
            *,
            profiles (
                id, username, avatar_url, type
            )
        `)
        .order('created_at', { ascending: false })
        .range(from, to);
        
    if (error) throw error;
    return data;
};

export const getIssueById = async (id: string): Promise<Issue | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('issues')
        .select(`
            *,
            profiles (*),
            issue_updates (*)
        `)
        .eq('id', id)
        .order('timestamp', { foreignTable: 'issue_updates', ascending: false })
        .single();

    if (error) throw error;
    // Supabase returns issue_updates as 'updates' in the type, adjust if needed
    if (data && data.issue_updates) {
        data.updates = data.issue_updates;
        delete data.issue_updates;
    }
    return data;
};

type CreateIssueData = Omit<Issue, 'id' | 'created_at' | 'upvotes' | 'reposts' | 'image_url'> & { image: File };
export const createIssue = async (issueData: CreateIssueData) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { image, ...issueDetails } = issueData;

    // 1. Upload image to storage
    const fileName = `${Date.now()}_${image.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('issue-images')
        .upload(fileName, image);

    if (uploadError) throw uploadError;

    // 2. Get public URL of the uploaded image
    const { data: { publicUrl } } = supabase.storage
        .from('issue-images')
        .getPublicUrl(fileName);

    // 3. Create the issue in the database
    const { error: insertError } = await supabase
        .from('issues')
        .insert({
            ...issueDetails,
            image_url: publicUrl,
            upvotes: 0,
            reposts: 0,
        });

    if (insertError) throw insertError;
};

export const getIssuesByAuthor = async (authorId: string): Promise<Issue[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('issues')
        .select(`*, profiles (*)`)
        .eq('author_id', authorId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

// This function needs a DB view or RPC to be efficient, but for now, it's a client-side filter
export const getIssuesByAuthority = async (authorityId: string): Promise<Issue[]> => {
    if (!supabase) return [];
    // A proper implementation would use an RPC function to find issues in an authority's jurisdiction.
    // As a placeholder, we fetch all issues they've updated.
    const { data: updates, error: updateError } = await supabase
      .from('issue_updates')
      .select('issue_id')
      .eq('updated_by', authorityId)

    if (updateError) throw updateError
    
    const issueIds = [...new Set(updates.map(u => u.issue_id))]

    const { data, error } = await supabase
        .from('issues')
        .select(`*, profiles (*)`)
        .in('id', issueIds)
        .order('created_at', { ascending: false });
    if (error) throw error
    return data
};

export const updateIssueStatus = async (issueId: string, status: string, updateText: string, authorityId: string) => {
    if (!supabase) throw new Error('Supabase not configured.');
    // Use an RPC to do this atomically in a real app, but transactions work too.
    const { error: updateError } = await supabase
        .from('issue_updates')
        .insert({ issue_id: issueId, update_text: `${status}: ${updateText}`, updated_by: authorityId });
    if (updateError) throw updateError;

    const { error: issueError } = await supabase
        .from('issues')
        .update({ status })
        .eq('id', issueId);
    if (issueError) throw issueError;
};

export const upvoteIssue = async (issueId: string) => {
    if (!supabase) return;
    await supabase.rpc('increment_upvotes', { issue_id_in: issueId });
};

export const repostIssue = async (issueId: string) => {
    if (!supabase) return;
    await supabase.rpc('increment_reposts', { issue_id_in: issueId });
};

export const getUserById = async (userId: string): Promise<User | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) {
        console.error("Error fetching user:", error);
        return null;
    }
    return data;
};

// --- Real-time Subscriptions ---
export const subscribeToIssueUpdates = (
    issueId: string, 
    onUpdate: () => void
): (() => Promise<"ok" | "timed out" | "error">) | null => {
    if (!supabase) return null;

    const channel = supabase.channel(`issue-${issueId}`);

    channel
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'issues', filter: `id=eq.${issueId}` },
            onUpdate // Refetch on any change to the issue row itself (e.g., status)
        )
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'issue_updates', filter: `issue_id=eq.${issueId}` },
            onUpdate // Refetch when a new update is added
        )
        .subscribe();

    // Return the cleanup function
    return () => channel.unsubscribe();
};