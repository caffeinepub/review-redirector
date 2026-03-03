import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { CheckCheck, Copy, Settings, Sparkles, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useGoogleMapsUrl, useReviews } from "../hooks/useQueries";

const PARTICLES = Array.from({ length: 8 }, (_, i) => i);
const STARS = ["s1", "s2", "s3", "s4", "s5"];

export default function MainPage() {
  const [copied, setCopied] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    data: mapsUrl,
    isLoading: isMapsLoading,
    isError: isMapsError,
  } = useGoogleMapsUrl();

  const {
    data: reviews,
    isLoading: isReviewsLoading,
    isError: isReviewsError,
  } = useReviews();

  const isLoading = isMapsLoading || isReviewsLoading;
  const isError = isMapsError || isReviewsError;

  const handleCopy = useCallback(async () => {
    if (!reviews || reviews.length === 0 || !mapsUrl || copied || isRedirecting)
      return;

    const randomReview = reviews[Math.floor(Math.random() * reviews.length)];

    try {
      await navigator.clipboard.writeText(randomReview);
      setCopied(true);
      setIsRedirecting(true);

      toast.success("Review copied! Redirecting to Google Maps...", {
        duration: 3000,
        icon: "⭐",
      });

      setTimeout(() => {
        window.location.href = mapsUrl;
      }, 1500);
    } catch {
      toast.error("Failed to copy to clipboard. Please try again.");
    }
  }, [reviews, mapsUrl, copied, isRedirecting]);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/assets/generated/hero-bg.dim_1920x1080.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-navy-deep/70" />
      <div className="absolute inset-0 bg-navy-mesh" />

      {/* Floating particles */}
      {PARTICLES.map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${10 + i * 11}%`,
            top: `${15 + (i % 3) * 25}%`,
            backgroundColor: `oklch(0.76 0.16 75 / ${0.2 + (i % 4) * 0.1})`,
          }}
          animate={{
            y: [0, -24, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}

      {/* Admin corner link */}
      <div className="relative z-10 flex justify-end p-4">
        <Link
          to="/admin"
          data-ocid="main.link"
          className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200 group px-3 py-1.5 rounded-full border border-border/30 hover:border-border/60 bg-navy-surface/30 backdrop-blur-sm"
        >
          <Settings className="w-3 h-3 group-hover:rotate-45 transition-transform duration-300" />
          Admin
        </Link>
      </div>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-8 max-w-xl"
        >
          {/* Star decoration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "backOut" }}
            className="flex items-center gap-1"
          >
            {STARS.map((id, i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <Star className="w-5 h-5 fill-gold text-gold" />
              </motion.div>
            ))}
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="space-y-3"
          >
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-tight tracking-tight text-gradient-gold">
              Share Your
              <br />
              Experience
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-sm mx-auto">
              Click below to copy a review and share it on Google Maps. It takes
              just one click.
            </p>
          </motion.div>

          {/* CTA Button area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "backOut" }}
            className="flex flex-col items-center gap-4"
          >
            {isLoading ? (
              <div
                data-ocid="main.loading_state"
                className="flex flex-col items-center gap-3"
              >
                <Skeleton className="w-64 h-16 rounded-2xl bg-navy-raised/60" />
                <Skeleton className="w-36 h-4 rounded-full bg-navy-raised/40" />
              </div>
            ) : isError ? (
              <div
                data-ocid="main.error_state"
                className="flex flex-col items-center gap-3 px-6 py-4 rounded-2xl border border-destructive/30 bg-destructive/10"
              >
                <p className="text-destructive text-sm font-medium">
                  Unable to load. Please refresh.
                </p>
              </div>
            ) : (
              <>
                {/* Pulse ring wrapper */}
                <div className="relative">
                  <AnimatePresence>
                    {!copied && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          border: "2px solid oklch(0.76 0.16 75 / 0.4)",
                        }}
                        animate={{
                          scale: [1, 1.12, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.button
                    data-ocid="main.primary_button"
                    onClick={handleCopy}
                    disabled={
                      copied || isRedirecting || !mapsUrl || !reviews?.length
                    }
                    whileHover={!copied ? { scale: 1.04 } : {}}
                    whileTap={!copied ? { scale: 0.97 } : {}}
                    className={`
                      relative flex items-center gap-3 px-10 py-5 rounded-2xl font-body font-semibold text-lg
                      transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
                      disabled:opacity-60 disabled:cursor-not-allowed
                      ${
                        copied
                          ? "bg-green-800/40 text-green-300 border border-green-700/40"
                          : "glow-gold text-primary-foreground border border-gold/20"
                      }
                    `}
                    style={
                      !copied
                        ? {
                            background:
                              "linear-gradient(135deg, oklch(0.76 0.16 75), oklch(0.68 0.14 60))",
                          }
                        : undefined
                    }
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.span
                          key="check"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="flex items-center gap-3"
                        >
                          <CheckCheck className="w-5 h-5" />
                          Copied! Redirecting...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="flex items-center gap-3"
                        >
                          <Copy className="w-5 h-5" />
                          Copy Review &amp; Go to Maps
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Shimmer overlay */}
                    {!copied && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{
                          duration: 2.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                          repeatDelay: 1.5,
                        }}
                      >
                        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                      </motion.div>
                    )}
                  </motion.button>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-muted-foreground/70 text-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold/60" />A fresh
                  review every click
                </motion.p>
              </>
            )}
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 px-4">
        <p className="text-muted-foreground/40 text-xs">
          © {new Date().getFullYear()}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground/70 transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
