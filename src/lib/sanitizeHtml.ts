import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    return html;
  }
  
  // Xavfsiz hook qo'shish
  try {
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      if (node.nodeName === 'A' && node.hasAttribute('href')) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    });
  } catch {}

  return DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] });
}
