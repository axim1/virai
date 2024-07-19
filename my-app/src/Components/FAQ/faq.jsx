import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: url('https://source.unsplash.com/random/1920x1080') no-repeat center center fixed;
  background-size: cover;
  color: white;
  font-family: Arial, sans-serif;
  padding: 40px;
  max-width: 800px;
  max-height: 60vh;
  overflow-y: auto;
  margin: 0 auto;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  &::-webkit-scrollbar {
    width: 12px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(26, 26, 26, 0.9);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.4);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.6);
  }
`;

const Title = styled.h1`
  font-size: 3em;
  text-align: center;
  margin-bottom: 20px;
`;

const Question = styled.div`
  background-color: rgba(26, 26, 26, 0.9);
  margin: 10px 0;
  padding: 15px 25px;
  cursor: pointer;
  border: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(40, 40, 40, 0.9);
  }
`;

const QuestionText = styled.span`
  font-weight: bold;
`;

const Answer = styled.div`
  background-color: rgba(26, 26, 26, 0.9);
  padding: 15px 25px;
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
  border-radius: 0 0 5px 5px;
  margin-top: -10px;
`;

const FAQ = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setSelectedQuestion(selectedQuestion === index ? null : index);
  };

  const faqData = [
    {
      question: 'What is AI-powered text-to-image generation?',
      answer: 'AI-powered text-to-image generation is a process that uses advanced algorithms and machine learning models to create visual images based on descriptive text provided by the user.'
    },
    {
      question: 'How does your service work?',
      answer: 'Our service utilizes AI models that analyze your text description and generate images that match your description. The process involves natural language processing and image generation using neural networks.'
    },
    {
      question: 'What kind of texts can I use to generate images?',
      answer: 'You can use any descriptive text that clearly outlines the scene, object, or concept you want to visualize. The more detailed and specific the description, the more accurate the resulting image will be.'
    },
    {
      question: 'How long does it take to generate an image?',
      answer: 'The time to generate an image can vary depending on the complexity of the description and the current load on our system. It typically takes a few minutes.'
    },
    {
      question: 'Are the generated images unique?',
      answer: 'Yes, each generated image is unique and created based on your specific text description. This ensures you receive an original image tailored to your requirements.'
    },
    {
      question: 'Can I use the generated images for commercial purposes?',
      answer: 'This depends on the licensing terms of our service. Please read our terms of use and licensing agreements for more information on commercial use.'
    },
    {
      question: 'What image formats are available?',
      answer: 'Images are generated in PNG or JPEG format, according to your preference.'
    },
    {
      question: 'What if I am not satisfied with the generated image?',
      answer: 'If you are not satisfied with the result, you can enter a new text description and generate a new image. You can also contact our customer support for assistance.'
    },
    {
      question: 'How can I contact support?',
      answer: 'You can reach our customer support via email on support@virtuartai.com.'
    },
    {
      question: 'Are my text descriptions and generated images stored?',
      answer: 'Your text descriptions and generated images are stored in accordance with our privacy policy. You can be assured that your data is securely protected.'
    },
    {
      question: 'Can you generate images for any type of description?',
      answer: 'Our AI can generate images for a wide range of descriptions, but it may have limitations with very abstract or vague descriptions. We recommend providing as specific and detailed descriptions as possible.'
    },
    {
      question: 'How can I start using your service?',
      answer: 'To get started, simply register on our website, enter your text description, and click the button to generate an image. It\'s easy and quick!'
    }
  ];

  return (
    <Container>
      <Title>FAQ</Title>
      {faqData.map((item, index) => (
        <div key={index}>
          <Question onClick={() => toggleQuestion(index)}>
            <QuestionText>{item.question}</QuestionText>
            <span>{selectedQuestion === index ? '-' : '+'}</span>
          </Question>
          {selectedQuestion === index && (
            <Answer>
              <p>{item.answer}</p>
            </Answer>
          )}
        </div>
      ))}
    </Container>
  );
};

export default FAQ;
