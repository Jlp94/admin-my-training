export interface Diet {
  _id: string;
  userId: string;
  name: string;
  isActive: boolean;
  totalKcal: number;
  notes?: string;
  createdAt: string;
}
