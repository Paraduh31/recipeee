'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { supabase, isConfigured } from '@/lib/supabase';
import { Recipe, CATEGORY_META } from '@/lib/types';
import { RecipeCard } from '@/components/RecipeCard';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return; }
    supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRecipes(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return recipes.filter(r => {
      const matchCat = activeCategory === 'All' || r.category === activeCategory;
      const matchQ =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.ingredients.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [recipes, search, activeCategory]);

  if (!isConfigured) return <SetupScreen />;

  return (
    <main className="min-h-screen bg-amber-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-orange-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🍛</span>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-none">Mom's Recipes</h1>
                <p className="text-xs text-gray-400">All your favourite dishes</p>
              </div>
            </div>
            <Link href="/add">
              <button className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow active:scale-95 transition-all">
                <Plus size={16} />
                Add Recipe
              </button>
            </Link>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search by name or ingredient…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
            />
          </div>
        </div>
        {/* Category pills */}
        <div className="overflow-x-auto scrollbar-hide px-4 pb-3">
          <div className="flex gap-2 max-w-2xl mx-auto">
            {CATEGORY_META.map(cat => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  activeCategory === cat.name
                    ? 'bg-orange-500 text-white shadow'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                }`}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4 pb-10">
        {error ? (
          <p className="text-center text-red-500 py-8 text-sm">Error: {error}</p>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasSearch={!!search} category={activeCategory} />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(r => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState({ hasSearch, category }: { hasSearch: boolean; category: string }) {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">
        {hasSearch ? '🔍' : category !== 'All' ? '🍽️' : '📖'}
      </div>
      <p className="text-gray-700 font-semibold text-lg">
        {hasSearch
          ? 'No recipes found'
          : category !== 'All'
          ? `No ${category} recipes yet`
          : 'No recipes yet'}
      </p>
      <p className="text-gray-400 text-sm mt-1">
        {hasSearch
          ? 'Try a different search term'
          : 'Tap "Add Recipe" to get started!'}
      </p>
    </div>
  );
}

function SetupScreen() {
  const steps = [
    'Go to supabase.com and create a free account',
    'Create a new project (name it "recipes")',
    'In SQL Editor, paste & run the contents of supabase/schema.sql',
    'Go to Settings → API → copy the Project URL and anon/public key',
    'Create a .env.local file (see .env.local.example) and paste the values',
    'Restart the dev server — done!',
  ];
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-7 shadow-xl">
        <div className="text-center mb-6">
          <span className="text-5xl">🔧</span>
          <h1 className="text-xl font-bold mt-3">One-time setup needed</h1>
          <p className="text-gray-500 text-sm mt-1">Takes about 5 minutes to connect the database</p>
        </div>
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 items-start text-sm text-gray-700">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
