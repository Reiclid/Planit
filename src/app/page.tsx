'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const fullText = "[Hello World]";
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true); // Додаємо стан друку

  useEffect(() => {
    if (text.length < fullText.length) {
      // Поки друкуємо - ставимо true
      setIsTyping(true);
      const timeout = setTimeout(() => {
        setText(fullText.slice(0, text.length + 1));
      }, 80);
      return () => clearTimeout(timeout);
    } else {
      // Коли текст закінчився - дозволяємо блимати
      setIsTyping(false);
    }
  }, [text, fullText]);

  return (
    // <div className="flex min-h-screen items-center justify-center">
    //   <p className="font-bold text-5xl font-mono">
    //     {text}
    //     <span 
    //       className={`ml-1 text-black inline-block ${
    //         isTyping ? "opacity-100" : "animate-blink"
    //       }`}
    //     >
    //       |
    //     </span>
    //   </p>
    // </div>
    <div className="flex flex-col w-full">
      {/* Секція HOME */}
      <section id="home" className="h-screen bg-blue-100 flex items-center justify-center text-4xl">
        Home Section
      </section>

      {/* Секція ABOUT */}
      <section id="about" className="h-screen bg-green-100 flex items-center justify-center text-4xl">
        About Section
      </section>

      {/* Секція CONTACT */}
      <section id="contact" className="h-screen bg-red-100 flex items-center justify-center text-4xl">
        Contact Section
      </section>
    </div>
  );
}





