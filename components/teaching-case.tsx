import 'server-only';
import type { CaseHeadingNumber } from './numbered-heading';

import rawSpecification from '../knowledge/cases/wall-coating-v1.json';
import { publicTeachingCase } from '../scripts/case-publication.mjs';
import { assertTeachingCaseIdentity, type TeachingCaseSpec } from '../lib/teaching-case';
import { TeachingCaseClient } from './teaching-case-client';
import { EnWallCaseClient } from './en-wall-case-client';
import { JointProductionCase } from './joint-production-case';
import { EnJointProductionCase } from './en-joint-case';

/** Raw records and Node publication helpers stay outside the client module graph. */
export function TeachingCase({
  id,
  version,
  print = false,
  numbering = [],
  lang = 'zh',
}: {
  print?: boolean;
  numbering?: CaseHeadingNumber[];
  id: 'CASE-WALL-CONNECT' | 'CASE-JOINT-BATCH';
  version: '1.0.0';
  lang?: 'zh' | 'en';
}) {
  if (id === 'CASE-JOINT-BATCH') {
    if (version !== '1.0.0') throw new TypeError(`Unsupported teaching case ${id}@${version}`);
    if (lang === 'en') {
      return <EnJointProductionCase />;
    }
    return <JointProductionCase print={print} numbering={numbering} />;
  }
  const spec = publicTeachingCase(rawSpecification) as unknown as TeachingCaseSpec;
  assertTeachingCaseIdentity(spec, id, version);
  if (lang === 'en') {
    return <EnWallCaseClient spec={spec} print={print} />;
  }
  return <TeachingCaseClient spec={spec} print={print} numbering={numbering} />;
}
