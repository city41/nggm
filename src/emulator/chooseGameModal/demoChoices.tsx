import React from "react";
import styled from "styled-components";
import gowcaizerImg from "./gowcaizerTitle.png";
import ss2Img from "./ss2Title.png";

interface DemoChoicesProps {
  className?: string;
  onChoice: (demoType: "ss2" | "gowcaizer") => void;
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: max-content;
  column-gap: 8px;
`;

const Choice = styled.div`
  width: 100%;
  height: 128px;
  outline: 1px solid gray;
  cursor: pointer;

  background-color: black;
  background-image: var(--choice-title-img);
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 80%;
`;

const SS2 = styled.div`
  --choice-title-img: url(${ss2Img});
`;

const Gowcaizer = styled.div`
  --choice-title-img: url(${gowcaizerImg});
`;

export const DemoChoices: React.FunctionComponent<DemoChoicesProps> = ({
  className,
  onChoice
}) => {
  return (
    <Container>
      <SS2>
        <Choice onClick={() => onChoice("ss2")} />
      </SS2>
      <Gowcaizer>
        <Choice onClick={() => onChoice("gowcaizer")} />
      </Gowcaizer>
    </Container>
  );
};
