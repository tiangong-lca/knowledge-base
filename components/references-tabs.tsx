import Link from 'next/link';
import styles from './references-tabs.module.css';

interface ReferencesTabsProps {
  active: 'research' | 'sources';
  sourceCount: number;
  evidenceCount: number;
}

export function ReferencesTabs({ active, sourceCount, evidenceCount }: ReferencesTabsProps) {
  return (
    <nav className={styles.tabNav} aria-label="参考文献与出处视图切换">
      <ul className={styles.tabList}>
        <li className={styles.tabItem}>
          <Link
            href="/research/"
            aria-current={active === 'research' ? 'page' : undefined}
            className={`${styles.tabLink} ${active === 'research' ? styles.tabActive : ''}`}
          >
            <span>书目与核读</span>
            <span className={styles.tabBadge}>{sourceCount} 份文献</span>
          </Link>
        </li>
        <li className={styles.tabItem}>
          <Link
            href="/sources/"
            aria-current={active === 'sources' ? 'page' : undefined}
            className={`${styles.tabLink} ${active === 'sources' ? styles.tabActive : ''}`}
          >
            <span>引文定位</span>
            <span className={styles.tabBadge}>{evidenceCount} 条引文</span>
          </Link>
        </li>
      </ul>
      <p className={styles.tabSummary}>
        {active === 'research'
          ? '当前视图：按原文献列示书目、版本信息与核读章节页码；切换至「引文定位」可按来源逐条查验引文位置与对应论述。'
          : '当前视图：按来源展开逐条引文定位、原文摘录与支撑论述；切换至「书目与核读」可快速浏览全部原始文献清单。'}
      </p>
    </nav>
  );
}
