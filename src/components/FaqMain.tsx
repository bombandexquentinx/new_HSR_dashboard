import {
  Button,
  Form,
} from "react-bootstrap";
import Faq from "./FAQ";

function FaqMain({
  faqs,
  questionInput,
  setQuestionInput,
  answerInput,
  setAnswerInput,
  handleAddFAQ,
}) {
  return (
    <Form>
      <Form.Group className="mb-3 mt-3">
        <Form.Label className="font-semibold">
          Frequently Asked Questions (FAQ)
        </Form.Label>

        <div className="flex flex-col">
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            className="border p-2 rounded-md w-full mb-2"
            placeholder="Enter FAQ question"
          />

          <textarea
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            className="border p-2 rounded-md w-full mb-2"
            placeholder="Enter FAQ answer"
            rows="4"
          />

          <Button onClick={handleAddFAQ} className="mt-2">
            Add FAQ
          </Button>
        </div>
        <Faq questionsAndAnswers={faqs} />
      </Form.Group>
    </Form>
  );
}

export default FaqMain;
