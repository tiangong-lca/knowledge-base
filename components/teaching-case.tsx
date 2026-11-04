import 'server-only';

import rawSpecification from '../knowledge/cases/wall-coating-v1.json';
import { publicTeachingCase } from '../scripts/case-publication.mjs';
import { assertTeachingCaseIdentity, type TeachingCaseSpec } from '../lib/teaching-case';
import { TeachingCaseClient } from './teaching-case-client';

/** Raw records and Node publication helpers stay outside the client module graph. */
export function TeachingCase({ id, version }: { id: 'CASE-WALL-CONNECT'; version: '1.0.0' }) {
  const spec = publicTeachingCase(rawSpecification) as unknown as TeachingCaseSpec;
  assertTeachingCaseIdentity(spec, id, version);
  return <TeachingCaseClient spec={spec} />;
}
