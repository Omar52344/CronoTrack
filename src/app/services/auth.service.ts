import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: User | null = null;

  constructor(private supabaseService: SupabaseService, private router: Router) {
    this.supabaseService.client.auth.onAuthStateChange((event, session) => {
      this.user = session?.user ?? null;
      if (this.user) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  get currentUser() {
    return this.user;
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabaseService.client.auth.signUp({
      email,
      password
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  async signInWithGoogle() {
    const { data, error } = await this.supabaseService.client.auth.signInWithOAuth({
      provider: 'google'
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabaseService.client.auth.signOut();
    return { error };
  }
}