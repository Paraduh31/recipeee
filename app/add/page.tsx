'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Category, CATEGORY_META } from '@/lib/types';
import { VoiceInput } from '@/components/VoiceInput';

const CATEGORIES = CATEGORY_META.filter(c => c.name !== 'All') as {
  name: Category;
  emoji: string;
  bg: string;
  text: string;
}[];

interface FormState {
  title: string;
  category: Category;
  description: string;
  ingredients: string;
  instructions: string;
  serves: string;
  prep_time: string;
  cook_time: string;
}

const EMPTY: FormState = {
  title: '',
  category: 'Sabzi',
  description: '',
  ingredients: '',
  instructions: '',
  serves: '',
  prep_time: '',
  cook_time: '',
};

export default function AddRecipePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof FormState) => (val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const appendVoice = useCallback(
    (key: keyof FormState) => (text: string) =>
      setForm(f => ({
        ...f,
        [key]: f[key] ? `${f[key]}\n${text}` : text,
      })),
    []
  );

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function save() {
    if (!form.title.trim()) { setError('Please enter a recipe title'); return; }
    if (!form.ingredients.trim()) { setError('Please enter the ingredients'); return; }
    if (!form.instructions.trim()) { setError('Please enter the instructions'); return; }

    setSaving(true);
    setError('');

    try {
      let image_url: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('recipe-images')
          .upload(path, imageFile);
        if (uploadErr) throw uploadErr;
        const { data } = supabase.storage.from('recipe-images').getPublicUrl(path);
        image_url = data.publicUrl;
      }

      const { error: insertErr } = await supabase.from('recipes').insert({
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim() || null,
        ingredients: form.ingredients.trim(),
        instructions: form.instructions.trim(),
        serves: form.serves ? parseInt(form.serves) : null,
        prep_time: form.prep_time ? parseInt(form.prep_time) : null,
        cook_time: form.cook_time ? parseInt(form.cook_time) : null,
        image_url,
      });

      if (insertErr) throw insertErr;
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-10">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-orange-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm font-medium">
              <ArrowLeft size={18} />
              Back
            </button>
          </Link>
          <h1 className="font-bold text-gray-900">New Recipe</h1>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-4 py-2 rounded-full text-sm font-semibold active:scale-95 transition-all"
          >
            <Save size={15} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Photo */}
        <label className="block cursor-pointer">
          {imagePreview ? (
            <div className="relative h-48 rounded-2xl overflow-hidden">
              <Image src={imagePreview} alt="preview" fill className="object-cover" />
              <button
                type="button"
                onClick={e => { e.preventDefault(); setImageFile(null); setImagePreview(''); }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="h-32 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 flex flex-col items-center justify-center gap-2 text-orange-400 hover:bg-orange-100 transition-colors">
              <Upload size={24} />
              <span className="text-sm font-medium">Add a photo (optional)</span>
            </div>
          )}
          <input type="file" accept="image/*" capture="environment" onChange={handleImage} className="hidden" />
        </label>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Recipe Name *</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Aloo Gobi, Palak Paneer…"
              value={form.title}
              onChange={e => set('title')(e.target.value)}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
            />
            <VoiceInput onTranscript={t => set('title')(t)} />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                type="button"
                onClick={() => set('category')(cat.name)}
                className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 text-xs font-semibold transition-all active:scale-95 ${
                  form.category === cat.name
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-gray-100 bg-white text-gray-600 hover:border-orange-200'
                }`}
              >
                <span className="text-xl">{cat.emoji}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Serves / Prep / Cook */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Serves', key: 'serves', placeholder: '4', suffix: 'people' },
            { label: 'Prep time', key: 'prep_time', placeholder: '15', suffix: 'min' },
            { label: 'Cook time', key: 'cook_time', placeholder: '30', suffix: 'min' },
          ].map(({ label, key, placeholder, suffix }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={placeholder}
                  value={form[key as keyof FormState]}
                  onChange={e => set(key as keyof FormState)(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">{suffix}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
          <div className="flex gap-2">
            <textarea
              placeholder="A quick note about this dish…"
              value={form.description}
              onChange={e => set('description')(e.target.value)}
              rows={2}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
            <VoiceInput onTranscript={appendVoice('description')} />
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-gray-700">Ingredients *</label>
            <span className="text-xs text-gray-400">One per line</span>
          </div>
          <div className="flex gap-2">
            <textarea
              placeholder={"2 cups basmati rice\n1 tsp cumin seeds\n1 onion, chopped…"}
              value={form.ingredients}
              onChange={e => set('ingredients')(e.target.value)}
              rows={6}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none font-mono"
            />
            <div className="flex flex-col justify-start pt-0.5">
              <VoiceInput onTranscript={appendVoice('ingredients')} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">🎤 Tap mic and say each ingredient</p>
        </div>

        {/* Instructions */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-gray-700">Instructions *</label>
            <span className="text-xs text-gray-400">Step by step</span>
          </div>
          <div className="flex gap-2">
            <textarea
              placeholder={"1. Heat oil in a pan\n2. Add cumin and let it splutter\n3. Add onions and fry till golden…"}
              value={form.instructions}
              onChange={e => set('instructions')(e.target.value)}
              rows={8}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
            <div className="flex flex-col justify-start pt-0.5">
              <VoiceInput onTranscript={appendVoice('instructions')} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">🎤 Tap mic and narrate the steps</p>
        </div>

        {/* Save button (bottom) */}
        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-4 rounded-2xl font-bold text-base active:scale-95 transition-all shadow-lg shadow-orange-200"
        >
          {saving ? 'Saving recipe…' : '💾 Save Recipe'}
        </button>
      </div>
    </div>
  );
}
