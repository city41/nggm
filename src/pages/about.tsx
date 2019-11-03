import React from "react";
import styled from "styled-components";

const Root = styled.div`
  display: flex;
  margin: auto;
  text-align: center;
  font-style: italic;
  color: white;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
  padding: 24px;

  font-style: normal;

  h1 {
    color: #666;
  }

  p:last-of-type {
    margin: 0;
  }
`;
const About: React.FunctionComponent = () => {
  return (
    <Root>
      <h1>About</h1>
      <p>this will be an about/help page</p>
    </Root>
  );
};

export default About;
