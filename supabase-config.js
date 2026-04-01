const VITE_SUPABASE_URL = 'https://qrelbmfykwuzxjtflczn.supabase.co';
const VITE_SUPABASE_ANON_KEY = 'sb_publishable_GRAA7nmHM993hsWDTapWxg_NlwscRtA';
const supabaseClient = window.supabase.createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

// Data globais
let currentUser = null; 
let currentProfile = null; 
let userPurchases = []; 
let ALL_PRODUCTS = [];
