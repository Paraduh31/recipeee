'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Users, ChefHat, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Recipe, getCategoryMeta } from '@/lib/types';

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setRecipe(data);
        setLoading(false);
      });
  }, [id]);

  async function deleteRecipe() {
    if (!confirm('Delete this recipe? This cannot be undone.')) return;
    setDeleting(true);
    await supabase.from('recipes').delete().eq('id', id);
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center gap-4">
        <span className="text-5xl">😕</span>
        <p className="text-gray-600 font-medium">Recipe not found</p>
        <Link href="/" className="text-orange-500 font-semibold underline">Go home</Link>
      </div>
    );
  }

  const cat = getCategoryMeta(recipe.category);
  const totalTime = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0);

  const ingredients = recipe.ingredients
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const steps = recipe.instructions
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-amber-50 pb-10">
      {/* Hero */}
      <div className="relative h-56 w-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
        {recipe.image_url ? (
          <Image src={recipe.image_url} alt={recipe.title} fill className="object-cover" />
        ) : (
          <span className="text-8xl select-none">{cat.emoji}</span>
        )}
        {/* Overlay bar */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4">
          <Link href="/">
            <button className="bg-white/90 backdrop-blur text-gray-700 rounded-full p-2 shadow-md hover:bg-white transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <button
            onClick={deleteRecipe}
            disabled={deleting}
            className="bg-white/90 backdrop-blur text-red-500 rounded-full p-2 shadow-md hover:bg-white transition-colors disabled:opacity-50"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-5">
        {/* Card header */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <span className={`inline-block ${cat.bg} ${cat.text} text-xs font-semibold px-2.5 py-1 rounded-full mb-2`}>
            {cat.emoji} {recipe.category}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{recipe.title}</h1>
          {recipe.description && (
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">{recipe.description}</p>
          )}

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {recipe.serves && (
              <Chip icon={<Users size={14} />} label={`${recipe.serves} servings`} />
            )}
            {recipe.prep_time && (
              <Chip icon={<Clock size={14} />} label={`${recipe.prep_time}m prep`} />
            )}
            {recipe.cook_time && (
              <Chip icon={<ChefHat size={14} />} label={`${recipe.cook_time}m cook`} />
            )}
            {totalTime > 0 && recipe.prep_time && recipe.cook_time && (
              <Chip icon={<Clock size={14} />} label={`${totalTime}m total`} accent />
            )}
          </div>
        </div>

        {/* Ingredients */}
        <Section title="Ingredients" emoji="🧅">
          <ul className="space-y-2">
            {ingredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                {ing}
              </li>
            ))}
          </ul>
        </Section>

        {/* Instructions */}
        <Section title="Instructions" emoji="📋">
          <ol className="space-y-4">
            {steps.map((step, i) => {
              const isNumbered = /^\d+[.)]\s*/.test(step);
              const text = isNumbered ? step.replace(/^\d+[.)]\s*/, '') : step;
              return (
                <li key={i} className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{text}</p>
                </li>
              );
            })}
          </ol>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
      <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>{emoji}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Chip({ icon, label, accent }: { icon: React.ReactNode; label: string; accent?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
      accent ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
    }`}>
      {icon}
      {label}
    </div>
  );
}
