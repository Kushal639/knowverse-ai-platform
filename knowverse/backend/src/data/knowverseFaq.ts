export interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

export const KNOWVERSE_FAQ: FaqItem[] = [
  {
    id: 1,
    category: "Greetings",
    question: "Hi",
    answer: "Hello! 👋 Welcome to KnowVerse. I can help you use the website, explore your knowledge, and understand its features.",
    keywords: ["hi", "hello"]
  },
  {
    id: 2,
    category: "Greetings",
    question: "Hello",
    answer: "Hello! 👋 How can I help you with KnowVerse?",
    keywords: ["hello"]
  },
  {
    id: 3,
    category: "Greetings",
    question: "Hey",
    answer: "Hey! 👋 I'm your KnowVerse assistant. What would you like to do?",
    keywords: ["hey"]
  },
  {
    id: 4,
    category: "Greetings",
    question: "Good morning",
    answer: "Good morning! 👋 How can I help you use KnowVerse today?",
    keywords: ["good morning"]
  },
  {
    id: 5,
    category: "Greetings",
    question: "Good afternoon",
    answer: "Good afternoon! 👋 What would you like help with?",
    keywords: ["good afternoon"]
  },
  {
    id: 6,
    category: "Greetings",
    question: "Good evening",
    answer: "Good evening! 👋 I'm ready to help with KnowVerse.",
    keywords: ["good evening"]
  },
  {
    id: 7,
    category: "Greetings",
    question: "How are you?",
    answer: "I'm ready to help! Ask me about KnowVerse, your data, or the knowledge graph.",
    keywords: ["how are you"]
  },
  {
    id: 8,
    category: "Greetings",
    question: "Who are you?",
    answer: "I'm the KnowVerse AI Assistant. I help you use the platform and explore available knowledge.",
    keywords: ["assistant", "who are you"]
  },
  {
    id: 9,
    category: "Greetings",
    question: "What can you do?",
    answer: "I can guide you through KnowVerse, explain features, help with datasets, and answer questions about available knowledge.",
    keywords: ["capabilities", "what can you do"]
  },
  {
    id: 10,
    category: "Greetings",
    question: "Can you help me?",
    answer: "Absolutely. Tell me what you want to do, or ask me what to do next.",
    keywords: ["help", "can you help me"]
  },
  {
    id: 11,
    category: "Greetings",
    question: "What is KnowVerse?",
    answer: "KnowVerse is an AI-powered knowledge discovery platform for turning information into connected, searchable knowledge.",
    keywords: ["knowverse", "what is knowverse"]
  },
  {
    id: 12,
    category: "Greetings",
    question: "How can you help me?",
    answer: "I can explain features, guide workflows, and help you explore your datasets and knowledge graph.",
    keywords: ["help", "how can you help me"]
  },
  {
    id: 13,
    category: "Greetings",
    question: "I am new here",
    answer: "Welcome! Start with Datasets, upload a small file, process it, review the results, and then explore the Knowledge Graph.",
    keywords: ["new user", "new here", "i am new"]
  },
  {
    id: 14,
    category: "Greetings",
    question: "I don't know how to use this website",
    answer: "No problem! Ask me how to perform any task and I can guide you step by step through KnowVerse.",
    keywords: ["beginner", "how to use this website", "dont know how to use"]
  },
  {
    id: 15,
    category: "Greetings",
    question: "What should I do first?",
    answer: "Start by uploading a dataset from Datasets. Then process it, review extracted knowledge, approve valid results, and explore the graph.",
    keywords: ["first step", "what should i do first"]
  },
  {
    id: 16,
    category: "Getting Started",
    "question": "How do I use KnowVerse?",
    answer: "A typical workflow is Upload → Process → Extract → Review → Approve → Explore the Knowledge Graph → Ask the AI Assistant.",
    keywords: ["workflow", "how do i use knowverse"]
  },
  {
    id: 17,
    category: "Getting Started",
    question: "How do I get started?",
    answer: "Open Datasets and upload your first file. After processing, review the extracted knowledge and open the Knowledge Graph.",
    keywords: ["start", "how do i get started"]
  },
  {
    id: 18,
    category: "Getting Started",
    question: "What is the KnowVerse workflow?",
    answer: "The workflow is data upload, processing, knowledge extraction, review, approval, graph exploration, search, and AI analysis.",
    keywords: ["workflow", "knowverse workflow"]
  },
  {
    id: 19,
    category: "Getting Started",
    question: "How do I create a knowledge graph?",
    answer: "Upload and process data, extract entities and relationships, review and approve valid results, then open Knowledge Graph.",
    keywords: ["create graph", "how do i create a knowledge graph"]
  },
  {
    id: 20,
    category: "Getting Started",
    question: "What happens after I upload a dataset?",
    answer: "KnowVerse validates and processes the file, then extracts structured or textual knowledge depending on its type.",
    keywords: ["upload", "after upload"]
  },
  {
    id: 21,
    category: "Getting Started",
    question: "Where can I see my data?",
    answer: "Use Datasets to view uploaded data and processing status. Approved knowledge can be explored in Knowledge Graph.",
    keywords: ["datasets", "where can i see my data"]
  },
  {
    id: 22,
    category: "Getting Started",
    question: "Where is the dashboard?",
    answer: "Open Dashboard from the main navigation to see an overview of your datasets, knowledge, and activity.",
    keywords: ["dashboard", "where is the dashboard"]
  },
  {
    id: 23,
    category: "Getting Started",
    question: "What should I do after extraction?",
    answer: "Review the extracted results, approve valid knowledge, and then explore the approved information in the graph.",
    keywords: ["after extraction", "what should i do after extraction"]
  },
  {
    id: 24,
    category: "Getting Started",
    question: "What is the best way to learn KnowVerse?",
    answer: "Start with a small dataset and complete the upload-to-graph workflow before trying advanced analytics and AI features.",
    keywords: ["learn", "best way to learn"]
  },
  {
    id: 25,
    category: "Getting Started",
    question: "Can I use KnowVerse without knowing AI?",
    answer: "Yes. You can use the platform through its guided workflow without needing detailed AI knowledge.",
    keywords: ["beginner", "without knowing ai"]
  },
  {
    id: 26,
    category: "Getting Started",
    question: "What is the main purpose of KnowVerse?",
    answer: "KnowVerse connects information into knowledge so users can discover entities, relationships, patterns, and insights.",
    keywords: ["purpose", "main purpose"]
  },
  {
    id: 27,
    category: "Getting Started",
    question: "What can I do with a processed dataset?",
    answer: "You can review knowledge, explore entities and relationships, search the graph, analyze data, and ask the AI Assistant questions.",
    keywords: ["processed dataset", "what can i do with a processed dataset"]
  },
  {
    id: 28,
    category: "Getting Started",
    question: "Where should I go to explore my knowledge?",
    answer: "Open Knowledge Graph after useful knowledge has been approved.",
    keywords: ["explore", "where to explore"]
  },
  {
    id: 29,
    category: "Getting Started",
    question: "Can I ask the AI what to do next?",
    answer: "Yes. Ask 'What should I do next?' and the assistant can guide you through the current workflow.",
    keywords: ["next step", "what to do next"]
  },
  {
    id: 30,
    category: "Getting Started",
    question: "Is there a beginner workflow?",
    answer: "Yes. Upload a small file, map columns if needed, extract knowledge, review it, approve valid results, and explore the graph.",
    keywords: ["beginner", "beginner workflow"]
  },
  {
    id: 31,
    category: "Dataset Upload",
    question: "How do I upload a dataset?",
    answer: "Open Datasets, choose Upload Dataset, select your file, review its structure or column mapping, and start processing.",
    keywords: ["upload", "how do i upload a dataset"]
  },
  {
    id: 32,
    category: "Dataset Upload",
    question: "How do I upload a CSV?",
    answer: "Go to Datasets, upload the CSV, review detected columns, map them if needed, and start processing.",
    keywords: ["csv", "how do i upload a csv"]
  },
  {
    id: 33,
    category: "Dataset Upload",
    question: "How do I upload an Excel file?",
    answer: "Open Datasets, upload the Excel file, review its detected structure, and start processing.",
    keywords: ["excel", "how do i upload an excel file"]
  },
  {
    id: 34,
    category: "Dataset Upload",
    question: "Can I upload JSON?",
    answer: "If JSON is enabled in your build, upload it through the dataset workflow and process its structured information.",
    keywords: ["json", "can i upload json"]
  },
  {
    id: 35,
    category: "Dataset Upload",
    question: "Can I upload PDF documents?",
    answer: "If PDF processing is enabled, upload the PDF through the supported document workflow and process its text.",
    keywords: ["pdf", "can i upload pdf"]
  },
  {
    id: 36,
    category: "Dataset Upload",
    question: "Can I upload TXT files?",
    answer: "If TXT processing is enabled, upload the file and process its text through extraction.",
    keywords: ["txt", "can i upload txt"]
  },
  {
    id: 37,
    category: "Dataset Upload",
    question: "Can I upload DOCX files?",
    answer: "If DOCX processing is enabled, upload the document and process its text.",
    keywords: ["docx", "can i upload docx"]
  },
  {
    id: 38,
    category: "Dataset Upload",
    question: "What file types does KnowVerse support?",
    answer: "Support depends on your current build. Common inputs include CSV, TSV, Excel, JSON, TXT, PDF, and DOCX.",
    keywords: ["formats", "file types", "supported files"]
  },
  {
    id: 39,
    category: "Dataset Upload",
    question: "Why is my CSV not uploading?",
    answer: "Check that the CSV is valid, readable, within upload limits, and not corrupted. Then retry and inspect the displayed error.",
    keywords: ["csv", "error", "not uploading"]
  },
  {
    id: 40,
    category: "Dataset Upload",
    question: "Why did dataset processing fail?",
    answer: "Possible causes include malformed data, unsupported content, or a backend processing error. Check the status and error details.",
    keywords: ["processing", "processing failed"]
  },
  {
    id: 41,
    category: "Dataset Upload",
    question: "What is schema detection?",
    answer: "Schema detection examines structured columns and identifies likely roles such as entity name, ID, attribute, category, or text.",
    keywords: ["schema", "schema detection"]
  },
  {
    id: 42,
    category: "Dataset Upload",
    question: "What is column mapping?",
    answer: "Column mapping lets you tell KnowVerse what each dataset column represents so structured extraction can work correctly.",
    keywords: ["mapping", "column mapping"]
  },
  {
    id: 43,
    category: "Dataset Upload",
    question: "Why should I map columns?",
    answer: "Correct mapping gives the extraction system semantic information and improves the quality of generated knowledge.",
    keywords: ["mapping", "why map columns"]
  },
  {
    id: 44,
    category: "Dataset Upload",
    question: "Can I upload a student dataset?",
    answer: "Yes. Student datasets can contain IDs, names, departments, subjects, grades, topics, and knowledge text.",
    keywords: ["student", "student dataset"]
  },
  {
    id: 45,
    category: "Dataset Upload",
    question: "Can I upload multiple datasets?",
    answer: "If multiple uploads are enabled, you can manage separate datasets individually and keep their sources traceable.",
    keywords: ["multiple", "multiple datasets"]
  },
  {
    id: 46,
    category: "Dataset Upload",
    question: "Can I delete a dataset?",
    answer: "If your permissions allow it, use the dataset management delete action and confirm carefully.",
    keywords: ["delete", "delete dataset"]
  },
  {
    id: 47,
    category: "Dataset Upload",
    question: "Can I rename a dataset?",
    answer: "If renaming is enabled, open dataset management and use the rename action.",
    keywords: ["rename", "rename dataset"]
  },
  {
    id: 48,
    category: "Dataset Upload",
    question: "What does dataset status mean?",
    answer: "Status shows where a dataset is in the workflow, such as uploaded, processing, extracting, reviewing, completed, or failed.",
    keywords: ["status", "dataset status"]
  },
  {
    id: 49,
    category: "Dataset Upload",
    question: "What if my dataset is empty?",
    answer: "Check that the file has headers and data rows and that you selected the intended file.",
    keywords: ["empty", "dataset is empty"]
  },
  {
    id: 50,
    category: "Dataset Upload",
    question: "How do I preview a dataset?",
    answer: "Open the dataset details or preview option, if available, to inspect its records before processing.",
    keywords: ["preview", "preview dataset"]
  },
  {
    id: 51,
    category: "NLP Extraction",
    question: "What is NLP extraction?",
    answer: "NLP extraction uses natural language processing to identify useful entities and relationships from text.",
    keywords: ["nlp", "nlp extraction", "what is nlp extraction"]
  },
  {
    id: 52,
    category: "NLP Extraction",
    question: "What is an entity?",
    answer: "An entity is a meaningful object or concept such as a student, subject, topic, technology, or organization.",
    keywords: ["entity", "what is an entity"]
  },
  {
    id: 53,
    category: "NLP Extraction",
    question: "What is a relationship?",
    answer: "A relationship describes how two entities are connected, such as studies, belongs_to, or has_topic.",
    keywords: ["relationship", "what is a relationship"]
  },
  {
    id: 54,
    category: "NLP Extraction",
    question: "What is a knowledge triple?",
    answer: "A triple represents knowledge as Subject → Relation → Object, for example Rohan → studies → Machine Learning.",
    keywords: ["triple", "knowledge triple", "what is a knowledge triple"]
  },
  {
    id: 55,
    category: "NLP Extraction",
    question: "What is structured extraction?",
    answer: "Structured extraction uses dataset columns and their semantic roles to create entities, attributes, and relationships.",
    keywords: ["structured", "structured extraction"]
  },
  {
    id: 56,
    category: "NLP Extraction",
    question: "What is hybrid extraction?",
    answer: "Hybrid extraction combines structured processing with NLP extraction from text columns such as descriptions or knowledge text.",
    keywords: ["hybrid", "hybrid extraction"]
  },
  {
    id: 57,
    category: "NLP Extraction",
    question: "What is a confidence score?",
    answer: "A confidence score indicates how strongly the extraction system supports a detected entity or relationship.",
    keywords: ["confidence", "confidence score", "what is a confidence score"]
  },
  {
    id: 58,
    category: "NLP Extraction",
    question: "Why did extraction return zero triples?",
    answer: "This can happen because of incorrect mapping, insufficient relational information, unsupported content, or an unsuitable extraction mode.",
    keywords: ["zero triples", "no triples", "why did extraction return zero triples"]
  },
  {
    id: 59,
    category: "NLP Extraction",
    question: "How do I review extracted knowledge?",
    answer: "Open extraction results, inspect each subject, relation, object, confidence, and source, then approve valid results.",
    keywords: ["review", "review extracted knowledge"]
  },
  {
    id: 60,
    category: "NLP Extraction",
    question: "What does approve mean?",
    answer: "Approve means accepting an extracted fact or relationship as valid trusted knowledge.",
    keywords: ["approve", "what does approve mean"]
  },
  {
    id: 61,
    category: "NLP Extraction",
    question: "What does reject mean?",
    answer: "Reject means preventing an extracted result from becoming trusted knowledge.",
    keywords: ["reject", "what does reject mean"]
  },
  {
    id: 62,
    category: "NLP Extraction",
    question: "Can I edit extracted relationships?",
    answer: "If editing is enabled, correct the subject, relation, or object before approving the result.",
    keywords: ["edit", "edit extracted relationships"]
  },
  {
    id: 63,
    category: "NLP Extraction",
    question: "What is entity resolution?",
    answer: "Entity resolution identifies records or names that may refer to the same real-world entity.",
    keywords: ["resolution", "entity resolution", "what is entity resolution"]
  },
  {
    id: 64,
    category: "NLP Extraction",
    question: "Why is entity resolution important?",
    answer: "It prevents the same concept from appearing as multiple unrelated graph nodes.",
    keywords: ["duplicates", "why is entity resolution important"]
  },
  {
    id: 65,
    category: "NLP Extraction",
    question: "What is provenance?",
    answer: "Provenance records where knowledge came from, such as dataset, document, row, sentence, model, and timestamp.",
    keywords: ["provenance", "what is provenance"]
  },
  {
    id: 66,
    category: "NLP Extraction",
    question: "Why is provenance useful?",
    answer: "It lets you trace a graph fact back to its source so the information can be verified.",
    keywords: ["source", "why is provenance useful"]
  },
  {
    id: 67,
    category: "NLP Extraction",
    question: "What is model selection?",
    answer: "Model selection determines which configured AI or NLP method is used for extraction.",
    keywords: ["model", "model selection"]
  },
  {
    id: 68,
    category: "NLP Extraction",
    question: "Can NLP extract information from CSV?",
    answer: "CSV should use structured extraction for columns. Text columns can additionally use NLP in hybrid mode.",
    keywords: ["csv", "extract from csv"]
  },
  {
    id: 69,
    category: "NLP Extraction",
    question: "What if the AI extracts something incorrectly?",
    answer: "Do not approve it. Reject or edit it and verify the original source.",
    keywords: ["incorrect", "incorrect extraction"]
  },
  {
    id: 70,
    category: "NLP Extraction",
    question: "Why should I review AI extraction?",
    answer: "AI can make mistakes, so human review helps prevent unsupported knowledge from entering the trusted graph.",
    keywords: ["review", "why review"]
  },
  {
    id: 71,
    category: "Knowledge Graph",
    question: "What is a knowledge graph?",
    answer: "A knowledge graph represents entities and their relationships as connected knowledge.",
    keywords: ["graph", "knowledge graph", "what is a knowledge graph"]
  },
  {
    id: 72,
    category: "Knowledge Graph",
    question: "What are nodes?",
    answer: "Nodes represent entities or concepts in the graph.",
    keywords: ["nodes", "what are nodes"]
  },
  {
    id: 73,
    category: "Knowledge Graph",
    question: "What are edges?",
    answer: "Edges represent relationships connecting two nodes.",
    keywords: ["edges", "what are edges"]
  },
  {
    id: 74,
    category: "Knowledge Graph",
    question: "How do I open the knowledge graph?",
    answer: "Open Knowledge Graph from the main navigation after approved knowledge is available.",
    keywords: ["open", "how to open knowledge graph"]
  },
  {
    id: 75,
    category: "Knowledge Graph",
    question: "How do I explore the graph?",
    answer: "Search for entities, zoom and pan, select nodes, inspect relationships, and explore connected entities.",
    keywords: ["explore", "how to explore graph"]
  },
  {
    id: 76,
    category: "Knowledge Graph",
    question: "How do I search the graph?",
    answer: "Use graph or global search to find entities, topics, relationships, students, datasets, or other indexed knowledge.",
    keywords: ["search", "how to search graph"]
  },
  {
    id: 77,
    category: "Knowledge Graph",
    question: "How do I find connected entities?",
    answer: "Select an entity and use neighborhood or related-entity exploration to see its connections.",
    keywords: ["connections", "connected entities"]
  },
  {
    id: 78,
    category: "Knowledge Graph",
    question: "What is neighborhood exploration?",
    answer: "It shows entities connected to a selected entity within a chosen graph depth.",
    keywords: ["neighborhood", "neighborhood exploration"]
  },
  {
    id: 79,
    category: "Knowledge Graph",
    question: "What does graph depth mean?",
    answer: "Depth controls how many relationship steps away from the selected entity are included.",
    keywords: ["depth", "graph depth"]
  },
  {
    id: 80,
    category: "Knowledge Graph",
    question: "How do I filter relationships?",
    answer: "Use available graph filters to limit results by relationship type, entity type, confidence, or other supported criteria.",
    keywords: ["filter", "filter relationships"]
  },
  {
    id: 81,
    category: "Knowledge Graph",
    question: "How do I zoom the graph?",
    answer: "Use the graph zoom controls or supported mouse/touch gestures.",
    keywords: ["zoom", "zoom graph"]
  },
  {
    id: 82,
    category: "Knowledge Graph",
    question: "How do I move around the graph?",
    answer: "Pan or drag the graph canvas using the supported controls.",
    keywords: ["pan", "move graph"]
  },
  {
    id: 83,
    category: "Knowledge Graph",
    question: "What is graph analytics?",
    answer: "Graph analytics calculates statistics such as entity counts, relationship counts, connectivity, and highly connected entities.",
    keywords: ["analytics", "graph analytics"]
  },
  {
    id: 84,
    category: "Knowledge Graph",
    question: "What is the most connected entity?",
    answer: "Use Graph Analytics to find entities with the highest number of relationships. The result depends on your current graph.",
    keywords: ["connected", "most connected entity"]
  },
  {
    id: 85,
    category: "Knowledge Graph",
    question: "What is graph density?",
    answer: "Graph density describes how many relationships exist compared with the number of possible relationships.",
    keywords: ["density", "graph density"]
  },
  {
    id: 86,
    category: "Knowledge Graph",
    question: "What are isolated entities?",
    answer: "They are nodes with no connections to other graph entities.",
    keywords: ["isolated", "isolated entities"]
  },
  {
    id: 87,
    category: "Knowledge Graph",
    question: "Can I edit graph entities?",
    answer: "If your permissions and current graph interface allow it, use the graph management controls to edit entities.",
    keywords: ["edit", "edit graph entities"]
  },
  {
    id: 88,
    category: "Knowledge Graph",
    question: "Can I merge duplicate entities?",
    answer: "If merging is enabled, verify the entities represent the same concept and use the merge action.",
    keywords: ["merge", "merge duplicate entities"]
  },
  {
    id: 89,
    category: "Knowledge Graph",
    question: "Can I export the graph?",
    answer: "If export is enabled, use graph export controls to create supported image or data formats.",
    keywords: ["export", "export graph"]
  },
  {
    id: 90,
    category: "Knowledge Graph",
    question: "Why is my graph empty?",
    answer: "Check that extraction produced results, valid knowledge was approved, and filters are not hiding the graph.",
    keywords: ["empty", "why is graph empty"]
  },
  {
    id: 91,
    category: "AI Assistant",
    question: "What can the AI Assistant do?",
    answer: "It can guide you through KnowVerse, answer questions about available knowledge, explain graph relationships, and help you understand features.",
    keywords: ["assistant", "what can the ai assistant do"]
  },
  {
    id: 92,
    category: "AI Assistant",
    question: "Can I ask questions about my dataset?",
    answer: "Yes, after your dataset is processed and its information is available to the assistant.",
    keywords: ["dataset", "ask about dataset"]
  },
  {
    id: 93,
    category: "AI Assistant",
    question: "Can I ask general questions?",
    answer: "Yes. General questions can be answered separately from KnowVerse-specific facts.",
    keywords: ["general", "ask general questions"]
  },
  {
    id: 94,
    category: "AI Assistant",
    question: "Can you explain a graph relationship?",
    answer: "Yes. Ask how two entities are connected and the assistant can explain available graph paths and sources.",
    keywords: ["relationship", "explain relationship"]
  },
  {
    id: 95,
    category: "AI Assistant",
    question: "Can you tell me where an answer came from?",
    answer: "For grounded KnowVerse answers, the assistant can provide available source or provenance information.",
    keywords: ["source", "where did answer come from"]
  },
  {
    id: 96,
    category: "AI Assistant",
    question: "Can you show graph paths?",
    answer: "Yes, when the requested connection exists, the assistant can describe the path and provide graph navigation where supported.",
    keywords: ["path", "show graph paths"]
  },
  {
    id: 97,
    category: "AI Assistant",
    question: "Can you summarize my dataset?",
    answer: "Yes, when the dataset has been processed and its contents are retrievable.",
    keywords: ["summary", "summarize dataset"]
  },
  {
    id: 98,
    category: "AI Assistant",
    question: "Can you recommend what to learn next?",
    answer: "Yes, when enough student knowledge and related-topic data exists.",
    keywords: ["recommendation", "what to learn next"]
  },
  {
    id: 99,
    category: "AI Assistant",
    question: "What happens if you don't know an answer?",
    answer: "The assistant should say that the information could not be found rather than inventing a fact.",
    keywords: ["unknown", "dont know answer"]
  },
  {
    id: 100,
    category: "AI Assistant",
    question: "Can I ask follow-up questions?",
    answer: "Yes. The assistant can use conversation context for follow-up questions.",
    keywords: ["follow up", "follow-up questions"]
  },
  {
    id: 101,
    category: "AI Assistant",
    question: "How do I ask a graph question?",
    answer: "Ask naturally, such as 'Who studies Machine Learning?' or 'What topics are connected to AI?'.",
    keywords: ["graph question", "how to ask graph question"]
  },
  {
    id: 102,
    category: "AI Assistant",
    question: "Can the AI guide me around the website?",
    answer: "Yes. Ask questions such as 'How do I upload a dataset?' or 'What should I do next?'.",
    keywords: ["guide", "guide around website"]
  },
  {
    id: 103,
    category: "AI Assistant",
    question: "Can the AI explain technical terms?",
    answer: "Yes. Ask about NLP, knowledge graphs, provenance, confidence, RAG, entity resolution, or analytics.",
    keywords: ["terms", "explain technical terms"]
  },
  {
    id: 104,
    category: "AI Assistant",
    question: "Can I ask what to do next?",
    answer: "Yes. Ask 'What should I do next?' and the assistant can guide your workflow.",
    keywords: ["next", "what to do next"]
  },
  {
    id: 105,
    category: "AI Assistant",
    question: "Is the AI always correct?",
    answer: "No. Data-specific answers should be grounded in evidence, and uncertainty should be acknowledged.",
    keywords: ["accuracy", "is the ai always correct"]
  },
  {
    id: 106,
    category: "Analytics & Recommendations",
    question: "What is Knowledge Health?",
    answer: "It summarizes the quality and completeness of the knowledge base using available metrics such as confidence and duplicates.",
    keywords: ["health", "knowledge health", "what is knowledge health"]
  },
  {
    id: 107,
    category: "Analytics & Recommendations",
    question: "What is Skill Gap Analysis?",
    answer: "It compares available knowledge with a target role or goal and identifies areas that may need development.",
    keywords: ["skill gap", "skill gap analysis", "what is skill gap analysis"]
  },
  {
    id: 108,
    category: "Analytics & Recommendations",
    question: "What are recommendations?",
    answer: "They suggest relevant topics, skills, subjects, or entities based on available knowledge relationships and supported similarity or rules.",
    keywords: ["recommendations", "what are recommendations"]
  },
  {
    id: 109,
    category: "Analytics & Recommendations",
    question: "How do graph analytics work?",
    answer: "They analyze the actual graph structure to calculate statistics about nodes, relationships, connectivity, and clusters.",
    keywords: ["analytics", "how graph analytics work"]
  },
  {
    id: 110,
    category: "Analytics & Recommendations",
    question: "What is community detection?",
    answer: "It identifies groups of entities that are more strongly connected within the graph.",
    keywords: ["community", "community detection", "what is community detection"]
  },
  {
    id: 111,
    category: "Analytics & Recommendations",
    question: "What is a connected component?",
    answer: "It is a group of graph nodes connected to each other through paths.",
    keywords: ["component", "connected component"]
  },
  {
    id: 112,
    category: "Analytics & Recommendations",
    question: "How can I analyze a student?",
    answer: "Open the student or entity profile, review subjects and topics, inspect graph connections, and use supported analytics.",
    keywords: ["student", "analyze a student"]
  },
  {
    id: 113,
    category: "Analytics & Recommendations",
    question: "Can KnowVerse recommend learning topics?",
    answer: "Yes, when enough graph and student knowledge data exists.",
    keywords: ["learning", "recommend learning topics"]
  },
  {
    id: 114,
    category: "Analytics & Recommendations",
    question: "Can I compare datasets?",
    answer: "If comparison is enabled, select two datasets to compare supported entities, relationships, topics, and changes.",
    keywords: ["compare", "compare datasets"]
  },
  {
    id: 115,
    category: "Analytics & Recommendations",
    question: "What does graph clustering show?",
    answer: "It groups related entities so you can focus on meaningful areas instead of the whole graph.",
    keywords: ["clustering", "graph clustering"]
  },
  {
    id: 116,
    category: "Profile & Settings",
    question: "How do I update my profile?",
    answer: "Open Profile and use the available editing controls.",
    keywords: ["profile", "update profile"]
  },
  {
    id: 117,
    category: "Profile & Settings",
    question: "How do I change my password?",
    answer: "Open Profile or Settings and use the password option if enabled.",
    keywords: ["password", "change password"]
  },
  {
    id: 118,
    category: "Profile & Settings",
    question: "How do I log out?",
    answer: "Use the account menu or logout option in the main navigation.",
    keywords: ["logout", "how do i log out"]
  },
  {
    id: 119,
    category: "Profile & Settings",
    question: "Where are my settings?",
    answer: "Open Settings from the main navigation or account menu.",
    keywords: ["settings", "where are settings"]
  },
  {
    id: 120,
    category: "Profile & Settings",
    question: "Can I change the theme?",
    answer: "If enabled, use the appearance or theme control in Settings or the top navigation.",
    keywords: ["theme", "change theme", "dark mode", "light mode"]
  },
  {
    id: 121,
    category: "Profile & Settings",
    question: "Where can I see notifications?",
    answer: "Use the notification control in the application header or notifications area if enabled.",
    keywords: ["notifications", "where to see notifications"]
  },
  {
    id: 122,
    category: "Profile & Settings",
    question: "How do I manage my account?",
    answer: "Use Profile and Settings for account information, preferences, and security options.",
    keywords: ["account", "manage account"]
  },
  {
    id: 123,
    category: "Profile & Settings",
    question: "Can I delete my account?",
    answer: "If account deletion is supported, use the account settings option and follow its confirmation process.",
    keywords: ["delete", "delete account"]
  },
  {
    id: 124,
    category: "Profile & Settings",
    question: "How do I change my preferences?",
    answer: "Open Settings and update the preferences available in your current build.",
    keywords: ["preferences", "change preferences"]
  },
  {
    id: 125,
    category: "Profile & Settings",
    question: "How do I check my account role?",
    answer: "If role information is exposed in your profile or account area, you can view it there.",
    keywords: ["role", "check role"]
  },
  {
    id: 126,
    category: "Admin Features",
    question: "What can an admin do?",
    answer: "Depending on permissions, administrators can manage users, review extraction results, manage graph knowledge, inspect logs, and handle feedback.",
    keywords: ["admin", "what can an admin do"]
  },
  {
    id: 127,
    category: "Admin Features",
    question: "How do I approve extracted relationships?",
    answer: "Open extraction review, inspect pending results and sources, then approve valid relationships.",
    keywords: ["approve", "how to approve"]
  },
  {
    id: 128,
    category: "Admin Features",
    question: "How do I merge duplicate entities?",
    answer: "Review the possible duplicate pair, verify the match, and use the merge control if authorized.",
    keywords: ["merge", "how to merge duplicate entities"]
  },
  {
    id: 129,
    category: "Admin Features",
    question: "What are audit logs?",
    answer: "Audit logs record important actions so administrators can review activity and changes.",
    keywords: ["audit", "what are audit logs"]
  },
  {
    id: 130,
    category: "Admin Features",
    question: "How do I manage users?",
    answer: "Use the user management area if you have administrator permissions.",
    keywords: ["users", "manage users"]
  },
  {
    id: 131,
    category: "Admin Features",
    question: "What is graph versioning?",
    answer: "It records meaningful graph changes so authorized users can inspect history and supported restore options.",
    keywords: ["versioning", "graph versioning"]
  },
  {
    id: 132,
    category: "Admin Features",
    question: "What is an admin dashboard?",
    answer: "It provides administrative views and controls for users, datasets, graph knowledge, feedback, and logs.",
    keywords: ["dashboard", "admin dashboard"]
  },
  {
    id: 133,
    category: "Admin Features",
    question: "Can an admin see private data?",
    answer: "Access should follow the application's permission model. Do not assume administrative access bypasses privacy controls.",
    keywords: ["privacy", "can admin see private data"]
  },
  {
    id: 134,
    category: "Admin Features",
    question: "What is an audit trail?",
    answer: "It is a chronological record of important actions and changes, including who changed what and when.",
    keywords: ["audit", "audit trail"]
  },
  {
    id: 135,
    category: "Admin Features",
    question: "Can an admin delete knowledge?",
    answer: "If authorized deletion is supported, an admin can use it with confirmation and auditing.",
    keywords: ["delete", "can admin delete knowledge"]
  },
  {
    id: 136,
    category: "Troubleshooting",
    question: "My upload failed",
    answer: "Check file format, size, integrity, and the specific error message, then retry after correcting the issue.",
    keywords: ["upload", "failed", "upload failed"]
  },
  {
    id: 137,
    category: "Troubleshooting",
    question: "My dataset is not processing",
    answer: "Check processing status and error details. Invalid structure, unsupported content, or backend errors can cause failures.",
    keywords: ["processing", "dataset not processing"]
  },
  {
    id: 138,
    category: "Troubleshooting",
    question: "My graph is empty",
    answer: "Check whether extraction produced results, whether valid knowledge was approved, and whether filters hide the results.",
    keywords: ["graph", "graph is empty"]
  },
  {
    id: 139,
    category: "Troubleshooting",
    question: "The AI did not answer my question",
    answer: "Try a more specific question. If the information is not present, the assistant should say it cannot find the answer.",
    keywords: ["ai", "ai did not answer"]
  },
  {
    id: 140,
    category: "Troubleshooting",
    question: "Why are there no entities?",
    answer: "Extraction may have detected no supported entities, the mapping may be incorrect, or processing may have failed.",
    keywords: ["entities", "no entities", "why are there no entities"]
  },
  {
    id: 141,
    category: "Troubleshooting",
    question: "Why are there no relationships?",
    answer: "The data may contain insufficient relational information, incorrect mappings, or an unsuitable extraction mode.",
    keywords: ["relationships", "no relationships", "why are there no relationships"]
  },
  {
    id: 142,
    category: "Troubleshooting",
    question: "Why did my extraction fail?",
    answer: "Check the extraction status and error details, then verify that the input contains supported usable content.",
    keywords: ["extraction", "extraction fail", "why did extraction fail"]
  },
  {
    id: 143,
    category: "Troubleshooting",
    question: "Why can't I see my dataset?",
    answer: "Check that you are using the correct account, the upload completed, and you have permission to access the dataset.",
    keywords: ["dataset", "cannot see dataset"]
  },
  {
    id: 144,
    category: "Troubleshooting",
    question: "Why can't I see the graph?",
    answer: "There may be no approved knowledge, no relationships, or a filter may be hiding the results.",
    keywords: ["graph", "cannot see graph"]
  },
  {
    id: 145,
    category: "Troubleshooting",
    question: "The page is not loading",
    answer: "Refresh the page and check your connection. If the problem continues, record the displayed error.",
    keywords: ["page", "page not loading"]
  },
  {
    id: 146,
    category: "Troubleshooting",
    question: "Why did my login fail?",
    answer: "Verify your credentials and account status, then use the available recovery process if needed.",
    keywords: ["login", "login fail", "why did login fail"]
  },
  {
    id: 147,
    category: "Troubleshooting",
    question: "Why is search returning no results?",
    answer: "Try a shorter or exact term, remove restrictive filters, and verify the entity or dataset exists.",
    keywords: ["search", "search returning no results"]
  },
  {
    id: 148,
    category: "Troubleshooting",
    question: "Why is extraction slow?",
    answer: "Processing time depends on file size, document complexity, model, and available backend resources.",
    keywords: ["slow", "extraction slow"]
  },
  {
    id: 149,
    category: "Troubleshooting",
    question: "What should I do after an error?",
    answer: "Read the error message, correct the identified problem, retry, and record the details if it persists.",
    keywords: ["error", "after error"]
  },
  {
    id: 150,
    category: "Troubleshooting",
    question: "How do I report a problem?",
    answer: "Use the Feedback or support mechanism available in your current KnowVerse build and include the error details.",
    keywords: ["feedback", "report a problem"]
  }
];
