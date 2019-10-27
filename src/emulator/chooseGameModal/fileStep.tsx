import React from "react";
import styled, { keyframes } from "styled-components";
import { FileDropZone } from "./fileDropZone";

interface FileStepProps {
  className?: string;
  stepNumber: number;
  title: string;
  description: React.ReactNode;
  onFileChosen: (file: File) => void;
  fileName?: string;
  loading?: boolean;
}

const Container = styled.div`
  display: grid;
  grid-template-rows: repeat(2, auto);

  color: black;
  outline: 1px solid gray;
`;

const InnerContainer = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr 200px;
  grid-template-rows: repeat(2, auto);
  column-gap: 16px;
  row-gap: 16px;

  padding: 16px;
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

const loadingFrames = keyframes`
  0% {
    width: 0%;
  }
  50% {
    width: 100%;
  }
  100% {
    width: 0%;
  }
`;

const LoadingIndicator = styled.div`
  width: 100%;
  height: 3px;

  background-color: var(--focal-color);
  position: relative;

  &:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    background-image: linear-gradient(
      90deg,
      transparent 0,
      transparent 90%,
      rgba(255, 255, 255, 0.5) 90%,
      white 95%,
      rgba(255, 255, 255, 0.5) 100%
    );

    animation: 6s ${loadingFrames} ease-in-out infinite;
  }
`;

export const FileStep: React.FunctionComponent<FileStepProps> = ({
  className,
  stepNumber,
  title,
  description,
  loading,
  fileName,
  onFileChosen
}) => {
  const loadingStyle = {
    visibility: loading ? "visible" : "hidden"
  } as const;

  return (
    <Container className={className}>
      <LoadingIndicator style={loadingStyle} />
      <InnerContainer>
        <StepNumber>{stepNumber}</StepNumber>
        <TitleContainer>
          <Title>{title}</Title>
          <p>{description}</p>
        </TitleContainer>
        <FileDropZone onFileChosen={onFileChosen} fileName={fileName} />
      </InnerContainer>
    </Container>
  );
};
