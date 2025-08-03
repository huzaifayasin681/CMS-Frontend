export interface ReadingTimeResult {
  text: string;
  minutes: number;
  time: number;
  words: number;
}

export const calculateReadingTime = (text: string, wordsPerMinute: number = 200): ReadingTimeResult => {
  // Remove HTML tags and get plain text
  const plainText = text.replace(/<[^>]*>/g, '');
  
  // Count words (split by whitespace and filter empty strings)
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  // Calculate reading time in minutes
  const minutes = Math.ceil(words / wordsPerMinute);
  
  // Time in milliseconds
  const time = minutes * 60 * 1000;
  
  // Generate human-readable text
  const text_result = minutes === 1 ? '1 min read' : `${minutes} min read`;
  
  return {
    text: text_result,
    minutes,
    time,
    words
  };
};

export const getContentStats = (content: string) => {
  const plainText = content.replace(/<[^>]*>/g, '');
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const characters = plainText.length;
  const charactersWithSpaces = plainText.length;
  const charactersWithoutSpaces = plainText.replace(/\s/g, '').length;
  const paragraphs = content.split(/<\/p>|<br\s*\/?>/i).filter(p => p.trim().length > 0).length;
  const readingTime = calculateReadingTime(content);

  return {
    words,
    characters,
    charactersWithSpaces,
    charactersWithoutSpaces,
    paragraphs,
    readingTime
  };
};