import type { Mantra } from '../types';

export const MOCK_MANTRAS: Mantra[] = [
  {
    id: 'mahamrityunjaya',
    name: 'Mahamrityunjaya Mantra',
    displayName: 'MAHAMRITYUNJAYA',
    text: 'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam',
    description: 'The great death-conquering mantra, dedicated to Shiva. Recited for health, longevity, and liberation.',
    audioUrl: '/maha_mritunjay.mp3',
    target: 100000,
    category: 'Shiva',
    order: 1,
    enabled: true,
    theme: {
      primaryColor: '#60A5FA',
      secondaryColor: '#1E3A8A',
      glowColor: 'rgba(96, 165, 250, 0.35)',
      bgTint: 'rgba(30, 58, 138, 0.06)',
      particleColor: '#60A5FA',
      backgroundStyle: 'cosmic',
    }
  },
  {
    id: 'gayatri',
    name: 'Gayatri Mantra',
    displayName: 'GAYATRI',
    text: 'Om Bhur Bhuva Svaha',
    description: 'A highly revered mantra from the Rig Veda, dedicated to the sun deity Savitr. Recited for wisdom and enlightenment.',
    audioUrl: '/gayatri_mantra.mp3',
    target: 100000,
    category: 'Vedic',
    order: 2,
    enabled: true,
    theme: {
      primaryColor: '#FBBF24',
      secondaryColor: '#B45309',
      glowColor: 'rgba(251, 191, 36, 0.35)',
      bgTint: 'rgba(180, 83, 9, 0.06)',
      particleColor: '#FBBF24',
      backgroundStyle: 'sunrise',
    }
  },
  {
    id: 'hanuman',
    name: 'Hanuman Mantra',
    displayName: 'HANUMAN',
    text: 'Om Hum Hanumate Namaha',
    description: 'Dedicated to Lord Hanuman. Recited for strength, courage, and protection.',
    audioUrl: '/hanuman.mp3',
    target: 100000,
    category: 'Hanuman',
    order: 3,
    enabled: true,
    theme: {
      primaryColor: '#EF4444',
      secondaryColor: '#7F1D1D',
      glowColor: 'rgba(239, 68, 68, 0.35)',
      bgTint: 'rgba(127, 29, 29, 0.06)',
      particleColor: '#EF4444',
      backgroundStyle: 'energetic',
    }
  },
  {
    id: 'shiva',
    name: 'Om Namah Shivaya',
    displayName: 'SHIVA',
    text: 'Om Namah Shivaya',
    description: 'The five-syllable mantra dedicated to Lord Shiva. Recited for inner peace and cosmic consciousness.',
    audioUrl: '/om_namah_shivay.mp3',
    target: 100000,
    category: 'Shiva',
    order: 4,
    enabled: true,
    theme: {
      primaryColor: '#818CF8',
      secondaryColor: '#312E81',
      glowColor: 'rgba(129, 140, 248, 0.35)',
      bgTint: 'rgba(49, 46, 129, 0.06)',
      particleColor: '#818CF8',
      backgroundStyle: 'cosmic',
    }
  }
];
