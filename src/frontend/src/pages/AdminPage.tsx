import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  GripVertical,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  MessageSquareQuote,
  Plus,
  Save,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGoogleMapsUrl,
  useIsAdmin,
  useReviews,
  useUpdateGoogleMapsUrl,
  useUpdateReviews,
} from "../hooks/useQueries";

type ReviewItem = { id: string; text: string };

let reviewIdCounter = 0;
function nextReviewId() {
  reviewIdCounter += 1;
  return `review-${reviewIdCounter}`;
}

function reviewsToItems(reviews: string[]): ReviewItem[] {
  return reviews.map((text) => ({ id: nextReviewId(), text }));
}

export default function AdminPage() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: mapsUrl, isLoading: isMapsLoading } = useGoogleMapsUrl();
  const { data: reviews, isLoading: isReviewsLoading } = useReviews();

  const updateMapsMutation = useUpdateGoogleMapsUrl();
  const updateReviewsMutation = useUpdateReviews();

  const [urlInput, setUrlInput] = useState("");
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [newReview, setNewReview] = useState("");
  const [mapsSaveStatus, setMapsSaveStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [reviewsSaveStatus, setReviewsSaveStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Sync state from backend
  useEffect(() => {
    if (mapsUrl !== undefined) {
      setUrlInput(mapsUrl);
    }
  }, [mapsUrl]);

  useEffect(() => {
    if (reviews !== undefined) {
      setReviewItems(reviewsToItems(reviews));
    }
  }, [reviews]);

  const handleSaveUrl = async () => {
    setMapsSaveStatus("idle");
    try {
      await updateMapsMutation.mutateAsync(urlInput);
      setMapsSaveStatus("success");
      toast.success("Google Maps URL updated successfully");
      setTimeout(() => setMapsSaveStatus("idle"), 3000);
    } catch {
      setMapsSaveStatus("error");
      toast.error("Failed to update Google Maps URL");
      setTimeout(() => setMapsSaveStatus("idle"), 3000);
    }
  };

  const handleSaveReviews = async () => {
    setReviewsSaveStatus("idle");
    const filtered = reviewItems
      .map((r) => r.text)
      .filter((t) => t.trim().length > 0);
    try {
      await updateReviewsMutation.mutateAsync(filtered);
      setReviewsSaveStatus("success");
      toast.success("Reviews updated successfully");
      setTimeout(() => setReviewsSaveStatus("idle"), 3000);
    } catch {
      setReviewsSaveStatus("error");
      toast.error("Failed to update reviews");
      setTimeout(() => setReviewsSaveStatus("idle"), 3000);
    }
  };

  const handleAddReview = () => {
    if (!newReview.trim()) return;
    setReviewItems((prev) => [
      ...prev,
      { id: nextReviewId(), text: newReview.trim() },
    ]);
    setNewReview("");
  };

  const handleUpdateReview = (id: string, value: string) => {
    setReviewItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, text: value } : r)),
    );
  };

  const handleDeleteReview = (id: string) => {
    setReviewItems((prev) => prev.filter((r) => r.id !== id));
  };

  // Loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div
          data-ocid="admin.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <p className="text-muted-foreground text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AdminHeader />
        <main className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-6 max-w-sm text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-navy-raised flex items-center justify-center border border-gold/20">
              <LogIn className="w-7 h-7 text-gold" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Admin Access
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Sign in to manage your Google Maps link and reviews.
              </p>
            </div>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </Button>
          </motion.div>
        </main>
        <AdminFooter />
      </div>
    );
  }

  // Checking admin role
  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div
          data-ocid="admin.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
          <p className="text-muted-foreground text-sm">
            Checking permissions...
          </p>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AdminHeader onLogout={clear} />
        <main className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 max-w-sm text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/30">
              <ShieldOff className="w-7 h-7 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Access Denied
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your account does not have admin privileges.
              </p>
            </div>
            <Button variant="outline" onClick={clear} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </motion.div>
        </main>
        <AdminFooter />
      </div>
    );
  }

  // Admin panel
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader onLogout={clear} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl font-semibold text-foreground mb-1">
            Admin Panel
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your Google Maps link and review collection.
          </p>
        </motion.div>

        {/* Google Maps URL Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-6 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-base">
                Google Maps Link
              </h2>
              <p className="text-muted-foreground text-xs">
                Users will be redirected here after copying a review.
              </p>
            </div>
          </div>

          {isMapsLoading ? (
            <Skeleton className="h-10 w-full rounded-lg" />
          ) : (
            <div className="space-y-3">
              <Label
                htmlFor="maps-url"
                className="text-sm text-muted-foreground"
              >
                Google Maps URL
              </Label>
              <Input
                id="maps-url"
                data-ocid="admin.input"
                type="url"
                placeholder="https://maps.google.com/..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <AnimatePresence>
              {mapsSaveStatus === "success" && (
                <motion.div
                  data-ocid="admin.success_state"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-green-400 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Saved successfully
                </motion.div>
              )}
              {mapsSaveStatus === "error" && (
                <motion.div
                  data-ocid="admin.error_state"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-destructive text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  Failed to save
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              data-ocid="admin.save_button"
              onClick={handleSaveUrl}
              disabled={updateMapsMutation.isPending || !urlInput.trim()}
              className="ml-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {updateMapsMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {updateMapsMutation.isPending ? "Saving..." : "Save URL"}
            </Button>
          </div>
        </motion.section>

        {/* Reviews Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-6 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <MessageSquareQuote className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-base">
                Review Collection
              </h2>
              <p className="text-muted-foreground text-xs">
                One of these will be randomly copied when the user clicks the
                button.
              </p>
            </div>
          </div>

          {isReviewsLoading ? (
            <div className="space-y-2">
              {(["sk1", "sk2", "sk3"] as const).map((sk) => (
                <Skeleton key={sk} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {reviewItems.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl"
                  >
                    No reviews yet. Add one below.
                  </motion.div>
                ) : (
                  reviewItems.map((item, index) => (
                    <ReviewRow
                      key={item.id}
                      item={item}
                      index={index}
                      onUpdate={handleUpdateReview}
                      onDelete={handleDeleteReview}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Add new review */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <Label className="text-xs text-muted-foreground">
              Add New Review
            </Label>
            <div className="flex gap-2">
              <Textarea
                data-ocid="admin.textarea"
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                rows={3}
                placeholder="Type a new review here..."
                className="flex-1 text-sm resize-none bg-input border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.metaKey) {
                    handleAddReview();
                  }
                }}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddReview}
                disabled={!newReview.trim()}
                className="h-auto aspect-square border-gold/30 text-gold hover:bg-gold/10 hover:text-gold hover:border-gold/60 self-center"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/50">
              Tip: Press ⌘ + Enter to add quickly
            </p>
          </div>

          {/* Save reviews */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <AnimatePresence>
              {reviewsSaveStatus === "success" && (
                <motion.div
                  data-ocid="admin.success_state"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-green-400 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Reviews saved
                </motion.div>
              )}
              {reviewsSaveStatus === "error" && (
                <motion.div
                  data-ocid="admin.error_state"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-destructive text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  Failed to save
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              data-ocid="admin.save_button"
              onClick={handleSaveReviews}
              disabled={updateReviewsMutation.isPending}
              className="ml-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {updateReviewsMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {updateReviewsMutation.isPending ? "Saving..." : "Save Reviews"}
            </Button>
          </div>
        </motion.section>
      </main>

      <AdminFooter />
    </div>
  );
}

function ReviewRow({
  item,
  index,
  onUpdate,
  onDelete,
}: {
  item: ReviewItem;
  index: number;
  onUpdate: (id: string, value: string) => void;
  onDelete: (id: string) => void;
}) {
  const labelId = useId();
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-2 items-start group"
      data-ocid={`admin.item.${index + 1}`}
    >
      <div className="mt-2.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
        <GripVertical className="w-4 h-4" />
      </div>
      <Textarea
        id={labelId}
        value={item.text}
        onChange={(e) => onUpdate(item.id, e.target.value)}
        rows={3}
        className="flex-1 text-sm resize-none bg-input border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring"
        placeholder="Review text..."
      />
      <Button
        variant="ghost"
        size="icon"
        data-ocid={`admin.delete_button.${index + 1}`}
        onClick={() => onDelete(item.id)}
        className="mt-1 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </motion.div>
  );
}

function AdminHeader({ onLogout }: { onLogout?: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          to="/"
          data-ocid="admin.link"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Main
        </Link>

        <span className="font-display text-sm font-medium text-gold">
          Admin
        </span>

        {onLogout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </Button>
        )}
      </div>
    </header>
  );
}

function AdminFooter() {
  return (
    <footer className="border-t border-border py-4 px-6 text-center">
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
  );
}
