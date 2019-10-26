import React from "react";

interface FileStepProps {
  className?: string;
  stepNumber: number;
  title: string;
  description: string;
  disabled?: boolean;
  onFileUploaded: (file: File) => void;
}

export const FileStep: React.FunctionComponent<FileStepProps> = ({
  className,
  stepNumber,
  title,
  description,
  disabled,
  onFileUploaded
}) => {
  return <div>file step</div>;
};
