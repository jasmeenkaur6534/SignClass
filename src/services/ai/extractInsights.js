import { mockCheckpointInsights } from '../../mock/mockInsights.js';

export class ActionExtractor {
  constructor() {
    this.extractedItemsMap = new Map(); // Client-side Map<id, ActionItem> for deduplication
    this.currentTopic = { title: 'Binary Search Trees', subpoints: ['Tree Invariant', 'In-order traversal'], changed: false };
    this.earlierTopics = [];
  }

  processSegment(segment) {
    let result = null;

    // 1. Checkpoint-based extraction for Demo Mode
    if (segment.checkpoint && mockCheckpointInsights[segment.checkpoint]) {
      const insightData = mockCheckpointInsights[segment.checkpoint];

      // Topic update
      if (insightData.topic) {
        if (insightData.topic.changed && insightData.topic.title !== this.currentTopic.title) {
          this.earlierTopics.push(this.currentTopic.title);
          this.currentTopic = {
            title: insightData.topic.title,
            subpoints: insightData.topic.subpoints || [],
            changed: true
          };
        } else {
          this.currentTopic.subpoints = [
            ...new Set([...this.currentTopic.subpoints, ...(insightData.topic.subpoints || [])])
          ];
        }
      }

      // Action items upsert
      const newItems = [];
      if (insightData.items) {
        insightData.items.forEach(item => {
          if (!this.extractedItemsMap.has(item.id)) {
            const fullItem = {
              ...item,
              completed: false,
              edited: false
            };
            this.extractedItemsMap.set(item.id, fullItem);
            newItems.push(fullItem);
          }
        });
      }

      result = {
        topic: this.currentTopic,
        earlierTopics: this.earlierTopics,
        newItems,
        keyTerms: insightData.keyTerms || []
      };
    } else {
      // 2. Client-side heuristic keyword pre-filter for live mic input
      const text = segment.text.toLowerCase();
      const wordCount = text.trim().split(/\s+/).length;
      const triggerRegex = /(submit|due|deadline|assignment|homework|exam|midterm|test|important|remember|chapter \d+|problem \d+)/i;

      if (wordCount >= 4 && triggerRegex.test(text)) {
        let type = 'announcement';
        if (/homework|assignment|solve|problem/i.test(text)) type = 'assignment';
        else if (/due|deadline|submit/i.test(text)) type = 'deadline';
        else if (/exam|midterm|test|important|remember/i.test(text)) type = 'exam_note';

        const textHash = text.replace(/[^a-z0-9]/g, '').slice(0, 32);
        const itemId = `auto_${textHash}`;

        if (!this.extractedItemsMap.has(itemId)) {
          const item = {
            id: itemId,
            type,
            title: segment.text,
            detail: 'Auto-extracted from live lecture transcript',
            dueDate: null,
            dueLabel: type === 'deadline' || type === 'assignment' ? 'Upcoming' : undefined,
            confidence: 'high',
            sourceTimestamp: segment.timestampLabel,
            sourceQuote: segment.text,
            completed: false,
            edited: false
          };

          this.extractedItemsMap.set(itemId, item);
          result = {
            topic: this.currentTopic,
            earlierTopics: this.earlierTopics,
            newItems: [item],
            keyTerms: []
          };
        }
      }
    }

    return result;
  }

  getAllItems() {
    return Array.from(this.extractedItemsMap.values());
  }

  updateItem(id, updatedFields) {
    if (this.extractedItemsMap.has(id)) {
      const existing = this.extractedItemsMap.get(id);
      const updated = { ...existing, ...updatedFields, edited: true };
      this.extractedItemsMap.set(id, updated);
      return updated;
    }
    return null;
  }

  deleteItem(id) {
    return this.extractedItemsMap.delete(id);
  }
}
