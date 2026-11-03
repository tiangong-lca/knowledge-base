'use client';
export function PrintButton(){return <button className="primary-link print-button" onClick={()=>{const details=Array.from(document.querySelectorAll<HTMLDetailsElement>('.print-book details'));const previous=details.map(d=>d.open);details.forEach(d=>d.open=true);window.print();details.forEach((d,i)=>d.open=previous[i]);}}>打印或另存为 PDF</button>}
