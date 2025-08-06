"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FullPageLoader = () => {
    return (
        <AnimatePresence>
            <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-100 flex items-center justify-center bg-white/90 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative flex flex-col items-center gap-6"
                >
                    {/* Gradient bubble */}
                    <div className="absolute -inset-8 blur-2xl opacity-30 animate-pulse bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>

                    {/* Loader icon */}
                    <Loader2 className="h-16 w-16 animate-spin text-primary drop-shadow-lg z-10" />

                    {/* Typing animation */}
                    <motion.div
                        className="text-lg font-medium text-gray-700 z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0.5, 1] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                        }}
                    >
                        Mohon tunggu<span className="animate-ping">...</span>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FullPageLoader;
