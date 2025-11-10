import { useState } from 'react';

const Accordion = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(prevState => !prevState);
  };

  return (
    <div className="accordion bg-white rounded-lg">
      <button
        type="button"
        onClick={toggleAccordion}
        className="toggle-button px-3 pt-2 w-full text-base font-semibold text-left text-gray-800 flex items-center"
      >
        <span className="mr-4">{question}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 42 42"
          className="w-3 fill-current ml-auto shrink-0"
        >
          <path
            className={isOpen ? 'hidden' : 'plus'}
            d="M37.059 16H26V4.941C26 2.224 23.718 0 21 0s-5 2.224-5 4.941V16H4.941C2.224 16 0 18.282 0 21s2.224 5 4.941 5H16v11.059C16 39.776 18.282 42 21 42s5-2.224 5-4.941V26h11.059C39.776 26 42 23.718 42 21s-2.224-5-4.941-5z"
          />
          <path
            d="M37.059 16H4.941C2.224 16 0 18.282 0 21s2.224 5 4.941 5h32.118C39.776 26 42 23.718 42 21s-2.224-5-4.941-5z"
          />
        </svg>
      </button>
      <div
        className={`content ${isOpen ? '' : 'invisible'} max-h-[1000px] px-6 pb-6 overflow-hidden transition-all duration-300`}
        style={{ maxHeight: isOpen ? `${document.querySelector('.content').scrollHeight + 100}px` : '0px' }}
      >
        <p className="text-sm text-gray-500 mt-2">{answer}</p>
      </div>
    </div>
  );
};

const Faq = ({questionsAndAnswers}) => {
//   const questionsAndAnswers = [
//     {
//       question: 'Are there any special discounts available during the event.',
//       answer:
//         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed auctor auctor arcu, at fermentum dui. Maecenas vestibulum a turpis in lacinia. Proin aliquam turpis at erat venenatis malesuada. Sed semper, justo vitae consequat fermentum, felis diam posuere ante, sed fermentum quam justo in dui. Nulla facilisi. Nulla aliquam auctor purus, vitae dictum dolor sollicitudin vitae. Sed bibendum purus in efficitur consequat. Fusce et tincidunt arcu. Curabitur ac lacus lectus. Morbi congue facilisis sapien, a semper orci facilisis in.',
//     },
//     {
//       question: 'What are the dates and locations for the product launch events?',
//       answer:
//         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed auctor auctor arcu, at fermentum dui. Maecenas ongue facilisis sapien, a semper orci facilisis in.',
//     },
//     {
//       question: 'Can I bring a guest with me to the product launch event?',
//       answer:
//         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed auctor auctor arcu, at fermentum dui. Maecenas ongue facilisis sapien, a semper orci facilisis in.',
//     },
//     {
//       question: 'Are there any special promotions available during the event.',
//       answer:
//         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed auctor auctor arcu, at fermentum dui. Maecenas ongue facilisis sapien, a semper orci facilisis in.',
//     },
//   ];

  return (
    <div className="max-w-7xl mx-auto sm:px-8 px-4 font-sans mt-4">
      <div className="grid lg:grid-cols-1 gap-2">
        <div className="space-y-2">
          {questionsAndAnswers.slice(0, 2).map((qa, index) => (
            <Accordion key={index} question={qa.question} answer={qa.answer} />
          ))}
        </div>
        <div className="space-y-2">
          {questionsAndAnswers.slice(2).map((qa, index) => (
            <Accordion key={index + 2} question={qa.question} answer={qa.answer} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;
