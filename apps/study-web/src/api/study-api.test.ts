import { afterEach, describe, expect, it, vi } from 'vitest';
import { createStudyApi } from './study-api.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('study API recruitment source boundary', () => {
  it.each([
    { search: '', expectedRecruitmentId: null },
    { search: '?id=ub', expectedRecruitmentId: 'ub' },
    { search: '?id=tu', expectedRecruitmentId: 'tu' },
    { search: '?id=other-university', expectedRecruitmentId: 'other-university' },
    { search: '?id=unknown', expectedRecruitmentId: 'unknown' },
  ])('forwards only id from "$search" during session creation', async ({
    search,
    expectedRecruitmentId,
  }) => {
    const requests: Array<{ readonly url: string; readonly body: unknown }> = [];
    vi.stubGlobal(
      'fetch',
      async (input: RequestInfo | URL, init?: RequestInit) => {
        if (typeof init?.body !== 'string') throw new Error('missing-request-body');
        const body: unknown = JSON.parse(init.body);
        requests.push({ url: String(input), body });
        return new Response(
          JSON.stringify({
            sessionId: '00000000-0000-4000-8000-000000000001',
            condition: 'supportive',
            assignmentMode: 'forced-supportive',
            guardrailFormId: 'F1',
            deletionCode: 'PW-AB12-CD34-EF56-7890',
          }),
          { status: 201, headers: { 'content-type': 'application/json' } },
        );
      },
    );

    await createStudyApi({ recruitmentSearch: search }).createSession(false, null);

    expect(requests).toHaveLength(1);
    const request = requests[0];
    if (request === undefined || typeof request.body !== 'object' || request.body === null) {
      throw new Error('missing-session-create-request');
    }
    expect(request).toEqual({
      url: '/api/study/sessions',
      body: expect.objectContaining({ recruitmentId: expectedRecruitmentId }),
    });
    expect(Object.keys(request.body)).not.toEqual(
      expect.arrayContaining(['url', 'referrer', 'ip', 'condition']),
    );
  });
});
