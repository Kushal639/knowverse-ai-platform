export interface ActionButton {
  label: string;
  route: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface GuideResponse {
  answer: string;
  steps?: string[];
  actionButtons: ActionButton[];
  suggestedQuestions: string[];
}

export const websiteGuideService = {
  /**
   * Safe registry of real KnowVerse features, workflows, and routes
   */
  getFeatureRegistry() {
    return [
      {
        feature: 'Dashboard',
        route: '/dashboard',
        description: 'Overview of total datasets, documents, graph entities, approved triples, and recent system actions.',
        actions: ['View Overview', 'Inspect Activity', 'Quick Actions'],
      },
      {
        feature: 'Datasets & Documents',
        route: '/datasets',
        description: 'Upload CSV, JSON, and text datasets. Manage document corpus and inspect schema metadata.',
        actions: ['Upload Dataset', 'View Dataset', 'Delete Dataset', 'Start Extraction'],
      },
      {
        feature: 'NLP Extraction Workspace',
        route: '/nlp',
        description: 'Run AI & spaCy extraction pipelines on documents to discover Subject-Relation-Object triples with confidence scores.',
        actions: ['Select Document', 'Start Extraction', 'Approve Triple', 'Reject Triple', 'Bulk Approve'],
      },
      {
        feature: 'Knowledge Graph Explorer',
        route: '/graph',
        description: 'Interactive React Flow graph canvas. Isolate 1-hop, 2-hop, and 3-hop neighborhoods, inspect entity profiles, and view edge extraction provenance.',
        actions: ['Search Entity', 'Isolate Neighborhood', 'Filter Type/Confidence', 'Inspect Provenance', 'Export JSON/CSV'],
      },
      {
        feature: 'Analytics & Community Clusters',
        route: '/analytics',
        description: 'Graph structural analytics, density metrics, hub rankings, and semantic community clusters (AI/ML, CS Core, Student Network).',
        actions: ['Inspect Density', 'View Top Hubs', 'Isolate Community Cluster'],
      },
      {
        feature: 'Student Knowledge Profiles',
        route: '/students',
        description: 'Inspect multi-domain mastery radar charts, target career readiness (MLE, Full-Stack, Data Science), and custom learning pathways.',
        actions: ['Search Student', 'View Mastery Radar', 'Generate Career Readiness Roadmap'],
      },
      {
        feature: 'Graph Admin & Entity Resolution',
        route: '/admin/graph',
        description: 'AI candidate duplicate detection scanner, entity renaming, transactional merging, and instant Undo/Rollback snapshots.',
        actions: ['Scan Duplicates', 'Merge Entities', 'Rename Entity', 'Undo Change / Rollback'],
      },
    ];
  },

  /**
   * Generate context-aware guidance based on user question and current route
   */
  getGuidance(query: string, currentRoute?: string): GuideResponse | null {
    const lower = query.toLowerCase();

    // 1. "How do I upload a dataset / CSV?"
    if (lower.includes('upload') && (lower.includes('dataset') || lower.includes('csv') || lower.includes('file'))) {
      return {
        answer: `### 📁 How to Upload a Dataset in KnowVerse\n\nFollow these simple steps:`,
        steps: [
          'Navigate to **Datasets** (`/datasets`) from the sidebar.',
          'Click the **"New Dataset"** button in the top right header.',
          'Enter a descriptive **Name** and optional **Description**.',
          'Drag & drop or select your CSV, JSON, or text file.',
          'Click **"Upload & Save"**.',
          'Once uploaded, click **"Start Extraction"** on the dataset detail page to extract knowledge triples.',
        ],
        actionButtons: [
          { label: 'Go to Datasets', route: '/datasets', variant: 'primary' },
          { label: 'Open NLP Workspace', route: '/nlp', variant: 'secondary' },
        ],
        suggestedQuestions: [
          'How do I extract entities and relationships?',
          'What file formats are supported?',
          'How do I view the knowledge graph?',
        ],
      };
    }

    // 2. "How do I extract entities / relationships?"
    if (lower.includes('extract') || lower.includes('nlp') || lower.includes('approve')) {
      return {
        answer: `### 🧠 How to Extract & Approve Knowledge Triples\n\nTurn raw documents into verified knowledge:`,
        steps: [
          'Open **NLP Extraction** (`/nlp`) from the sidebar.',
          'Select your target document from the dropdown.',
          'Choose the extraction pipeline (**Hybrid spaCy + AI**).',
          'Click **"Start Extraction"** and watch real-time progress.',
          'Review the extracted candidate triples (`Subject → Relation → Object`).',
          'Click the **Green Checkmark (Approve)** to add verified facts to the Knowledge Graph, or **Red X (Reject)**.',
          'Open **Knowledge Graph** to explore approved relationships!',
        ],
        actionButtons: [
          { label: 'Open NLP Workspace', route: '/nlp', variant: 'primary' },
          { label: 'View Knowledge Graph', route: '/graph', variant: 'secondary' },
        ],
        suggestedQuestions: [
          'What is confidence score in extraction?',
          'How do I explore multi-hop connections in the graph?',
          'How do I merge duplicate entities?',
        ],
      };
    }

    // 3. "How do I explore the knowledge graph?"
    if (lower.includes('explore') && lower.includes('graph') || lower.includes('use graph') || lower.includes('neighborhood')) {
      return {
        answer: `### 🌐 Exploring the Interactive Knowledge Graph\n\nKnowVerse provides a deep multi-depth visual exploration canvas:`,
        steps: [
          'Open **Knowledge Graph** (`/graph`) from the sidebar.',
          'Use the search bar at the top to find any entity (e.g. *Data Structures*, *Machine Learning*, or student names).',
          'Click on any node to open the **Entity Inspector** and view connected incoming/outgoing relationships.',
          'Toggle **Neighborhood Depth** (`1-Hop`, `2-Hop`, `3-Hop`) to isolate connected subgraphs.',
          'Click on any directed edge to open the **Provenance Drawer** and view the exact source document, extraction model, and confidence %.',
          'Export subgraphs as **JSON** or **CSV** anytime.',
        ],
        actionButtons: [
          { label: 'Open Knowledge Graph', route: '/graph', variant: 'primary' },
          { label: 'View Analytics & Clusters', route: '/analytics', variant: 'secondary' },
        ],
        suggestedQuestions: [
          'How do I find shortest path between two entities?',
          'What are semantic community clusters?',
          'Which students study Machine Learning?',
        ],
      };
    }

    // 4. "How do I merge duplicates / undo changes?"
    if (lower.includes('duplicate') || lower.includes('merge') || lower.includes('undo') || lower.includes('rollback')) {
      return {
        answer: `### ⚙️ Entity Resolution, Merging & Undo Rollback\n\nManage and refine your graph topology in Graph Administration:`,
        steps: [
          'Open **Graph Admin & Resolution** (`/admin/graph`) (Admin only).',
          'In the **AI Duplicate Detection Workbench**, click **"Scan Duplicates"**.',
          'Review candidate duplicates and click **"Merge A → B"** to redirect all triples into one canonical entity.',
          'To undo any merge, rename, or creation, scroll to **Graph Version History & Undo Rollback**.',
          'Click **"Undo Change"** on any snapshot to immediately revert changes and restore the previous graph state.',
        ],
        actionButtons: [
          { label: 'Open Graph Admin', route: '/admin/graph', variant: 'primary' },
          { label: 'View Knowledge Graph', route: '/graph', variant: 'secondary' },
        ],
        suggestedQuestions: [
          'How does duplicate detection calculate similarity?',
          'What happens to triples when entities are merged?',
          'How do I create a new relation type?',
        ],
      };
    }

    // 5. "What do I do on this page?" (Context-Aware)
    if (lower.includes('what do i do here') || lower.includes('what should i do next') || lower.includes('how to use this page')) {
      if (currentRoute?.startsWith('/datasets')) {
        return {
          answer: `### 📁 You are on the Datasets Page\n\nHere you manage your raw dataset files and documents.`,
          steps: [
            'Click **"New Dataset"** to upload CSV or text files.',
            'Click on any dataset card to inspect its documents and extraction history.',
            'Click **"Start Extraction"** to process document text with AI models.',
          ],
          actionButtons: [
            { label: 'Go to NLP Workspace', route: '/nlp', variant: 'primary' },
            { label: 'Open Knowledge Graph', route: '/graph', variant: 'secondary' },
          ],
          suggestedQuestions: ['How do I upload a CSV?', 'How does NLP extraction work?'],
        };
      }

      if (currentRoute?.startsWith('/nlp')) {
        return {
          answer: `### 🧠 You are on the NLP Workspace Page\n\nHere you review AI-extracted knowledge before adding it to the graph.`,
          steps: [
            'Select a document from the searchable selector.',
            'Click **"Start Extraction"** to run the pipeline.',
            'Inspect extracted triples and click **Approve (Green)** to save to MySQL.',
          ],
          actionButtons: [
            { label: 'Open Knowledge Graph', route: '/graph', variant: 'primary' },
            { label: 'View Student Profiles', route: '/students', variant: 'secondary' },
          ],
          suggestedQuestions: ['How do I approve all triples?', 'What does confidence score mean?'],
        };
      }

      if (currentRoute?.startsWith('/graph')) {
        return {
          answer: `### 🌐 You are on the Knowledge Graph Page\n\nHere you visually explore approved concepts and relationships.`,
          steps: [
            'Search for an entity using the top search bar.',
            'Click on nodes to isolate 1-hop or 2-hop neighborhoods.',
            'Click on edges to inspect document source provenance.',
          ],
          actionButtons: [
            { label: 'View Analytics', route: '/analytics', variant: 'primary' },
            { label: 'View Student Profiles', route: '/students', variant: 'secondary' },
          ],
          suggestedQuestions: ['What are the most connected entities?', 'Which students study AI?'],
        };
      }
    }

    // 6. General "What is KnowVerse / Where do I start?"
    if (lower.includes('what is knowverse') || lower.includes('how does knowverse work') || lower.includes('where do i start') || lower.includes('guide me') || lower.includes('tour')) {
      return {
        answer: '### 🚀 Welcome to KnowVerse — AI Knowledge Discovery Platform\n\nKnowVerse transforms raw datasets into an interactive, grounded Knowledge Graph with AI-powered discovery.\n\n#### 🌟 Recommended Workflow:\n1. **Upload Dataset:** Upload student records or curriculum files in **Datasets** (`/datasets`).\n2. **Run AI Extraction:** Extract subject-relation-object facts in **NLP Workspace** (`/nlp`).\n3. **Approve Facts:** Approve verified knowledge into your MySQL graph.\n4. **Explore Graph:** Discover connections, isolate neighborhoods, and trace paths in **Knowledge Graph** (`/graph`).\n5. **Analyze Mastery:** Check skill gaps and career roadmaps in **Student Profiles** (`/students`).\n6. **Ask AI:** Ask natural-language questions right here in the **AI Assistant**!',
        steps: [
          'Step 1: Upload a dataset at /datasets',
          'Step 2: Run extraction at /nlp and approve triples',
          'Step 3: Explore visual graph at /graph',
          'Step 4: Query knowledge here at /ai-assistant',
        ],
        actionButtons: [
          { label: 'Upload Dataset', route: '/datasets', variant: 'primary' },
          { label: 'Open Knowledge Graph', route: '/graph', variant: 'secondary' },
          { label: 'View Student Profiles', route: '/students', variant: 'outline' },
        ],
        suggestedQuestions: [
          'How do I upload a dataset?',
          'Which students study Machine Learning?',
          'What are the most connected hubs in the graph?',
        ],
      };
    }

    return null;
  },
};
