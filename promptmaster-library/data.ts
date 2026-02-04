import { Category, Prompt } from './types';

// Helper to generate past dates
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const PROMPTS: Prompt[] = [
  {
    id: '1',
    title: 'Code Refactoring Expert',
    category: Category.CODING,
    description: 'Improve code quality, readability, and performance.',
    rating: 4.8,
    createdAt: daysAgo(2),
    reviews: [
      { id: 'r1', userName: 'DevDave', rating: 5, text: 'Saved me hours of work!', createdAt: daysAgo(1) },
      { id: 'r2', userName: 'SarahCode', rating: 4, text: 'Very solid suggestions.', createdAt: daysAgo(2) }
    ],
    template: `Act as a Senior Software Engineer. Review the following [Language] code. 
Identify any code smells, potential bugs, or performance bottlenecks. 
Suggest a refactored version that improves [Metric] while maintaining the original functionality.

Code:
[Code Snippet]`
  },
  {
    id: '2',
    title: 'SEO Blog Post Generator',
    category: Category.MARKETING,
    description: 'Create SEO-optimized content for your blog.',
    rating: 4.5,
    createdAt: daysAgo(10),
    reviews: [],
    template: `Write a comprehensive, SEO-optimized blog post about [Topic]. 
The target audience is [Audience]. 
Include the following keywords: [Keywords].
The tone should be [Tone]. 
Ensure the structure includes an H1, multiple H2s, and a conclusion with a call to action.`
  },
  {
    id: '3',
    title: 'Cold Email Outreach',
    category: Category.BUSINESS,
    description: 'Generate a compelling cold email for sales.',
    rating: 4.2,
    createdAt: daysAgo(5),
    reviews: [
      { id: 'r3', userName: 'SalesSam', rating: 4, text: 'Good structure, needs personalization.', createdAt: daysAgo(3) }
    ],
    template: `Draft a cold email to a potential client in the [Industry] industry. 
My product helps them solve [Problem]. 
The goal of the email is to get them to [Goal]. 
Keep the tone professional but conversational. 
Value proposition: [Value Prop].`
  },
  {
    id: '4',
    title: 'Complex Concept Simplifier',
    category: Category.LEARNING,
    description: 'Explain difficult topics simply (Feynman Technique).',
    rating: 4.9,
    createdAt: daysAgo(1),
    reviews: [],
    template: `Explain the concept of [Topic] to a [Audience] as if you were Richard Feynman. 
Use simple analogies, avoid jargon, and focus on the core intuition behind the idea. 
Limit the explanation to [Word Count] words.`
  },
  {
    id: '5',
    title: 'Social Media Caption',
    category: Category.MARKETING,
    description: 'Engaging captions for Instagram or LinkedIn.',
    rating: 4.0,
    createdAt: daysAgo(20),
    reviews: [],
    template: `Write 3 variations of a social media caption for [Platform] about [Topic]. 
The mood should be [Mood]. 
Include relevant hashtags. 
Call to action: [CTA].`
  },
  {
    id: '6',
    title: 'Unit Test Generator',
    category: Category.CODING,
    description: 'Create comprehensive unit tests.',
    rating: 4.6,
    createdAt: daysAgo(15),
    reviews: [],
    template: `Write unit tests for the following [Language] function using [Test Framework]. 
Cover edge cases, null inputs, and typical success scenarios.

Function:
[Code Snippet]`
  },
  {
    id: '7',
    title: 'Story Plot Generator',
    category: Category.CREATIVE,
    description: 'Brainstorm creative story ideas.',
    rating: 4.7,
    createdAt: daysAgo(3),
    reviews: [],
    template: `Generate a detailed plot outline for a story in the [Genre] genre.
The protagonist is a [Character Type] who wants to [Goal] but is stopped by [Obstacle].
The setting is [Setting].`
  },
  {
    id: '8',
    title: 'Professional Bio',
    category: Category.WRITING,
    description: 'Create a bio for LinkedIn or a resume.',
    rating: 4.3,
    createdAt: daysAgo(45),
    reviews: [],
    template: `Write a professional bio for a [Job Title] with [Years] years of experience.
Highlight key skills such as [Skills].
The bio is for [Platform/Purpose] and should be written in the [Person] person.`
  }
];