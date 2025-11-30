export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          color: string
          type: 'income' | 'expense'
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon: string
          color: string
          type: 'income' | 'expense'
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          color?: string
          type?: 'income' | 'expense'
          is_default?: boolean
          created_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          note: string | null
          category_id: string | null
          payment_method_id: string | null
          date: string
          is_recurring: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          note?: string | null
          category_id?: string | null
          payment_method_id?: string | null
          date: string
          is_recurring?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          note?: string | null
          category_id?: string | null
          payment_method_id?: string | null
          date?: string
          is_recurring?: boolean
          created_at?: string
        }
      }
      incomes: {
        Row: {
          id: string
          user_id: string
          amount: number
          source: string | null
          date: string
          is_recurring: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          source?: string | null
          date: string
          is_recurring?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          source?: string | null
          date?: string
          is_recurring?: boolean
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
      }
      expense_tags: {
        Row: {
          id: string
          expense_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          expense_id: string
          tag_id: string
        }
        Update: {
          id?: string
          expense_id?: string
          tag_id?: string
        }
      }
      bills: {
        Row: {
          id: string
          expense_id: string
          image_url: string
          ocr_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          expense_id: string
          image_url: string
          ocr_text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          expense_id?: string
          image_url?: string
          ocr_text?: string | null
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          month: number
          year: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          month: number
          year: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          month?: number
          year?: number
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          billing_cycle: 'monthly' | 'yearly'
          next_payment_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          billing_cycle: 'monthly' | 'yearly'
          next_payment_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          billing_cycle?: 'monthly' | 'yearly'
          next_payment_date?: string
          created_at?: string
        }
      }
    }
  }
}
