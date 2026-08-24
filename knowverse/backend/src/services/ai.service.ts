import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import axios from 'axios';
import logger from '../config/logger';
import { knowledgeRetrievalService, GroundedAnswer } from './knowledgeRetrieval.service';
import { ActionButton } from './websiteGuide.service';

export interface GraphFact {
  subject: string;
  relation: string;
  object: string;
  confidence: number;
  sourceDocument?: string;
  datasetName?: string;
  sourceText?: string;
}

export interface SourceCitation {
  documentTitle: string;
  datasetName: string;
  confidence: number;
  snippet?: string;
  subject?: string;
  object?: string;
}

export interface ChatResult {
  conversationId: string;
  message: string;
  answerType: 'KNOWVERSE_FACT' | 'GENERAL_KNOWLEDGE' | 'INFERENCE' | 'WEBSITE_GUIDE' | 'UNKNOWN';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  graphContext: GraphFact[];
  sources: SourceCitation[];
  groundedFacts: boolean;
  directFacts: Array<{ subject: string; relation: string; object: string; confidence: number }>;
  graphPaths: Array<{ path: string[]; description: string; confidence: number }>;
  suggestedQuestions: string[];
  actionButtons?: ActionButton[];
  steps?: string[];
  relatedEntities?: string[];
}

export const aiService = {
  async chat(
    userId: string,
    message: string,
    conversationId?: string,
    contextInfo?: { currentRoute?: string; mode?: 'beginner' | 'expert' }
  ): Promise<ChatResult> {
    // 1. Find or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.aiConversation.findFirst({ where: { id: conversationId, userId } });
      if (!conversation) throw new AppError('Conversation not found', 404, 'NOT_FOUND');
    } else {
      conversation = await prisma.aiConversation.create({
        data: { userId, title: message.substring(0, 60) },
      });
    }

    // 2. Save user message
    await prisma.aiMessage.create({
      data: { conversationId: conversation.id, role: 'USER', content: message },
    });

    // 3. Process via Grounded Retrieval Service
    const grounded = await knowledgeRetrievalService.processQuery(
      message,
      contextInfo?.currentRoute,
      contextInfo?.mode
    );

    let responseText = grounded.message;

    // 4. If external LLM is configured and not a website guide, enhance reasoning
    if (env.AI_PROVIDER !== 'none' && env.AI_API_KEY && grounded.answerType !== 'WEBSITE_GUIDE') {
      try {
        const llmResponse = await aiService._callLLM(message, grounded.directFacts, env.AI_PROVIDER, env.AI_API_KEY, env.AI_MODEL);
        if (llmResponse && llmResponse.length > 20) {
          responseText = llmResponse;
        }
      } catch (err) {
        logger.warn('External LLM call skipped, using local grounded synthesis:', err);
      }
    }

    // 5. Save assistant message with complete metadata
    await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: responseText,
        metadata: {
          answerType: grounded.answerType,
          confidence: grounded.confidence,
          confidenceScore: grounded.confidenceScore,
          graphContext: grounded.graphContext,
          sources: grounded.sources,
          directFacts: grounded.directFacts,
          graphPaths: grounded.graphPaths,
          suggestedQuestions: grounded.suggestedQuestions,
          actionButtons: grounded.actionButtons,
          steps: grounded.steps,
        } as any,
      },
    });

    // Update conversation timestamp
    await prisma.aiConversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });

    return {
      conversationId: conversation.id,
      message: responseText,
      answerType: grounded.answerType,
      confidence: grounded.confidence,
      confidenceScore: grounded.confidenceScore,
      graphContext: grounded.graphContext,
      sources: grounded.sources,
      groundedFacts: grounded.answerType === 'KNOWVERSE_FACT',
      directFacts: grounded.directFacts,
      graphPaths: grounded.graphPaths,
      suggestedQuestions: grounded.suggestedQuestions,
      actionButtons: grounded.actionButtons,
      steps: grounded.steps,
      relatedEntities: grounded.relatedEntities,
    };
  },

  async _callLLM(message: string, context: any[], provider: string, apiKey: string, model?: string): Promise<string> {
    const contextText = context.map(c => `${c.subject} ${c.relation} ${c.object} (Confidence: ${c.confidence}%)`).join('\n');
    const systemPrompt = `You are KnowVerse AI, an intelligent, grounded knowledge graph assistant.
Answer user questions directly and clearly using markdown formatting.
If verified graph facts are provided below, ALWAYS base your answer on them and cite the relationships.
Do NOT invent unverified data.

Knowledge Graph Grounding Context:
${contextText || 'No specific dataset facts found.'}`;

    if (provider === 'openai') {
      const resp = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          max_tokens: 1200,
        },
        { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 30000 }
      );
      return resp.data.choices[0]?.message?.content || '';
    }

    if (provider === 'gemini') {
      const resp = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash'}:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }] }],
        },
        { timeout: 30000 }
      );
      return resp.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    return '';
  },

  async explainSubgraph(entityIds: string[]): Promise<{
    explanation: string;
    paths: Array<{ subject: string; relation: string; object: string }>;
    sources: SourceCitation[];
  }> {
    if (!entityIds || entityIds.length < 2) {
      throw new AppError('At least 2 entities are required to explain connections', 400, 'BAD_REQUEST');
    }

    const directTriples = await prisma.triple.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          { subjectEntityId: { in: entityIds }, objectEntityId: { in: entityIds } },
          { subjectEntityId: { in: entityIds } },
          { objectEntityId: { in: entityIds } },
        ],
      },
      include: {
        subjectEntity: true,
        relation: true,
        objectEntity: true,
        sourceDocument: { include: { dataset: true } },
      },
      take: 20,
    });

    const entities = await prisma.entity.findMany({
      where: { id: { in: entityIds } },
      select: { id: true, name: true, entityType: true },
    });

    const entityNames = entities.map(e => e.name);
    const paths = directTriples.map(t => ({
      subject: t.subjectEntity.name,
      relation: t.relation.name,
      object: t.objectEntity.name,
    }));

    const sources: SourceCitation[] = directTriples.map(t => ({
      documentTitle: t.sourceDocument?.title || 'Document',
      datasetName: t.sourceDocument?.dataset?.name || 'Dataset',
      confidence: Math.round(t.confidence * 100),
      snippet: t.sourceText || `${t.subjectEntity.name} ${t.relation.name} ${t.objectEntity.name}`,
    }));

    const pathText = paths.length > 0
      ? paths.map(p => `• **${p.subject}** → *${p.relation}* → **${p.object}**`).join('\n')
      : 'No direct or intermediate paths connecting these entities were found in the current approved graph.';

    const explanation = `### 🔗 Multi-Entity Connection Explanation\n\n**Entities Analyzed:** ${entityNames.join(', ')}\n\n#### Relationship Paths Traced:\n${pathText}\n\n*This explanation is deterministically grounded in ${paths.length} approved MySQL triples.*`;

    return { explanation, paths, sources: sources.slice(0, 5) };
  },

  async getConversations(userId: string) {
    return prisma.aiConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { content: true, role: true, metadata: true } },
        _count: { select: { messages: true } },
      },
    });
  },

  async getConversation(id: string, userId: string) {
    const conv = await prisma.aiConversation.findFirst({
      where: { id, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conv) throw new AppError('Conversation not found', 404, 'NOT_FOUND');
    return conv;
  },

  async deleteConversation(id: string, userId: string) {
    return prisma.aiConversation.deleteMany({
      where: { id, userId },
    });
  },

  async saveInsight(userId: string, data: { question: string; answer: string; sources?: any; metadata?: any }) {
    return (prisma as any).savedInsight.create({
      data: {
        userId,
        question: data.question,
        answer: data.answer,
        sources: data.sources,
        metadata: data.metadata,
      },
    });
  },

  async getSavedInsights(userId: string) {
    return (prisma as any).savedInsight.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async deleteSavedInsight(id: string, userId: string) {
    return (prisma as any).savedInsight.deleteMany({
      where: { id, userId },
    });
  },
};
