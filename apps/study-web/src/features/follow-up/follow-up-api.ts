import { WEB_STUDY_REQUEST_HEADER, WEB_STUDY_REQUEST_HEADER_VALUE } from '@passwo/contracts';
import {
  followUpAccessRequestSchema,
  followUpAccessResponseSchema,
  type FollowUpAccessResponse,
  type FollowUpSubmissionRequest,
  followUpSubmissionRequestSchema,
  followUpSubmissionResponseSchema,
} from '@passwo/contracts/follow-up';

function errorCode(value: unknown): string {
  if (
    typeof value === 'object' &&
    value !== null &&
    'errorCode' in value &&
    typeof value.errorCode === 'string' &&
    value.errorCode.length > 0 &&
    value.errorCode.length <= 80
  )
    return value.errorCode;
  return 'follow-up-request-failed';
}

async function post(apiBasePath: string, path: string, body: unknown): Promise<unknown> {
  const response = await fetch(`${apiBasePath}${path}`, {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
      [WEB_STUDY_REQUEST_HEADER]: WEB_STUDY_REQUEST_HEADER_VALUE,
    },
    body: JSON.stringify(body),
  });
  const responseBody: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorCode(responseBody));
  return responseBody;
}

export async function loadFollowUpAccess(
  token: string,
  apiBasePath = '',
): Promise<FollowUpAccessResponse> {
  const request = followUpAccessRequestSchema.parse({ token });
  return followUpAccessResponseSchema.parse(
    await post(apiBasePath, '/api/follow-up/access', request),
  );
}

export async function submitFollowUp(
  request: FollowUpSubmissionRequest,
  apiBasePath = '',
): Promise<void> {
  const parsed = followUpSubmissionRequestSchema.parse(request);
  followUpSubmissionResponseSchema.parse(
    await post(apiBasePath, '/api/follow-up/submissions', parsed),
  );
}
