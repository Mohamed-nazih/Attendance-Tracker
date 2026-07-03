import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  Present: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50",
  Absent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50",
  "On Duty": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50",
  Pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
};

const dots = {
  Present: "bg-green-500",
  Absent: "bg-red-500",
  "On Duty": "bg-yellow-500",
  Pending: "bg-gray-500",
};

export const StatusBadge = ({ status, className = '', animate = true }) => {
  const content = (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status] || variants.Pending} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dots[status] || dots.Pending}`}></span>
      {status}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};
