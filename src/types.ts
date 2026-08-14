export type Person = 'khai' | 'wife' | 'both'

export const DEFAULT_DATE_CATEGORIES = ['Utama', 'Appointment', 'Bercuti', 'Anniversary']

export interface ImportantDate {
  id: string
  title: string
  date: number // epoch ms
  category: string
  repeat: 'none' | 'monthly' | 'yearly'
  notes?: string | null
  createdBy: string
  createdAt: number
}

export interface GroceryItem {
  id: string
  item: string
  category: 'dapur' | 'mandian' | 'lain'
  quantity?: string
  isBought: boolean
  addedBy: string
  createdAt: number
  boughtAt?: number
}

export interface Task {
  id: string
  title: string
  assignedTo: Person
  dueDate?: number
  isDone: boolean
  createdBy: string
  createdAt: number
  completedAt?: number
}

export interface HouseholdConfig {
  khaiName: string
  wifeName: string
  khaiUid: string
  wifeUid: string
  dateCategories?: string[]
}
