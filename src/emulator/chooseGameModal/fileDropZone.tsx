import React from "react";
import styled from "styled-components";

interface FileDropZoneProps {
  onFileChosen: (file: File) => void;
}

const Container = styled.div`
  border: 1px dotted gray;
  flex: 1;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  text-align: center;
  font-size: 0.8em;
  color: gray;
`;

const ChooseFile = styled.label`
  cursor: pointer;
  font-weight: bold;
`;

const FileInput = styled.input`
  width: 0.01px;
  height: 0.01px;
`;

export const FileDropZone: React.FunctionComponent<FileDropZoneProps> = ({
  onFileChosen
}) => {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target && e.target.files && e.target.files[0]) {
      onFileChosen(e.target.files[0]);
    }
  }

  return (
    <Container>
      drag a file here, or{" "}
      <ChooseFile>
        click to choose
        <FileInput type="file" onChange={handleChange} />
      </ChooseFile>
    </Container>
  );
};
