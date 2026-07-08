import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users } from 'lucide-react';
import { Recipe, getCategoryMeta } from '@/lib/types';

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const cat = getCategoryMeta(recipe.category);
  const totalTime = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0);

  return (
    <Link href={`/recipe/${recipe.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-95 transition-transform hover:shadow-md">
        {/* Image / placeholder */}
        <div className="relative h-36 w-full bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-5xl">{cat.emoji}</span>
          )}
          {/* Category badge */}
          <span
            className={`absolute top-2 left-2 ${cat.bg} ${cat.text} text-xs font-semibold px-2 py-0.5 rounded-full`}
          >
            {recipe.category}
          </span>
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
            {recipe.title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {totalTime}m
              </span>
            )}
            {recipe.serves && (
              <span className="flex items-center gap-1">
                <Users size={11} />
                {recipe.serves}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
