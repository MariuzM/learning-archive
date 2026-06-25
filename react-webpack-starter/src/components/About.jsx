import React from 'react';

const About = () => {
  return (
    <div>
      <div className="container">
        <h4 className="center">About</h4>
        <img src={require('./pic1.jpg')} />
        <p>Blablabla </p>
        <img src={require('./pic1.jpg')} />
      </div>
    </div>
  );
};

export default About;
