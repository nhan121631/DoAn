/**
 * Utility function to decode HTML entities and fix styling issues
 */

/**
 * Decode HTML entities in content
 * @param html - HTML string with entities
 * @returns Decoded HTML string
 */
export const decodeHtmlEntities = (html: string): string => {
  if (!html) return '';
  
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
};

/**
 * Process HTML content for proper display
 * @param content - Raw HTML content from database
 * @returns Processed HTML ready for display
 */
export const processHtmlForDisplay = (content: string): string => {
  if (!content) return '';
  
  // First decode HTML entities
  let processedContent = decodeHtmlEntities(content);
  
  // Handle escaped newlines
  processedContent = processedContent.replace(/\\n/g, '\n');
  
  console.log('🔄 Processing HTML content:', {
    original: content.substring(0, 100) + '...',
    decoded: processedContent.substring(0, 100) + '...'
  });
  
  return processedContent;
};