import React, { useState } from "react";
import styled from "styled-components";

interface FileDropZoneProps {
  onFileChosen: (file: File) => void;
  fileName?: string;
}

interface ContainerProps {
  isOver?: boolean;
}

const Container = styled.div<ContainerProps>`
  border: 1px dotted gray;
  flex: 1;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  text-align: center;
  font-size: 0.8em;
  color: gray;

  background-color: ${props => (props.isOver ? "lightgray" : "transparent")};
`;

const ChooseFile = styled.label`
  cursor: pointer;
  font-weight: bold;
`;

const FileInput = styled.input`
  width: 0.01px;
  height: 0.01px;
`;

function hasFiles(e: React.DragEvent<HTMLDivElement>): boolean {
  let hasFiles = false;

  if (e.dataTransfer) {
    const types = e.dataTransfer.types;
    for (const keyOrIndex in types) {
      if (types[keyOrIndex] === "Files") {
        hasFiles = true;
        break;
      }
    }
  }
  return hasFiles;
}

export const FileDropZone: React.FunctionComponent<FileDropZoneProps> = ({
  onFileChosen,
  fileName
}) => {
  const [isOver, setIsOver] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target && e.target.files && e.target.files[0]) {
      onFileChosen(e.target.files[0]);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    setIsOver(hasFiles(e));
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    setIsOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    if (hasFiles(e)) {
      const file =
        e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];

      if (file) {
        onFileChosen(file);
      }
    }
  }

  const body = fileName ? (
    <>{fileName}</>
  ) : (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      drag a file here, or{" "}
      <ChooseFile>
        click to choose
        <FileInput type="file" onChange={handleChange} />
      </ChooseFile>
    </div>
  );

  return <Container isOver={isOver}>{body}</Container>;
};
