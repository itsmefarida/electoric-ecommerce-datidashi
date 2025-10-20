// app/(public)/@banner/page.tsx
import Hero from '@/components/Hero';

// Konten ini akan otomatis dimasukkan ke dalam prop "banner" di layout.tsx
export default function BannerSlot() {
  return <Hero />;
}