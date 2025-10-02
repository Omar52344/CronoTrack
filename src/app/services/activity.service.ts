import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Activity {
  id: string;
  user_id: string;
  project_id?: string;
  category_id?: string;
  description?: string;
  start_time: string;
  end_time?: string;
  duration?: number; // en minutos
  created_at: string;
  projects?: { name: string; color: string };
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private currentActivity: Omit<Activity, 'id' | 'user_id' | 'created_at'> | null = null;
  private timer: any;

  constructor(private supabaseService: SupabaseService) {}

  async getActivities(filters?: { project_id?: string; category_id?: string; date?: string }) {
    let query = this.supabaseService.client
      .from('activities')
      .select('*, projects(name, color), categories(name, color)')
      .order('start_time', { ascending: false });

    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id);
    }
    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters?.date) {
      // Filtrar por fecha (asumiendo formato YYYY-MM-DD)
      const start = new Date(filters.date);
      const end = new Date(filters.date);
      end.setDate(end.getDate() + 1);
      query = query.gte('start_time', start.toISOString()).lt('start_time', end.toISOString());
    }

    const { data, error } = await query;
    return { data, error };
  }

  async createActivity(activity: Omit<Activity, 'id' | 'user_id' | 'created_at'>) {
    const { data, error } = await this.supabaseService.client
      .from('activities')
      .insert([activity])
      .select();
    return { data, error };
  }

  async updateActivity(id: string, updates: Partial<Activity>) {
    const { data, error } = await this.supabaseService.client
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  }

  async deleteActivity(id: string) {
    const { error } = await this.supabaseService.client
      .from('activities')
      .delete()
      .eq('id', id);
    return { error };
  }

  // Timer functionality
  startActivity(description?: string, projectId?: string, categoryId?: string) {
    if (this.currentActivity) {
      this.stopActivity();
    }

    this.currentActivity = {
      project_id: projectId,
      category_id: categoryId,
      description,
      start_time: this.toLocalISOString(new Date())
    };

    this.timer = setInterval(() => {
      // Actualizar duración en tiempo real si es necesario
    }, 1000);
  }

  async stopActivity() {
    if (!this.currentActivity) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - new Date(this.currentActivity.start_time).getTime()) / 60000);

    this.currentActivity.end_time = this.toLocalISOString(endTime);
    this.currentActivity.duration = duration;

    // Guardar en DB
    const { data, error } = await this.createActivity(this.currentActivity);
    if (error) {
      console.error('Error saving activity:', error);
    }

    this.currentActivity = null;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    return { data, error };
  }

  private toLocalISOString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  getCurrentActivity() {
    return this.currentActivity;
  }

  isTimerRunning() {
    return !!this.currentActivity;
  }
}