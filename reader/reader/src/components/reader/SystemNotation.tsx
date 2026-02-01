"use client";

import React from "react";

interface SystemNotationProps {
    content: string;
    fontSize: number;
}

export default function SystemNotation({ content, fontSize }: SystemNotationProps) {
    // Regex for different notations
    // 1. [System: ...]
    // 2. {Quest: ...}
    // 3. |Status| ... |/Status|

    const parseContent = (text: string) => {
        const parts = text.split(/(\[System:.*?\]|\{Quest:.*?\}|\|Status\|[\s\S]*?\|\/Status\|)/g);

        return parts.map((part, index) => {
            if (part.startsWith("[System:")) {
                const inner = part.replace("[System:", "").replace("]", "").trim();
                const [header, ...msgParts] = inner.includes("|") ? inner.split("|") : [null, inner];
                const message = msgParts.join("|").trim();

                return (
                    <div key={index} className="my-6 p-4 bg-indigo-500/5 border-l-4 border-indigo-500/50 shadow-sm animate-in fade-in slide-in-from-left-2 duration-500">
                        {header && <p className="text-[10px] uppercase tracking-widest text-indigo-600/70 dark:text-indigo-400 font-bold mb-1 transition-colors">{header.trim()}</p>}
                        <p className="italic text-gray-800 dark:text-indigo-100/90 transition-colors" style={{ fontSize: `${fontSize}px` }}>{message}</p>
                    </div>
                );
            }

            if (part.startsWith("{Quest:")) {
                const inner = part.replace("{Quest:", "").replace("}", "").trim();
                const [title, ...contentParts] = inner.includes("|") ? inner.split("|") : ["QUEST UPDATE", inner];
                const questContent = contentParts.join("|").trim();

                return (
                    <div key={index} className="my-10 border border-amber-600/20 bg-amber-600/5 overflow-hidden shadow-lg border-t-amber-600/50 border-t-2">
                        <div className="bg-amber-600/10 px-4 py-2 border-b border-amber-600/10 flex justify-between items-center transition-colors">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-700 dark:text-amber-500 font-black">{title.trim()}</p>
                            <span className="text-[9px] text-amber-700/50 dark:text-amber-500/50 italic font-bold">LEGENDARY</span>
                        </div>
                        <div className="p-6 space-y-4 text-gray-800 dark:text-amber-100/90 transition-colors whitespace-pre-wrap" style={{ fontSize: `${fontSize}px` }}>
                            {questContent}
                        </div>
                    </div>
                );
            }

            if (part.startsWith("|Status|")) {
                const statusBody = part.replace("|Status|", "").replace("|/Status|", "").trim();
                const lines = statusBody.split("\n");
                return (
                    <div key={index} className="my-10 border border-gray-400/20 dark:border-white/10 bg-gray-400/5 dark:bg-black/40 backdrop-blur-sm overflow-hidden shadow-2xl transition-all">
                        <div className="bg-gray-400/10 dark:bg-white/5 px-4 py-2 border-b border-gray-400/20 dark:border-white/10 flex justify-between items-center transition-colors">
                            <p className="text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-400 font-bold">Chronicle Status Screen</p>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                            </div>
                        </div>
                        <div className="p-6 space-y-3">
                            {lines.map((line, i) => {
                                const [label, ...valParts] = line.split(":");
                                const value = valParts.join(":");
                                if (!label.trim()) return null;
                                return (
                                    <div key={i} className="flex justify-between items-center border-b border-gray-400/10 dark:border-white/5 pb-1 last:border-0 transition-colors">
                                        <span className="text-[10px] uppercase tracking-widest text-gray-500/90 dark:text-gray-500">{label.trim()}</span>
                                        <span className="text-xs font-mono text-gray-800 dark:text-gray-200">{value?.trim() || "---"}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            }

            // Normal text
            return <span key={index} className="whitespace-pre-wrap">{part}</span>;
        });
    };

    return <div className="system-notation-container">{parseContent(content)}</div>;
}
