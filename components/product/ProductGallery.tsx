'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import type { ProductImage, ProductVideo } from '@/types/product';
import { WaterMarkLeadFreeOverlay } from './WaterMarkLeadFreeOverlay';

interface ProductGalleryProps {
  images: ReadonlyArray<ProductImage>;
  video?: ProductVideo | null;
  title: string;
  preferredImage?: ProductImage | null;
  showLeadFreeBadge?: boolean;
  watermarkLicence?: string | null;
}

/**
 * Shopify auto-generates placeholder alt text like "image 2" when a
 * merchant doesn't set one. We don't want that surfacing to the page
 * - it's worse than no alt at all because it carries no information.
 * Treat empty, whitespace-only, or "image N"-style alts as missing
 * and fall back to a generated label that names the product.
 */
function isPlaceholderAlt(alt: string | null | undefined): boolean {
  if (!alt) return true;
  const trimmed = alt.trim();
  if (!trimmed) return true;
  return /^image[\s_-]*\d*$/i.test(trimmed);
}

export function ProductGallery({
  images,
  video = null,
  title,
  preferredImage = null,
  showLeadFreeBadge = false,
  watermarkLicence = null,
}: ProductGalleryProps) {
  const galleryImages =
    preferredImage && !images.some((image) => image.url === preferredImage.url)
      ? [preferredImage, ...images]
      : images;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeVideo = () => {
    videoRef.current?.pause();
    setVideoOpen(false);
    setPlaying(false);
  };
  const openVideo = () => {
    setVideoOpen(true);
    setPlaying(true);
  };
  useEffect(() => {
    if (!videoOpen) return;
    const player = videoRef.current;
    if (!player) return;
    void player.play().catch(() => setPlaying(false));
  }, [videoOpen]);
  useEffect(() => {
    closeVideo();
  }, [video?.url]);

  useEffect(() => {
    if (!preferredImage) return;
    const index = galleryImages.findIndex(
      (image) => image.url === preferredImage.url,
    );
    if (index >= 0) setSelectedIndex(index);
  }, [preferredImage?.url]);

  if (galleryImages.length === 0) {
    return (
      <div className="aspect-square flex items-center justify-center bg-gray-100 rounded">
        <span className="text-sm text-gray-500">No image available</span>
      </div>
    );
  }

  const showArrows = galleryImages.length > 1;
  const selected = galleryImages[selectedIndex] ?? galleryImages[0]!;
  const heroAlt = isPlaceholderAlt(selected.altText)
    ? `${title} - image ${selectedIndex + 1} of ${galleryImages.length}`
    : selected.altText!;

  const goPrev = () => {
    closeVideo();
    setSelectedIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
  };
  const goNext = () => {
    closeVideo();
    setSelectedIndex((i) => (i + 1) % galleryImages.length);
  };

  // Keyboard navigation when the gallery wrapper has focus.
  useEffect(() => {
    if (!showArrows) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') goPrev();
      else if (event.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showArrows, galleryImages.length]);

  return (
    <div
      className="relative w-full max-w-[70vh] aspect-square mx-auto overflow-hidden rounded border border-gray-200 bg-white"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${title} images`}
    >
      {videoOpen && video ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            src={video.url}
            poster={video.poster ?? undefined}
            playsInline
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nofullscreen nodownload noremoteplayback"
            muted={muted}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onContextMenu={(event) => event.preventDefault()}
            className="h-full w-full object-contain"
            aria-label={video.alt || `${title} product video`}
          />
          <button
            type="button"
            aria-label="Close video and return to product photos"
            onClick={closeVideo}
            className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black shadow-sm backdrop-blur-xl transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-black/65 p-1 shadow-lg backdrop-blur-xl">
            <button
              type="button"
              aria-label={playing ? 'Pause video' : 'Play video'}
              onClick={() => {
                const player = videoRef.current;
                if (!player) return;
                if (player.paused) void player.play().catch(() => setPlaying(false));
                else player.pause();
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label={muted ? 'Unmute video' : 'Mute video'}
              onClick={() => setMuted((current) => !current)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ) : null}
      <Image
        key={selected.url}
        src={selected.url}
        alt={heroAlt}
        fill
        priority
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-contain"
      />

      {!videoOpen && showLeadFreeBadge && watermarkLicence && <WaterMarkLeadFreeOverlay licenceNumber={watermarkLicence} />}

      {video && !videoOpen && (
        <button
          type="button"
          onClick={openVideo}
          className="absolute bottom-4 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-black/10 bg-white/90 px-5 py-3 text-sm font-medium tracking-tight text-neutral-900 shadow-[0_4px_20px_rgba(0,0,0,0.09)] backdrop-blur-xl transition-all hover:bg-white hover:shadow-[0_6px_24px_rgba(0,0,0,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          <Play className="h-4 w-4 fill-current" aria-hidden="true" />
          Watch Video
        </button>
      )}
      {showArrows && !videoOpen && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/90 hover:bg-white border border-gray-200 text-black shadow-none focus:outline-none focus:ring-2 focus:ring-brand-blue transition-colors"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/90 hover:bg-white border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-brand-blue transition-colors"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <div
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            Image {selectedIndex + 1} of {galleryImages.length}
          </div>
        </>
      )}
    </div>
  );
}
