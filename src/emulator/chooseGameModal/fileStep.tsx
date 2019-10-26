import React from "react";
import styled from "styled-components";
import { FileDropZone } from "./fileDropZone";

interface FileStepProps {
  className?: string;
  stepNumber: number;
  title: string;
  description: React.ReactNode;
  disabled?: boolean;
  onFileChosen: (file: File) => void;
}

const Container = styled.div`
  padding: 16px;
  display: grid;
  grid-template-columns: max-content 1fr 200px;
  column-gap: 16px;

  color: black;
  outline: 1px solid gray;

  // align-items: center;
`;

const StepNumber = styled.div`
  font-size: 96px;
  font-weight: bold;

  color: lightgray;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  font-size: 24px;
  font-weight: bold;
`;

export const FileStep: React.FunctionComponent<FileStepProps> = ({
  className,
  stepNumber,
  title,
  description,
  disabled,
  onFileChosen
}) => {
  return (
    <Container>
      <StepNumber>{stepNumber}</StepNumber>
      <TitleContainer>
        <Title>{title}</Title>
        <p>{description}</p>
      </TitleContainer>
      <FileDropZone onFileChosen={onFileChosen} />
    </Container>
  );
};
