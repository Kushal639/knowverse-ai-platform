import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare, Send, Smile } from 'lucide-react';
import { feedbackApi } from '@/api/index';
import { Skeleton, Badge } from '@/components/ui';
import { toast } from '@/components/ui/Toaster';
import { formatDate } from '@/lib/utils';

export default function Feedback() {
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['feedback'], queryFn: () => feedbackApi.list({}) });
  const feedbacks = data?.data?.feedback || [];

  const { mutate: submitFeedback, isPending: submitting } = useMutation({
    mutationFn: () => feedbackApi.create({ rating, comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feedback'] });
      toast({ title: 'Thank you for your feedback! 🌟', variant: 'success' });
      setRating(0); setComment('');
    },
    onError: (e: Error) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Feedback</h1>
        <p className="text-muted-foreground">Help us improve KnowVerse</p>
      </div>

      {/* Submit feedback */}
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Smile className="w-5 h-5 text-primary" /> Share Your Experience</h2>

        {/* Star rating */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition-colors ${s <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
              />
            </button>
          ))}
          {rating > 0 && <span className="ml-2 text-sm text-muted-foreground self-center">{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}</span>}
        </div>

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Tell us about your experience, suggestions, or feature requests..."
          className="w-full px-4 py-3 bg-secondary rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none mb-4"
          rows={4}
        />

        <button
          onClick={() => submitFeedback()}
          disabled={rating === 0 || submitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-60"
        >
          <Send className="w-4 h-4" /> Submit Feedback
        </button>
      </div>

      {/* Previous feedback */}
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> Your Feedback History</h2>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
        ) : feedbacks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No feedback submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((f: { id: string; rating: number; comment?: string; status: string; adminResponse?: string; createdAt: string }) => (
              <div key={f.id} className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < f.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={f.status === 'REVIEWED' ? 'success' : 'secondary'}>{f.status}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(f.createdAt)}</span>
                  </div>
                </div>
                {f.comment && <p className="text-sm text-muted-foreground mb-2">"{f.comment}"</p>}
                {f.adminResponse && (
                  <div className="border-l-2 border-primary/50 pl-3 mt-2">
                    <p className="text-xs text-muted-foreground font-medium">KnowVerse Team:</p>
                    <p className="text-sm text-primary">{f.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
