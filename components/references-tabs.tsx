import Link from 'next/link';
import styles from './references-tabs.module.css';

interface ReferencesTabsProps {
  active: 'research' | 'sources';
  sourceCount: number;
  evidenceCount: number;
  prefix?: string;
  lang?: 'zh' | 'en';
}

export function ReferencesTabs({ active, sourceCount, evidenceCount, prefix = '/zh', lang = 'zh' }: ReferencesTabsProps) {
  const isEn = lang === 'en';
  return (
    <nav className={styles.tabNav} aria-label={isEn ? 'Switch between bibliography and citation locators' : '参考文献与出处视图切换'}>
      <ul className={styles.tabList}>
        <li className={styles.tabItem}>
          <Link
            href={`${prefix}/research/`}
            aria-current={active === 'research' ? 'page' : undefined}
            className={`${styles.tabLink} ${active === 'research' ? styles.tabActive : ''}`}
          >
            <span>{isEn ? 'Bibliography & Readings' : '书目与核读'}</span>
            <span className={styles.tabBadge}>{isEn ? `${sourceCount} sources` : `${sourceCount} 份文献`}</span>
          </Link>
        </li>
        <li className={styles.tabItem}>
          <Link
            href={`${prefix}/sources/`}
            aria-current={active === 'sources' ? 'page' : undefined}
            className={`${styles.tabLink} ${active === 'sources' ? styles.tabActive : ''}`}
          >
            <span>{isEn ? 'Citation Locators' : '引文定位'}</span>
            <span className={styles.tabBadge}>{isEn ? `${evidenceCount} locators` : `${evidenceCount} 条引文`}</span>
          </Link>
        </li>
      </ul>
      <p className={styles.tabSummary}>
        {isEn
          ? active === 'research'
            ? 'Current view: primary sources listed by original title, version, and verified reading sections; switch to Citation Locators to inspect passage-level citations and linked claims.'
            : 'Current view: passage-level citation locators, excerpts, and supporting claims grouped by source; switch to Bibliography & Readings for the compact bibliography.'
          : active === 'research'
            ? '当前视图：按原文献列示书目、版本信息与核读章节页码；切换至「引文定位」可按来源逐条查验引文位置与对应论述。'
            : '当前视图：按来源展开逐条引文定位、原文摘录与支撑论述；切换至「书目与核读」可快速浏览全部原始文献清单。'}
      </p>
    </nav>
  );
}
