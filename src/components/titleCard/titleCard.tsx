import React from "react";
import { Link } from "gatsby";
import styled from "styled-components";
import { IconButton } from "../primitives/iconButton";
import Help from "@material-ui/icons/HelpOutline";

interface TitleCardProps {
  className?: string;
}

const Container = styled.div`
  --size: 32px;

  z-index: 100;
  display: grid;
  grid-template-columns: 50% 1fr var(--size);
  grid-template-rows: 2fr 1fr;
  height: var(--size);
`;

const Title = styled.h1`
  display: block;

  grid-column: 1;
  grid-row: 1;
  margin: 0;
  padding: 0;
  font-size: 18px;

  text-align: justify;
  &:after {
    content: "";
    display: inline-block;
    width: 100%;
  }

  overflow: hidden;
`;

const Subtitle = styled.h2`
  display: block;

  grid-column: 1;
  grid-row: 2;
  margin: 0;
  padding: 0;
  height: 100%;
  font-size: 10px;
`;

const HelpContainer = styled.div`
  grid-column: 3;
  grid-row: 1 / -1;

  & svg {
    width: var(--size) !important;
    height: var(--size) !important;

    fill: white !important;
    background-color: transparent !important;

    &:hover {
      fill: var(--focal-color) !important;
    }
  }
`;

export const TitleCard: React.FunctionComponent<TitleCardProps> = ({
  className
}) => {
  return (
    <Container className={className}>
      <Title>NGGM</Title>
      <Subtitle>neo.geo.gif.maker</Subtitle>
      <HelpContainer>
        <Link to="/about">
          <IconButton icon={Help} />
        </Link>
      </HelpContainer>
    </Container>
  );
};
