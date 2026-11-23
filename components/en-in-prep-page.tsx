import Link from 'next/link';
import { PublicationShell } from '@/components/publication-shell';

export function EnInPrepPage({
  title,
  description,
  zhHref,
  zhLabel,
}: {
  title: string;
  description: string;
  zhHref: string;
  zhLabel: string;
}) {
  return (
    <PublicationShell title={title} description={description}>
      <section className="reading-section">
        <p className="home-lead">
          This English section is currently in preparation as part of the meaning-equivalent English edition rollout.
          All underlying evidence, primary-source locators, and numerical case inputs are already published in the Chinese edition.
        </p>
        <div className="home-actions flex-wrap">
          <Link className="primary-link whitespace-nowrap" href={zhHref}>
            {zhLabel}
          </Link>
          <Link className="secondary-link whitespace-nowrap" href="/en/coverage/">
            View English Book Guide &amp; Status
          </Link>
        </div>
      </section>
    </PublicationShell>
  );
}
