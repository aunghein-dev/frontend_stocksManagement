'use client';
import { motion } from 'framer-motion';
import { memo } from 'react';

const MiniDataCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="flex items-center h-[100px] w-full max-w-sm bg-white rounded-sm shadow-md hover:shadow-lg transition-shadow p-3"
    >
      <div className="text-3xl text-blue-600 mr-4 shrink-0">
        {icon}
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-sm text-gray-500">{title}</span>
        <span className="text-xl font-bold text-gray-800">{value}</span>
      </div>
    </motion.div>
  );
};

export default memo(MiniDataCard);
