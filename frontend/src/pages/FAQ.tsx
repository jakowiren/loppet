import React, { useState } from "react";

const FAQ_DATA = [
  {
    question: "Hur skapar jag en annons?",
    answer: "För att skapa en annons måste du först logga in. Klicka sedan på 'Skapa annons' i menyn och fyll i formuläret."
  },
  {
    question: "Hur kontaktar jag en säljare?",
    answer: "När du hittar en annons du är intresserad av kan du kontakta säljaren via kontaktuppgifterna som finns i annonsen."
  },
  {
    question: "Hur fungerar betalning?",
    answer: "Betalning sker direkt mellan köpare och säljare. Loppet ansvarar inte för transaktionen, så var noga med att komma överens om betalningssätt."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-2xl mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold mb-8">FAQ</h1>
      <div className="space-y-4">
        {FAQ_DATA.map((item, idx) => (
          <div key={idx} className="border rounded-lg">
            <button
              className="w-full flex justify-between items-center px-4 py-3 text-left font-medium text-gray-800 focus:outline-none"
              onClick={() => toggle(idx)}
              aria-expanded={openIndex === idx}
            >
              <span>{item.question}</span>
              <span className={`transform transition-transform ${openIndex === idx ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            {openIndex === idx && (
              <div className="px-4 pb-4 text-gray-700 animate-fade-in">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;