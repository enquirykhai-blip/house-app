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
  quantity?: string | null
  isBought: boolean
  addedBy: string
  createdAt: number
  boughtAt?: number
}

export interface Task {
  id: string
  title: string
  assignedTo: Person
  dueDate?: number | null
  isDone: boolean
  createdBy: string
  createdAt: number
  completedAt?: number
}

export interface FavoriteGrocery {
  name: string
  category: GroceryItem['category']
}

export interface HouseholdConfig {
  khaiName: string
  wifeName: string
  khaiUid: string
  wifeUid: string
  dateCategories?: string[]
  favoriteGroceries?: FavoriteGrocery[]
}

export type ActivityType =
  | 'date_added'
  | 'date_updated'
  | 'grocery_added'
  | 'grocery_bought'
  | 'task_added'
  | 'task_done'

export interface Activity {
  id: string
  actorUid: string
  actorName: string
  type: ActivityType
  /** The title/item name the action was about — user content, never translated. */
  detail: string
  createdAt: number
}
