import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY


// Auth helpers

class service{
     supabase;
    constructor(){
this.supabase=createClient(supabaseUrl, supabaseAnonKey);
    }
async signUp(email , password, fullName){
const {data, error}=  await this.supabase.auth.signUp({
    email ,
    password,
    options:{
        data:{
            full_name:fullName
        }
    }
})
if(error){
    throw error
}
if(data.user){
    await this.supabase.from('profiles').insert({
        id:data.user.id,
        full_name:fullName
    })
}
return data;
}
//sign in function
async signIn(email, password){
    const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
    })
    if(error){
        throw error
    }
    return data;
}

async signOut(){
    const {error}= await  this.supabase.auth.signOut();
    if(error){
        throw error
    }
    return true;
}

async getCurrentUser(){
    const {data:{user}}= await this.supabase.auth.getUser();
    return user;
}
async getProfile(userId){
    const {data,error}= await this.supabase.from('profiles').select('*').eq('id',userId).single();
    if(error){
        throw error
    }
    return data;
}
async getSubscription(userId){
    const {data,error}= await this.supabase.from('subscriptions').select('*').eq('user_id',userId).single();
    if(error){
        throw error
    }
    return data;
}

}


const authService = new service();
export default authService



