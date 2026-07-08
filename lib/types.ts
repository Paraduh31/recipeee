export type Category =
  | 'Sabzi'
  | 'Dal'
  | 'Rice'
  | 'Roti & Bread'
  | 'Snacks'
  | 'Sweets'
  | 'Soup'
  | 'Chutney'
  | 'Drinks'
  | 'Other';

export interface Recipe {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  category: Category;
  ingredients: string;
  instructions: string;
  serves: number | null;
  prep_time: number | null;
  cook_time: number | null;
  image_url: string | null;
}

export const CATEGORY_META: {
  name: Category | 'All';
  emoji: string;
  bg: string;
  text: string;
}[] = [
  { name: 'All',         emoji: '🍽️', bg: 'bg-gray-100',   text: 'text-gray-700' },
  { name: 'Sabzi',       emoji: '🥦', bg: 'bg-green-100',  text: 'text-green-700' },
  { name: 'Dal',         emoji: '🫘', bg: 'bg-amber-100',  text: 'text-amber-700' },
  { name: 'Rice',        emoji: '🍚', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  { name: 'Roti & Bread',emoji: '🫓', bg: 'bg-orange-100', text: 'text-orange-700' },
  { name: 'Snacks',      emoji: '🥨', bg: 'bg-purple-100', text: 'text-purple-700' },
  { name: 'Sweets',      emoji: '🍮', bg: 'bg-pink-100',   text: 'text-pink-700' },
  { name: 'Soup',        emoji: '🍲', bg: 'bg-blue-100',   text: 'text-blue-700' },
  { name: 'Chutney',     emoji: '🫙', bg: 'bg-lime-100',   text: 'text-lime-700' },
  { name: 'Drinks',      emoji: '🥛', bg: 'bg-cyan-100',   text: 'text-cyan-700' },
  { name: 'Other',       emoji: '🍽️', bg: 'bg-gray-100',   text: 'text-gray-700' },
];

export function getCategoryMeta(name: string) {
  return CATEGORY_META.find(c => c.name === name) ?? CATEGORY_META[CATEGORY_META.length - 1];
}
