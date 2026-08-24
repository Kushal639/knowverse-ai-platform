import { KNOWVERSE_FAQ, FaqItem } from '../data/knowverseFaq';
import { ActionButton } from './websiteGuide.service';

export interface FaqMatchResult {
  faq: FaqItem;
  score: number;
  actionButtons?: ActionButton[];
  suggestedQuestions?: string[];
}

function cleanStr(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenSimilarity(a: string, b: string): number {
  const setA = new Set(cleanStr(a).split(' ').filter(w => w.length > 1));
  const setB = new Set(cleanStr(b).split(' ').filter(w => w.length > 1));
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  return (2 * intersection) / (setA.size + setB.size);
}

export const faqMatcherService = {
  findMatch(userQuery: string): FaqMatchResult | null {
    const qClean = cleanStr(userQuery);
    if (!qClean) return null;

    let bestMatch: FaqItem | null = null;
    let highestScore = 0;

    for (const item of KNOWVERSE_FAQ) {
      const itemQClean = cleanStr(item.question);

      // 1. Exact match
      if (qClean === itemQClean) {
        bestMatch = item;
        highestScore = 1.0;
        break;
      }

      // 2. Keyword exact match
      const hasExactKeyword = item.keywords.some(k => {
        const kClean = cleanStr(k);
        return qClean === kClean || qClean === `${kClean}s` || qClean.startsWith(`${kClean} `) || qClean.endsWith(` ${kClean}`);
      });

      if (hasExactKeyword && highestScore < 0.95) {
        bestMatch = item;
        highestScore = 0.95;
      }

      // 3. Question contains query or query contains question
      if ((qClean.includes(itemQClean) || itemQClean.includes(qClean)) && highestScore < 0.9) {
        const lenRatio = Math.min(qClean.length, itemQClean.length) / Math.max(qClean.length, itemQClean.length);
        if (lenRatio > 0.4) {
          bestMatch = item;
          highestScore = 0.85 + (lenRatio * 0.1);
        }
      }

      // 4. Token Jaccard similarity
      const score = tokenSimilarity(qClean, itemQClean);
      if (score > highestScore && score >= 0.65) {
        highestScore = score;
        bestMatch = item;
      }
    }

    if (!bestMatch || highestScore < 0.65) {
      return null;
    }

    // Determine category-specific action buttons
    const actionButtons: ActionButton[] = [];
    const cat = bestMatch.category;

    if (cat === 'Dataset Upload') {
      actionButtons.push(
        { label: 'Go to Datasets', route: '/datasets', variant: 'primary' },
        { label: 'Open NLP Workspace', route: '/nlp', variant: 'secondary' }
      );
    } else if (cat === 'NLP Extraction' || cat === 'Getting Started') {
      actionButtons.push(
        { label: 'Open NLP Workspace', route: '/nlp', variant: 'primary' },
        { label: 'Explore Knowledge Graph', route: '/graph', variant: 'secondary' }
      );
    } else if (cat === 'Knowledge Graph') {
      actionButtons.push(
        { label: 'Open Knowledge Graph', route: '/graph', variant: 'primary' },
        { label: 'View Analytics', route: '/analytics', variant: 'secondary' }
      );
    } else if (cat === 'Analytics & Recommendations') {
      actionButtons.push(
        { label: 'View Analytics & Clusters', route: '/analytics', variant: 'primary' },
        { label: 'View Student Profiles', route: '/students', variant: 'secondary' }
      );
    } else if (cat === 'Admin Features') {
      actionButtons.push(
        { label: 'Open Graph Admin', route: '/admin/graph', variant: 'primary' }
      );
    } else if (cat === 'Profile & Settings') {
      actionButtons.push(
        { label: 'Go to Profile', route: '/profile', variant: 'primary' }
      );
    } else if (cat === 'Troubleshooting') {
      actionButtons.push(
        { label: 'Submit Feedback', route: '/feedback', variant: 'primary' },
        { label: 'View Datasets', route: '/datasets', variant: 'secondary' }
      );
    }

    // Pick 3 related FAQ questions as suggested follow-ups
    const related = KNOWVERSE_FAQ
      .filter(f => f.category === cat && f.id !== bestMatch!.id)
      .slice(0, 3)
      .map(f => f.question);

    return {
      faq: bestMatch,
      score: Math.round(highestScore * 100),
      actionButtons: actionButtons.length > 0 ? actionButtons : undefined,
      suggestedQuestions: related.length > 0 ? related : [
        'How do I upload a dataset?',
        'Which students study Machine Learning?',
        'How do I explore the knowledge graph?'
      ],
    };
  },
};
