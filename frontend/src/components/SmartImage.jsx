import { splitProps } from 'solid-js';
import { Image as UnpicImage } from '@unpic/solid';

/**
 * SmartImage – drop-in replacement for <img>.
 *
 * Features:
 * 1. For remote URLs (http/https) – uses UnpicImage which delivers responsive,
 *    auto-format images via CDN params.
 * 2. For local static assets (e.g. /assets/foo.png) – outputs a <picture> that
 *    serves AVIF → WebP → original, so browsers load the smallest format they support.
 * 3. For SVG files – renders as regular <img> since SVG is already optimized.
 * 4. For WebP/AVIF files – renders as regular <img> since they're already optimized.
 * 5. Passes through all other props (width, height, class, style, etc.).
 *
 * Usage:
 *   <SmartImage src="/assets/banners/vip-rewards.png" alt="VIP" width={480} height={320} />
 */
export default function SmartImage(props) {
  const [local, rest] = splitProps(props, ['src', 'alt']);

  // Remote images (starts with http or https)
  if (/^https?:\/\//i.test(local.src)) {
    return <UnpicImage src={local.src} alt={local.alt ?? ''} {...rest} />;
  }

  // SVG files - render as regular img tag since SVG is already optimized
  if (/\.svg$/i.test(local.src)) {
    return <img src={local.src} alt={local.alt ?? ''} loading="lazy" decoding="async" {...rest} />;
  }

  // WebP/AVIF files - render as regular img tag since they're already optimized
  if (/\.(webp|avif)$/i.test(local.src)) {
    return <img src={local.src} alt={local.alt ?? ''} loading="lazy" decoding="async" {...rest} />;
  }

  // Local static images (PNG/JPG) – assume we generated .avif & .webp via convert-images.js
  const base = local.src.replace(/\.(png|jpe?g)$/i, '');
  const ext = local.src.match(/\.([a-z0-9]+)$/i)?.[1] ?? 'png';

  return (
    <picture>
      <source srcSet={`${base}.avif`} type="image/avif" />
      <source srcSet={`${base}.webp`} type="image/webp" />
      <img src={local.src} alt={local.alt ?? ''} loading="lazy" decoding="async" {...rest} />
    </picture>
  );
} 