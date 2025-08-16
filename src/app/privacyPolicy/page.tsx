'use client';

import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import axios from 'axios';
import { useModalStore } from "@/store/modalStore"; 

const PrivacyPolicy: React.FC = () => {

  const [contentHtml, setContentHtml] = useState('');


  const { openModal, closeModal } = useModalStore(); 
    
  

  useEffect(() => {
      const fetchMarkdown = async () => {
      openModal("loading");
      try {
        // Updated path: Now it correctly points to the file in the public directory
        const response = await axios.get('/privacyPolicy.md'); // Make sure filename here matches the one in public/
        const text = response.data; // axios directly gives you the data, no need for .text()
        const html = marked.parse(text) as string;
        setContentHtml(html);
      } catch (error) {
        console.error('Error fetching markdown:', error); // Log the actual error for debugging
        setContentHtml('<p class="text-red-500">Failed to load content. Please try again later.</p>');
      } finally {
        closeModal();
      }
    };

    fetchMarkdown();
  }, [openModal, closeModal, ]);

  

  return (
    <div className="overflow-hidden h-full rounded-lg bg-white p-1">
      <div className=" overflow-auto custom-scrollbar pt-0 h-[calc(100dvh-135px)] custom-scrollbar my-2">
        <div className="markdown-content text-gray-800 w-full px-3 sm:px-4 md:px-8 py-6">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
