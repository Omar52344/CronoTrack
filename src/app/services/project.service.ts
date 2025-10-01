import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  constructor(private supabaseService: SupabaseService) {}

  async getProjects() {
    const { data, error } = await this.supabaseService.client
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  }

  async createProject(project: Omit<Project, 'id' | 'user_id' | 'created_at'>) {
    const { data, error } = await this.supabaseService.client
      .from('projects')
      .insert([project])
      .select();
    return { data, error };
  }

  async updateProject(id: string, updates: Partial<Project>) {
    const { data, error } = await this.supabaseService.client
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  }

  async deleteProject(id: string) {
    const { error } = await this.supabaseService.client
      .from('projects')
      .delete()
      .eq('id', id);
    return { error };
  }
}