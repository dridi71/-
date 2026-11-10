import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { DocumentImportResult } from '../types';

// Ensure PDF.js worker is properly configured in browser
if (typeof window !== 'undefined') {
  try {
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
    }
  } catch (err) {
    console.warn('PDF.js worker setup note:', err);
  }
}

/**
 * Checks if Arabic text appears to be character-reversed (common bug in certain PDF exporters)
 * e.g., words starting with Taa Marbuta (ة) or Tanween (ً / ٍ / ٌ)
 */
export function isArabicTextReversed(text: string): boolean {
  const words = text.trim().split(/\s+/).slice(0, 30);
  if (words.length === 0) return false;

  let reversedIndications = 0;
  for (const word of words) {
    // A word starting with ة or Tanween is grammatically impossible in Arabic
    if (/^[ةًٌٍ]/.test(word)) {
      reversedIndications++;
    }
    // Words ending in 'ال' where 'ال' is at the tail
    if (word.length > 3 && word.endsWith('لا')) {
      reversedIndications++;
    }
  }

  return reversedIndications >= Math.min(3, Math.ceil(words.length * 0.2));
}

/**
 * Reverses characters of each Arabic word to restore correct RTL reading
 */
export function reverseArabicWords(text: string): string {
  const lines = text.split('\n');
  return lines
    .map((line) => {
      const words = line.trim().split(/\s+/);
      // Reverse each word's characters and keep word order or reverse word order depending on PDF export
      return words
        .map((w) => w.split('').reverse().join(''))
        .reverse()
        .join(' ');
    })
    .join('\n');
}

/**
 * Converts a File object to Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip metadata prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts raw text from Microsoft Word (.docx) files using mammoth
 */
export async function extractFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value || '';
  
  // Format paragraphs cleanly
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extracts text from PDF files using PDF.js
 */
export async function extractFromPdf(file: File): Promise<{
  text: string;
  pageCount: number;
  isScanned: boolean;
  wasReversed: boolean;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/cmaps/',
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Group text items into lines
    const lineMap = new Map<number, string[]>();
    for (const item of textContent.items) {
      if ('str' in item && typeof item.str === 'string') {
        const str = item.str.trim();
        if (!str) continue;
        // Group by Y coordinate (approximate line)
        const y = Math.round(item.transform[5]);
        if (!lineMap.has(y)) {
          lineMap.set(y, []);
        }
        lineMap.get(y)!.push(item.str);
      }
    }

    // Sort lines from top to bottom (descending Y)
    const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);
    const pageLines = sortedY.map((y) => (lineMap.get(y) || []).join(' '));
    const combinedPageText = pageLines.join('\n');

    if (combinedPageText.trim()) {
      pageTexts.push(combinedPageText.trim());
    }
  }

  let fullText = pageTexts.join('\n\n');
  const isScanned = fullText.trim().length < 30 && numPages > 0;
  
  let wasReversed = false;
  if (!isScanned && isArabicTextReversed(fullText)) {
    fullText = reverseArabicWords(fullText);
    wasReversed = true;
  }

  return {
    text: fullText.trim(),
    pageCount: numPages,
    isScanned,
    wasReversed,
  };
}

/**
 * Extracts Arabic text from documents (especially scanned PDFs or complex formats)
 * using the server-side Gemini 2.5 Flash API endpoint
 */
export async function extractDocumentWithAi(
  file: File,
  mimeTypeOverride?: string
): Promise<{ text: string }> {
  const base64Data = await fileToBase64(file);
  const mimeType = mimeTypeOverride || file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');

  const response = await fetch('/api/extract-document', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: file.name,
      mimeType,
      base64Data,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.details || `فشل الاستخراج بالذكاء الاصطناعي (رمز: ${response.status})`);
  }

  const data = await response.json();
  return {
    text: (data.text || '').trim(),
  };
}

/**
 * Extracts plain text from .txt, .md, .json, .rtf files
 */
export async function extractFromTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content);
          if (parsed.rawText && typeof parsed.rawText === 'string') {
            resolve(parsed.rawText);
            return;
          }
          if (parsed.text && typeof parsed.text === 'string') {
            resolve(parsed.text);
            return;
          }
        } catch {
          // fallback to raw json string
        }
      }
      resolve(content);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Helper to calculate word and character counts for Arabic text
 */
export function getArabicTextCounts(text: string): { wordCount: number; charCount: number } {
  const clean = text.trim();
  if (!clean) return { wordCount: 0, charCount: 0 };
  const words = clean.split(/\s+/).filter(Boolean);
  return {
    wordCount: words.length,
    charCount: clean.length,
  };
}

/**
 * Master parser: inspects file extension/mime and parses accordingly
 */
export async function parseDocumentFile(
  file: File,
  useAiForced: boolean = false
): Promise<DocumentImportResult> {
  const fileName = file.name.toLowerCase();
  let fileType: DocumentImportResult['fileType'] = 'other';

  if (fileName.endsWith('.pdf')) fileType = 'pdf';
  else if (fileName.endsWith('.docx')) fileType = 'docx';
  else if (fileName.endsWith('.doc')) fileType = 'doc';
  else if (fileName.endsWith('.txt') || fileName.endsWith('.text')) fileType = 'txt';
  else if (fileName.endsWith('.md')) fileType = 'md';
  else if (fileName.endsWith('.json')) fileType = 'json';

  // If user requested AI extraction explicitly
  if (useAiForced) {
    const aiResult = await extractDocumentWithAi(file);
    const { wordCount, charCount } = getArabicTextCounts(aiResult.text);
    return {
      text: aiResult.text,
      fileName: file.name,
      fileSize: file.size,
      fileType,
      wordCount,
      charCount,
      method: 'gemini-ai',
    };
  }

  // Word .docx files
  if (fileType === 'docx') {
    try {
      const text = await extractFromDocx(file);
      const { wordCount, charCount } = getArabicTextCounts(text);
      return {
        text,
        fileName: file.name,
        fileSize: file.size,
        fileType: 'docx',
        wordCount,
        charCount,
        method: 'mammoth',
      };
    } catch (docxErr) {
      console.warn('Direct docx extraction failed, trying AI fallback:', docxErr);
      const aiResult = await extractDocumentWithAi(file);
      const { wordCount, charCount } = getArabicTextCounts(aiResult.text);
      return {
        text: aiResult.text,
        fileName: file.name,
        fileSize: file.size,
        fileType: 'docx',
        wordCount,
        charCount,
        method: 'gemini-ai',
      };
    }
  }

  // Word legacy .doc files
  if (fileType === 'doc') {
    // Binary legacy .doc is best parsed via AI extraction or fallback
    const aiResult = await extractDocumentWithAi(file, 'application/msword');
    const { wordCount, charCount } = getArabicTextCounts(aiResult.text);
    return {
      text: aiResult.text,
      fileName: file.name,
      fileSize: file.size,
      fileType: 'doc',
      wordCount,
      charCount,
      method: 'gemini-ai',
    };
  }

  // PDF files
  if (fileType === 'pdf') {
    const pdfResult = await extractFromPdf(file);
    
    // If the PDF appears to be scanned (no digital text layer), auto-fallback to AI
    if (pdfResult.isScanned || pdfResult.text.length < 10) {
      try {
        const aiResult = await extractDocumentWithAi(file, 'application/pdf');
        const { wordCount, charCount } = getArabicTextCounts(aiResult.text);
        return {
          text: aiResult.text,
          fileName: file.name,
          fileSize: file.size,
          fileType: 'pdf',
          wordCount,
          charCount,
          pageCount: pdfResult.pageCount,
          isScanned: true,
          method: 'gemini-ai',
        };
      } catch (aiErr) {
        // Return whatever was found with isScanned flag
        const { wordCount, charCount } = getArabicTextCounts(pdfResult.text);
        return {
          text: pdfResult.text,
          fileName: file.name,
          fileSize: file.size,
          fileType: 'pdf',
          wordCount,
          charCount,
          pageCount: pdfResult.pageCount,
          isScanned: true,
          method: 'pdfjs',
        };
      }
    }

    const { wordCount, charCount } = getArabicTextCounts(pdfResult.text);
    return {
      text: pdfResult.text,
      fileName: file.name,
      fileSize: file.size,
      fileType: 'pdf',
      wordCount,
      charCount,
      pageCount: pdfResult.pageCount,
      isScanned: false,
      method: 'pdfjs',
    };
  }

  // Text / Markdown / JSON
  const text = await extractFromTextFile(file);
  const { wordCount, charCount } = getArabicTextCounts(text);
  return {
    text,
    fileName: file.name,
    fileSize: file.size,
    fileType,
    wordCount,
    charCount,
    method: 'plaintext',
  };
}
