(()=>{'use strict';
const SUPABASE_URL='https://srhxpueskpvcwhmsmees.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_IRJTuxYE6J4MIYhXBlcfjg_UAmQgZDH';
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
const $=s=>document.querySelector(s), screen=$('#authScreen'), msg=$('#authMessage'), email=$('#authEmail'), password=$('#authPassword'), resend=$('#resendBtn');
let appLoaded=false;
function message(t,bad=false){msg.textContent=t;msg.style.color=bad?'#9b3b35':'';}
function loadApp(user){window.DP_USER=user;screen.classList.add('hidden');if(appLoaded)return;appLoaded=true;const s=document.createElement('script');s.src='app.js';document.body.appendChild(s);}
async function current(){const {data:{session}}=await sb.auth.getSession();if(session?.user)loadApp(session.user);else screen.classList.remove('hidden');}
$('#signInBtn').onclick=async()=>{message('Signing in…');const {data,error}=await sb.auth.signInWithPassword({email:email.value.trim(),password:password.value});if(error){message(error.message,true);return}loadApp(data.user)};
$('#signUpBtn').onclick=async()=>{if(!email.value.trim()||password.value.length<6){message('Enter your email and a password of at least 6 characters.',true);return}message('Creating your account…');const {data,error}=await sb.auth.signUp({email:email.value.trim(),password:password.value,options:{emailRedirectTo:location.origin}});if(error){message(error.message,true);return}if(data.session){loadApp(data.user)}else{message('Account created. Check your email and click the confirmation link, then come back and sign in.');resend.classList.remove('hidden')}};
resend.onclick=async()=>{const {error}=await sb.auth.resend({type:'signup',email:email.value.trim(),options:{emailRedirectTo:location.origin}});message(error?error.message:'Confirmation email sent again.',!!error)};
window.DP_SIGN_OUT=async()=>{await sb.auth.signOut();location.reload()};
sb.auth.onAuthStateChange((_event,session)=>{if(session?.user&&!appLoaded)loadApp(session.user)});
current();
})();
