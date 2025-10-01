import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private supabaseService: SupabaseService) {}

  async getCategories() {
    const { data, error } = await this.supabaseService.client
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  }

  async createCategory(category: Omit<Category, 'id' | 'user_id' | 'created_at'>) {
    const { data, error } = await this.supabaseService.client
      .from('categories')
      .insert([category])
      .select();
    return { data, error };
  }

  async updateCategory(id: string, updates: Partial<Category>) {
    const { data, error } = await this.supabaseService.client
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  }

  async deleteCategory(id: string) {
    const { error } = await this.supabaseService.client
      .from('categories')
      .delete()
      .eq('id', id);
    return { error };
  }
}