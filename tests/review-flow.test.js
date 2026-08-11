import { describe, expect, test } from 'bun:test';

// Helper function to bind AI messages to their preceding user questions (QnA pair)
export function pairQnaMessages(messages, selectedAiMessageIds) {
  const selectedAiSet = new Set(selectedAiMessageIds);
  const pairedPairs = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === 'assistant' && selectedAiSet.has(msg.id)) {
      // Find preceding user question
      let userQuestion = null;
      for (let j = i - 1; j >= 0; j--) {
        if (messages[j].role === 'user') {
          userQuestion = messages[j];
          break;
        }
      }
      pairedPairs.push({
        clientMessageId: msg.id,
        userQuestionId: userQuestion ? userQuestion.id : null,
        patientQuestion: userQuestion ? userQuestion.content : 'Pertanyaan AI',
        aiResponse: msg.content,
        safetyLevel: msg.safetyLevel || 'general',
      });
    }
  }

  return pairedPairs;
}

export function calculateReviewPrice(qnaCount, feePerQna) {
  const count = Math.max(1, Math.floor(qnaCount || 0));
  const unitFee = parseFloat(feePerQna) || 0;
  return count * unitFee;
}

describe('Review Flow Logic (TDD)', () => {
  test('automatically pairs selected AI response bubble with preceding user question bubble', () => {
    const mockMessages = [
      { id: 101, role: 'user', content: 'Apakah obat ibuprofen aman untuk lambung?' },
      { id: 102, role: 'assistant', content: 'Ibuprofen dapat mengiritasi lambung jika diminum tanpa makanan.', safetyLevel: 'review' },
      { id: 103, role: 'user', content: 'Berapa dosis paracetamol dewasa?' },
      { id: 104, role: 'assistant', content: 'Dosis lazim paracetamol dewasa adalah 500mg tiap 4-6 jam.', safetyLevel: 'general' },
    ];

    // User selects AI message #102 and #104
    const pairs = pairQnaMessages(mockMessages, [102, 104]);
    expect(pairs).toHaveLength(2);
    expect(pairs[0]).toEqual({
      clientMessageId: 102,
      userQuestionId: 101,
      patientQuestion: 'Apakah obat ibuprofen aman untuk lambung?',
      aiResponse: 'Ibuprofen dapat mengiritasi lambung jika diminum tanpa makanan.',
      safetyLevel: 'review',
    });
    expect(pairs[1]).toEqual({
      clientMessageId: 104,
      userQuestionId: 103,
      patientQuestion: 'Berapa dosis paracetamol dewasa?',
      aiResponse: 'Dosis lazim paracetamol dewasa adalah 500mg tiap 4-6 jam.',
      safetyLevel: 'general',
    });
  });

  test('dynamically calculates total price based on qnaCount * feePerQna', () => {
    expect(calculateReviewPrice(1, '25000')).toBe(25000);
    expect(calculateReviewPrice(2, '25000')).toBe(50000);
    expect(calculateReviewPrice(3, '35000')).toBe(105000);
    expect(calculateReviewPrice(0, '25000')).toBe(25000); // Minimum 1 QnA
  });
});
