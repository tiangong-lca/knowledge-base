'use client';
export function PrintButton({ label = '打印或另存为 PDF' }: { label?: string }) {
  return (
    <button
      className="primary-link print-button"
      onClick={() => {
        const details = Array.from(document.querySelectorAll<HTMLDetailsElement>('.print-book details'));
        const previous = details.map(d => d.open);
        details.forEach(d => (d.open = true));
        window.print();
        details.forEach((d, i) => (d.open = previous[i]));
      }}
    >
      {label}
    </button>
  );
}
