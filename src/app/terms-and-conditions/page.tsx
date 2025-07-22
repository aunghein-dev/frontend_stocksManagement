// src/app/terms&conditions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { marked } from 'marked'; // Import the marked library
import axios from 'axios'; // Using axios for fetching the markdown file


const TermsAndConditions: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [contentHtml, setContentHtml] = useState(''); // State to hold the parsed HTML content
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // --- CRUCIAL: Ensure  'terms-and-conditions.md' is in the 'public' directory ---
        // For example, if it's directly in 'public/', the path is '/terms-and-conditions.md'
        // If it's in 'public/content/', the path is '/content/terms-and-conditions.md'
        const response = await axios.get('/terms-and-conditions.md'); // Adjust this path if needed

        if (response.status !== 200) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let text = response.data; // Axios puts the response data in .data

        // --- Replace all  placeholders here, matching those in  .md file exactly ---
        // Ensure these regex patterns match the placeholders in  markdown file
        text = text.replace(/\[Current Date, e\.g\., June 18, 2025\]/g, formattedDate);
        text = text.replace(/\[ Company Name\]/g, 'MoMo Clothing System'); // Use  actual company name
        text = text.replace(/\[Myanmar\/ Country\]/g, 'Myanmar'); // Use  actual country
        text = text.replace(/\[e\.g\., 18\]/g, '18'); // Example age
        text = text.replace(/\[Number\]/g, '30'); // Example number of days for returns
        text = text.replace(/\[ Contact Email\]/g, 'contact@momoclothing.com'); //  contact email
        text = text.replace(/\[ Website URL\]/g, 'https://www.momoclothing.com'); //  website URL
        text = text.replace(/\[ Company Address, if applicable\]/g, '123 Cloth Street, Yangon, Myanmar'); //  company address

        // Parse the Markdown text to HTML using marked
        const html = marked.parse(text) as string;
        setContentHtml(html);

      } catch (error) {
        console.error('Error fetching or parsing markdown:', error);
        setFetchError(`Failed to load content. Please ensure 'terms-and-conditions.md' is correctly placed in  public directory. Error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkdown();
  }, []); // Run once on component mount

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full min-h-[300px] text-gray-600">
        <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
        <p>Loading terms and conditions...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex-1 flex items-center justify-center h-full min-h-[300px] text-red-600 font-semibold p-6 bg-red-50 border border-red-200 rounded-lg shadow-sm">
        <p>{fetchError}</p>
      </div>
    );
  }

 return (
  <div className="py-4 px-2 sm:px:8 text-gray-800 leading-relaxed bg-white max-w-6xl mx-auto my-4 overflow-hidden rounded-sm">
    <div className="h-full max-h-[calc(100dvh-65px)] overflow-y-auto custom-scrollbar px-2 py-6 sm:px-10">
      {/* IMPORTANT: Remove prose classes and add  custom class */}
      <div className="markdown-content"> {/* <-- Added  class here */}
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>
    </div>
  </div>
);
};

export default TermsAndConditions;