import sanitizeHtml from 'sanitize-html';
import { normalizeAddress } from './address';

const ALLOWED_TAGS = [
  'a',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'hr',
  'i',
  'li',
  'main',
  'ol',
  'p',
  'pre',
  'section',
  'span',
  'strong',
  'ul',
];

const BLOCK_TAGS = '(address|article|blockquote|div|h[1-6]|li|main|ol|p|pre|section|ul)';

export function internalAddressFromHref(href: string | undefined): string | null {
  if (!href) return null;

  const match = /^(?:(?:https?):\/\/)?([^/?#]+)\/?$/i.exec(href.trim());
  if (!match) return null;

  try {
    return normalizeAddress(match[1]);
  } catch {
    return null;
  }
}

export function safeInternalHref(href: string | undefined): string | null {
  const address = internalAddressFromHref(href);
  return address ? `https://${address}` : null;
}

export function sanitizeHtmlContent(dirtyHtml: string): string {
  return sanitizeHtml(dirtyHtml, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { a: ['href', 'title'] },
    allowedSchemes: ['https'],
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
    nonTextTags: [
      'iframe',
      'math',
      'noembed',
      'noframes',
      'noscript',
      'object',
      'option',
      'plaintext',
      'script',
      'style',
      'svg',
      'template',
      'textarea',
      'xmp',
    ],
    transformTags: {
      a: (_tagName, attributes) => {
        const href = safeInternalHref(attributes.href);
        const safeAttributes: Record<string, string> = {};
        if (href) safeAttributes.href = href;
        if (attributes.title) safeAttributes.title = attributes.title;
        return { tagName: 'a', attribs: safeAttributes };
      },
    },
  });
}

function decodeCodePoint(value: number): string {
  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > 0x10ffff ||
    (value >= 0xd800 && value <= 0xdfff)
  ) {
    return '\ufffd';
  }

  return String.fromCodePoint(value);
}

export function htmlToPlainText(sanitizedHtml: string): string {
  return sanitizedHtml
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(new RegExp(`</${BLOCK_TAGS}>`, 'gi'), '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_entity, decimal: string) =>
      decodeCodePoint(Number(decimal)),
    )
    .replace(/&#x([\da-f]+);/gi, (_entity, hexadecimal: string) =>
      decodeCodePoint(Number.parseInt(hexadecimal, 16)),
    )
    .replace(/&amp;/gi, '&')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
